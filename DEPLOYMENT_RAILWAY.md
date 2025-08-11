# Railway deployment notes for MoveSmart KE

Services to create
- Backend (Django) – Dockerfile at backend/Dockerfile
- Worker (Celery) – same image as Backend
- Redis – Railway plugin
- Frontend (Static) – Vite build from frontend

Backend (Django)
- Root Directory: backend
- Build: Docker
- Dockerfile Path: backend/Dockerfile
- Start Command: gunicorn movesmart_backend.wsgi:application --bind 0.0.0.0:8000

Env vars (Backend)
- DEBUG=false
- SECRET_KEY={{DJANGO_SECRET_KEY}}
- ALLOWED_HOSTS={{your_backend_domain}}
- DATABASE_URL={{NEON_DATABASE_URL}}  (ensure ?sslmode=require)
- REDIS_URL={{RAILWAY_REDIS_URL}}
- TOMTOM_API_KEY={{TOMTOM_API_KEY}}
- OPENROUTER_API_KEY={{OPENROUTER_API_KEY}} (optional)
- AI_MODEL=deepseek/deepseek-r1-0528-qwen3-8b:free (optional)
- CORS_ALLOWED_ORIGINS=https://{{your_frontend_domain}}
- CSRF_TRUSTED_ORIGINS=https://{{your_frontend_domain}}

After first deploy (or as deploy hooks)
- python manage.py migrate
- python manage.py collectstatic --noinput

Worker (Celery)
- Root Directory: backend
- Build: Docker
- Dockerfile Path: backend/Dockerfile
- Start Command: celery -A movesmart_backend worker --loglevel=info
- Env vars: same as Backend (DATABASE_URL, REDIS_URL, SECRET_KEY, TOMTOM_API_KEY, etc.)

Redis
- Add Railway Redis plugin and copy REDIS_URL into both Backend and Worker.

Frontend (Static Site)
- Root Directory: frontend
- Build Command: npm ci && npm run build
- Publish Directory: dist
- Env vars:
  - For Vite: VITE_API_URL=https://{{your_backend_domain}}
  - If CRA-style instead: REACT_APP_API_URL=https://{{your_backend_domain}}

Troubleshooting
- Railpack build error: set the service Root Directory (backend or frontend) and for backend choose Dockerfile build.
- collectstatic fails: ensure STATIC_ROOT is set (now configured in settings.py).
- 403 CSRF/CORS: set CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS env vars to your frontend domain.
- 400 Bad Request: ensure ALLOWED_HOSTS includes your Railway backend domain.

Security
- Never paste secrets into code. Put them in Railway Variables.

