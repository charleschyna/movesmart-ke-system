from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from incidents.services.data_collector import LiveDataCollector
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Collect live traffic and incident data from TomTom API for ML training'

    def add_arguments(self, parser):
        parser.add_argument(
            '--city',
            type=str,
            help='Specific city to collect data for (nairobi, mombasa, kisumu, nakuru, eldoret)',
        )
        parser.add_argument(
            '--type',
            type=str,
            default='combined',
            choices=['incidents', 'traffic_flow', 'combined'],
            help='Type of data to collect (default: combined)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Enable verbose output',
        )

    def handle(self, *args, **options):
        start_time = timezone.now()
        
        if options['verbose']:
            logging.basicConfig(level=logging.INFO)
            self.stdout.write("Starting data collection...")

        collector = LiveDataCollector()
        
        try:
            if options['city']:
                city = options['city'].lower()
                if city not in collector.KENYAN_CITIES:
                    available_cities = ', '.join(collector.KENYAN_CITIES.keys())
                    raise CommandError(f"Unknown city '{city}'. Available cities: {available_cities}")
                
                if options['type'] == 'incidents':
                    result = collector.collect_incident_data(city)
                elif options['type'] == 'traffic_flow':
                    result = collector.collect_traffic_flow_data(city)
                else:  # combined
                    incident_result = collector.collect_incident_data(city)
                    traffic_result = collector.collect_traffic_flow_data(city)
                    result = {
                        'city': city,
                        'incident_collection': incident_result,
                        'traffic_collection': traffic_result
                    }
                
                self._print_city_result(result, options['verbose'])
                
            else:
                # Collect data for all cities
                results = collector.collect_all_cities_data(options['type'])
                
                for result in results:
                    self._print_city_result(result, options['verbose'])
            
            # Print summary statistics
            end_time = timezone.now()
            duration = (end_time - start_time).total_seconds()
            
            stats = collector.get_collection_statistics(hours=1)  # Last hour stats
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nCollection completed in {duration:.2f} seconds\n"
                    f"Recent statistics (last hour):\n"
                    f"  - Collection runs: {stats['collection_runs']}\n"
                    f"  - Successful runs: {stats['successful_runs']}\n"
                    f"  - Failed runs: {stats['failed_runs']}\n"
                    f"  - Incidents collected: {stats['incidents_collected']}\n"
                    f"  - Traffic flow records: {stats['traffic_flow_collected']}\n"
                    f"  - Total records: {stats['total_records']}"
                )
            )

        except Exception as e:
            logger.error(f"Data collection failed: {e}")
            raise CommandError(f"Data collection failed: {e}")

    def _print_city_result(self, result, verbose):
        """Print collection results for a city."""
        if 'error' in result:
            self.stdout.write(
                self.style.ERROR(f"❌ {result['city']}: {result['error']}")
            )
            return

        city = result.get('city', 'Unknown')
        
        if 'incident_collection' in result and 'traffic_collection' in result:
            # Combined collection
            incident_result = result['incident_collection']
            traffic_result = result['traffic_collection']
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ {city.title()}: "
                    f"Incidents({incident_result.get('new_records', 0)} new, "
                    f"{incident_result.get('updated_records', 0)} updated), "
                    f"Traffic({traffic_result.get('new_records', 0)} points)"
                )
            )
            
            if verbose:
                self.stdout.write(f"   Incidents found: {incident_result.get('total_found', 0)}")
                self.stdout.write(f"   Traffic points sampled: {traffic_result.get('total_points', 0)}")
                if incident_result.get('errors', 0) > 0 or traffic_result.get('errors', 0) > 0:
                    self.stdout.write(
                        self.style.WARNING(
                            f"   Errors: incidents({incident_result.get('errors', 0)}), "
                            f"traffic({traffic_result.get('errors', 0)})"
                        )
                    )
        
        elif 'new_records' in result:
            # Single type collection
            collection_type = "incidents" if 'total_found' in result else "traffic flow"
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ {city.title()} {collection_type}: "
                    f"{result.get('new_records', 0)} new records"
                )
            )
            
            if verbose:
                if 'total_found' in result:
                    self.stdout.write(f"   Total incidents found: {result['total_found']}")
                    self.stdout.write(f"   Updated records: {result.get('updated_records', 0)}")
                else:
                    self.stdout.write(f"   Traffic points sampled: {result.get('total_points', 0)}")
                
                if result.get('errors', 0) > 0:
                    self.stdout.write(
                        self.style.WARNING(f"   Errors encountered: {result['errors']}")
                    )
