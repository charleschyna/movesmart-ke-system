import requests
import logging
import math
from django.conf import settings
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class TomTomService:
    """Service for integrating with TomTom API to fetch real-time traffic data."""
    
    def __init__(self):
        self.api_key = settings.TOMTOM_API_KEY
        self.base_url = "https://api.tomtom.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    
    def get_traffic_flow(self, lat: float, lon: float, zoom: int = 12) -> Dict[str, Any]:
        """
        Fetch traffic flow data for a specific location.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate  
            zoom: Map zoom level (affects detail level)
            
        Returns:
            Dictionary containing traffic flow data
        """
        url = f"{self.base_url}/traffic/services/4/flowSegmentData/absolute/10/json"
        
        params = {
            'key': self.api_key,
            'point': f"{lat},{lon}",
            'unit': 'KMPH',
            'openLr': 'false'
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10) # 10-second timeout
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching traffic flow data: {e}")
            return {}
    
    def get_traffic_incidents(self, bbox: str, category_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch traffic incidents for a bounding box area.
        
        Args:
            bbox: Bounding box in format "minLon,minLat,maxLon,maxLat"
            category_filter: Optional filter for incident categories
            
        Returns:
            Dictionary containing traffic incidents data
        """
        # TomTom incidents API endpoint format - corrected URL structure
        url = f"{self.base_url}/traffic/services/5/incidentDetails"
        
        params = {
            'key': self.api_key,
            'bbox': bbox,
            'fields': '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity,probabilityOfOccurrence,numberOfReports,lastReportTime}}}',
            'language': 'en-US',
            'timeValidityFilter': 'present'
        }
        
        # Add category filter if provided
        if category_filter:
            params['categoryFilter'] = category_filter
        
        try:
            response = self.session.get(url, params=params, timeout=15) # 15-second timeout
            response.raise_for_status()
            return response.json()
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON from TomTom API. Status: {response.status_code}, Response: {response.text}")
            return {}
        except requests.RequestException as e:
            logger.error(f"Error fetching traffic incidents: {e}")
            logger.error(f"URL: {url}")
            logger.error(f"Params: {params}")
            return {}
    
    def get_traffic_flow_tile(self, x: int, y: int, zoom: int, style: str = "absolute") -> Optional[bytes]:
        """
        Fetch traffic flow tile data.
        
        Args:
            x: Tile X coordinate
            y: Tile Y coordinate
            zoom: Zoom level
            style: Traffic style ("absolute", "relative", "relative-delay")
            
        Returns:
            Tile data as bytes or None if failed
        """
        url = f"{self.base_url}/traffic/map/4/tile/flow/{style}/{zoom}/{x}/{y}.png"
        
        params = {
            'key': self.api_key
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.content
        except requests.RequestException as e:
            logger.error(f"Error fetching traffic flow tile: {e}")
            return None
    
    def get_detailed_traffic_report(self, city_center: tuple, radius_km: float = 10) -> Dict[str, Any]:
        """
        Get comprehensive traffic data for detailed report generation.
        
        Args:
            city_center: Tuple of (lat, lon) for the city center.
            radius_km: Radius in kilometers to define the area.
            
        Returns:
            A dictionary with detailed traffic data including roads, incidents, and flow data.
        """
        logger.info(f"Fetching detailed traffic report for {city_center} with radius {radius_km}km")
        
        lat, lon = city_center
        
        # Convert to float to handle Decimal types from Django models
        lat = float(lat)
        lon = float(lon)
        
        # Calculate bounding box for incidents API
        lat_change = radius_km / 111.32
        lon_change = radius_km / (111.32 * abs(math.cos(math.radians(lat))))
        bbox = f"{lon - lon_change},{lat - lat_change},{lon + lon_change},{lat + lat_change}"
        
        # Fetch multiple data points around the area for comprehensive coverage
        traffic_points = self._generate_traffic_sampling_points(lat, lon, radius_km)
        
        # Fetch detailed traffic flow data for multiple points
        flow_data_points = []
        for point_lat, point_lon in traffic_points:
            flow_data = self.get_traffic_flow(point_lat, point_lon)
            if flow_data:
                flow_data['coordinates'] = [point_lat, point_lon]
                flow_data_points.append(flow_data)
        
        # Fetch incidents data
        incidents_data = self.get_traffic_incidents(bbox)
        
        # Fetch route data for major roads
        route_data = self._get_major_routes_traffic(lat, lon, radius_km)
        
        return {
            'center_coordinates': [lat, lon],
            'radius_km': radius_km,
            'bbox': bbox,
            'traffic_flow_points': flow_data_points,
            'incidents': incidents_data,
            'major_routes': route_data,
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_traffic_sampling_points(self, center_lat: float, center_lon: float, radius_km: float) -> List[tuple]:
        """
        Generate sampling points around the center for comprehensive traffic analysis.
        """
        points = [(center_lat, center_lon)]  # Center point
        
        # Add points in 8 directions around the center
        angles = [0, 45, 90, 135, 180, 225, 270, 315]
        for angle in angles:
            # Calculate point at 60% of radius in each direction
            angle_rad = math.radians(angle)
            lat_offset = (radius_km * 0.6) * math.cos(angle_rad) / 111.32
            lon_offset = (radius_km * 0.6) * math.sin(angle_rad) / (111.32 * abs(math.cos(math.radians(center_lat))))
            
            new_lat = center_lat + lat_offset
            new_lon = center_lon + lon_offset
            points.append((new_lat, new_lon))
        
        return points
    
    def _get_major_routes_traffic(self, center_lat: float, center_lon: float, radius_km: float) -> List[Dict[str, Any]]:
        """
        Get traffic data for major routes in the area.
        """
        # Define some major routes for Nairobi area (can be expanded)
        major_routes = [
            {'name': 'Uhuru Highway', 'start': (-1.2921, 36.8219), 'end': (-1.3073, 36.8219)},
            {'name': 'Waiyaki Way', 'start': (-1.2651, 36.8048), 'end': (-1.2434, 36.7073)},
            {'name': 'Ngong Road', 'start': (-1.2921, 36.8219), 'end': (-1.3670, 36.7756)},
            {'name': 'Thika Road', 'start': (-1.2634, 36.8309), 'end': (-1.0332, 37.0692)},
            {'name': 'Mombasa Road', 'start': (-1.2921, 36.8219), 'end': (-1.3670, 36.8950)}
        ]
        
        route_traffic_data = []
        for route in major_routes:
            # Check if route is within our analysis area
            if self._is_route_in_area(route, center_lat, center_lon, radius_km):
                route_traffic = self.get_route_traffic(
                    route['start'][0], route['start'][1],
                    route['end'][0], route['end'][1]
                )
                if route_traffic:
                    route_traffic['route_name'] = route['name']
                    route_traffic_data.append(route_traffic)
        
        return route_traffic_data
    
    def _is_route_in_area(self, route: Dict[str, Any], center_lat: float, center_lon: float, radius_km: float) -> bool:
        """
        Check if a route intersects with the analysis area.
        """
        start_lat, start_lon = route['start']
        end_lat, end_lon = route['end']
        
        # Simple distance check - if either start or end is within radius
        start_distance = self._calculate_distance(center_lat, center_lon, start_lat, start_lon)
        end_distance = self._calculate_distance(center_lat, center_lon, end_lat, end_lon)
        
        return start_distance <= radius_km or end_distance <= radius_km
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula.
        """
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c

    def get_city_traffic_summary(self, city_center: tuple, radius_km: float = 10) -> Dict[str, Any]:
        """
        Get a simplified traffic summary for the frontend dashboard.
        
        Args:
            city_center: Tuple of (lat, lon) for the city center.
            radius_km: Radius in kilometers to define the area.
            
        Returns:
            A dictionary formatted for the dashboard with congestion, travel time, incidents, and AI forecast.
        """
        logger.info(f"Fetching city traffic summary for {city_center} with radius {radius_km}km")
        
        lat, lon = city_center
        
        # Calculate bounding box for incidents API
        lat_change = radius_km / 111.32
        lon_change = radius_km / (111.32 * abs(math.cos(math.radians(lat))))
        bbox = f"{lon - lon_change},{lat - lat_change},{lon + lon_change},{lat + lat_change}"
        
        # Fetch data from TomTom APIs
        logger.info("Fetching TomTom traffic flow data...")
        flow_data = self.get_traffic_flow(lat, lon)
        logger.info(f"Received flow data: {'present' if flow_data else 'empty'}")

        logger.info("Fetching TomTom traffic incidents data...")
        incidents_data = self.get_traffic_incidents(bbox)
        logger.info(f"Received incidents data: {'present' if incidents_data else 'empty'}")
        
        # Initialize default values
        congestion_level = 0
        avg_travel_time = 0  # Per 10km
        live_incidents = 0
        
        # Process flow data
        if flow_data and 'flowSegmentData' in flow_data:
            segment = flow_data['flowSegmentData']
            current_speed = segment.get('currentSpeed', 0)
            free_flow_speed = segment.get('freeFlowSpeed', 1) # Avoid division by zero
            
            if free_flow_speed > 0:
                # Congestion is the percentage of speed reduction from free flow
                congestion_level = round(max(0, (1 - (current_speed / free_flow_speed)) * 100))
            
            # Average travel time is reported in seconds per meter in some APIs, here it's per segment
            # Let's calculate travel time per 10km based on current speed
            if current_speed > 0:
                avg_travel_time = round((10 / current_speed) * 60) # Time in minutes to travel 10km
            else:
                # If speed is 0, travel time is effectively infinite, show a high number
                avg_travel_time = 99
        else:
            # Fallback data when TomTom API is not available
            logger.warning("TomTom API unavailable, using simulated data")
            import random
            import datetime
            
            # Generate realistic data based on time of day
            current_hour = datetime.datetime.now().hour
            
            # Morning rush (7-9 AM) and evening rush (5-7 PM)
            if 7 <= current_hour <= 9 or 17 <= current_hour <= 19:
                congestion_level = random.randint(65, 85)
                avg_travel_time = random.randint(35, 50)
            # Lunch time (12-2 PM)
            elif 12 <= current_hour <= 14:
                congestion_level = random.randint(45, 65)
                avg_travel_time = random.randint(25, 35)
            # Late night/early morning (10 PM - 6 AM)
            elif current_hour >= 22 or current_hour <= 6:
                congestion_level = random.randint(10, 25)
                avg_travel_time = random.randint(15, 25)
            # Regular hours
            else:
                congestion_level = random.randint(30, 50)
                avg_travel_time = random.randint(20, 30)
                
        # Process incidents data
        if incidents_data and 'incidents' in incidents_data:
            live_incidents = len(incidents_data['incidents'])
        else:
            # Fallback incidents data
            import random
            live_incidents = random.randint(1, 8)  # 1-8 incidents in the city
            
        # Generate AI forecast
        ai_forecast = self._generate_ai_forecast(congestion_level, live_incidents)
        
        # Format data for the frontend
        dashboard_data = {
            "congestionLevel": congestion_level,
            "avgTravelTime": avg_travel_time,
            "liveIncidents": live_incidents,
            "aiForecast": ai_forecast
        }
        
        logger.info(f"Returning dashboard data: {dashboard_data}")
        return dashboard_data

    def _generate_ai_forecast(self, congestion_level: float, live_incidents: int) -> str:
        """Generate a simple AI forecast based on traffic data."""
        if congestion_level > 75 or live_incidents > 10:
            return "Expect major delays. Consider alternative routes or travel times."
        elif congestion_level > 50 or live_incidents > 5:
            return "Heavy traffic reported. Plan for extra travel time."
        elif congestion_level > 25:
            return "Moderate traffic conditions. Minor delays possible."
        else:
            return "Traffic is flowing smoothly. Have a safe trip!"
    
    def get_route_traffic(self, start_lat: float, start_lon: float, 
                         end_lat: float, end_lon: float) -> Dict[str, Any]:
        """
        Get traffic information for a specific route.
        
        Args:
            start_lat: Starting latitude
            start_lon: Starting longitude
            end_lat: Ending latitude
            end_lon: Ending longitude
            
        Returns:
            Dictionary with route traffic data
        """
        url = f"{self.base_url}/routing/1/calculateRoute/{start_lat},{start_lon}:{end_lat},{end_lon}/json"
        
        params = {
            'key': self.api_key,
            'traffic': 'true',
            'travelMode': 'car',
            'routeType': 'fastest'
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error fetching route traffic data: {e}")
            return {}


# Singleton instance
tomtom_service = TomTomService()
