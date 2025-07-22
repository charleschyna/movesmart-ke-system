#!/usr/bin/env python
"""
Simple verification script for MoveSmart KE PostgreSQL setup
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movesmart_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from traffic.models import TrafficData, TrafficReport, Route, TrafficPrediction
from incidents.models import Incident, IncidentComment
from django.db import connection

def verify_database_setup():
    print("🚀 MoveSmart KE PostgreSQL Database Setup Verification")
    print("=" * 60)
    
    # Database Connection Info
    print("\n📊 Database Configuration:")
    print(f"   Backend: {connection.vendor}")
    print(f"   Name: {connection.settings_dict['NAME']}")
    print(f"   Host: {connection.settings_dict['HOST']}")
    print(f"   User: {connection.settings_dict['USER']}")
    
    # Test database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"   Version: {version.split(',')[0]}")
    except Exception as e:
        print(f"   ❌ Connection Error: {e}")
        return
    
    # Check tables exist by counting records
    print("\n📋 Database Tables Status:")
    try:
        print(f"   👥 Users: {User.objects.count()}")
        print(f"   🔐 Auth Tokens: {Token.objects.count()}")
        print(f"   🚗 Traffic Data: {TrafficData.objects.count()}")
        print(f"   📊 Traffic Reports: {TrafficReport.objects.count()}")
        print(f"   🗺️ Routes: {Route.objects.count()}")
        print(f"   🔮 Traffic Predictions: {TrafficPrediction.objects.count()}")
        print(f"   🚨 Incidents: {Incident.objects.count()}")
        print(f"   💬 Incident Comments: {IncidentComment.objects.count()}")
        print("   ✅ All tables accessible!")
    except Exception as e:
        print(f"   ❌ Table Access Error: {e}")
        return
    
    # Check admin user
    try:
        admin_user = User.objects.get(username='admin')
        print(f"\n👤 Admin User: {admin_user.username} ({admin_user.email})")
        print(f"   Created: {admin_user.date_joined}")
        print(f"   Is Active: {admin_user.is_active}")
        print(f"   Is Staff: {admin_user.is_staff}")
        print(f"   Is Superuser: {admin_user.is_superuser}")
    except User.DoesNotExist:
        print("\n👤 Admin User: Not found")
    
    # Show available endpoints
    print("\n🔗 Available Authentication Endpoints:")
    print("   • POST /auth/register/ - User registration")
    print("   • POST /auth/login/ - User login  ")
    print("   • POST /auth/logout/ - User logout (requires auth)")
    print("   • GET /auth/profile/ - Get user profile (requires auth)")
    print("   • PUT /auth/profile/update/ - Update profile (requires auth)")
    print("   • POST /auth/change-password/ - Change password (requires auth)")
    
    print("\n🔗 Other Endpoints:")
    print("   • GET /admin/ - Django admin interface")
    print("   • Traffic endpoints - See traffic.urls")
    print("   • Incidents endpoints - See incidents.urls")
    
    # Environment check
    print(f"\n🔧 Environment:")
    print(f"   DEBUG: {os.environ.get('DEBUG', 'Not set')}")
    print(f"   ALLOWED_HOSTS: {os.environ.get('ALLOWED_HOSTS', 'Not set')}")
    
    print("\n✅ PostgreSQL Database Setup Complete!")
    print("🚀 Ready to run: python manage.py runserver")
    print("🔑 Admin login: username='admin', password='MoveSmart2025!'")

if __name__ == "__main__":
    verify_database_setup()
