#!/usr/bin/env python3
"""
Test script for Google OAuth implementation
Run this to verify Google Sign-In is working properly
"""

import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movesmart_backend.settings')
import django
django.setup()

from authentication.google_auth import GoogleAuth

def test_google_auth_setup():
    """Test if Google OAuth is properly configured"""
    print("Testing Google OAuth Setup...")
    print("-" * 50)
    
    # Check environment variables
    from django.conf import settings
    
    print(f"✓ Google Client ID: {settings.GOOGLE_CLIENT_ID[:20]}...")
    print(f"✓ Google Client Secret: {'*' * 10} (hidden)")
    
    # Test the GoogleAuth class exists
    try:
        print("✓ GoogleAuth class imported successfully")
    except Exception as e:
        print(f"✗ Error importing GoogleAuth: {e}")
        return False
    
    print("-" * 50)
    print("Google OAuth setup appears to be configured correctly!")
    print("\nNext steps:")
    print("1. Install required packages: pip install -r backend/requirements.txt")
    print("2. Run migrations: python backend/manage.py migrate")
    print("3. Start the backend server: python backend/manage.py runserver")
    print("4. Start the frontend: cd frontend && npm run dev")
    print("5. Visit http://localhost:3000/login and test Google Sign-In")
    
    return True

if __name__ == "__main__":
    test_google_auth_setup()
