import razorpay
from django.conf import settings
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Donation, Project
from .serializers import DonationSerializer
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

User = get_user_model()

# Razorpay client setup (add your keys in settings.py)
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class DonationViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        user = request.user
        project_id = request.data.get('project_id')
        amount = request.data.get('amount')
        if not project_id or not amount:
            return Response({'error': 'Project and amount required.'}, status=400)
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found.'}, status=404)
        try:
            amount_int = int(float(amount) * 100)  # Razorpay expects paise
            if amount_int < 200:
                return Response({'error': 'Minimum donation is 2 INR.'}, status=400)
            order = razorpay_client.order.create({
                'amount': amount_int,
                'currency': 'INR',
                'payment_capture': 1
            })
            donation = Donation.objects.create(
                user=user, project=project, amount=amount, order_id=order['id'], status='created'
            )
            return Response({'order_id': order['id'], 'razorpay_key': settings.RAZORPAY_KEY_ID, 'donation_id': donation.id})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def verify_payment(self, request):
        from razorpay.errors import SignatureVerificationError
        donation_id = request.data.get('donation_id')
        payment_id = request.data.get('razorpay_payment_id')
        order_id = request.data.get('razorpay_order_id')
        signature = request.data.get('razorpay_signature')
        try:
            donation = Donation.objects.get(id=donation_id, order_id=order_id)
        except Donation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=404)
        try:
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            razorpay_client.utility.verify_payment_signature(params_dict)
            donation.payment_id = payment_id
            donation.status = 'paid'
            donation.save()
            return Response({'status': 'success'})
        except SignatureVerificationError:
            donation.status = 'failed'
            donation.save()
            return Response({'status': 'failed', 'error': 'Signature verification failed.'}, status=400)

    @action(detail=False, methods=['get'])
    def my_donations(self, request):
        user = request.user
        donations = Donation.objects.filter(user=user).order_by('-created_at')[:20]
        serializer = DonationSerializer(donations, many=True)
        return Response(serializer.data)
