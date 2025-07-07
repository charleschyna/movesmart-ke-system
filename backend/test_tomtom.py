#!/usr/bin/env python3

import os
import sys
import django
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movesmart_backend.settings')
django.setup()

from traffic.services.tomtom_service import TomTomService
import json

def test_tomtom_api():
    print("Testing TomTom API integration...")
    
    try:
        # Initialize the service
        tomtom_service = TomTomService()
        print(f"✓ TomTom service initialized with API key: {tomtom_service.api_key[:10]}...")
        
        # Test basic API access first
        print("\n1. Testing basic API key validation...")
        test_url = f"https://api.tomtom.com/search/2/geocode/nairobi.json?key={tomtom_service.api_key}"
        response = tomtom_service.session.get(test_url)
        print(f"Geocoding API Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ API key is valid for basic services")
        else:
            print(f"✗ API key validation failed: {response.text}")
        
        # Test map tile access
        print("\n2. Testing map tile access...")
        tile_url = f"https://api.tomtom.com/map/1/tile/basic/main/0/0/0.png?key={tomtom_service.api_key}"
        tile_response = tomtom_service.session.get(tile_url)
        print(f"Map tile API Status: {tile_response.status_code}")
        
        # Test routing service
        print("\n3. Testing routing service...")
        route_url = f"https://api.tomtom.com/routing/1/calculateRoute/-1.2921,36.8219:-1.3000,36.8500/json?key={tomtom_service.api_key}"
        route_response = tomtom_service.session.get(route_url)
        print(f"Routing API Status: {route_response.status_code}")
        if route_response.status_code == 200:
            print("✓ Routing API is accessible")
        else:
            print(f"✗ Routing API failed: {route_response.text[:200]}...")
        
        # Test traffic services (the ones that are failing)
        print("\n4. Testing traffic flow service...")
        nairobi_coords = (-1.2921, 36.8219)
        lat, lon = nairobi_coords
        
        flow_data = tomtom_service.get_traffic_flow(lat, lon)
        print(f"Flow data response: {json.dumps(flow_data, indent=2)}")
        
        print(f"\n5. Testing traffic incidents service...")
        # Calculate bounding box
        radius_km = 10
        lat_change = radius_km / 111.32
        lon_change = radius_km / (111.32 * abs(lat))
        bbox = f"{lon - lon_change},{lat - lat_change},{lon + lon_change},{lat + lat_change}"
        
        incidents_data = tomtom_service.get_traffic_incidents(bbox)
        print(f"Incidents data: {json.dumps(incidents_data, indent=2)}")
        
        print(f"\n6. Testing city summary for Nairobi...")
        summary_data = tomtom_service.get_city_traffic_summary(nairobi_coords)
        print(f"Summary data: {json.dumps(summary_data, indent=2)}")
        
        print("\n✓ All tests completed successfully!")
        
    except Exception as e:
        print(f"✗ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_tomtom_api()
