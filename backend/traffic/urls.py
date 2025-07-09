from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrafficDataViewSet, TrafficPredictionViewSet, RouteViewSet, TrafficReportViewSet

router = DefaultRouter()
router.register(r'data', TrafficDataViewSet, basename='trafficdata')
router.register(r'predictions', TrafficPredictionViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'reports', TrafficReportViewSet, basename='trafficreport')

urlpatterns = [
    path('api/traffic/', include(router.urls)),
]
