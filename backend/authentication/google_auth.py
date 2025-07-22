from google.auth.transport import requests
from google.oauth2 import id_token
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.conf import settings
import requests as http_requests


class GoogleAuth:
    """Handle Google OAuth authentication"""
    
    @staticmethod
    def verify_token(token):
        """Verify the Google ID token"""
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            # Token is valid, extract user info
            return {
                'email': idinfo.get('email'),
                'name': idinfo.get('name'),
                'given_name': idinfo.get('given_name'),
                'family_name': idinfo.get('family_name'),
                'picture': idinfo.get('picture'),
                'email_verified': idinfo.get('email_verified'),
                'sub': idinfo.get('sub'),  # Google user ID
            }
        except ValueError as e:
            # Invalid token
            return None
    
    @staticmethod
    def get_or_create_user(google_user_info):
        """Get or create a user from Google user info"""
        if not google_user_info or not google_user_info.get('email_verified'):
            return None
            
        email = google_user_info.get('email')
        
        # Try to find existing user by email
        user = User.objects.filter(email=email).first()
        
        if not user:
            # Create new user
            username = email.split('@')[0]
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=google_user_info.get('given_name', ''),
                last_name=google_user_info.get('family_name', ''),
            )
            # Set unusable password for OAuth users
            user.set_unusable_password()
            user.save()
        
        return user
    
    @staticmethod
    def authenticate_google_user(token):
        """Full authentication flow for Google users"""
        # Verify token
        google_user_info = GoogleAuth.verify_token(token)
        if not google_user_info:
            return None, None
        
        # Get or create user
        user = GoogleAuth.get_or_create_user(google_user_info)
        if not user:
            return None, None
        
        # Get or create auth token
        auth_token, created = Token.objects.get_or_create(user=user)
        
        return user, auth_token
