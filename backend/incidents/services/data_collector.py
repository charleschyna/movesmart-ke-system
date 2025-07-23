import logging
import math
from datetime import datetime, timezone
from typing import Dict, List, Tuple, Optional
from dateutil import parser

from django.utils import timezone as django_timezone
from django.db import transaction

from traffic.services.tomtom_service import TomTomService
from incidents.models import LiveIncidentData, TrafficFlowData, DataCollectionLog

logger = logging.getLogger(__name__)


class LiveDataCollector:
    """
    Service for collecting and storing live incident and traffic data from TomTom API
    for machine learning model training.
    """
    
    # Kenyan cities with their bounding boxes for data collection
    KENYAN_CITIES = {
        'nairobi': {
            'name': 'Nairobi',
            'center': (-1.2921, 36.8219),
            'bbox_radius': 25,  # km
        },
        'mombasa': {
            'name': 'Mombasa',
            'center': (-4.0435, 39.6682),
            'bbox_radius': 20,
        },
        'kisumu': {
            'name': 'Kisumu',
            'center': (-0.0917, 34.7680),
            'bbox_radius': 15,
        },
        'nakuru': {
            'name': 'Nakuru',
            'center': (-0.3031, 36.0800),
            'bbox_radius': 15,
        },
        'eldoret': {
            'name': 'Eldoret',
            'center': (0.5143, 35.2698),
            'bbox_radius': 15,
        }
    }
    
    def __init__(self):
        self.tomtom_service = TomTomService()
    
    def collect_all_cities_data(self, collection_type: str = 'combined') -> List[Dict]:
        """
        Collect data for all Kenyan cities.
        
        Args:
            collection_type: 'incidents', 'traffic_flow', or 'combined'
            
        Returns:
            List of collection results for each city
        """
        results = []
        
        for city_key, city_info in self.KENYAN_CITIES.items():
            try:
                if collection_type == 'incidents':
                    result = self.collect_incident_data(city_key)
                elif collection_type == 'traffic_flow':
                    result = self.collect_traffic_flow_data(city_key)
                else:  # combined
                    incident_result = self.collect_incident_data(city_key)
                    traffic_result = self.collect_traffic_flow_data(city_key)
                    result = {
                        'city': city_key,
                        'incident_collection': incident_result,
                        'traffic_collection': traffic_result
                    }
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error collecting data for {city_key}: {e}")
                results.append({
                    'city': city_key,
                    'error': str(e),
                    'status': 'failed'
                })
        
        return results
    
    def collect_incident_data(self, city: str) -> Dict:
        """
        Collect live incident data for a specific city.
        
        Args:
            city: City key from KENYAN_CITIES
            
        Returns:
            Collection statistics
        """
        if city not in self.KENYAN_CITIES:
            raise ValueError(f"Unknown city: {city}")
        
        city_info = self.KENYAN_CITIES[city]
        bbox = self._calculate_bbox(city_info['center'], city_info['bbox_radius'])
        bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
        
        # Create collection log
        collection_log = DataCollectionLog.objects.create(
            collection_type='incidents',
            city=city_info['name'],
            bbox=bbox_str
        )
        
        try:
            # Fetch incidents from TomTom API
            incidents_response = self.tomtom_service.get_traffic_incidents(bbox_str)
            
            if not incidents_response or 'incidents' not in incidents_response:
                collection_log.mark_completed()
                return {
                    'city': city,
                    'status': 'completed',
                    'total_found': 0,
                    'new_records': 0,
                    'updated_records': 0
                }
            
            incidents = incidents_response.get('incidents', [])
            collection_log.total_records_found = len(incidents)
            
            new_records = 0
            updated_records = 0
            errors = 0
            
            for incident_data in incidents:
                try:
                    processed = self._process_incident_data(incident_data, city_info['name'])
                    if processed['created']:
                        new_records += 1
                    else:
                        updated_records += 1
                        
                except Exception as e:
                    logger.error(f"Error processing incident {incident_data.get('properties', {}).get('id', 'unknown')}: {e}")
                    errors += 1
            
            # Update collection log
            collection_log.new_records_created = new_records
            collection_log.existing_records_updated = updated_records
            collection_log.errors_encountered = errors
            collection_log.mark_completed()
            
            logger.info(f"Completed incident collection for {city}: {new_records} new, {updated_records} updated, {errors} errors")
            
            return {
                'city': city,
                'status': 'completed',
                'total_found': len(incidents),
                'new_records': new_records,
                'updated_records': updated_records,
                'errors': errors
            }
            
        except Exception as e:
            collection_log.mark_failed(str(e))
            logger.error(f"Failed to collect incident data for {city}: {e}")
            raise
    
    def collect_traffic_flow_data(self, city: str) -> Dict:
        """
        Collect traffic flow data for a specific city.
        
        Args:
            city: City key from KENYAN_CITIES
            
        Returns:
            Collection statistics
        """
        if city not in self.KENYAN_CITIES:
            raise ValueError(f"Unknown city: {city}")
        
        city_info = self.KENYAN_CITIES[city]
        bbox = self._calculate_bbox(city_info['center'], city_info['bbox_radius'])
        bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
        
        # Create collection log
        collection_log = DataCollectionLog.objects.create(
            collection_type='traffic_flow',
            city=city_info['name'],
            bbox=bbox_str
        )
        
        try:
            # Generate sampling points for traffic flow data
            sampling_points = self._generate_sampling_points(
                city_info['center'], 
                city_info['bbox_radius']
            )
            
            collection_log.total_records_found = len(sampling_points)
            
            new_records = 0
            errors = 0
            
            for lat, lon in sampling_points:
                try:
                    flow_data = self.tomtom_service.get_traffic_flow(lat, lon)
                    if flow_data:
                        self._process_traffic_flow_data(flow_data, lat, lon, city_info['name'])
                        new_records += 1
                        
                except Exception as e:
                    logger.error(f"Error processing traffic flow at ({lat}, {lon}): {e}")
                    errors += 1
            
            # Update collection log
            collection_log.new_records_created = new_records
            collection_log.errors_encountered = errors
            collection_log.mark_completed()
            
            logger.info(f"Completed traffic flow collection for {city}: {new_records} new, {errors} errors")
            
            return {
                'city': city,
                'status': 'completed',
                'total_points': len(sampling_points),
                'new_records': new_records,
                'errors': errors
            }
            
        except Exception as e:
            collection_log.mark_failed(str(e))
            logger.error(f"Failed to collect traffic flow data for {city}: {e}")
            raise
    
    def _process_incident_data(self, incident_data: Dict, city: str) -> Dict:
        """
        Process and store incident data from TomTom API.
        
        Returns:
            Dict with 'created' boolean indicating if new record was created
        """
        properties = incident_data.get('properties', {})
        geometry = incident_data.get('geometry', {})
        coordinates = geometry.get('coordinates', [])
        
        # Validate and parse coordinates
        if not coordinates:
            raise ValueError("No coordinates found in incident data")
        
        # Log raw coordinates for debugging
        logger.debug(f"Raw coordinates received: {coordinates} (type: {type(coordinates)})")
        
        # Handle case where coordinates might be a string representation
        if isinstance(coordinates, str):
            try:
                import json
                coordinates = json.loads(coordinates)
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse coordinates string '{coordinates}': {e}")
                raise ValueError(f"Invalid coordinates format: {coordinates}")
        
        # Handle both single coordinate pairs [lon, lat] and multi-point geometries [[lon1, lat1], [lon2, lat2], ...]
        if not isinstance(coordinates, (list, tuple)) or len(coordinates) == 0:
            logger.error(f"Coordinates must be a non-empty array, got: {coordinates}")
            raise ValueError(f"Coordinates must be a non-empty array, got: {coordinates}")
        
        # Check if this is a multi-point geometry (list of coordinate pairs)
        if isinstance(coordinates[0], (list, tuple)):
            logger.debug(f"Multi-point geometry detected with {len(coordinates)} points")
            # For multi-point geometries, use the first coordinate as representative point
            if len(coordinates[0]) != 2:
                logger.error(f"Each coordinate pair must have exactly 2 elements, got: {coordinates[0]}")
                raise ValueError(f"Each coordinate pair must have exactly 2 elements, got: {coordinates[0]}")
            representative_coords = coordinates[0]
        else:
            # Single coordinate pair [lon, lat]
            if len(coordinates) != 2:
                logger.error(f"Single coordinate must be an array of length 2, got: {coordinates}")
                raise ValueError(f"Single coordinate must be an array of length 2, got: {coordinates}")
            representative_coords = coordinates
        
        # Parse coordinates as floats explicitly (TomTom returns [lon, lat])
        try:
            lon = float(representative_coords[0])  # longitude
            lat = float(representative_coords[1])  # latitude
            logger.debug(f"Parsed coordinates: lat={lat}, lon={lon}")
        except (ValueError, TypeError) as e:
            logger.error(f"Failed to parse coordinates to floats: {representative_coords}, error: {e}")
            raise ValueError(f"Invalid coordinate values - must be numeric: {representative_coords}")
        
        # Validate coordinate ranges (basic sanity check)
        if not (-90 <= lat <= 90):
            logger.error(f"Invalid latitude value: {lat} (must be between -90 and 90)")
            raise ValueError(f"Invalid latitude value: {lat}")
        
        if not (-180 <= lon <= 180):
            logger.error(f"Invalid longitude value: {lon} (must be between -180 and 180)")
            raise ValueError(f"Invalid longitude value: {lon}")
        
        incident_id = properties.get('id')
        if not incident_id:
            raise ValueError("No incident ID found")
        
        # Parse timing data
        start_time = None
        end_time = None
        last_report_time = None
        
        if properties.get('startTime'):
            start_time = parser.parse(properties['startTime'])
        if properties.get('endTime'):
            end_time = parser.parse(properties['endTime'])
        if properties.get('lastReportTime'):
            last_report_time = parser.parse(properties['lastReportTime'])
        
        # Extract additional features for ML
        now = django_timezone.now()
        time_of_day = self._get_time_of_day(now.hour)
        day_of_week = now.strftime('%A')
        is_weekend = now.weekday() >= 5
        
        # Parse events for incident type
        events = properties.get('events', [])
        incident_type = 'other'
        if events:
            event_codes = [event.get('code', '') for event in events]
            incident_type = self._categorize_incident_type(event_codes)
        
        # Create or update incident record
        incident, created = LiveIncidentData.objects.update_or_create(
            tomtom_incident_id=incident_id,
            defaults={
                'latitude': lat,  # Use parsed and validated latitude
                'longitude': lon,  # Use parsed and validated longitude
                'location_description': properties.get('to', '') or properties.get('from', ''),
                'road_numbers': properties.get('roadNumbers', []),
                'incident_type': incident_type,
                'icon_category': properties.get('iconCategory', ''),
                'severity_code': str(properties.get('magnitudeOfDelay', '')),
                'start_time': start_time,
                'end_time': end_time,
                'last_report_time': last_report_time,
                'magnitude_of_delay': str(properties.get('magnitudeOfDelay', '')),
                'length': properties.get('length'),
                'delay': properties.get('delay'),
                'probability_of_occurrence': properties.get('probabilityOfOccurrence'),
                'number_of_reports': properties.get('numberOfReports', 0),
                'raw_api_data': incident_data,
                'city': city,
                'time_of_day': time_of_day,
                'day_of_week': day_of_week,
                'is_weekend': is_weekend,
                'is_active': end_time is None or end_time > now,
            }
        )
        
        return {'created': created, 'incident': incident}
    
    def _process_traffic_flow_data(self, flow_data: Dict, lat: float, lon: float, city: str):
        """
        Process and store traffic flow data from TomTom API.
        """
        flow_segment = flow_data.get('flowSegmentData', {})
        
        current_speed = flow_segment.get('currentSpeed', 0)
        free_flow_speed = flow_segment.get('freeFlowSpeed', 0)
        current_travel_time = flow_segment.get('currentTravelTime', 0)
        free_flow_travel_time = flow_segment.get('freeFlowTravelTime', 0)
        
        # Calculate derived metrics
        congestion_ratio = current_speed / free_flow_speed if free_flow_speed > 0 else 0
        delay_factor = current_travel_time / free_flow_travel_time if free_flow_travel_time > 0 else 1
        
        # Extract additional features for ML
        now = django_timezone.now()
        time_of_day = self._get_time_of_day(now.hour)
        day_of_week = now.strftime('%A')
        is_weekend = now.weekday() >= 5
        
        # Create traffic flow record
        TrafficFlowData.objects.create(
            latitude=lat,
            longitude=lon,
            current_speed=current_speed,
            free_flow_speed=free_flow_speed,
            current_travel_time=current_travel_time,
            free_flow_travel_time=free_flow_travel_time,
            congestion_ratio=congestion_ratio,
            delay_factor=delay_factor,
            road_closure=flow_segment.get('roadClosure', False),
            confidence=flow_segment.get('confidence'),
            timestamp=now,
            city=city,
            time_of_day=time_of_day,
            day_of_week=day_of_week,
            is_weekend=is_weekend,
            raw_api_data=flow_data
        )
    
    def _calculate_bbox(self, center: Tuple[float, float], radius_km: float) -> Tuple[float, float, float, float]:
        """
        Calculate bounding box from center point and radius.
        
        Returns:
            Tuple of (min_lon, min_lat, max_lon, max_lat)
        """
        lat, lon = center
        
        # Approximate degrees per kilometer
        lat_change = radius_km / 111.32
        lon_change = radius_km / (111.32 * abs(math.cos(math.radians(lat))))
        
        return (
            lon - lon_change,  # min_lon
            lat - lat_change,  # min_lat
            lon + lon_change,  # max_lon
            lat + lat_change   # max_lat
        )
    
    def _generate_sampling_points(self, center: Tuple[float, float], radius_km: float, num_points: int = 25) -> List[Tuple[float, float]]:
        """
        Generate sampling points within the specified radius for traffic flow data collection.
        
        Args:
            center: (lat, lon) center point
            radius_km: Radius in kilometers
            num_points: Number of sampling points to generate
            
        Returns:
            List of (lat, lon) tuples
        """
        lat, lon = center
        points = [(lat, lon)]  # Include center point
        
        # Generate points in a grid pattern
        grid_size = int(math.sqrt(num_points - 1))
        
        for i in range(grid_size):
            for j in range(grid_size):
                # Calculate offset as fraction of radius
                lat_offset = (i - grid_size/2) * (radius_km * 0.8) / grid_size / 111.32
                lon_offset = (j - grid_size/2) * (radius_km * 0.8) / grid_size / (111.32 * abs(math.cos(math.radians(lat))))
                
                new_lat = lat + lat_offset
                new_lon = lon + lon_offset
                points.append((new_lat, new_lon))
        
        return points[:num_points]
    
    def _get_time_of_day(self, hour: int) -> str:
        """
        Categorize hour into time of day for ML features.
        """
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 21:
            return 'evening'
        else:
            return 'night'
    
    def _categorize_incident_type(self, event_codes: List[str]) -> str:
        """
        Categorize incident type based on TomTom event codes.
        """
        # Map TomTom event codes to our incident types
        code_mapping = {
            # Accidents
            '1': 'accident', '2': 'accident', '3': 'accident',
            # Construction
            '4': 'construction', '5': 'construction', '6': 'construction',
            # Road closure
            '7': 'road_closure', '8': 'road_closure',
            # Weather
            '9': 'weather', '10': 'weather',
            # Events
            '11': 'event', '12': 'event',
            # Breakdown
            '13': 'breakdown', '14': 'breakdown'
        }
        
        for code in event_codes:
            if code in code_mapping:
                return code_mapping[code]
        
        return 'other'
    
    def get_collection_statistics(self, hours: int = 24) -> Dict:
        """
        Get data collection statistics for the specified time period.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dictionary with collection statistics
        """
        from django.utils import timezone
        from datetime import timedelta
        
        since = timezone.now() - timedelta(hours=hours)
        
        # Get collection logs
        logs = DataCollectionLog.objects.filter(started_at__gte=since)
        
        # Get data counts
        incidents_count = LiveIncidentData.objects.filter(collected_at__gte=since).count()
        traffic_flow_count = TrafficFlowData.objects.filter(collected_at__gte=since).count()
        
        return {
            'period_hours': hours,
            'collection_runs': logs.count(),
            'successful_runs': logs.filter(status='completed').count(),
            'failed_runs': logs.filter(status='failed').count(),
            'incidents_collected': incidents_count,
            'traffic_flow_collected': traffic_flow_count,
            'total_records': incidents_count + traffic_flow_count,
            'latest_collection': logs.first().started_at if logs.exists() else None
        }


# Convenience function for easy import
def collect_live_data(city: str = None, collection_type: str = 'combined') -> Dict:
    """
    Convenience function to collect live data.
    
    Args:
        city: Specific city to collect data for, or None for all cities
        collection_type: 'incidents', 'traffic_flow', or 'combined'
        
    Returns:
        Collection results
    """
    collector = LiveDataCollector()
    
    if city:
        if collection_type == 'incidents':
            return collector.collect_incident_data(city)
        elif collection_type == 'traffic_flow':
            return collector.collect_traffic_flow_data(city)
        else:
            return {
                'city': city,
                'incident_collection': collector.collect_incident_data(city),
                'traffic_collection': collector.collect_traffic_flow_data(city)
            }
    else:
        return collector.collect_all_cities_data(collection_type)
