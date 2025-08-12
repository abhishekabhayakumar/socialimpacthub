from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Comment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    content = serializers.CharField(source='comment_text')
    created_at = serializers.DateTimeField(source='timestamp', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at')

class ProjectSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    impact_area = serializers.CharField(source='category')
    supporters_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    is_supported = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'impact_area', 'image_url', 'created_at', 
                 'creator', 'supporters_count', 'comments', 'is_supported')

    def get_supporters_count(self, obj):
        from .models import Support
        return Support.objects.filter(project=obj).count()

    def get_is_supported(self, obj):
        from .models import Support
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Support.objects.filter(project=obj, user=request.user).exists()
        return False
