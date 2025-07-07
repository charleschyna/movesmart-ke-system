from rest_framework import serializers
from .models import Incident, IncidentComment


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class IncidentCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentComment
        fields = '__all__'
        read_only_fields = ['created_at']
