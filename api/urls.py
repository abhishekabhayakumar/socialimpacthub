from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView
from .donation_api import DonationViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from django.contrib import admin
#from .views import predict_impact

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')

donation_list = DonationViewSet.as_view({'get': 'my_donations'})
donation_create_order = DonationViewSet.as_view({'post': 'create_order'})
donation_verify_payment = DonationViewSet.as_view({'post': 'verify_payment'})

urlpatterns = [
    path('', include(router.urls)),
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view({'post': 'create'}), name='register'),
    path('predict_impact/', views.predict_impact, name='predict-impact'),
    # Donation endpoints
    path('donations/create_order/', donation_create_order, name='donation-create-order'),
    path('donations/verify_payment/', donation_verify_payment, name='donation-verify-payment'),
    path('donations/my/', donation_list, name='donation-my-donations'),
    path('admin/', admin.site.urls),
    
]
urlpatterns += router.urls
