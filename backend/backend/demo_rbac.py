#!/usr/bin/env python3
"""
Demo script showing role-based access control for traffic reports.

This script demonstrates how users can only access their own reports,
ensuring privacy and data isolation between different users.
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'movesmart_backend.settings')
django.setup()

from django.contrib.auth.models import User
from traffic.models import TrafficReport
from rest_framework.authtoken.models import Token
import requests
from datetime import datetime

# Base URL for the API (adjust as needed)
BASE_URL = 'http://localhost:8000'

def create_demo_users():
    """Create demo users for testing."""
    print("🔧 Creating demo users...")
    
    # User 1
    user1, created = User.objects.get_or_create(
        username='user1',
        defaults={
            'email': 'user1@example.com',
            'first_name': 'Alice',
            'last_name': 'Johnson'
        }
    )
    if created:
        user1.set_password('testpass123')
        user1.save()
    token1, _ = Token.objects.get_or_create(user=user1)
    
    # User 2
    user2, created = User.objects.get_or_create(
        username='user2',
        defaults={
            'email': 'user2@example.com',
            'first_name': 'Bob',
            'last_name': 'Smith'
        }
    )
    if created:
        user2.set_password('testpass123')
        user2.save()
    token2, _ = Token.objects.get_or_create(user=user2)
    
    print(f"✅ User 1: {user1.username} (ID: {user1.id}) - Token: {token1.key[:10]}...")
    print(f"✅ User 2: {user2.username} (ID: {user2.id}) - Token: {token2.key[:10]}...")
    
    return user1, user2, token1.key, token2.key

def create_demo_reports(user1, user2):
    """Create demo reports for each user."""
    print("\n📊 Creating demo reports...")
    
    # Reports for User 1
    report1 = TrafficReport.objects.create(
        title="Nairobi Traffic Report",
        description="Daily traffic analysis for Nairobi CBD",
        report_type="traffic_summary",
        location="Nairobi CBD",
        city="Nairobi",
        latitude=-1.2921,
        longitude=36.8219,
        traffic_data={"congestion_level": 65, "incidents": 3},
        traffic_overview="Heavy traffic observed during morning rush hours",
        ai_recommendations="Consider alternative routes via Uhuru Highway",
        congestion_level=65,
        avg_speed=25.5,
        incident_count=3,
        user=user1
    )
    
    report2 = TrafficReport.objects.create(
        title="Westlands Traffic Analysis",
        description="Route performance analysis for Westlands area",
        report_type="route_performance",
        location="Westlands",
        city="Nairobi",
        latitude=-1.2647,
        longitude=36.8062,
        traffic_data={"congestion_level": 45, "incidents": 1},
        traffic_overview="Moderate traffic with some bottlenecks",
        ai_recommendations="Traffic flows smoothly except during peak hours",
        congestion_level=45,
        avg_speed=35.2,
        incident_count=1,
        user=user1
    )
    
    # Reports for User 2
    report3 = TrafficReport.objects.create(
        title="Mombasa Road Traffic Report",
        description="Comprehensive analysis of Mombasa Road corridor",
        report_type="incident_analysis",
        location="Mombasa Road",
        city="Nairobi",
        latitude=-1.3067,
        longitude=36.8830,
        traffic_data={"congestion_level": 70, "incidents": 5},
        traffic_overview="Multiple incidents causing severe delays",
        ai_recommendations="Use alternative routes via Southern Bypass",
        congestion_level=70,
        avg_speed=18.7,
        incident_count=5,
        user=user2
    )
    
    report4 = TrafficReport.objects.create(
        title="Thika Road Analysis",
        description="Traffic patterns on Thika Superhighway",
        report_type="traffic_summary",
        location="Thika Road",
        city="Nairobi",
        latitude=-1.2296,
        longitude=36.8870,
        traffic_data={"congestion_level": 30, "incidents": 0},
        traffic_overview="Free-flowing traffic with minimal delays",
        ai_recommendations="Optimal route for northbound travel",
        congestion_level=30,
        avg_speed=65.0,
        incident_count=0,
        user=user2
    )
    
    print(f"✅ Created report '{report1.title}' for {user1.username}")
    print(f"✅ Created report '{report2.title}' for {user1.username}")
    print(f"✅ Created report '{report3.title}' for {user2.username}")
    print(f"✅ Created report '{report4.title}' for {user2.username}")
    
    return [report1, report2], [report3, report4]

def test_user_access(token, username, expected_count):
    """Test that a user can only access their own reports."""
    print(f"\n🔍 Testing access for {username}...")
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Test list reports endpoint
        response = requests.get(f'{BASE_URL}/api/traffic/reports/list_reports/', headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            actual_count = data.get('count', 0)
            reports = data.get('results', [])
            
            print(f"📋 {username} can see {actual_count} reports (expected: {expected_count})")
            
            if actual_count == expected_count:
                print("✅ Access control working correctly!")
                
                # Show report titles
                for report in reports:
                    print(f"   - {report['title']} (ID: {report['id']})")
            else:
                print("❌ Access control issue detected!")
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        print("Make sure the Django server is running on localhost:8000")

def test_cross_user_access(user1_token, user2_token, user1_reports, user2_reports):
    """Test that users cannot access each other's reports."""
    print(f"\n🚫 Testing cross-user access prevention...")
    
    headers1 = {'Authorization': f'Token {user1_token}', 'Content-Type': 'application/json'}
    headers2 = {'Authorization': f'Token {user2_token}', 'Content-Type': 'application/json'}
    
    # Try user1 accessing user2's report
    user2_report_id = user2_reports[0].id
    response = requests.get(f'{BASE_URL}/api/traffic/reports/{user2_report_id}/get_report/', headers=headers1)
    
    if response.status_code == 404:
        print("✅ User 1 correctly cannot access User 2's report")
    else:
        print(f"❌ User 1 inappropriately accessed User 2's report (status: {response.status_code})")
    
    # Try user2 accessing user1's report
    user1_report_id = user1_reports[0].id
    response = requests.get(f'{BASE_URL}/api/traffic/reports/{user1_report_id}/get_report/', headers=headers2)
    
    if response.status_code == 404:
        print("✅ User 2 correctly cannot access User 1's report")
    else:
        print(f"❌ User 2 inappropriately accessed User 1's report (status: {response.status_code})")

def test_report_deletion(token, username, report_to_delete):
    """Test that users can delete their own reports."""
    print(f"\n🗑️  Testing report deletion for {username}...")
    
    headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
    
    response = requests.delete(f'{BASE_URL}/api/traffic/reports/{report_to_delete.id}/delete_report/', headers=headers)
    
    if response.status_code == 200:
        print(f"✅ {username} successfully deleted their report")
        
        # Verify it's actually deleted
        if not TrafficReport.objects.filter(id=report_to_delete.id).exists():
            print("✅ Report confirmed deleted from database")
        else:
            print("❌ Report still exists in database")
    else:
        print(f"❌ Deletion failed with status {response.status_code}")

def display_summary():
    """Display a summary of the role-based access control features."""
    print("\n" + "="*60)
    print("🔐 ROLE-BASED ACCESS CONTROL SUMMARY")
    print("="*60)
    print()
    print("✅ Features Implemented:")
    print("   • Users can only view their own reports")
    print("   • Users cannot access other users' reports")
    print("   • Users can generate new reports (automatically linked to them)")
    print("   • Users can delete their own reports")
    print("   • All report endpoints require authentication")
    print("   • Reports are filtered by user ownership")
    print()
    print("🔧 Technical Implementation:")
    print("   • Added IsAuthenticated permission to TrafficReportViewSet")
    print("   • Modified list_reports to filter by request.user")
    print("   • Updated all report creation methods to set user=request.user")
    print("   • Added get_report and delete_report endpoints with user validation")
    print("   • Enhanced frontend API service with user-specific methods")
    print()
    print("🎯 Benefits:")
    print("   • Data privacy and isolation between users")
    print("   • Prevents unauthorized access to sensitive traffic data")
    print("   • Scalable multi-tenant architecture")
    print("   • Compliance with data protection requirements")

def main():
    """Main demonstration function."""
    print("🚀 ROLE-BASED ACCESS CONTROL DEMO")
    print("="*40)
    
    # Create demo users
    user1, user2, token1, token2 = create_demo_users()
    
    # Create demo reports
    user1_reports, user2_reports = create_demo_reports(user1, user2)
    
    # Test user access
    test_user_access(token1, user1.username, 2)
    test_user_access(token2, user2.username, 2)
    
    # Test cross-user access prevention
    test_cross_user_access(token1, token2, user1_reports, user2_reports)
    
    # Test report deletion
    test_report_deletion(token1, user1.username, user1_reports[1])
    
    # Display summary
    display_summary()
    
    print("\n" + "="*60)
    print("🎉 DEMO COMPLETED!")
    print("="*60)

if __name__ == '__main__':
    main()
