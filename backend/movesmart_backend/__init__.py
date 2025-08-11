# Expose Celery app if Celery is installed; otherwise, skip gracefully in dev/checks
try:
    from .celery import app as celery_app
    __all__ = ("celery_app",)
except Exception:  # ImportError or settings issues
    celery_app = None
    __all__ = ("celery_app",)
