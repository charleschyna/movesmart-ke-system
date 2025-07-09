import logging
import requests
from typing import Dict, Any, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)


class GeocodingService:
    """Service for converting addresses to coordinates using TomTom Geocoding API."""
    
    def __init__(self):
        self.api_key = settings.TOMTOM_API_KEY
        self.base_url = "https://api.tomtom.com"
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
    
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
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = data.get('results', [])
            
            if results:
                result = results[0]
                position = result.get('position', {})
                
                return {
                    'latitude': position.get('lat'),
                    'longitude': position.get('lon'),
                    'formatted_address': result.get('address', {}).get('freeformAddress', address),
                    'country': result.get('address', {}).get('country', ''),
                    'confidence': result.get('score', 0)
                }
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
            'key': self.api_key
        }
        
        try:
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            addresses = data.get('addresses', [])
            
            if addresses:
                address = addresses[0].get('address', {})
                
                return {
                    'formatted_address': address.get('freeformAddress', ''),
                    'street': address.get('streetName', ''),
                    'city': address.get('municipality', ''),
                    'country': address.get('country', ''),
                    'postal_code': address.get('postalCode', ''),
                    'confidence': address.get('confidence', 0)
                }
            else:
                logger.warning(f"No reverse geocoding results found for coordinates: {latitude}, {longitude}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Error reverse geocoding coordinates {latitude}, {longitude}: {e}")
            return None
    
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
        
        # If geocoding fails, try with known Kenyan cities
        kenyan_cities = {
            'nairobi': (-1.2921, 36.8219),
            'mombasa': (-4.0435, 39.6682),
            'kisumu': (-0.1022, 34.7617),
            'nakuru': (-0.3031, 36.0800),
            'eldoret': (0.5143, 35.2698),
            'thika': (-1.0332, 37.0692),
            'malindi': (-3.2197, 40.1169),
            'kitale': (1.0167, 35.0000),
            'garissa': (-0.4569, 39.6582),
            'kakamega': (0.2827, 34.7519)
        }
        
        location_lower = location.lower().strip()
        
        # Check if it's a known city
        for city, coords in kenyan_cities.items():
            if city in location_lower or location_lower in city:
                logger.info(f"Using predefined coordinates for {city}")
                return coords
        
        logger.warning(f"Could not find coordinates for location: {location}")
        return None


# Singleton instance
geocoding_service = GeocodingService()
