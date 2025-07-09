from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
import json
import math
from rest_framework.renderers import JSONRenderer
from django.shortcuts import render
from .models import TrafficData, TrafficPrediction, Route
from .serializers import TrafficDataSerializer, TrafficPredictionSerializer, RouteSerializer
from traffic.services.tomtom_service import TomTomService
import logging

logger = logging.getLogger(__name__)


class TrafficDataViewSet(viewsets.ViewSet):
    renderer_classes = [JSONRenderer]
    """API endpoints for traffic data."""


class TrafficReportViewSet(viewsets.ViewSet):
    """API endpoints for generating and retrieving traffic reports."""

    @action(detail=False, methods=['post'], url_path='generate-report')
    def generate_report(self, request):
        """Generate a traffic report for a given location."""
        from traffic.services.geocoding_service import geocoding_service
        from traffic.services.ai_service import ai_analyzer
        from traffic.services.tomtom_service import TomTomService
        from traffic.models import TrafficReport
        from traffic.serializers import TrafficReportSerializer, TrafficReportCreateSerializer

        serializer = TrafficReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        location = serializer.validated_data['location']
        use_current_location = serializer.validated_data.get('use_current_location', False)
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')

        if use_current_location:
            # Assume fetching current location coordinates implemented elsewhere
            latitude, longitude = self.get_current_location_coordinates()

        if not latitude or not longitude:
            coords = geocoding_service.get_coordinates_for_location(location)
            if not coords:
                return Response({'error': 'Coordinates could not be determined for location'}, status=status.HTTP_400_BAD_REQUEST)
            latitude, longitude = coords

        # Fetch traffic data
        tomtom_service = TomTomService()
        traffic_data = tomtom_service.get_traffic_flow(lat=latitude, lon=longitude)
        incidents_data = tomtom_service.get_traffic_incidents(bbox=f"{longitude},{latitude},{longitude},{latitude}")

        # AI analysis
        ai_result = ai_analyzer.analyze_traffic_data(traffic_data, incidents_data, location)

        # Create and save report
        traffic_report = TrafficReport.objects.create(
            title=f"Traffic Report for {location}",
            report_type=serializer.validated_data['report_type'],
            location=location,
            latitude=latitude,
            longitude=longitude,
            traffic_data=traffic_data,
            ai_analysis=ai_result['analysis'],
            ai_recommendations=ai_result['recommendations'],
            congestion_level=ai_result.get('congestion_level', 0),
            avg_speed=ai_result.get('avg_speed', 0),
            incident_count=len(incidents_data.get('incidents', []))
        )

        report_serializer = TrafficReportSerializer(traffic_report)
        return Response(report_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='generate-detailed-report')
    def generate_detailed_report(self, request):
        """Generate a comprehensive traffic report with detailed analysis."""
        from traffic.services.geocoding_service import geocoding_service
        from traffic.services.ai_service import ai_analyzer
        from traffic.services.tomtom_service import TomTomService
        from traffic.models import TrafficReport
        from traffic.serializers import TrafficReportSerializer, TrafficReportCreateSerializer

        serializer = TrafficReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        location = serializer.validated_data['location']
        use_current_location = serializer.validated_data.get('use_current_location', False)
        latitude = serializer.validated_data.get('latitude')
        longitude = serializer.validated_data.get('longitude')
        radius_km = request.data.get('radius_km', 10)  # Default 10km radius

        if use_current_location:
            latitude, longitude = self.get_current_location_coordinates()

        if not latitude or not longitude:
            coords = geocoding_service.get_coordinates_for_location(location)
            if not coords:
                return Response({'error': 'Coordinates could not be determined for location'}, status=status.HTTP_400_BAD_REQUEST)
            latitude, longitude = coords

        # Fetch detailed traffic data
        tomtom_service = TomTomService()
        detailed_traffic_data = tomtom_service.get_detailed_traffic_report((latitude, longitude), radius_km)

        # Comprehensive AI analysis
        ai_result = ai_analyzer.analyze_detailed_traffic_data(detailed_traffic_data, location)

        # Create and save detailed report
        traffic_report = TrafficReport.objects.create(
            title=f"Detailed Traffic Report for {location}",
            report_type=serializer.validated_data['report_type'],
            location=location,
            latitude=latitude,
            longitude=longitude,
            traffic_data=detailed_traffic_data,
            ai_analysis=ai_result['analysis'],
            ai_recommendations=ai_result['recommendations'],
            congestion_level=ai_result.get('congestion_level', 0),
            avg_speed=ai_result.get('avg_speed', 0),
            incident_count=ai_result.get('incident_count', 0)
        )

        # Add additional metadata for detailed report
        response_data = TrafficReportSerializer(traffic_report).data
        response_data['detailed_metrics'] = {
            'congested_areas_count': ai_result.get('congested_areas_count', 0),
            'major_routes_analyzed': ai_result.get('major_routes_analyzed', 0),
            'analysis_radius_km': radius_km,
            'sampling_points': len(detailed_traffic_data.get('traffic_flow_points', [])),
            'report_type': 'detailed'
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    def get_current_location_coordinates(self) -> tuple:
        """Placeholder method to obtain current device coordinates."""
        # This is a placeholder. Integration with a real geolocation service would be needed.
        return -1.2921, 36.8219  # Default to Nairobi
    @action(detail=False, methods=['get'])
    def live_traffic(self, request):
        """Get live traffic data from TomTom API."""
        city = request.query_params.get('city', '').lower()
        
        # City coordinates mapping
        city_coords = {
            'nairobi': (-1.2921, 36.8219),
            'mombasa': (-4.0435, 39.6682),
            'kisumu': (-0.1022, 34.7617),
            'nakuru': (-0.3031, 36.0800),
            'eldoret': (0.5143, 35.2698)
        }
        
        if city not in city_coords:
            return Response(
                {'error': f'City {city} not supported. Available cities: {list(city_coords.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tomtom_service = TomTomService()
            lat, lon = city_coords[city]
            
            # Get traffic flow data
            traffic_data = tomtom_service.get_traffic_flow(lat, lon)
            
            # Format response for frontend
            formatted_data = {
                'city': city.title(),
                'coordinates': [lon, lat],
                'traffic_flow': traffic_data,
                'timestamp': traffic_data.get('flowSegmentData', {}).get('currentTime', '')
            }
            
            return Response(formatted_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f'Error fetching live traffic data for {city}: {str(e)}')
            return Response(
                {'error': 'Failed to fetch live traffic data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def city_summary(self, request):
        """Get traffic summary for a city."""
        city = request.query_params.get('city', '').lower()
        
        # City coordinates mapping
        city_coords = {
            'nairobi': (-1.2921, 36.8219),
            'mombasa': (-4.0435, 39.6682),
            'kisumu': (-0.1022, 34.7617),
            'nakuru': (-0.3031, 36.0800),
            'eldoret': (0.5143, 35.2698)
        }
        
        if city not in city_coords:
            return Response(
                {'error': f'City {city} not supported. Available cities: {list(city_coords.keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tomtom_service = TomTomService()
            lat, lon = city_coords[city]
            
            # Get city traffic summary
            summary_data = tomtom_service.get_city_traffic_summary((lat, lon))
            
            return HttpResponse(json.dumps(summary_data), content_type='application/json', status=200)
            
        except Exception as e:
            logger.error(f'Error fetching city summary for {city}: {str(e)}')
            return Response(
                {'error': 'Failed to fetch city traffic summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def incidents(self, request):
        """Get live traffic incidents for a city."""
        city = request.query_params.get('city', '').lower()
        
        city_coords = {
            'nairobi': (-1.2921, 36.8219),
            'mombasa': (-4.0435, 39.6682),
            'kisumu': (-0.1022, 34.7617),
            'nakuru': (-0.3031, 36.0800),
            'eldoret': (0.5143, 35.2698)
        }
        
        if city not in city_coords:
            return Response(
                {'error': f'City {city} not supported.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tomtom_service = TomTomService()
            lat, lon = city_coords[city]
            
            # Calculate bounding box from city center and a 10km radius
            radius_km = 10
            lat_change = radius_km / 111.32
            lon_change = radius_km / (111.32 * math.cos(math.radians(lat)))
            bbox = f"{lon - lon_change},{lat - lat_change},{lon + lon_change},{lat + lat_change}"
            
            incidents_data = tomtom_service.get_traffic_incidents(bbox)
            logger.info(f"TomTom incidents response: {json.dumps(incidents_data, indent=2)}")
            incidents_list = incidents_data.get('incidents', [])
            
            return HttpResponse(json.dumps(incidents_list), content_type='application/json', status=200)
            
        except Exception as e:
            logger.error(f'Error fetching incidents for {city}: {str(e)}')
            return Response(
                {'error': 'Failed to fetch traffic incidents'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrafficPredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing traffic predictions."""
    queryset = TrafficPrediction.objects.all()
    serializer_class = TrafficPredictionSerializer
    
    def get_queryset(self):
        """Filter predictions by location if provided."""
        queryset = TrafficPrediction.objects.all()
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset.order_by('-created_at')


class RouteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing routes."""
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    
    @action(detail=False, methods=['post'])
    def optimize(self, request):
        """Optimize route based on current traffic conditions."""
        start_location = request.data.get('start_location')
        end_location = request.data.get('end_location')
        
        if not start_location or not end_location:
            return Response(
                {'error': 'Both start_location and end_location are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple optimization logic (can be enhanced with actual algorithms)
        # For now, we'll return a basic optimized route
        optimized_route = {
            'start_location': start_location,
            'end_location': end_location,
            'estimated_duration': 25,  # minutes
            'distance': 15.5,  # km
            'traffic_level': 'moderate',
            'alternative_routes': [
                {
                    'route_name': 'Route A',
                    'duration': 30,
                    'distance': 18.2,
                    'traffic_level': 'heavy'
                },
                {
                    'route_name': 'Route B',
                    'duration': 22,
                    'distance': 14.8,
                    'traffic_level': 'light'
                }
            ]
        }
        
        return Response(optimized_route, status=status.HTTP_200_OK)
