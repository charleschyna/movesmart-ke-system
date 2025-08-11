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


class LiveIncidentData(models.Model):
    """
    Model for storing live incident data from TomTom API for ML training.
    This stores raw API responses and processed data for analytics.
    """
    
    # TomTom incident ID (unique from TomTom API)
    tomtom_incident_id = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Location data
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    location_description = models.TextField(blank=True)
    road_numbers = models.JSONField(default=list, help_text="Road numbers affected")
    
    # Incident classification
    incident_type = models.CharField(max_length=50, db_index=True)
    icon_category = models.CharField(max_length=50, db_index=True)
    severity_code = models.CharField(max_length=20, db_index=True)
    
    # Timing data
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    last_report_time = models.DateTimeField(null=True, blank=True)
    
    # Impact metrics
    magnitude_of_delay = models.CharField(max_length=20, blank=True)
    length = models.FloatField(null=True, blank=True, help_text="Length of affected road in meters")
    delay = models.IntegerField(null=True, blank=True, help_text="Delay in seconds")
    
    # Statistical data
    probability_of_occurrence = models.FloatField(null=True, blank=True)
    number_of_reports = models.IntegerField(default=0)
    
    # Raw API response for future analysis
    raw_api_data = models.JSONField(help_text="Complete raw response from TomTom API")
    
    # Processing metadata
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    city = models.CharField(max_length=100, db_index=True)
    
    # Additional features for ML
    weather_conditions = models.CharField(max_length=100, blank=True)
    time_of_day = models.CharField(max_length=20, blank=True)  # morning, afternoon, evening, night
    day_of_week = models.CharField(max_length=15, blank=True)
    is_weekend = models.BooleanField(default=False)
    is_holiday = models.BooleanField(default=False)
    
    # Status tracking
    is_active = models.BooleanField(default=True)
    is_processed = models.BooleanField(default=False, help_text="Whether this data has been processed for ML")
    
    class Meta:
        ordering = ['-collected_at']
        verbose_name = 'Live Incident Data'
        verbose_name_plural = 'Live Incident Data'
        indexes = [
            models.Index(fields=['tomtom_incident_id']),
            models.Index(fields=['collected_at']),
            models.Index(fields=['city', 'incident_type']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['is_active', 'is_processed']),
        ]
    
    def __str__(self):
        return f"Incident {self.tomtom_incident_id} - {self.incident_type} at {self.location_description}"
    
    @property
    def duration_minutes(self):
        """Calculate incident duration in minutes"""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds() / 60)
        return None
    
    @property
    def is_resolved(self):
        """Check if incident is resolved"""
        return self.end_time is not None and self.end_time <= timezone.now()


class TrafficFlowData(models.Model):
    """
    Model for storing traffic flow data for ML training.
    """
    
    # Location
    latitude = models.DecimalField(max_digits=10, decimal_places=7, db_index=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, db_index=True)
    
    # Traffic metrics
    current_speed = models.FloatField(help_text="Current speed in km/h")
    free_flow_speed = models.FloatField(help_text="Free flow speed in km/h")
    current_travel_time = models.IntegerField(help_text="Current travel time in seconds")
    free_flow_travel_time = models.IntegerField(help_text="Free flow travel time in seconds")
    
    # Calculated metrics
    congestion_ratio = models.FloatField(help_text="Current speed / Free flow speed")
    delay_factor = models.FloatField(help_text="Current time / Free flow time")
    
    # Contextual data
    road_closure = models.BooleanField(default=False)
    confidence = models.FloatField(null=True, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(db_index=True)
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Location context
    city = models.CharField(max_length=100, db_index=True)
    road_name = models.CharField(max_length=255, blank=True)
    
    # Additional features for ML
    time_of_day = models.CharField(max_length=20, blank=True)
    day_of_week = models.CharField(max_length=15, blank=True)
    is_weekend = models.BooleanField(default=False)
    is_holiday = models.BooleanField(default=False)
    weather_conditions = models.CharField(max_length=100, blank=True)
    
    # Raw API data
    raw_api_data = models.JSONField(help_text="Complete raw response from TomTom API")
    
    # Processing status
    is_processed = models.BooleanField(default=False, help_text="Whether this data has been processed for ML")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Traffic Flow Data'
        verbose_name_plural = 'Traffic Flow Data'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['city', 'time_of_day']),
            models.Index(fields=['collected_at']),
            models.Index(fields=['is_processed']),
        ]
    
    def __str__(self):
        return f"Traffic flow at ({self.latitude}, {self.longitude}) - {self.timestamp}"


class DataCollectionLog(models.Model):
    """
    Model to track data collection runs and statistics.
    """
    
    collection_type = models.CharField(max_length=50, choices=[
        ('incidents', 'Incidents Data'),
        ('traffic_flow', 'Traffic Flow Data'),
        ('combined', 'Combined Data Collection'),
    ])
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    city = models.CharField(max_length=100)
    bbox = models.CharField(max_length=200, help_text="Bounding box used for data collection")
    
    # Collection statistics
    total_records_found = models.IntegerField(default=0)
    new_records_created = models.IntegerField(default=0)
    existing_records_updated = models.IntegerField(default=0)
    errors_encountered = models.IntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='running')
    
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.collection_type} - {self.city} ({self.status})"
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.completed_at = timezone.now()
        self.error_message = error_message
        self.save()


class AuditLog(models.Model):
    """Simple audit log for privileged actions."""
    ACTION_CHOICES = [
        ('incident_resolve', 'Incident Resolve'),
        ('report_generate', 'Report Generate'),
        ('report_delete', 'Report Delete'),
        ('role_change', 'Role Change'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.action} by {self.user_id} at {self.created_at}"

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


class LiveIncidentData(models.Model):
    """
    Model for storing live incident data from TomTom API for ML training.
    This stores raw API responses and processed data for analytics.
    """
    
    # TomTom incident ID (unique from TomTom API)
    tomtom_incident_id = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Location data
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    location_description = models.TextField(blank=True)
    road_numbers = models.JSONField(default=list, help_text="Road numbers affected")
    
    # Incident classification
    incident_type = models.CharField(max_length=50, db_index=True)
    icon_category = models.CharField(max_length=50, db_index=True)
    severity_code = models.CharField(max_length=20, db_index=True)
    
    # Timing data
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    last_report_time = models.DateTimeField(null=True, blank=True)
    
    # Impact metrics
    magnitude_of_delay = models.CharField(max_length=20, blank=True)
    length = models.FloatField(null=True, blank=True, help_text="Length of affected road in meters")
    delay = models.IntegerField(null=True, blank=True, help_text="Delay in seconds")
    
    # Statistical data
    probability_of_occurrence = models.FloatField(null=True, blank=True)
    number_of_reports = models.IntegerField(default=0)
    
    # Raw API response for future analysis
    raw_api_data = models.JSONField(help_text="Complete raw response from TomTom API")
    
    # Processing metadata
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    city = models.CharField(max_length=100, db_index=True)
    
    # Additional features for ML
    weather_conditions = models.CharField(max_length=100, blank=True)
    time_of_day = models.CharField(max_length=20, blank=True)  # morning, afternoon, evening, night
    day_of_week = models.CharField(max_length=15, blank=True)
    is_weekend = models.BooleanField(default=False)
    is_holiday = models.BooleanField(default=False)
    
    # Status tracking
    is_active = models.BooleanField(default=True)
    is_processed = models.BooleanField(default=False, help_text="Whether this data has been processed for ML")
    
    class Meta:
        ordering = ['-collected_at']
        verbose_name = 'Live Incident Data'
        verbose_name_plural = 'Live Incident Data'
        indexes = [
            models.Index(fields=['tomtom_incident_id']),
            models.Index(fields=['collected_at']),
            models.Index(fields=['city', 'incident_type']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['is_active', 'is_processed']),
        ]
    
    def __str__(self):
        return f"Incident {self.tomtom_incident_id} - {self.incident_type} at {self.location_description}"
    
    @property
    def duration_minutes(self):
        """Calculate incident duration in minutes"""
        if self.start_time and self.end_time:
            return int((self.end_time - self.start_time).total_seconds() / 60)
        return None
    
    @property
    def is_resolved(self):
        """Check if incident is resolved"""
        return self.end_time is not None and self.end_time <= timezone.now()


class TrafficFlowData(models.Model):
    """
    Model for storing traffic flow data for ML training.
    """
    
    # Location
    latitude = models.DecimalField(max_digits=10, decimal_places=7, db_index=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, db_index=True)
    
    # Traffic metrics
    current_speed = models.FloatField(help_text="Current speed in km/h")
    free_flow_speed = models.FloatField(help_text="Free flow speed in km/h")
    current_travel_time = models.IntegerField(help_text="Current travel time in seconds")
    free_flow_travel_time = models.IntegerField(help_text="Free flow travel time in seconds")
    
    # Calculated metrics
    congestion_ratio = models.FloatField(help_text="Current speed / Free flow speed")
    delay_factor = models.FloatField(help_text="Current time / Free flow time")
    
    # Contextual data
    road_closure = models.BooleanField(default=False)
    confidence = models.FloatField(null=True, blank=True)
    
    # Timing
    timestamp = models.DateTimeField(db_index=True)
    collected_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Location context
    city = models.CharField(max_length=100, db_index=True)
    road_name = models.CharField(max_length=255, blank=True)
    
    # Additional features for ML
    time_of_day = models.CharField(max_length=20, blank=True)
    day_of_week = models.CharField(max_length=15, blank=True)
    is_weekend = models.BooleanField(default=False)
    is_holiday = models.BooleanField(default=False)
    weather_conditions = models.CharField(max_length=100, blank=True)
    
    # Raw API data
    raw_api_data = models.JSONField(help_text="Complete raw response from TomTom API")
    
    # Processing status
    is_processed = models.BooleanField(default=False, help_text="Whether this data has been processed for ML")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Traffic Flow Data'
        verbose_name_plural = 'Traffic Flow Data'
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['city', 'time_of_day']),
            models.Index(fields=['collected_at']),
            models.Index(fields=['is_processed']),
        ]
    
    def __str__(self):
        return f"Traffic flow at ({self.latitude}, {self.longitude}) - {self.timestamp}"


class DataCollectionLog(models.Model):
    """
    Model to track data collection runs and statistics.
    """
    
    collection_type = models.CharField(max_length=50, choices=[
        ('incidents', 'Incidents Data'),
        ('traffic_flow', 'Traffic Flow Data'),
        ('combined', 'Combined Data Collection'),
    ])
    
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    city = models.CharField(max_length=100)
    bbox = models.CharField(max_length=200, help_text="Bounding box used for data collection")
    
    # Collection statistics
    total_records_found = models.IntegerField(default=0)
    new_records_created = models.IntegerField(default=0)
    existing_records_updated = models.IntegerField(default=0)
    errors_encountered = models.IntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='running')
    
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.collection_type} - {self.city} ({self.status})"
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.completed_at = timezone.now()
        self.error_message = error_message
        self.save()
