from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from django.http import JsonResponse, FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime, timedelta, date
import io
import os
import json
import math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from .models import TrafficData, TrafficReport, TrafficPrediction, Route
from .serializers import TrafficDataSerializer, TrafficReportSerializer, TrafficPredictionSerializer, RouteSerializer
from traffic.services.tomtom_service import TomTomService
import logging

logger = logging.getLogger(__name__)


class TrafficDataViewSet(viewsets.ViewSet):
    renderer_classes = [JSONRenderer]
    """API endpoints for traffic data."""


class TrafficReportViewSet(viewsets.ViewSet):
    """API endpoints for generating and retrieving traffic reports."""

    @action(detail=False, methods=['get'])
    def list_reports(self, request):
        """List all traffic reports with filtering and pagination."""
        # Get query parameters for filtering
        location = request.query_params.get('location')
        report_type = request.query_params.get('report_type')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        
        # Build queryset with filters
        queryset = TrafficReport.objects.all()
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        if date_from:
            try:
                date_from_parsed = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=date_from_parsed)
            except ValueError:
                return Response({'error': 'Invalid date_from format'}, status=status.HTTP_400_BAD_REQUEST)
        
        if date_to:
            try:
                date_to_parsed = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__lte=date_to_parsed)
            except ValueError:
                return Response({'error': 'Invalid date_to format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Order by most recent
        queryset = queryset.order_by('-created_at')
        
        # Apply pagination
        total_count = queryset.count()
        reports = queryset[offset:offset + limit]
        
        serializer = TrafficReportSerializer(reports, many=True)
        
        return Response({
            'count': total_count,
            'results': serializer.data,
            'limit': limit,
            'offset': offset
        }, status=status.HTTP_200_OK)

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

        # Get the proper location name using reverse geocoding
        location_info = geocoding_service.reverse_geocode(latitude, longitude)
        if location_info and location_info.get('formatted_address'):
            location_name = location_info['formatted_address']
            logger.info(f"Using reverse geocoded location: {location_name}")
        else:
            location_name = location
            logger.info(f"Using original location: {location_name}")

        # Fetch traffic data
        tomtom_service = TomTomService()
        traffic_data = tomtom_service.get_traffic_flow(lat=latitude, lon=longitude)
        incidents_data = tomtom_service.get_traffic_incidents(bbox=f"{longitude},{latitude},{longitude},{latitude}")

        # AI analysis
        ai_result = ai_analyzer.analyze_traffic_data(traffic_data, incidents_data, location_name)

        # Create and save report
        traffic_report = TrafficReport.objects.create(
            title=f"Traffic Report for {location_name}",
            report_type=serializer.validated_data['report_type'],
            location=location_name,
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

    @action(detail=False, methods=['post'], url_path='generate-comprehensive-report')
    def generate_comprehensive_report(self, request):
        """Generate a comprehensive traffic report with AI-generated sections based on template type."""
        logger.info(f"Comprehensive report request data: {request.data}")
        
        from traffic.services.geocoding_service import geocoding_service
        from traffic.services.ai_service import ai_analyzer
        from traffic.services.tomtom_service import TomTomService
        from traffic.models import TrafficReport
        from traffic.serializers import TrafficReportSerializer
        from datetime import datetime
        import random
        
        # Extract request data
        location = request.data.get('location')
        city = request.data.get('city', location)
        report_type = request.data.get('report_type', 'traffic_summary')
        date_start = request.data.get('date_start')
        date_end = request.data.get('date_end')
        format_type = request.data.get('format', 'pdf')
        
        if not location and not city:
            return Response({'error': 'Location or city is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use city if location not provided
        if not location:
            location = city
            
        # Get coordinates for the location
        coords = geocoding_service.get_coordinates_for_location(location)
        if not coords:
            return Response({'error': 'Could not determine coordinates for location'}, status=status.HTTP_400_BAD_REQUEST)
        
        latitude, longitude = coords
        logger.info(f"Generating {report_type} report for {location} at {latitude}, {longitude}")
        
        # Parse dates
        try:
            if date_start:
                start_date = datetime.strptime(date_start, '%Y-%m-%d').date()
            else:
                start_date = date.today()
                
            if date_end:
                end_date = datetime.strptime(date_end, '%Y-%m-%d').date()
            else:
                end_date = date.today()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Fetch comprehensive traffic data
            tomtom_service = TomTomService()
            detailed_traffic_data = tomtom_service.get_detailed_traffic_report((latitude, longitude), 15)
            
            # Generate AI sections based on report type
            ai_sections = ai_analyzer.generate_detailed_report_sections(
                detailed_traffic_data, location, report_type
            )
            
            # Calculate file size (mock)
            file_size = f"{random.uniform(1.5, 8.0):.1f} MB"
            
            # Create comprehensive traffic report
            traffic_report = TrafficReport.objects.create(
                title=self._get_report_title(report_type, location, start_date),
                description=self._get_report_description(report_type, location),
                report_type=report_type,
                status='generated',
                format=format_type,
                location=location,
                city=city,
                latitude=latitude,
                longitude=longitude,
                date_start=start_date,
                date_end=end_date,
                traffic_data=detailed_traffic_data,
                traffic_overview=ai_sections.get('traffic_overview', ''),
                incident_analysis=ai_sections.get('incident_analysis', ''),
                peak_hours_analysis=ai_sections.get('peak_hours_analysis', ''),
                route_performance=ai_sections.get('route_performance', ''),
                ai_recommendations=ai_sections.get('recommendations', ''),
                insights={
                    'totalIncidents': ai_sections.get('incident_count', 0),
                    'avgCongestion': ai_sections.get('congestion_level', 0),
                    'peakHours': ai_sections.get('peak_hours', '7:30-9:00 AM, 5:00-7:30 PM'),
                    'topRoutes': ai_sections.get('top_routes', ['Main Route', 'Alternative Route'])
                },
                congestion_level=ai_sections.get('congestion_level', 0),
                avg_speed=ai_sections.get('avg_speed', 0),
                incident_count=ai_sections.get('incident_count', 0),
                file_size=file_size,
                download_url=f'/api/reports/{report_type}-{location.lower().replace(" ", "-")}-{datetime.now().strftime("%Y%m%d")}.{format_type}'
            )
            
            logger.info(f"Created comprehensive report with ID: {traffic_report.id}")
            
            response_data = TrafficReportSerializer(traffic_report).data
            response_data['success'] = True
            response_data['message'] = 'Comprehensive report generated successfully'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error generating comprehensive report: {str(e)}")
            return Response({
                'error': 'Failed to generate comprehensive report',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_report_title(self, report_type: str, location: str, date: date) -> str:
        """Generate appropriate title based on report type."""
        titles = {
            'traffic_summary': f'Daily Traffic Summary - {location} - {date.strftime("%B %d, %Y")}',
            'incident_analysis': f'Incident Analysis Report - {location} - {date.strftime("%B %d, %Y")}',
            'route_performance': f'Route Performance Report - {location} - {date.strftime("%B %d, %Y")}',
            'city_comparison': f'City Comparison Report - {location} - {date.strftime("%B %d, %Y")}',
            'predictive': f'Predictive Analytics Report - {location} - {date.strftime("%B %d, %Y")}',
            'custom': f'Custom Report - {location} - {date.strftime("%B %d, %Y")}'
        }
        return titles.get(report_type, f'Traffic Report - {location} - {date.strftime("%B %d, %Y")}')
    
    def _get_report_description(self, report_type: str, location: str) -> str:
        """Generate appropriate description based on report type."""
        descriptions = {
            'traffic_summary': f'Comprehensive daily traffic analysis for {location} with congestion levels, incident reports, and route performance',
            'incident_analysis': f'Detailed analysis of traffic incidents in {location} including patterns, causes, and impact assessment',
            'route_performance': f'Analysis of specific routes in {location} including travel times, bottlenecks, and optimization opportunities',
            'city_comparison': f'Comparative analysis of {location} with other cities including traffic patterns and performance metrics',
            'predictive': f'AI-powered predictions for future traffic patterns and potential issues in {location}',
            'custom': f'Custom traffic analysis report for {location} with selected metrics and timeframes'
        }
        return descriptions.get(report_type, f'Traffic analysis report for {location}')

    @action(detail=False, methods=['post'], url_path='generate-detailed-report')
    def generate_detailed_report(self, request):
        logger.info(f"Received request data: {request.data}")
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

        if use_current_location and not latitude and not longitude:
            # Only use current location if no coordinates provided and user explicitly requested it
            latitude, longitude = self.get_current_location_coordinates()

        if not latitude or not longitude:
            coords = geocoding_service.get_coordinates_for_location(location)
            if not coords:
                return Response({'error': 'Coordinates could not be determined for location'}, status=status.HTTP_400_BAD_REQUEST)
            latitude, longitude = coords

        # Get the proper location name using reverse geocoding
        location_info = geocoding_service.reverse_geocode(latitude, longitude)
        if location_info and location_info.get('formatted_address'):
            location_name = location_info['formatted_address']
            logger.info(f"Using reverse geocoded location: {location_name}")
        else:
            location_name = location
            logger.info(f"Using original location: {location_name}")

        # Fetch detailed traffic data
        tomtom_service = TomTomService()
        detailed_traffic_data = tomtom_service.get_detailed_traffic_report((latitude, longitude), radius_km)

        # Comprehensive AI analysis
        ai_result = ai_analyzer.analyze_detailed_traffic_data(detailed_traffic_data, location_name)

        # Create and save detailed report
        traffic_report = TrafficReport.objects.create(
            title=f"Detailed Traffic Report for {location_name}",
            report_type=serializer.validated_data['report_type'],
            location=location_name,
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
        # This should not be used as fallback. Return None to force proper geocoding.
        return None, None
    
    @action(detail=False, methods=['post'], url_path='reverse-geocode')
    def reverse_geocode(self, request):
        """Reverse geocode coordinates to get address using enhanced TomTom API."""
        from traffic.services.geocoding_service import geocoding_service
        
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        if not latitude or not longitude:
            return Response({
                'error': 'Both latitude and longitude are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Convert to float in case they're strings
            latitude = float(latitude)
            longitude = float(longitude)
            
            # Use the enhanced geocoding service
            result = geocoding_service.reverse_geocode(latitude, longitude)
            
            if result:
                return Response({
                    'success': True,
                    'address': result['formatted_address'],
                    'details': {
                        'street': result.get('street', ''),
                        'city': result.get('city', ''),
                        'country': result.get('country', ''),
                        'postal_code': result.get('postal_code', ''),
                        'confidence': result.get('confidence', 0)
                    },
                    'coordinates': {
                        'latitude': latitude,
                        'longitude': longitude
                    }
                }, status=status.HTTP_200_OK)
            else:
                # Fallback to coordinates if reverse geocoding fails
                return Response({
                    'success': True,
                    'address': f"{latitude:.4f}, {longitude:.4f}",
                    'details': {
                        'street': '',
                        'city': 'Unknown',
                        'country': 'Kenya',
                        'postal_code': '',
                        'confidence': 0
                    },
                    'coordinates': {
                        'latitude': latitude,
                        'longitude': longitude
                    }
                }, status=status.HTTP_200_OK)
                
        except ValueError:
            return Response({
                'error': 'Invalid latitude or longitude format'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in reverse geocoding: {e}")
            return Response({
                'error': 'Failed to reverse geocode location'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='geocode')
    def geocode(self, request):
        """Geocode an address to get coordinates using enhanced TomTom API."""
        from traffic.services.geocoding_service import geocoding_service
        
        address = request.data.get('address')
        
        if not address:
            return Response({
                'error': 'Address is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Use the enhanced geocoding service
            result = geocoding_service.geocode_address(address)
            
            if result:
                return Response({
                    'success': True,
                    'coordinates': {
                        'latitude': result['latitude'],
                        'longitude': result['longitude']
                    },
                    'address': result['formatted_address'],
                    'details': {
                        'country': result.get('country', ''),
                        'confidence': result.get('confidence', 0)
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Could not geocode the provided address'
                }, status=status.HTTP_404_NOT_FOUND)
                
        except Exception as e:
            logger.error(f"Error in geocoding: {e}")
            return Response({
                'error': 'Failed to geocode address'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
