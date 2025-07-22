import logging
import requests
from typing import Dict, Any, Optional, Tuple
from django.conf import settings
import time
import json

logger = logging.getLogger(__name__)


class GeocodingService:
    """Enhanced service for converting addresses to coordinates using TomTom Geocoding API."""
    
    def __init__(self):
        self.api_key = settings.TOMTOM_API_KEY
        self.base_url = "https://api.tomtom.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'MoveSmart-Traffic-System/1.0'
        })
        # Add retry configuration
        self.max_retries = 3
        self.retry_delay = 1.0
    
    def geocode_address(self, address: str, country_code: str = "KE") -> Optional[Dict[str, Any]]:
        """
        Convert an address to coordinates using TomTom Geocoding API.
        
        Args:
            address: Address to geocode
            country_code: Country code (default: KE for Kenya)
            
        Returns:
            Dictionary with geocoding results or None if failed
        """
        url = f"{self.base_url}/search/2/geocode/{address}.json"
        
        params = {
            'key': self.api_key,
            'countrySet': country_code,
            'limit': 1
        }
        
        logger.info(f"Geocoding address: '{address}' with country: {country_code}")
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('results', [])
            
            logger.info(f"TomTom geocoding response: {data}")
            
            if results:
                result = results[0]
                position = result.get('position', {})
                
                geocoded_result = {
                    'latitude': position.get('lat'),
                    'longitude': position.get('lon'),
                    'formatted_address': result.get('address', {}).get('freeformAddress', address),
                    'country': result.get('address', {}).get('country', ''),
                    'confidence': result.get('score', 0)
                }
                
                logger.info(f"Geocoded '{address}' to: {geocoded_result}")
                return geocoded_result
            else:
                logger.warning(f"No geocoding results found for address: {address}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error geocoding address '{address}': {e}")
            return None
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Convert coordinates to address using TomTom Reverse Geocoding API.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Dictionary with reverse geocoding results or None if failed
        """
        url = f"{self.base_url}/search/2/reverseGeocode/{latitude},{longitude}.json"
        
        params = {
            'key': self.api_key,
            'returnSpeedLimit': 'false',
            'returnRoadUse': 'false'
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            addresses = data.get('addresses', [])
            
            if addresses:
                address = addresses[0].get('address', {})
                
                # Build a more descriptive location name
                location_parts = []
                
                # Add specific area/suburb if available
                if address.get('localName'):
                    location_parts.append(address['localName'])
                elif address.get('streetName'):
                    location_parts.append(address['streetName'])
                
                # Add municipality/city
                if address.get('municipality'):
                    location_parts.append(address['municipality'])
                elif address.get('municipalitySubdivision'):
                    location_parts.append(address['municipalitySubdivision'])
                
                # Create formatted address prioritizing local names
                if location_parts:
                    formatted_address = ', '.join(location_parts)
                else:
                    formatted_address = address.get('freeformAddress', f"{latitude:.4f}, {longitude:.4f}")
                
                return {
                    'formatted_address': formatted_address,
                    'street': address.get('streetName', ''),
                    'city': address.get('municipality', ''),
                    'area': address.get('localName', ''),
                    'district': address.get('municipalitySubdivision', ''),
                    'country': address.get('country', ''),
                    'postal_code': address.get('postalCode', ''),
                    'confidence': 1.0  # High confidence for successful reverse geocoding
                }
            else:
                logger.warning(f"No reverse geocoding results found for coordinates: {latitude}, {longitude}")
                # Fallback to known area detection
                return self._get_known_area_name(latitude, longitude)
                
        except requests.RequestException as e:
            logger.error(f"Error reverse geocoding coordinates {latitude}, {longitude}: {e}")
            # Fallback to known area detection
            return self._get_known_area_name(latitude, longitude)
    
    def get_coordinates_for_location(self, location: str) -> Optional[Tuple[float, float]]:
        """
        Get coordinates for a location string.
        
        Args:
            location: Location name or address
            
        Returns:
            Tuple of (latitude, longitude) or None if not found
        """
        
        # First try to geocode as an address
        result = self.geocode_address(location)
        
        if result and result.get('latitude') and result.get('longitude'):
            return (result['latitude'], result['longitude'])
        
        logger.warning(f"Could not find coordinates for location: {location}")
        return None
    
    def _get_known_area_name(self, latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Fallback method to get known area names for Kenyan locations.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Dictionary with area information or None if not found
        """
        # Kenya major cities and areas with their approximate coordinates
        known_areas = [
            {'name': 'Nairobi CBD', 'lat': -1.2921, 'lng': 36.8219, 'radius': 0.05},
            {'name': 'Westlands, Nairobi', 'lat': -1.2672, 'lng': 36.8074, 'radius': 0.03},
            {'name': 'Karen, Nairobi', 'lat': -1.3195, 'lng': 36.7073, 'radius': 0.03},
            {'name': 'Kileleshwa, Nairobi', 'lat': -1.2789, 'lng': 36.7879, 'radius': 0.02},
            {'name': 'Kilimani, Nairobi', 'lat': -1.2956, 'lng': 36.7856, 'radius': 0.02},
            {'name': 'Kasarani, Nairobi', 'lat': -1.2284, 'lng': 36.8979, 'radius': 0.03},
            {'name': 'Embakasi, Nairobi', 'lat': -1.3119, 'lng': 36.8947, 'radius': 0.03},
            {'name': 'Kikuyu, Nairobi', 'lat': -1.2467, 'lng': 36.6636, 'radius': 0.03},
            {'name': 'Thika', 'lat': -1.0332, 'lng': 37.0692, 'radius': 0.05},
            {'name': 'Juja', 'lat': -1.0982, 'lng': 36.9648, 'radius': 0.05},
            {'name': 'Kiambu', 'lat': -1.1712, 'lng': 36.8356, 'radius': 0.05},
            {'name': 'Mombasa CBD', 'lat': -4.0435, 'lng': 39.6682, 'radius': 0.05},
            {'name': 'Nyali, Mombasa', 'lat': -4.0168, 'lng': 39.7058, 'radius': 0.03},
            {'name': 'Kisumu', 'lat': -0.1022, 'lng': 34.7617, 'radius': 0.1},
            {'name': 'Nakuru', 'lat': -0.3031, 'lng': 36.0800, 'radius': 0.1},
            {'name': 'Eldoret', 'lat': 0.5143, 'lng': 35.2698, 'radius': 0.1},
        ]
        
        # Find the closest known area
        for area in known_areas:
            distance = self._calculate_distance(latitude, longitude, area['lat'], area['lng'])
            if distance <= area['radius']:
                return {
                    'formatted_address': area['name'],
                    'street': '',
                    'city': area['name'].split(',')[-1].strip() if ',' in area['name'] else area['name'],
                    'area': area['name'].split(',')[0].strip() if ',' in area['name'] else '',
                    'district': '',
                    'country': 'Kenya',
                    'postal_code': '',
                    'confidence': 0.8  # Medium confidence for known area matching
                }
        
        # If no known area found, return general area description
        if -1.5 <= latitude <= -1.1 and 36.6 <= longitude <= 37.1:
            return {
                'formatted_address': 'Nairobi Area',
                'street': '',
                'city': 'Nairobi',
                'area': 'Nairobi Area',
                'district': '',
                'country': 'Kenya',
                'postal_code': '',
                'confidence': 0.5
            }
        elif -4.2 <= latitude <= -3.8 and 39.4 <= longitude <= 39.9:
            return {
                'formatted_address': 'Mombasa Area',
                'street': '',
                'city': 'Mombasa',
                'area': 'Mombasa Area',
                'district': '',
                'country': 'Kenya',
                'postal_code': '',
                'confidence': 0.5
            }
        elif -0.3 <= latitude <= 0.1 and 34.5 <= longitude <= 35.0:
            return {
                'formatted_address': 'Kisumu Area',
                'street': '',
                'city': 'Kisumu',
                'area': 'Kisumu Area',
                'district': '',
                'country': 'Kenya',
                'postal_code': '',
                'confidence': 0.5
            }
        
        # Final fallback to coordinates
        return {
            'formatted_address': f"{latitude:.4f}, {longitude:.4f}",
            'street': '',
            'city': 'Unknown',
            'area': '',
            'district': '',
            'country': 'Kenya',
            'postal_code': '',
            'confidence': 0.1
        }
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using simple Euclidean distance.
        
        Args:
            lat1, lon1: First coordinate
            lat2, lon2: Second coordinate
            
        Returns:
            Distance in degrees (approximate)
        """
        import math
        return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)


# Singleton instance
geocoding_service = GeocodingService()
