from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IncidentViewSet, IncidentCommentViewSet

router = DefaultRouter()
router.register(r'incidents', IncidentViewSet)
router.register(r'comments', IncidentCommentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
