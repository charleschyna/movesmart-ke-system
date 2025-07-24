import requests
import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
import asyncio
import aiohttp
from .tomtom_service import TomTomService

logger = logging.getLogger(__name__)


class RealTimeTrafficService:
    """Enhanced service for real-time traffic data collection and historical trend analysis."""
    
    def __init__(self):
        self.tomtom_service = TomTomService()
        self.api_key = settings.TOMTOM_API_KEY
        self.base_url = "https://api.tomtom.com"
        self.cache_timeout = 30  # 30 seconds cache
        
        # City configurations with multiple sampling points for better coverage
        self.city_configs = {
            'nairobi': {
                'center': (-1.2921, 36.8219),
                'major_roads': [
                    {'name': 'Uhuru Highway', 'points': [(-1.2921, 36.8219), (-1.3073, 36.8219)]},
                    {'name': 'Waiyaki Way', 'points': [(-1.2651, 36.8048), (-1.2434, 36.7073)]},
                    {'name': 'Mombasa Road', 'points': [(-1.2921, 36.8219), (-1.3670, 36.8950)]},
                    {'name': 'Thika Road', 'points': [(-1.2634, 36.8309), (-1.0332, 37.0692)]},
                    {'name': 'Ngong Road', 'points': [(-1.2921, 36.8219), (-1.3670, 36.7756)]},
                    {'name': 'Jogoo Road', 'points': [(-1.2821, 36.8619), (-1.2831, 36.8629)]},
                    {'name': 'Lang\'ata Road', 'points': [(-1.3321, 36.7719), (-1.3331, 36.7729)]},
                    {'name': 'Kiambu Road', 'points': [(-1.2421, 36.8419), (-1.2431, 36.8429)]}
                ]
            },
            'mombasa': {
                'center': (-4.0435, 39.6682),
                'major_roads': [
                    {'name': 'Moi Avenue', 'points': [(-4.0435, 39.6682), (-4.0445, 39.6692)]},
                    {'name': 'Nyali Bridge', 'points': [(-4.0235, 39.6882), (-4.0245, 39.6892)]},
                    {'name': 'Digo Road', 'points': [(-4.0535, 39.6482), (-4.0545, 39.6492)]},
                    {'name': 'Makupa Causeway', 'points': [(-4.0335, 39.6582), (-4.0345, 39.6592)]}
                ]
            },
            'kisumu': {
                'center': (-0.1022, 34.7617),
                'major_roads': [
                    {'name': 'Oginga Odinga Street', 'points': [(-0.1022, 34.7617), (-0.1032, 34.7627)]},
                    {'name': 'Kenyatta Avenue', 'points': [(-0.0922, 34.7717), (-0.0932, 34.7727)]},
                    {'name': 'Nairobi Road', 'points': [(-0.1122, 34.7517), (-0.1132, 34.7527)]}
                ]
            },
            'nakuru': {
                'center': (-0.3031, 36.0800),
                'major_roads': [
                    {'name': 'Kenyatta Avenue', 'points': [(-0.3031, 36.0800), (-0.3041, 36.0810)]},
                    {'name': 'West Road', 'points': [(-0.3131, 36.0700), (-0.3141, 36.0710)]}
                ]
            },
            'eldoret': {
                'center': (0.5143, 35.2697),
                'major_roads': [
                    {'name': 'Uganda Road', 'points': [(0.5143, 35.2697), (0.5153, 35.2707)]},
                    {'name': 'Kenyatta Street', 'points': [(0.5043, 35.2797), (0.5053, 35.2807)]}
                ]
            }
        }

    async def get_realtime_congestion_trends(self, city_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get real-time congestion trends for the last N hours with live data points.
        
        Args:
            city_id: City identifier
            hours: Number of hours of historical data to include
            
        Returns:
            List of congestion data points with timestamps
        """
        logger.info(f"Fetching real-time congestion trends for {city_id} ({hours} hours)")
        
        if city_id not in self.city_configs:
            logger.error(f"City {city_id} not configured")
            return self._generate_fallback_trend_data(hours)
        
        try:
            # Get cached historical data
            historical_data = self._get_cached_historical_data(city_id, hours)
            
            # Get current real-time data
            current_data = await self._fetch_current_traffic_data(city_id)
            
            # Combine historical and current data
            trend_data = historical_data + [current_data]
            
            # Ensure we have the right number of data points
            while len(trend_data) < hours:
                # Fill missing data points with interpolated values
                trend_data = self._interpolate_missing_data(trend_data, hours)
                
            # Cache the current data point for future historical use
            self._cache_current_data_point(city_id, current_data)
            
            return trend_data[-hours:]  # Return last N hours
            
        except Exception as e:
            logger.error(f"Error fetching real-time trends for {city_id}: {e}")
            return self._generate_fallback_trend_data(hours)

    async def _fetch_current_traffic_data(self, city_id: str) -> Dict[str, Any]:
        """Fetch current real-time traffic data from TomTom API."""
        city_config = self.city_configs[city_id]
        center_lat, center_lon = city_config['center']
        
        try:
            # Fetch data from multiple points for better accuracy
            tasks = []
            
            async with aiohttp.ClientSession() as session:
                # Fetch flow data from city center
                tasks.append(self._fetch_flow_data_async(session, center_lat, center_lon))
                
                # Fetch incidents data
                tasks.append(self._fetch_incidents_data_async(session, city_id))
                
                # Fetch data from major roads
                for road in city_config['major_roads'][:3]:  # Limit to 3 roads to avoid rate limits
                    road_lat, road_lon = road['points'][0]
                    tasks.append(self._fetch_flow_data_async(session, road_lat, road_lon))
                
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                flow_data_points = []
                incidents_count = 0
                
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        logger.warning(f"Task {i} failed: {result}")
                        continue
                        
                    if i == 1:  # Incidents data
                        incidents_count = len(result.get('incidents', []))
                    else:  # Flow data
                        if result and 'flowSegmentData' in result:
                            flow_data_points.append(result['flowSegmentData'])
                
                # Calculate aggregate metrics
                congestion_level = self._calculate_aggregate_congestion(flow_data_points)
                avg_speed = self._calculate_aggregate_speed(flow_data_points)
                
                return {
                    'time': datetime.now().strftime('%H:%M'),
                    'timestamp': datetime.now().isoformat(),
                    'congestion': round(congestion_level),
                    'speed': round(avg_speed),
                    'incidents': incidents_count,
                    'city': city_id,
                    'data_source': 'tomtom_realtime'
                }
                
        except Exception as e:
            logger.error(f"Error fetching current traffic data for {city_id}: {e}")
            return self._generate_fallback_current_data(city_id)

    async def _fetch_flow_data_async(self, session: aiohttp.ClientSession, lat: float, lon: float) -> Dict[str, Any]:
        """Asynchronously fetch traffic flow data from TomTom API."""
        url = f"{self.base_url}/traffic/services/4/flowSegmentData/absolute/10/json"
        params = {
            'key': self.api_key,
            'point': f"{lat},{lon}",
            'unit': 'KMPH'
        }
        
        try:
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.warning(f"TomTom API returned status {response.status}")
                    return {}
        except Exception as e:
            logger.error(f"Error fetching flow data: {e}")
            return {}

    async def _fetch_incidents_data_async(self, session: aiohttp.ClientSession, city_id: str) -> Dict[str, Any]:
        """Asynchronously fetch incidents data from TomTom API."""
        city_config = self.city_configs[city_id]
        center_lat, center_lon = city_config['center']
        
        # Calculate bounding box (10km radius)
        radius_km = 10
        lat_change = radius_km / 111.32
        lon_change = radius_km / (111.32 * abs(center_lat))
        bbox = f"{center_lon - lon_change},{center_lat - lat_change},{center_lon + lon_change},{center_lat + lat_change}"
        
        url = f"{self.base_url}/traffic/services/5/incidentDetails"
        params = {
            'key': self.api_key,
            'bbox': bbox,
            'fields': '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay}}}',
            'language': 'en-US'
        }
        
        try:
            async with session.get(url, params=params, timeout=15) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.warning(f"TomTom incidents API returned status {response.status}")
                    return {'incidents': []}
        except Exception as e:
            logger.error(f"Error fetching incidents data: {e}")
            return {'incidents': []}

    def _calculate_aggregate_congestion(self, flow_data_points: List[Dict[str, Any]]) -> float:
        """Calculate aggregate congestion level from multiple flow data points."""
        if not flow_data_points:
            return self._get_realistic_congestion_by_time()
        
        congestion_levels = []
        for flow_data in flow_data_points:
            current_speed = flow_data.get('currentSpeed', 0)
            free_flow_speed = flow_data.get('freeFlowSpeed', 1)
            
            if free_flow_speed > 0:
                congestion = max(0, (1 - (current_speed / free_flow_speed)) * 100)
                congestion_levels.append(congestion)
        
        return sum(congestion_levels) / len(congestion_levels) if congestion_levels else self._get_realistic_congestion_by_time()

    def _calculate_aggregate_speed(self, flow_data_points: List[Dict[str, Any]]) -> float:
        """Calculate aggregate speed from multiple flow data points."""
        if not flow_data_points:
            return self._get_realistic_speed_by_time()
        
        speeds = []
        for flow_data in flow_data_points:
            current_speed = flow_data.get('currentSpeed', 0)
            if current_speed > 0:
                speeds.append(current_speed)
        
        return sum(speeds) / len(speeds) if speeds else self._get_realistic_speed_by_time()

    def _get_cached_historical_data(self, city_id: str, hours: int) -> List[Dict[str, Any]]:
        """Get cached historical data points."""
        cache_key = f"traffic_history_{city_id}"
        cached_data = cache.get(cache_key, [])
        
        # Filter data to last N hours
        cutoff_time = datetime.now() - timedelta(hours=hours)
        filtered_data = [
            point for point in cached_data 
            if datetime.fromisoformat(point['timestamp']) > cutoff_time
        ]
        
        return filtered_data

    def _cache_current_data_point(self, city_id: str, data_point: Dict[str, Any]) -> None:
        """Cache current data point for historical use."""
        cache_key = f"traffic_history_{city_id}"
        cached_data = cache.get(cache_key, [])
        
        # Add new data point
        cached_data.append(data_point)
        
        # Keep only last 48 hours of data
        cutoff_time = datetime.now() - timedelta(hours=48)
        cached_data = [
            point for point in cached_data 
            if datetime.fromisoformat(point['timestamp']) > cutoff_time
        ]
        
        # Cache for 1 hour
        cache.set(cache_key, cached_data, 3600)

    def _interpolate_missing_data(self, existing_data: List[Dict[str, Any]], target_hours: int) -> List[Dict[str, Any]]:
        """Interpolate missing data points to fill gaps."""
        if len(existing_data) >= target_hours:
            return existing_data
        
        # Generate missing hourly data points
        now = datetime.now()
        interpolated_data = []
        
        for i in range(target_hours):
            hour_time = now - timedelta(hours=target_hours - i - 1)
            
            # Check if we have data for this hour
            existing_point = None
            for point in existing_data:
                point_time = datetime.fromisoformat(point['timestamp'])
                if abs((point_time - hour_time).total_seconds()) < 1800:  # Within 30 minutes
                    existing_point = point
                    break
            
            if existing_point:
                interpolated_data.append(existing_point)
            else:
                # Generate realistic data based on time of day
                interpolated_data.append({
                    'time': hour_time.strftime('%H:%M'),
                    'timestamp': hour_time.isoformat(),
                    'congestion': self._get_realistic_congestion_by_time(hour_time.hour),
                    'speed': self._get_realistic_speed_by_time(hour_time.hour),
                    'incidents': self._get_realistic_incidents_by_time(hour_time.hour),
                    'city': existing_data[0]['city'] if existing_data else 'unknown',
                    'data_source': 'interpolated'
                })
        
        return interpolated_data

    def _get_realistic_congestion_by_time(self, hour: Optional[int] = None) -> float:
        """Get realistic congestion level based on time of day."""
        if hour is None:
            hour = datetime.now().hour
        
        # Rush hour patterns
        if 7 <= hour <= 9:  # Morning rush
            return 70 + (hour - 7) * 5  # 70-80%
        elif 17 <= hour <= 19:  # Evening rush
            return 75 + (hour - 17) * 2.5  # 75-82%
        elif 12 <= hour <= 14:  # Lunch time
            return 45 + (hour - 12) * 5  # 45-55%
        elif hour >= 22 or hour <= 6:  # Night time
            return 15 + hour if hour <= 6 else 15 + (24 - hour)  # 15-25%
        else:  # Regular hours
            return 35 + (hour % 3) * 5  # 35-45%

    def _get_realistic_speed_by_time(self, hour: Optional[int] = None) -> float:
        """Get realistic speed based on time of day."""
        if hour is None:
            hour = datetime.now().hour
        
        congestion = self._get_realistic_congestion_by_time(hour)
        # Speed inversely related to congestion
        base_speed = 60
        return max(15, base_speed - (congestion * 0.4))

    def _get_realistic_incidents_by_time(self, hour: Optional[int] = None) -> int:
        """Get realistic incident count based on time of day."""
        if hour is None:
            hour = datetime.now().hour
        
        # More incidents during rush hours
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            return 3 + (hour % 3)  # 3-5 incidents
        elif 12 <= hour <= 14:
            return 2 + (hour % 2)  # 2-3 incidents
        elif hour >= 22 or hour <= 6:
            return 0 + (hour % 2)  # 0-1 incidents
        else:
            return 1 + (hour % 3)  # 1-3 incidents

    def _generate_fallback_trend_data(self, hours: int) -> List[Dict[str, Any]]:
        """Generate fallback trend data when API is unavailable."""
        logger.info(f"Generating fallback trend data for {hours} hours")
        
        trend_data = []
        now = datetime.now()
        
        for i in range(hours):
            hour_time = now - timedelta(hours=hours - i - 1)
            trend_data.append({
                'time': hour_time.strftime('%H:%M'),
                'timestamp': hour_time.isoformat(),
                'congestion': self._get_realistic_congestion_by_time(hour_time.hour),
                'speed': self._get_realistic_speed_by_time(hour_time.hour),
                'incidents': self._get_realistic_incidents_by_time(hour_time.hour),
                'city': 'unknown',
                'data_source': 'fallback'
            })
        
        return trend_data

    def _generate_fallback_current_data(self, city_id: str) -> Dict[str, Any]:
        """Generate fallback current data when API is unavailable."""
        return {
            'time': datetime.now().strftime('%H:%M'),
            'timestamp': datetime.now().isoformat(),
            'congestion': self._get_realistic_congestion_by_time(),
            'speed': self._get_realistic_speed_by_time(),
            'incidents': self._get_realistic_incidents_by_time(),
            'city': city_id,
            'data_source': 'fallback'
        }

    async def get_live_traffic_summary(self, city_id: str) -> Dict[str, Any]:
        """Get current live traffic summary for a city."""
        logger.info(f"Fetching live traffic summary for {city_id}")
        
        try:
            # Use the existing TomTom service for compatibility
            city_config = self.city_configs.get(city_id)
            if not city_config:
                raise ValueError(f"City {city_id} not configured")
            
            center_coords = city_config['center']
            summary_data = self.tomtom_service.get_city_traffic_summary(center_coords)
            
            # Add timestamp and source info
            summary_data['timestamp'] = datetime.now().isoformat()
            summary_data['city'] = city_id
            summary_data['data_source'] = 'tomtom_realtime'
            
            return summary_data
            
        except Exception as e:
            logger.error(f"Error fetching live traffic summary for {city_id}: {e}")
            return {
                'congestionLevel': self._get_realistic_congestion_by_time(),
                'avgTravelTime': 25 + self._get_realistic_congestion_by_time() * 0.3,
                'liveIncidents': self._get_realistic_incidents_by_time(),
                'aiForecast': 'Traffic conditions are being monitored in real-time.',
                'timestamp': datetime.now().isoformat(),
                'city': city_id,
                'data_source': 'fallback'
            }


# Create singleton instance
realtime_traffic_service = RealTimeTrafficService()
