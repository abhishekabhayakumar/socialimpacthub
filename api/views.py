from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model, authenticate
from .models import Project, Comment
from .serializers import UserSerializer, ProjectSerializer, CommentSerializer
from .gemini_classifier import is_social_impact_project, classify_with_raw
from django.conf import settings
from rest_framework.decorators import api_view

User = get_user_model()

class RegisterView(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
    def create(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserSerializer(user).data
            return Response({
                'user': user_data,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password')
        )
        if user:
            user_data = UserSerializer(user).data
            response.data['user'] = user_data
        return response

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        # Use Gemini classifier to check social impact. The classifier is fail-open
        # (returns True on error), so creation won't be blocked by API failures.
        data = serializer.validated_data
        title = data.get('title', '')
        impact_area = data.get('category', '')  # serializer maps impact_area -> category
        description = data.get('description', '')
        info = classify_with_raw(title, impact_area, description)
        # include text/raw for logging/debugging
        is_impact = info.get('result')
        classifier_text = info.get('text')
        classifier_raw = info.get('raw')
        classifier_error = info.get('error')

        # Important: only treat explicit boolean True as acceptance. The classifier
        # may return strings or other types in 'result' — coerce to strict handling.
        # Accept: True; Reject: False; Ambiguous: None
        if isinstance(is_impact, str):
            low = is_impact.strip().lower()
            if low in ('true', 'yes', '1'):
                is_impact = True
            elif low in ('false', 'no', '0'):
                is_impact = False
            else:
                is_impact = None

        if isinstance(is_impact, (int, float)):
            # treat numeric 1/0
            is_impact = bool(is_impact)

        print('Classifier decision:', is_impact, 'text:', classifier_text, 'error:', classifier_error)
        print('Classifier raw:', classifier_raw)

        # Respect toggle: if enforcement is disabled, allow creation regardless of classification
        enforce = getattr(settings, 'GEMINI_ENFORCE_CLASSIFICATION', False)
        fail_open = getattr(settings, 'GEMINI_FAIL_OPEN', True)

        # If enforcement is enabled, decide based on classifier result:
        # - True  => allow
        # - False => reject
        # - None  => ambiguous/error: allow when fail_open True, otherwise reject
        if enforce:
            # Only accept when classifier explicitly returned boolean True
            if is_impact is True:
                pass
            elif is_impact is False:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'detail': 'Project is not classified as a social impact project. Submission denied.', 'accepted': False, 'classifier_text': classifier_text, 'classifier_error': classifier_error, 'reason': info.get('reason')})
            else:
                # result was ambiguous or non-boolean
                if not fail_open:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({'detail': 'Project classification ambiguous or failed; submission denied by policy.', 'accepted': False, 'classifier_text': classifier_text, 'classifier_error': classifier_error, 'reason': info.get('reason')})

        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            print('Project creation error:', e)
            print('Serializer errors:', serializer.errors)
            raise
    
    @action(detail=True, methods=['post'])
    def support(self, request, pk=None):
        project = self.get_object()
        # Add support logic: create a Support object if not already supported
        from .models import Support
        support, created = Support.objects.get_or_create(project=project, user=request.user)
        if created:
            return Response({'status': 'project supported'})
        else:
            return Response({'status': 'already supported'})
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        project = self.get_object()
        if request.method == 'GET':
            comments = project.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, project=project)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        project = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Note: ML-based impact prediction removed temporarily to allow project creation.


@api_view(['POST'])
def predict_impact(request):
    """Debug endpoint that returns classifier's raw result.

    Request JSON: {"title":"..","area":"..","description":".."}
    Response JSON: {"result": true|false|null, "message": "..."}
    """
    title = request.data.get('title', '')
    area = request.data.get('area', '')
    description = request.data.get('description', '')
    info = classify_with_raw(title, area, description)
    return Response(info)
