from rest_framework import serializers
from .models import TrafficData, TrafficPrediction, Route, TrafficReport


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


class TrafficReportSerializer(serializers.ModelSerializer):
    """Serializer for traffic reports with AI analysis."""
    
    class Meta:
        model = TrafficReport
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class TrafficReportCreateSerializer(serializers.Serializer):
    """Serializer for creating new traffic reports."""
    
    location = serializers.CharField(max_length=255, help_text="Location name or address")
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, required=False, allow_null=True)
    report_type = serializers.ChoiceField(
        choices=TrafficReport.REPORT_TYPE_CHOICES,
        default='location',
        help_text="Type of traffic report to generate"
    )
    use_current_location = serializers.BooleanField(
        default=False,
        help_text="Use current device location instead of provided coordinates"
    )
