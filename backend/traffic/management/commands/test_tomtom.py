from django.core.management.base import BaseCommand
from traffic.services.tomtom_service import tomtom_service
import json


class Command(BaseCommand):
    help = 'Test TomTom API integration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--city',
            type=str,
            default='nairobi',
            help='City to test (nairobi, mombasa, kisumu, nakuru, eldoret)',
        )

    def handle(self, *args, **options):
        city = options['city'].lower()
        
        # Kenyan cities coordinates (lat, lon)
        cities = {
            'nairobi': (-1.2921, 36.8219),
            'mombasa': (-4.0435, 39.6682),
            'kisumu': (-0.0917, 34.7680),
            'nakuru': (-0.3031, 36.0800),
            'eldoret': (0.5143, 35.2698)
        }
        
        if city not in cities:
            self.stdout.write(
                self.style.ERROR(f'Unknown city: {city}. Available cities: {", ".join(cities.keys())}')
            )
            return
        
        lat, lon = cities[city]
        
        self.stdout.write(
            self.style.SUCCESS(f'Testing TomTom API for {city.title()} ({lat}, {lon})')
        )
        
        # Test traffic flow
        self.stdout.write('Fetching traffic flow data...')
        flow_data = tomtom_service.get_traffic_flow(lat, lon)
        if flow_data:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Traffic flow data received: {len(str(flow_data))} characters')
            )
            if 'flowSegmentData' in flow_data:
                flow_segment = flow_data['flowSegmentData']
                self.stdout.write(f'  - Current Speed: {flow_segment.get("currentSpeed", "N/A")} km/h')
                self.stdout.write(f'  - Free Flow Speed: {flow_segment.get("freeFlowSpeed", "N/A")} km/h')
                self.stdout.write(f'  - Current Travel Time: {flow_segment.get("currentTravelTime", "N/A")} sec')
        else:
            self.stdout.write(self.style.ERROR('✗ No traffic flow data received'))
        
        # Test traffic incidents
        self.stdout.write('Fetching traffic incidents...')
        
        # Create bounding box around city
        radius_km = 10
        degree_offset = radius_km / 111
        min_lat = lat - degree_offset
        max_lat = lat + degree_offset
        min_lon = lon - degree_offset
        max_lon = lon + degree_offset
        bbox = f"{min_lon},{min_lat},{max_lon},{max_lat}"
        
        incidents_data = tomtom_service.get_traffic_incidents(bbox)
        if incidents_data:
            incidents = incidents_data.get('incidents', [])
            self.stdout.write(
                self.style.SUCCESS(f'✓ Traffic incidents data received: {len(incidents)} incidents')
            )
            for i, incident in enumerate(incidents[:3]):  # Show first 3 incidents
                self.stdout.write(f'  - Incident {i+1}: {incident.get("properties", {}).get("iconCategory", "Unknown")}')
        else:
            self.stdout.write(self.style.ERROR('✗ No traffic incidents data received'))
        
        # Test city traffic summary
        self.stdout.write('Fetching city traffic summary...')
        summary = tomtom_service.get_city_traffic_summary((lat, lon), radius_km)
        if summary:
            self.stdout.write(
                self.style.SUCCESS(f'✓ City traffic summary received')
            )
            self.stdout.write(f'  - Traffic Level: {summary.get("traffic_level", "Unknown")}')
            self.stdout.write(f'  - Total Incidents: {summary.get("total_incidents", 0)}')
            self.stdout.write(f'  - Timestamp: {summary.get("timestamp", "Unknown")}')
        else:
            self.stdout.write(self.style.ERROR('✗ No city traffic summary received'))
        
        # Test route traffic (example route within the city)
        self.stdout.write('Testing route traffic...')
        # Create a small route within the city
        end_lat = lat + 0.01  # ~1km offset
        end_lon = lon + 0.01
        
        route_data = tomtom_service.get_route_traffic(lat, lon, end_lat, end_lon)
        if route_data:
            routes = route_data.get('routes', [])
            self.stdout.write(
                self.style.SUCCESS(f'✓ Route traffic data received: {len(routes)} route(s)')
            )
            if routes:
                route = routes[0]
                summary_route = route.get('summary', {})
                self.stdout.write(f'  - Distance: {summary_route.get("lengthInMeters", "N/A")} meters')
                self.stdout.write(f'  - Travel Time: {summary_route.get("travelTimeInSeconds", "N/A")} seconds')
                self.stdout.write(f'  - Traffic Delay: {summary_route.get("trafficDelayInSeconds", "N/A")} seconds')
        else:
            self.stdout.write(self.style.ERROR('✗ No route traffic data received'))
        
        self.stdout.write(
            self.style.SUCCESS('TomTom API testing completed!')
        )
