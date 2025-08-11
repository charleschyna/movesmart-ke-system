from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import AdminRoleViewSet

router = DefaultRouter()
router.register(r'roles', AdminRoleViewSet, basename='admin-roles')

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('google-login/', views.google_login, name='google_login'),
    # Admin-only role management
    path('admin/', include(router.urls)),
]
