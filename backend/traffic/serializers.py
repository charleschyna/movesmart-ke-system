from rest_framework import serializers
from .models import TrafficData, TrafficPrediction, Route


class TrafficDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficData
        fields = '__all__'


class TrafficPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficPrediction
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'
