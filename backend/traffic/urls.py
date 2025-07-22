from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrafficDataViewSet, TrafficPredictionViewSet, RouteViewSet, TrafficReportViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'data', TrafficDataViewSet, basename='traffic-data')
router.register(r'predictions', TrafficPredictionViewSet, basename='traffic-predictions')
router.register(r'routes', RouteViewSet, basename='routes')
router.register(r'reports', TrafficReportViewSet, basename='traffic-reports')

urlpatterns = [
    path('api/traffic/', include(router.urls)),
]
