from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import render
from .models import Incident, IncidentComment
from .serializers import IncidentSerializer, IncidentCommentSerializer
from traffic.services.tomtom_service import TomTomService
from authentication.permissions import RolePermission


class IncidentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing incidents."""
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer
    permission_classes = [RolePermission]

    # Action -> required perms mapping
    REQUIRED_PERMISSIONS = {
        'list': ['incidents:read'],
        'retrieve': ['incidents:read'],
        'create': ['incidents:manage'],
        'update': ['incidents:manage'],
        'partial_update': ['incidents:manage'],
        'destroy': ['incidents:manage'],
        'resolve': ['incidents:manage'],
        'active': ['incidents:read'],
        'statistics': ['incidents:read'],
        'live_incidents': ['traffic:read'],
    }
    
    def get_queryset(self):
        """Filter incidents by status or location if provided."""
        queryset = Incident.objects.all()
        status_filter = self.request.query_params.get('status')
        location = self.request.query_params.get('location')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark an incident as resolved."""
        incident = self.get_object()
        incident.status = 'resolved'
        incident.save()
        
        # Audit log
        try:
            from .models import AuditLog
            AuditLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action='incident_resolve',
                details={'incident_id': incident.id, 'title': incident.title}
            )
        except Exception:
            pass
        
        serializer = self.get_serializer(incident)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active incidents."""
        active_incidents = Incident.objects.filter(status='active')
        serializer = self.get_serializer(active_incidents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get incident statistics."""
        total_incidents = Incident.objects.count()
        active_incidents = Incident.objects.filter(status='active').count()
        resolved_incidents = Incident.objects.filter(status='resolved').count()
        
        stats = {
            'total_incidents': total_incidents,
            'active_incidents': active_incidents,
            'resolved_incidents': resolved_incidents,
            'incident_types': {
                'accident': Incident.objects.filter(incident_type='accident').count(),
                'construction': Incident.objects.filter(incident_type='construction').count(),
                'weather': Incident.objects.filter(incident_type='weather').count(),
                'event': Incident.objects.filter(incident_type='event').count(),
                'other': Incident.objects.filter(incident_type='other').count(),
            }
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def live_incidents(self, request):
        """Get live incidents from TomTom API."""
        try:
            # Get city and bounding box from request parameters
            city = request.query_params.get('city', 'Nairobi')
            
            # Define bounding boxes for major Kenyan cities
            city_bounds = {
                'Nairobi': {
                    'min_lon': 36.6000,
                    'min_lat': -1.4500,
                    'max_lon': 37.1000,
                    'max_lat': -1.1500
                },
                'Mombasa': {
                    'min_lon': 39.5000,
                    'min_lat': -4.2000,
                    'max_lon': 39.8000,
                    'max_lat': -3.9000
                },
                'Kisumu': {
                    'min_lon': 34.6000,
                    'min_lat': -0.2000,
                    'max_lon': 35.0000,
                    'max_lat': 0.2000
                },
                'Nakuru': {
                    'min_lon': 36.0000,
                    'min_lat': -0.5000,
                    'max_lon': 36.2000,
                    'max_lat': -0.2000
                },
                'Eldoret': {
                    'min_lon': 35.1000,
                    'min_lat': 0.4000,
                    'max_lon': 35.4000,
                    'max_lat': 0.7000
                }
            }
            
            bounds = city_bounds.get(city, city_bounds['Nairobi'])
            
            # Initialize TomTom service
            tomtom_service = TomTomService()
            
            # Fetch live incidents
            live_incidents = tomtom_service.get_traffic_incidents(
                bbox=f"{bounds['min_lon']},{bounds['min_lat']},{bounds['max_lon']},{bounds['max_lat']}",
                category_filter='0,1,2,3,4,5,6,7,8,9,10,11,12,13,14'  # All incident categories
            )
            
            # Format the response for frontend consumption
            formatted_incidents = []
            if live_incidents and 'incidents' in live_incidents:
                for incident in live_incidents['incidents']:
                    # Extract incident details
                    incident_data = {
                        'id': incident.get('id'),
                        'type': incident.get('properties', {}).get('iconCategory', 'unknown'),
                        'description': incident.get('properties', {}).get('description', 'Traffic incident'),
                        'severity': incident.get('properties', {}).get('magnitudeOfDelay', 0),
                        'location': {
                            'coordinates': incident.get('geometry', {}).get('coordinates', []),
                            'type': incident.get('geometry', {}).get('type', 'Point')
                        },
                        'start_time': incident.get('properties', {}).get('startTime'),
                        'end_time': incident.get('properties', {}).get('endTime'),
                        'road_numbers': incident.get('properties', {}).get('roadNumbers', []),
                        'length': incident.get('properties', {}).get('length', 0),
                        'delay': incident.get('properties', {}).get('delay', 0),
                        'verified': incident.get('properties', {}).get('verified', False),
                        'source': 'tomtom'
                    }
                    formatted_incidents.append(incident_data)
            
            return Response({
                'incidents': formatted_incidents,
                'total_count': len(formatted_incidents),
                'city': city,
                'timestamp': tomtom_service.get_current_timestamp()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Failed to fetch live incidents',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IncidentCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing incident comments."""
    queryset = IncidentComment.objects.all()
    serializer_class = IncidentCommentSerializer
    
    def get_queryset(self):
        """Filter comments by incident if provided."""
        queryset = IncidentComment.objects.all()
        incident_id = self.request.query_params.get('incident_id')
        
        if incident_id:
            queryset = queryset.filter(incident_id=incident_id)
            
        return queryset.order_by('-created_at')
