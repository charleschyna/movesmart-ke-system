import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class AITrafficAnalyzer:
    """AI service for analyzing traffic data and generating insights."""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.use_mock_ai = not bool(self.openai_api_key)
        
        if self.use_mock_ai:
            logger.info("Using mock AI service (OpenAI API key not configured)")
        else:
            logger.info("Using OpenAI API for traffic analysis")
    
    def analyze_traffic_data(self, traffic_data: Dict[str, Any], 
                           incidents_data: List[Dict[str, Any]], 
                           location: str) -> Dict[str, str]:
        """
        Analyze traffic data and generate AI insights.
        
        Args:
            traffic_data: Raw traffic data from TomTom API
            incidents_data: List of traffic incidents
            location: Location name for context
            
        Returns:
            Dictionary with AI analysis and recommendations
        """
        
        if self.use_mock_ai:
            return self._generate_mock_analysis(traffic_data, incidents_data, location)
        else:
            return self._generate_openai_analysis(traffic_data, incidents_data, location)
    
    def analyze_detailed_traffic_data(self, detailed_traffic_data: Dict[str, Any], location: str) -> Dict[str, str]:
        """
        Analyze detailed traffic data and generate comprehensive AI insights.
        
        Args:
            detailed_traffic_data: Detailed traffic data from TomTom API
            location: Location name for context
            
        Returns:
            Dictionary with comprehensive AI analysis and recommendations
        """
        
        if self.use_mock_ai:
            return self._generate_detailed_mock_analysis(detailed_traffic_data, location)
        else:
            return self._generate_detailed_openai_analysis(detailed_traffic_data, location)
    
    def _generate_mock_analysis(self, traffic_data: Dict[str, Any], 
                              incidents_data: List[Dict[str, Any]], 
                              location: str) -> Dict[str, str]:
        """Generate mock AI analysis for development/testing."""
        
        # Extract key metrics
        current_speed = 0
        free_flow_speed = 0
        congestion_level = 0
        
        if traffic_data and 'flowSegmentData' in traffic_data:
            segment = traffic_data['flowSegmentData']
            current_speed = segment.get('currentSpeed', 0)
            free_flow_speed = segment.get('freeFlowSpeed', 0)
            
            if free_flow_speed > 0:
                congestion_level = round(max(0, (1 - (current_speed / free_flow_speed)) * 100))
        
        incident_count = len(incidents_data)
        current_hour = datetime.now().hour
        
        # Generate contextual analysis
        analysis_parts = []
        
        # Time-based analysis
        if 7 <= current_hour <= 9:
            analysis_parts.append(f"Morning rush hour traffic analysis for {location}.")
        elif 17 <= current_hour <= 19:
            analysis_parts.append(f"Evening rush hour traffic analysis for {location}.")
        elif 12 <= current_hour <= 14:
            analysis_parts.append(f"Midday traffic analysis for {location}.")
        else:
            analysis_parts.append(f"Off-peak traffic analysis for {location}.")
        
        # Congestion analysis
        if congestion_level > 75:
            analysis_parts.append("Traffic is experiencing severe congestion with significantly reduced speeds.")
        elif congestion_level > 50:
            analysis_parts.append("Moderate to heavy traffic congestion is currently affecting travel times.")
        elif congestion_level > 25:
            analysis_parts.append("Light traffic congestion with minimal impact on travel times.")
        else:
            analysis_parts.append("Traffic is flowing smoothly with minimal congestion.")
        
        # Speed analysis
        if current_speed > 0:
            analysis_parts.append(f"Current average speed is {current_speed} km/h")
            if free_flow_speed > 0:
                analysis_parts.append(f"compared to free-flow speed of {free_flow_speed} km/h.")
        
        # Incident analysis
        if incident_count > 5:
            analysis_parts.append(f"High incident activity with {incident_count} reported incidents affecting traffic flow.")
        elif incident_count > 2:
            analysis_parts.append(f"Moderate incident activity with {incident_count} reported incidents.")
        elif incident_count > 0:
            analysis_parts.append(f"Low incident activity with {incident_count} reported incident(s).")
        else:
            analysis_parts.append("No major incidents reported in the area.")
        
        analysis = " ".join(analysis_parts)
        
        # Generate recommendations
        recommendations = []
        
        if congestion_level > 75:
            recommendations.extend([
                "Consider delaying non-essential trips if possible",
                "Use alternative routes to avoid heavily congested areas",
                "Allow extra time for planned journeys",
                "Consider using public transportation if available"
            ])
        elif congestion_level > 50:
            recommendations.extend([
                "Plan for additional travel time",
                "Consider alternative routes for time-sensitive trips",
                "Monitor real-time traffic updates"
            ])
        elif congestion_level > 25:
            recommendations.extend([
                "Minor delays possible, plan accordingly",
                "Good time for non-urgent travel"
            ])
        else:
            recommendations.extend([
                "Excellent conditions for travel",
                "Optimal time for longer journeys"
            ])
        
        if incident_count > 2:
            recommendations.append("Stay alert for incident-related delays and road closures")
        
        # Time-based recommendations
        if 7 <= current_hour <= 9 or 17 <= current_hour <= 19:
            recommendations.append("Rush hour periods - expect increased traffic volume")
        
        recommendation_text = "\\n".join([f"• {rec}" for rec in recommendations])
        
        return {
            'analysis': analysis,
            'recommendations': recommendation_text,
            'congestion_level': congestion_level,
            'avg_speed': current_speed
        }
    
    def _generate_openai_analysis(self, traffic_data: Dict[str, Any], 
                                incidents_data: List[Dict[str, Any]], 
                                location: str) -> Dict[str, str]:
        """Generate AI analysis using OpenAI API."""
        
        # Prepare data for OpenAI
        prompt = self._create_analysis_prompt(traffic_data, incidents_data, location)
        
        try:
            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.openai_api_key}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a traffic analysis expert. Analyze the provided traffic data and generate practical insights and recommendations for drivers.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 500,
                    'temperature': 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # Parse the response to extract analysis and recommendations
                return self._parse_openai_response(ai_response)
            else:
                logger.error(f"OpenAI API error: {response.status_code} - {response.text}")
                return self._generate_mock_analysis(traffic_data, incidents_data, location)
                
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return self._generate_mock_analysis(traffic_data, incidents_data, location)
    
    def _create_analysis_prompt(self, traffic_data: Dict[str, Any], 
                              incidents_data: List[Dict[str, Any]], 
                              location: str) -> str:
        """Create a prompt for OpenAI API."""
        
        prompt = f"""Analyze the following traffic data for {location} and provide insights:

TRAFFIC DATA:
{json.dumps(traffic_data, indent=2)}

INCIDENTS DATA:
{json.dumps(incidents_data, indent=2)}

Please provide:
1. ANALYSIS: A detailed analysis of the current traffic situation
2. RECOMMENDATIONS: Practical recommendations for drivers

Format your response as:
ANALYSIS: [your analysis here]
RECOMMENDATIONS: [your recommendations here]
"""
        return prompt
    
    def _parse_openai_response(self, response: str) -> Dict[str, str]:
        """Parse OpenAI response to extract analysis and recommendations."""
        
        analysis = ""
        recommendations = ""
        
        try:
            # Simple parsing - look for ANALYSIS: and RECOMMENDATIONS: sections
            lines = response.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.startswith('ANALYSIS:'):
                    current_section = 'analysis'
                    analysis = line.replace('ANALYSIS:', '').strip()
                elif line.startswith('RECOMMENDATIONS:'):
                    current_section = 'recommendations'
                    recommendations = line.replace('RECOMMENDATIONS:', '').strip()
                elif current_section == 'analysis' and line:
                    analysis += f" {line}"
                elif current_section == 'recommendations' and line:
                    recommendations += f"\\n{line}"
            
            return {
                'analysis': analysis.strip(),
                'recommendations': recommendations.strip()
            }
            
        except Exception as e:
            logger.error(f"Error parsing OpenAI response: {e}")
            return {
                'analysis': response[:300] + "..." if len(response) > 300 else response,
                'recommendations': "Monitor traffic conditions and plan accordingly."
            }
    
    def _generate_detailed_mock_analysis(self, detailed_traffic_data: Dict[str, Any], location: str) -> Dict[str, str]:
        """Generate comprehensive mock AI analysis for detailed traffic reports."""
        
        flow_points = detailed_traffic_data.get('traffic_flow_points', [])
        incidents = detailed_traffic_data.get('incidents', {}).get('incidents', [])
        major_routes = detailed_traffic_data.get('major_routes', [])
        
        # Analyze flow data points
        total_speeds = []
        congested_areas = []
        
        for point in flow_points:
            if 'flowSegmentData' in point:
                segment = point['flowSegmentData']
                current_speed = segment.get('currentSpeed', 0)
                free_flow_speed = segment.get('freeFlowSpeed', 0)
                coordinates = point.get('coordinates', [])
                
                if current_speed > 0:
                    total_speeds.append(current_speed)
                    
                    if free_flow_speed > 0:
                        congestion_percent = (1 - (current_speed / free_flow_speed)) * 100
                        if congestion_percent > 40:  # Significant congestion
                            congested_areas.append({
                                'location': f"Area near {coordinates[0]:.4f}, {coordinates[1]:.4f}",
                                'congestion': round(congestion_percent),
                                'current_speed': current_speed,
                                'free_flow_speed': free_flow_speed
                            })
        
        # Calculate overall metrics
        avg_speed = round(sum(total_speeds) / len(total_speeds)) if total_speeds else 0
        overall_congestion = max([area['congestion'] for area in congested_areas], default=0)
        
        # Analyze incidents by type and location
        incident_analysis = []
        road_closures = []
        accidents = []
        construction = []
        
        for incident in incidents:
            props = incident.get('properties', {})
            incident_type = props.get('iconCategory', 'unknown')
            description = props.get('events', [{}])[0].get('description', 'Traffic incident')
            road_info = props.get('from', '') + ' to ' + props.get('to', '')
            
            incident_info = {
                'type': incident_type,
                'description': description,
                'road': road_info,
                'delay': props.get('delay', 0)
            }
            
            if 'closure' in description.lower() or 'closed' in description.lower():
                road_closures.append(incident_info)
            elif 'accident' in description.lower() or 'collision' in description.lower():
                accidents.append(incident_info)
            elif 'construction' in description.lower() or 'work' in description.lower():
                construction.append(incident_info)
            else:
                incident_analysis.append(incident_info)
        
        # Analyze major routes
        route_analysis = []
        for route in major_routes:
            route_name = route.get('route_name', 'Unknown Route')
            route_data = route.get('routes', [{}])[0] if route.get('routes') else {}
            summary = route_data.get('summary', {})
            
            route_info = {
                'name': route_name,
                'travel_time': summary.get('travelTimeInSeconds', 0) // 60,  # Convert to minutes
                'distance': summary.get('lengthInMeters', 0) / 1000,  # Convert to km
                'traffic_delay': summary.get('trafficDelayInSeconds', 0) // 60  # Convert to minutes
            }
            route_analysis.append(route_info)
        
        # Generate comprehensive analysis
        analysis_parts = []
        current_hour = datetime.now().hour
        
        # Time context
        if 7 <= current_hour <= 9:
            analysis_parts.append(f"📍 **MORNING RUSH HOUR ANALYSIS FOR {location.upper()}**")
        elif 17 <= current_hour <= 19:
            analysis_parts.append(f"📍 **EVENING RUSH HOUR ANALYSIS FOR {location.upper()}**")
        else:
            analysis_parts.append(f"📍 **TRAFFIC ANALYSIS FOR {location.upper()}**")
        
        # Overall traffic conditions
        if overall_congestion > 75:
            analysis_parts.append("🚨 **SEVERE CONGESTION DETECTED** - Multiple areas experiencing significant delays")
        elif overall_congestion > 50:
            analysis_parts.append("⚠️ **HEAVY TRAFFIC CONDITIONS** - Moderate to severe congestion in several areas")
        elif overall_congestion > 25:
            analysis_parts.append("🟡 **MODERATE TRAFFIC** - Some congestion but generally manageable")
        else:
            analysis_parts.append("✅ **GOOD TRAFFIC CONDITIONS** - Smooth flow with minimal congestion")
        
        # Speed analysis
        if avg_speed > 0:
            analysis_parts.append(f"📊 **Average Speed**: {avg_speed} km/h across monitored points")
        
        # Congested areas details
        if congested_areas:
            analysis_parts.append("\n🔴 **CONGESTED AREAS:**")
            for area in congested_areas[:5]:  # Show top 5 congested areas
                analysis_parts.append(f"• {area['location']}: {area['congestion']}% congestion ({area['current_speed']} km/h vs {area['free_flow_speed']} km/h normal)")
        
        # Major routes analysis
        if route_analysis:
            analysis_parts.append("\n🛣️ **MAJOR ROUTES STATUS:**")
            for route in route_analysis:
                delay_text = f" (+{route['traffic_delay']} min delay)" if route['traffic_delay'] > 0 else ""
                analysis_parts.append(f"• **{route['name']}**: {route['travel_time']} min travel time{delay_text}")
        
        # Incidents analysis
        if accidents:
            analysis_parts.append("\n🚨 **ACCIDENTS & COLLISIONS:**")
            for acc in accidents[:3]:  # Show top 3 accidents
                analysis_parts.append(f"• {acc['description']} on {acc['road']}")
        
        if road_closures:
            analysis_parts.append("\n🚧 **ROAD CLOSURES:**")
            for closure in road_closures[:3]:  # Show top 3 closures
                analysis_parts.append(f"• {closure['description']} on {closure['road']}")
        
        if construction:
            analysis_parts.append("\n🏗️ **CONSTRUCTION WORK:**")
            for work in construction[:3]:  # Show top 3 construction
                analysis_parts.append(f"• {work['description']} on {work['road']}")
        
        # Generate recommendations
        recommendations = []
        
        if overall_congestion > 75:
            recommendations.extend([
                "🚨 **AVOID TRAVEL** if possible - severe congestion citywide",
                "🚇 **USE PUBLIC TRANSPORT** - significantly faster than driving",
                "⏰ **DELAY TRIPS** until after peak hours if flexible",
                "📱 **MONITOR REAL-TIME** updates for any improvements"
            ])
        elif overall_congestion > 50:
            recommendations.extend([
                "⏰ **ALLOW EXTRA TIME** - expect 50-100% longer travel times",
                "🗺️ **USE ALTERNATIVE ROUTES** - avoid main highways",
                "📱 **CHECK NAVIGATION APPS** for real-time routing",
                "🚗 **CONSIDER CARPOOLING** to reduce overall traffic"
            ])
        elif overall_congestion > 25:
            recommendations.extend([
                "⏰ **PLAN EXTRA TIME** - minor delays possible",
                "🗺️ **STAY FLEXIBLE** with route choices",
                "📱 **MONITOR CONDITIONS** for any changes"
            ])
        else:
            recommendations.extend([
                "✅ **GOOD TIME TO TRAVEL** - optimal conditions",
                "🚗 **NORMAL ROUTES** are functioning well",
                "📱 **STAY UPDATED** for any sudden changes"
            ])
        
        # Add specific route recommendations
        if route_analysis:
            best_route = min(route_analysis, key=lambda x: x['travel_time'] + x['traffic_delay'])
            worst_route = max(route_analysis, key=lambda x: x['travel_time'] + x['traffic_delay'])
            
            if best_route != worst_route:
                recommendations.append(f"🛣️ **RECOMMENDED ROUTE**: {best_route['name']} (fastest currently)")
                recommendations.append(f"🚫 **AVOID**: {worst_route['name']} (experiencing delays)")
        
        # Add incident-specific recommendations
        if accidents or road_closures:
            recommendations.append("⚠️ **DRIVE CAREFULLY** - accidents and closures reported")
            recommendations.append("🚗 **MAINTAIN SAFE DISTANCE** and stay alert")
        
        analysis_text = "\n".join(analysis_parts)
        recommendations_text = "\n".join(recommendations)
        
        return {
            'analysis': analysis_text,
            'recommendations': recommendations_text,
            'congestion_level': overall_congestion,
            'avg_speed': avg_speed,
            'incident_count': len(incidents),
            'congested_areas_count': len(congested_areas),
            'major_routes_analyzed': len(route_analysis)
        }


# Singleton instance
ai_analyzer = AITrafficAnalyzer()
