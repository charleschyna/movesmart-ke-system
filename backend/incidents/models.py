from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Incident(models.Model):
    INCIDENT_TYPES = [
        ('accident', 'Accident'),
        ('construction', 'Construction'),
        ('road_closure', 'Road Closure'),
        ('weather', 'Weather'),
        ('event', 'Event'),
        ('breakdown', 'Vehicle Breakdown'),
        ('other', 'Other'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resolved', 'Resolved'),
        ('pending', 'Pending'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    reported_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-reported_at']
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'
    
    def __str__(self):
        return f"{self.title} - {self.location} ({self.status})"
    
    def save(self, *args, **kwargs):
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)


class IncidentComment(models.Model):
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Incident Comment'
        verbose_name_plural = 'Incident Comments'
    
    def __str__(self):
        return f"Comment on {self.incident.title} by {self.user.username}"
