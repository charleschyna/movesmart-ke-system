#!/usr/bin/env python
"""
Test script for MoveSmart KE authentication endpoints
Run with: python test_auth.py
"""
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movesmart_backend.settings')
django.setup()

import requests
import json
from django.test import Client
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

def test_authentication():
    print("🚀 Testing MoveSmart KE Authentication System")
    print("=" * 50)
    
    # Use Django test client
    client = Client()
    base_url = "http://127.0.0.1:8000"
    
    print("\n1. Testing User Registration...")
    register_data = {
        'username': 'testuser',
        'email': 'test@movesmart.ke',
        'password': 'TestPassword123!',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    # Register user via Django test client
    response = client.post('/auth/register/', 
                          data=json.dumps(register_data),
                          content_type='application/json')
    
    print(f"Registration Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"✅ User registered successfully: {data['user']['username']}")
        token = data['token']
        print(f"🔑 Token: {token[:20]}...")
    else:
        print(f"❌ Registration failed: {response.content}")
        return
    
    print("\n2. Testing User Login...")
    login_data = {
        'username': 'testuser',
        'password': 'TestPassword123!'
    }
    
    response = client.post('/auth/login/',
                          data=json.dumps(login_data),
                          content_type='application/json')
    
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful: {data['user']['username']}")
        login_token = data['token']
    else:
        print(f"❌ Login failed: {response.content}")
        return
    
    print("\n3. Testing Protected Profile Endpoint...")
    headers = {
        'HTTP_AUTHORIZATION': f'Token {login_token}',
        'content_type': 'application/json'
    }
    
    response = client.get('/auth/profile/', **headers)
    print(f"Profile Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Profile retrieved: {data['user']['email']}")
    else:
        print(f"❌ Profile retrieval failed: {response.content}")
    
    print("\n4. Testing Database Tables...")
    
    # Check if tables exist by counting records
    from traffic.models import TrafficData, TrafficReport, Route, TrafficPrediction
    from incidents.models import Incident, IncidentComment
    
    print(f"👥 Users: {User.objects.count()}")
    print(f"🚗 Traffic Data: {TrafficData.objects.count()}")
    print(f"📊 Traffic Reports: {TrafficReport.objects.count()}")
    print(f"🗺️ Routes: {Route.objects.count()}")
    print(f"🔮 Traffic Predictions: {TrafficPrediction.objects.count()}")
    print(f"🚨 Incidents: {Incident.objects.count()}")
    print(f"💬 Incident Comments: {IncidentComment.objects.count()}")
    print(f"🔐 Auth Tokens: {Token.objects.count()}")
    
    print("\n5. Database Connection Info...")
    from django.db import connection
    print(f"📊 Database Backend: {connection.vendor}")
    print(f"🔧 Database Name: {connection.settings_dict['NAME']}")
    print(f"🏠 Database Host: {connection.settings_dict['HOST']}")
    
    print("\n🎉 All tests completed!")
    print("=" * 50)
    print("\n📋 Authentication Endpoints Summary:")
    print("• POST /auth/register/ - User registration")
    print("• POST /auth/login/ - User login")
    print("• POST /auth/logout/ - User logout (requires auth)")
    print("• GET /auth/profile/ - Get user profile (requires auth)")
    print("• PUT /auth/profile/update/ - Update profile (requires auth)")
    print("• POST /auth/change-password/ - Change password (requires auth)")
    print("\n🚀 To start the server: python manage.py runserver")

if __name__ == "__main__":
    # Modify the test client headers
    from django.test.client import MULTIPART_CONTENT
    client.defaults["SERVER_NAME"] = "localhost"
    client.defaults["SERVER_PORT"] = "8000"
    client.defaults["CONTENT_TYPE"] = MULTIPART_CONTENT
    test_authentication()
