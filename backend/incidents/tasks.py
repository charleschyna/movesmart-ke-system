from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

from .services.data_collector import LiveDataCollector

logger = logging.getLogger(__name__)


@shared_task(bind=True, retry_backoff=True, max_retries=3)
def collect_all_cities_traffic_data(self, collection_type='combined'):
    """
    Celery task to collect traffic data for all Kenyan cities.
    
    Args:
        collection_type: 'incidents', 'traffic_flow', or 'combined'
    """
    try:
        collector = LiveDataCollector()
        results = collector.collect_all_cities_data(collection_type)
        
        # Log results
        successful_cities = []
        failed_cities = []
        
        for result in results:
            if 'error' in result:
                failed_cities.append(result['city'])
                logger.error(f"Data collection failed for {result['city']}: {result['error']}")
            else:
                successful_cities.append(result['city'])
        
        logger.info(f"Data collection completed. Success: {successful_cities}, Failed: {failed_cities}")
        
        return {
            'status': 'completed',
            'successful_cities': successful_cities,
            'failed_cities': failed_cities,
            'total_cities': len(results),
            'results': results
        }
        
    except Exception as exc:
        logger.error(f"Task failed: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, retry_backoff=True, max_retries=3)
def collect_city_traffic_data(self, city, collection_type='combined'):
    """
    Celery task to collect traffic data for a specific city.
    
    Args:
        city: City key (e.g., 'nairobi', 'mombasa')
        collection_type: 'incidents', 'traffic_flow', or 'combined'
    """
    try:
        collector = LiveDataCollector()
        
        if collection_type == 'incidents':
            result = collector.collect_incident_data(city)
        elif collection_type == 'traffic_flow':
            result = collector.collect_traffic_flow_data(city)
        else:  # combined
            incident_result = collector.collect_incident_data(city)
            traffic_result = collector.collect_traffic_flow_data(city)
            result = {
                'city': city,
                'incident_collection': incident_result,
                'traffic_collection': traffic_result
            }
        
        logger.info(f"Data collection completed for {city}")
        return result
        
    except Exception as exc:
        logger.error(f"Task failed for {city}: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task
def cleanup_old_data(days_to_keep=30):
    """
    Celery task to clean up old data to prevent database bloat.
    
    Args:
        days_to_keep: Number of days of data to keep
    """
    from .models import LiveIncidentData, TrafficFlowData, DataCollectionLog
    
    try:
        cutoff_date = timezone.now() - timedelta(days=days_to_keep)
        
        # Delete old incident data
        incidents_deleted = LiveIncidentData.objects.filter(
            collected_at__lt=cutoff_date,
            is_processed=True  # Only delete processed data
        ).delete()
        
        # Delete old traffic flow data
        traffic_deleted = TrafficFlowData.objects.filter(
            collected_at__lt=cutoff_date,
            is_processed=True  # Only delete processed data
        ).delete()
        
        # Delete old collection logs
        logs_deleted = DataCollectionLog.objects.filter(
            started_at__lt=cutoff_date
        ).delete()
        
        logger.info(f"Cleanup completed: {incidents_deleted[0]} incidents, "
                   f"{traffic_deleted[0]} traffic records, {logs_deleted[0]} logs deleted")
        
        return {
            'status': 'completed',
            'incidents_deleted': incidents_deleted[0],
            'traffic_records_deleted': traffic_deleted[0],
            'logs_deleted': logs_deleted[0],
            'cutoff_date': cutoff_date.isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Cleanup task failed: {exc}")
        raise


@shared_task
def generate_collection_report(hours=24):
    """
    Generate a collection statistics report.
    
    Args:
        hours: Number of hours to look back for statistics
    """
    try:
        collector = LiveDataCollector()
        stats = collector.get_collection_statistics(hours)
        
        logger.info(f"Collection report generated: {stats}")
        return stats
        
    except Exception as exc:
        logger.error(f"Report generation failed: {exc}")
        raise


# Periodic task configurations (add these to your Celery beat schedule)
"""
Example Celery beat configuration to add to settings.py:

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Collect data every 15 minutes during business hours (6 AM - 10 PM)
    'collect-traffic-data-frequent': {
        'task': 'incidents.tasks.collect_all_cities_traffic_data',
        'schedule': crontab(minute='*/15', hour='6-22'),
        'args': ('combined',),
    },
    # Collect data every hour during off-peak hours
    'collect-traffic-data-hourly': {
        'task': 'incidents.tasks.collect_all_cities_traffic_data',
        'schedule': crontab(minute=0, hour='23,0,1,2,3,4,5'),
        'args': ('combined',),
    },
    # Generate daily collection report
    'daily-collection-report': {
        'task': 'incidents.tasks.generate_collection_report',
        'schedule': crontab(hour=1, minute=0),
        'args': (24,),
    },
    # Clean up old data weekly
    'weekly-data-cleanup': {
        'task': 'incidents.tasks.cleanup_old_data',
        'schedule': crontab(day_of_week=1, hour=2, minute=0),
        'args': (30,),  # Keep 30 days of data
    },
    # Priority cities during rush hours (more frequent collection)
    'rush-hour-nairobi': {
        'task': 'incidents.tasks.collect_city_traffic_data',
        'schedule': crontab(minute='*/5', hour='7-9,17-19'),
        'args': ('nairobi', 'combined'),
    },
    'rush-hour-mombasa': {
        'task': 'incidents.tasks.collect_city_traffic_data',
        'schedule': crontab(minute='*/10', hour='7-9,17-19'),
        'args': ('mombasa', 'combined'),
    },
}

CELERY_TIMEZONE = 'Africa/Nairobi'
"""
