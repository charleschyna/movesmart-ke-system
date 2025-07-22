# Google Sign-In Setup Guide for MoveSmart KE

## Overview
This guide explains how to set up and use Google Sign-In for the MoveSmart KE application.

## Prerequisites
- Google Cloud Console account
- MoveSmart KE backend and frontend running

## Configuration

### 1. Google Cloud Console Setup
Your Google OAuth credentials are already configured:
- **Client ID**: `759211220044-od9no67r0ks0ai8sjb697o8igc3irn8o.apps.googleusercontent.com`
- **Client Secret**: `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`

**Important**: For production, you should:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create your own OAuth 2.0 credentials
3. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
4. Add authorized redirect URIs if needed

### 2. Backend Setup

#### Install Required Packages
```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

#### Environment Variables
The following are already configured in `backend/.env`:
```env
GOOGLE_CLIENT_ID=759211220044-od9no67r0ks0ai8sjb697o8igc3irn8o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### 3. Frontend Setup

#### Environment Variables
The following is already configured in `frontend/.env.local`:
```env
VITE_GOOGLE_CLIENT_ID=759211220044-od9no67r0ks0ai8sjb697o8igc3irn8o.apps.googleusercontent.com
```

## How It Works

### Authentication Flow
1. User clicks "Continue with Google" on the login page
2. Google's OAuth popup appears
3. User selects their Google account
4. Google returns an ID token to the frontend
5. Frontend sends the token to our backend
6. Backend verifies the token with Google
7. Backend creates/retrieves user account
8. Backend returns authentication token
9. User is logged in

### Backend Implementation

#### `authentication/google_auth.py`
- Verifies Google ID tokens
- Creates new users from Google profile data
- Handles existing users logging in with Google

#### `authentication/views.py`
- `google_login` endpoint handles Google authentication
- Returns user data and auth token

### Frontend Implementation

#### `components/auth/Login.tsx`
- Loads Google Identity Services library
- Handles Google Sign-In button
- Sends token to backend
- Manages authentication state

## Testing

### 1. Start the Backend
```bash
cd backend
python manage.py runserver
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Login
1. Navigate to http://localhost:3000/login
2. Click "Continue with Google"
3. Select your Google account
4. You should be redirected to the dashboard

## Security Considerations

1. **Never commit credentials**: Always use environment variables
2. **HTTPS in production**: Google OAuth requires HTTPS in production
3. **Token validation**: Always verify tokens on the backend
4. **Secure storage**: Store auth tokens securely in the frontend

## Troubleshooting

### Common Issues

1. **"Google is not defined" error**
   - Ensure the Google Identity Services script loads properly
   - Check browser console for errors

2. **"Invalid token" error**
   - Verify Google Client ID matches in frontend and backend
   - Check if token has expired

3. **CORS errors**
   - Ensure backend CORS settings allow frontend origin
   - Check `CORS_ALLOWED_ORIGINS` in Django settings

4. **User creation fails**
   - Check if email already exists in database
   - Verify database migrations are applied

### Debug Steps
1. Check browser console for JavaScript errors
2. Check network tab for API call failures
3. Check Django server logs for backend errors
4. Verify environment variables are loaded correctly

## API Reference

### POST `/auth/google-login/`
Authenticates a user with Google OAuth.

**Request Body:**
```json
{
  "token": "google_id_token_here"
}
```

**Response:**
```json
{
  "message": "Google login successful",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "auth_token_here",
  "is_new_user": false
}
```

## Next Steps

1. **Add user profile pictures**: Store Google profile picture URLs
2. **Implement refresh tokens**: For better session management
3. **Add social account linking**: Allow users to link multiple auth methods
4. **Implement role-based access**: Different permissions for different users
