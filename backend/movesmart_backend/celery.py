import os
from celery import Celery

# Set default Django settings module for 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "movesmart_backend.settings")

app = Celery("movesmart_backend")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related config keys
#   should have a `CELERY_` prefix in Django settings if used.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Configure broker and result backend from environment via Django settings
# Defaults to Redis when REDIS_URL is provided.
from django.conf import settings  # noqa: E402

broker_url = getattr(settings, "REDIS_URL", None)
if broker_url:
    app.conf.broker_url = broker_url
    app.conf.result_backend = broker_url

# Autodiscover tasks from installed apps
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")

