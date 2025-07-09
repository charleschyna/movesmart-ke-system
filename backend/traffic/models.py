from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class TrafficData(models.Model):
    DENSITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    FLOW_CHOICES = [
        ('smooth', 'Smooth'),
        ('moderate', 'Moderate'),
        ('congested', 'Congested'),
        ('gridlock', 'Gridlock'),
    ]
    
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    density = models.CharField(max_length=20, choices=DENSITY_CHOICES, default='medium')
    flow = models.CharField(max_length=20, choices=FLOW_CHOICES, default='smooth')
    speed = models.FloatField(help_text="Average speed in km/h")
    timestamp = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Traffic Data'
        verbose_name_plural = 'Traffic Data'
    
    def __str__(self):
        return f"{self.location} - {self.density} density at {self.timestamp}"


class TrafficPrediction(models.Model):
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    predicted_density = models.CharField(max_length=20, choices=TrafficData.DENSITY_CHOICES)
    predicted_flow = models.CharField(max_length=20, choices=TrafficData.FLOW_CHOICES)
    predicted_speed = models.FloatField(help_text="Predicted average speed in km/h")
    confidence = models.FloatField(help_text="Prediction confidence (0-1)")
    prediction_time = models.DateTimeField(help_text="Time this prediction is for")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-prediction_time']
        verbose_name = 'Traffic Prediction'
        verbose_name_plural = 'Traffic Predictions'
    
    def __str__(self):
        return f"{self.location} - Predicted {self.predicted_density} at {self.prediction_time}"


class Route(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    start_latitude = models.DecimalField(max_digits=10, decimal_places=7)
    start_longitude = models.DecimalField(max_digits=10, decimal_places=7)
    end_latitude = models.DecimalField(max_digits=10, decimal_places=7)
    end_longitude = models.DecimalField(max_digits=10, decimal_places=7)
    distance = models.FloatField(help_text="Distance in kilometers")
    estimated_time = models.IntegerField(help_text="Estimated time in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name}: {self.start_location} to {self.end_location}"


class TrafficReport(models.Model):
    """Model for storing generated traffic reports with AI analysis."""
    
    REPORT_TYPE_CHOICES = [
        ('location', 'Location Report'),
        ('route', 'Route Report'),
        ('city', 'City Report'),
    ]
    
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, default='location')
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    
    # Traffic data from TomTom API
    traffic_data = models.JSONField(help_text="Raw traffic data from TomTom API")
    
    # AI-generated analysis
    ai_analysis = models.TextField(help_text="AI-generated traffic analysis")
    ai_recommendations = models.TextField(help_text="AI-generated recommendations")
    
    # Report metadata
    congestion_level = models.IntegerField(help_text="Congestion level percentage (0-100)")
    avg_speed = models.FloatField(help_text="Average speed in km/h")
    incident_count = models.IntegerField(help_text="Number of incidents in the area")
    
    # User association (optional for now)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Traffic Report'
        verbose_name_plural = 'Traffic Reports'
    
    def __str__(self):
        return f"{self.title} - {self.location} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
