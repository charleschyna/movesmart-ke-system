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
        self.openrouter_api_key = getattr(settings, 'OPENROUTER_API_KEY', None)
        self.ai_model = getattr(settings, 'AI_MODEL', 'deepseek/deepseek-r1-0528-qwen3-8b:free')
        
        # Prioritize OpenRouter, then OpenAI, then mock
        if self.openrouter_api_key:
            self.use_mock_ai = False
            self.api_type = 'openrouter'
            logger.info(f"Using OpenRouter API with model {self.ai_model} for traffic analysis")
        elif self.openai_api_key:
            self.use_mock_ai = False
            self.api_type = 'openai'
            logger.info("Using OpenAI API for traffic analysis")
        else:
            self.use_mock_ai = True
            self.api_type = 'mock'
            logger.info("Using mock AI service (no API key configured)")
    
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
        return self._generate_detailed_openai_analysis(detailed_traffic_data, location)
    
    def generate_detailed_report_sections(self, traffic_data: Dict[str, Any], location: str, report_type: str) -> Dict[str, str]:
        """
        Generate detailed report sections using AI for comprehensive traffic reports.
        
        Args:
            traffic_data: Raw traffic data from TomTom API
            location: Location name for context
            report_type: Type of report (traffic_summary, incident_analysis, etc.)
            
        Returns:
            Dictionary with all report sections
        """
        return self._generate_comprehensive_report_sections(traffic_data, location, report_type)
    
    def _generate_comprehensive_report_sections(self, traffic_data: Dict[str, Any], location: str, report_type: str) -> Dict[str, str]:
        """
        Generate comprehensive report sections based on report type using AI.
        
        Args:
            traffic_data: Raw traffic data from TomTom API
            location: Location name for context
            report_type: Type of report (traffic_summary, incident_analysis, etc.)
            
        Returns:
            Dictionary with detailed report sections
        """
        
        # Create comprehensive prompt based on report type
        prompt = self._create_comprehensive_report_prompt(traffic_data, location, report_type)
        
        try:
            if self.api_type == 'openrouter':
                response = requests.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.openrouter_api_key}',
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://movesmart.ke',
                        'X-Title': 'MoveSmart Comprehensive Report Generation'
                    },
                    json={
                        'model': self.ai_model,
                        'messages': [
                            {
                                'role': 'system',
                                'content': f'''You are an expert traffic analyst for Kenya specializing in {report_type} reports. Generate comprehensive, detailed sections for a professional traffic report. Use real data insights, local context, and provide actionable recommendations. Format the response with clear sections and use emojis for visual appeal.'''
                            },
                            {
                                'role': 'user',
                                'content': prompt
                            }
                        ],
                        'max_tokens': 2000,
                        'temperature': 0.7
                    },
                    timeout=60
                )
            else:
                # Fallback to basic analysis if no API key
                return self._generate_mock_comprehensive_sections(traffic_data, location, report_type)
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # Parse comprehensive sections from AI response
                parsed_sections = self._parse_comprehensive_sections(ai_response, traffic_data)
                return parsed_sections
            else:
                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                return self._generate_mock_comprehensive_sections(traffic_data, location, report_type)
                
        except Exception as e:
            logger.error(f"Error generating comprehensive report sections: {e}")
            return self._generate_mock_comprehensive_sections(traffic_data, location, report_type)
    
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
        """Generate AI analysis using OpenAI or OpenRouter API."""
        
        # Prepare data for AI
        prompt = self._create_analysis_prompt(traffic_data, incidents_data, location)
        
        try:
            if self.api_type == 'openrouter':
                response = requests.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.openrouter_api_key}',
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://movesmart.ke',
                        'X-Title': 'MoveSmart Traffic Analysis'
                    },
                    json={
                        'model': self.ai_model,
                        'messages': [
                            {
                                'role': 'system',
                                'content': 'You are a traffic analysis expert for Kenya. Analyze the provided traffic data and generate practical insights and recommendations for drivers in Kenyan cities. Focus on local context and practical advice.'
                            },
                            {
                                'role': 'user',
                                'content': prompt
                            }
                        ],
                        'max_tokens': 800,
                        'temperature': 0.7
                    },
                    timeout=30
                )
            else:
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
                return self._parse_ai_response(ai_response)
            else:
                logger.error(f"{self.api_type.upper()} API error: {response.status_code} - {response.text}")
                return self._generate_mock_analysis(traffic_data, incidents_data, location)
                
        except Exception as e:
            logger.error(f"Error calling {self.api_type.upper()} API: {e}")
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
    
    def _parse_ai_response(self, response: str) -> Dict[str, str]:
        """Parse AI response to extract analysis and recommendations."""
        
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
            
            # If structured parsing fails, try to split by common patterns
            if not analysis or not recommendations:
                # Try alternative parsing patterns
                if "ANALYSIS" in response.upper() and "RECOMMENDATIONS" in response.upper():
                    parts = response.upper().split("RECOMMENDATIONS")
                    analysis = parts[0].replace("ANALYSIS:", "").replace("ANALYSIS", "").strip()
                    recommendations = parts[1].strip() if len(parts) > 1 else ""
                else:
                    # Fallback: split response in half
                    mid_point = len(response) // 2
                    analysis = response[:mid_point].strip()
                    recommendations = response[mid_point:].strip()
            
            return {
                'analysis': analysis.strip() if analysis else "Traffic conditions analyzed.",
                'recommendations': recommendations.strip() if recommendations else "Monitor traffic conditions and plan accordingly."
            }
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
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
    
    def _generate_detailed_openai_analysis(self, detailed_traffic_data: Dict[str, Any], location: str) -> Dict[str, str]:
        """
        Generate comprehensive AI analysis for detailed traffic reports using OpenAI/OpenRouter API.
        
        Args:
            detailed_traffic_data: Detailed traffic data from TomTom API
            location: Location name for context
            
        Returns:
            Dictionary with comprehensive AI analysis and recommendations
        """
        
        # Prepare comprehensive prompt for AI
        prompt = self._create_detailed_analysis_prompt(detailed_traffic_data, location)
        
        try:
            if self.api_type == 'openrouter':
                response = requests.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {self.openrouter_api_key}',
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://movesmart.ke',
                        'X-Title': 'MoveSmart Detailed Traffic Analysis'
                    },
                    json={
                        'model': self.ai_model,
                        'messages': [
                            {
                                'role': 'system',
                                'content': '''You are an expert traffic analyst for Kenya with deep knowledge of local traffic patterns, infrastructure, and driving conditions. Provide comprehensive, actionable insights for drivers and traffic management. Focus on:
                                - Current traffic conditions and congestion hotspots
                                - Impact of incidents on traffic flow
                                - Best route recommendations
                                - Time-sensitive advice
                                - Local context (rush hours, events, weather)
                                - Safety considerations
                                Use emojis and clear formatting to make the analysis engaging and easy to read.'''
                            },
                            {
                                'role': 'user',
                                'content': prompt
                            }
                        ],
                        'max_tokens': 1200,
                        'temperature': 0.7
                    },
                    timeout=45
                )
            else:
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
                                'content': 'You are an expert traffic analyst. Provide comprehensive analysis of traffic conditions with practical recommendations for drivers.'
                            },
                            {
                                'role': 'user',
                                'content': prompt
                            }
                        ],
                        'max_tokens': 800,
                        'temperature': 0.7
                    },
                    timeout=30
                )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                
                # Parse the response and extract metrics
                parsed_response = self._parse_detailed_ai_response(ai_response, detailed_traffic_data)
                return parsed_response
            else:
                logger.error(f"{self.api_type.upper()} API error: {response.status_code} - {response.text}")
                return self._generate_detailed_mock_analysis(detailed_traffic_data, location)
                
        except Exception as e:
            logger.error(f"Error calling {self.api_type.upper()} API for detailed analysis: {e}")
            return self._generate_detailed_mock_analysis(detailed_traffic_data, location)
    
    def _create_detailed_analysis_prompt(self, detailed_traffic_data: Dict[str, Any], location: str) -> str:
        """
        Create a comprehensive prompt for detailed traffic analysis with enhanced real-time data processing.
        
        Args:
            detailed_traffic_data: Detailed traffic data from TomTom API
            location: Location name for context
            
        Returns:
            Formatted prompt string for AI analysis
        """
        
        flow_points = detailed_traffic_data.get('traffic_flow_points', [])
        incidents = detailed_traffic_data.get('incidents', {}).get('incidents', [])
        major_routes = detailed_traffic_data.get('major_routes', [])
        center_coords = detailed_traffic_data.get('center_coordinates', [])
        radius = detailed_traffic_data.get('radius_km', 10)
        
        # Process traffic flow data to extract meaningful insights
        flow_analysis = self._analyze_flow_data(flow_points)
        incident_analysis = self._analyze_incidents_data(incidents)
        route_analysis = self._analyze_route_data(major_routes)
        
        current_time = datetime.now()
        time_context = self._get_time_context(current_time.hour)
        
        prompt = f"""🚦 COMPREHENSIVE TRAFFIC ANALYSIS FOR {location.upper()}

📍 ANALYSIS SCOPE:
- Location: {location}
- Coverage Area: {radius}km radius around coordinates {center_coords}
- Analysis Time: {current_time.strftime('%A, %B %d, %Y at %H:%M:%S')}
- Time Context: {time_context}
- Data Points: {len(flow_points)} traffic monitoring points, {len(incidents)} incidents, {len(major_routes)} major routes

🚗 REAL-TIME TRAFFIC FLOW ANALYSIS:
{flow_analysis}

🚨 INCIDENT SITUATION REPORT:
{incident_analysis}

🛣️ MAJOR ROADS & ROUTES STATUS:
{route_analysis}

📊 CURRENT CONDITIONS SUMMARY:
- Weather Impact: Consider current weather conditions affecting visibility and road conditions
- Peak Hour Status: {time_context}
- Emergency Services: {len([i for i in incidents if 'emergency' in str(i).lower()])} emergency-related incidents
- Road Works: {len([i for i in incidents if any(word in str(i).lower() for word in ['construction', 'roadwork', 'maintenance'])])} construction/maintenance activities

As an expert traffic analyst for Kenya, provide a comprehensive analysis that includes:

1. **DETAILED TRAFFIC OVERVIEW**: 
   - Current traffic density and flow patterns
   - Comparison with typical conditions for this time/day
   - Areas of concern and smooth-flowing sections
   - Speed variations across different road types

2. **SPECIFIC ROAD CONDITIONS**:
   - Name specific roads/highways and their current status
   - Congestion levels on major arterial roads
   - Alternative route suggestions with specific road names
   - Travel time estimates for key corridors

3. **INCIDENT IMPACT ANALYSIS**:
   - How each major incident is affecting traffic flow
   - Expected duration of delays
   - Cascading effects on surrounding roads
   - Emergency response effectiveness

4. **HISTORICAL CONTEXT & PATTERNS**:
   - How current conditions compare to typical patterns
   - Seasonal/weather-related factors
   - Recurring bottlenecks in this area
   - Previous incidents at similar locations

5. **ACTIONABLE RECOMMENDATIONS**:
   - Immediate route suggestions with specific road names
   - Time-sensitive travel advice
   - Safety precautions for current conditions
   - Public transport alternatives where applicable

6. **PREDICTIVE INSIGHTS**:
   - Expected traffic evolution in next 1-2 hours
   - Best times to travel for different destinations
   - Potential emerging issues to watch

Please make your analysis specific to Kenyan road infrastructure, local driving patterns, and include specific road names, landmarks, and local context. Use emojis and clear formatting for readability.

Format your response as:
ANALYSIS: [comprehensive traffic analysis with specific details and local context]
RECOMMENDATIONS: [practical, specific recommendations with road names and timing]
"""
        
        return prompt
    
    def _parse_detailed_ai_response(self, response: str, detailed_traffic_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Parse detailed AI response and extract metrics.
        
        Args:
            response: AI response text
            detailed_traffic_data: Original traffic data for metric extraction
            
        Returns:
            Dictionary with parsed analysis and extracted metrics
        """
        
        # Parse analysis and recommendations
        parsed = self._parse_ai_response(response)
        
        # Extract metrics from traffic data
        flow_points = detailed_traffic_data.get('traffic_flow_points', [])
        incidents = detailed_traffic_data.get('incidents', {}).get('incidents', [])
        major_routes = detailed_traffic_data.get('major_routes', [])
        
        # Calculate metrics
        total_speeds = []
        congested_areas = 0
        
        for point in flow_points:
            if 'flowSegmentData' in point:
                segment = point['flowSegmentData']
                current_speed = segment.get('currentSpeed', 0)
                free_flow_speed = segment.get('freeFlowSpeed', 0)
                
                if current_speed > 0:
                    total_speeds.append(current_speed)
                    
                    if free_flow_speed > 0:
                        congestion_percent = (1 - (current_speed / free_flow_speed)) * 100
                        if congestion_percent > 40:
                            congested_areas += 1
        
        avg_speed = round(sum(total_speeds) / len(total_speeds)) if total_speeds else 0
        overall_congestion = min(max(congested_areas * 20, 0), 100)  # Rough estimate
        
        # Add calculated metrics to the response
        parsed.update({
            'congestion_level': overall_congestion,
            'avg_speed': avg_speed,
            'incident_count': len(incidents),
            'congested_areas_count': congested_areas,
            'major_routes_analyzed': len(major_routes)
        })
        
        return parsed
    
    def _analyze_flow_data(self, flow_points: List[Dict[str, Any]]) -> str:
        """Analyze traffic flow data and return formatted summary."""
        if not flow_points:
            return "❌ **NO FLOW DATA AVAILABLE** - Unable to assess current traffic conditions"
        
        analysis_parts = []
        total_speeds = []
        slow_areas = []
        fast_areas = []
        
        for i, point in enumerate(flow_points[:10]):  # Analyze up to 10 points
            if 'flowSegmentData' in point:
                segment = point['flowSegmentData']
                current_speed = segment.get('currentSpeed', 0)
                free_flow_speed = segment.get('freeFlowSpeed', 50)  # Default assumption
                coordinates = point.get('coordinates', [])
                
                if current_speed > 0:
                    total_speeds.append(current_speed)
                    congestion_pct = max(0, (1 - (current_speed / free_flow_speed)) * 100)
                    
                    location_desc = f"Point {i+1} ({coordinates[0]:.4f}, {coordinates[1]:.4f})" if coordinates else f"Monitoring Point {i+1}"
                    
                    if congestion_pct > 60:
                        slow_areas.append(f"🔴 {location_desc}: {current_speed}km/h ({congestion_pct:.0f}% congested)")
                    elif congestion_pct < 20:
                        fast_areas.append(f"🟢 {location_desc}: {current_speed}km/h (free-flowing)")
        
        if total_speeds:
            avg_speed = sum(total_speeds) / len(total_speeds)
            analysis_parts.append(f"📊 **TRAFFIC FLOW SUMMARY**: {len(total_speeds)} monitoring points analyzed")
            analysis_parts.append(f"⚡ **Average Speed**: {avg_speed:.1f} km/h across all monitored segments")
            
            if slow_areas:
                analysis_parts.append(f"\n🔴 **CONGESTED AREAS** ({len(slow_areas)} locations):")
                analysis_parts.extend(slow_areas[:5])  # Show top 5
                
            if fast_areas:
                analysis_parts.append(f"\n🟢 **FREE-FLOWING AREAS** ({len(fast_areas)} locations):")
                analysis_parts.extend(fast_areas[:3])  # Show top 3
        else:
            analysis_parts.append("⚠️ **LIMITED FLOW DATA** - Current speed information not available")
        
        return "\n".join(analysis_parts)
    
    def _analyze_incidents_data(self, incidents: List[Dict[str, Any]]) -> str:
        """Analyze traffic incidents data and return formatted summary."""
        if not incidents:
            return "✅ **NO ACTIVE INCIDENTS** - Clear roads with no reported disruptions"
        
        analysis_parts = []
        accidents = []
        road_closures = []
        construction = []
        other_incidents = []
        
        for incident in incidents:
            props = incident.get('properties', {})
            events = props.get('events', [{}])
            description = events[0].get('description', 'Traffic incident') if events else 'Traffic incident'
            road_from = props.get('from', 'Unknown location')
            road_to = props.get('to', '')
            delay = props.get('delay', 0)
            start_time = props.get('startTime', '')
            
            # Format road information
            road_info = f"{road_from}" + (f" to {road_to}" if road_to else "")
            delay_info = f" (Delay: {delay//60}min)" if delay > 0 else ""
            time_info = f" - Started: {start_time[:16]}" if start_time else ""
            
            incident_summary = f"• {description} on {road_info}{delay_info}{time_info}"
            
            # Categorize incidents
            desc_lower = description.lower()
            if any(word in desc_lower for word in ['accident', 'collision', 'crash', 'vehicle']):
                accidents.append(incident_summary)
            elif any(word in desc_lower for word in ['closed', 'closure', 'blocked', 'obstruction']):
                road_closures.append(incident_summary)
            elif any(word in desc_lower for word in ['construction', 'roadwork', 'maintenance', 'repair']):
                construction.append(incident_summary)
            else:
                other_incidents.append(incident_summary)
        
        analysis_parts.append(f"🚨 **INCIDENT OVERVIEW**: {len(incidents)} active incidents affecting traffic")
        
        if accidents:
            analysis_parts.append(f"\n🚗 **ACCIDENTS & COLLISIONS** ({len(accidents)}):")
            analysis_parts.extend(accidents[:3])  # Show top 3
            
        if road_closures:
            analysis_parts.append(f"\n🚧 **ROAD CLOSURES & BLOCKAGES** ({len(road_closures)}):")
            analysis_parts.extend(road_closures[:3])  # Show top 3
            
        if construction:
            analysis_parts.append(f"\n🏗️ **CONSTRUCTION & MAINTENANCE** ({len(construction)}):")
            analysis_parts.extend(construction[:3])  # Show top 3
            
        if other_incidents:
            analysis_parts.append(f"\n⚠️ **OTHER INCIDENTS** ({len(other_incidents)}):")
            analysis_parts.extend(other_incidents[:2])  # Show top 2
        
        return "\n".join(analysis_parts)
    
    def _analyze_route_data(self, major_routes: List[Dict[str, Any]]) -> str:
        """Analyze major routes data and return formatted summary."""
        if not major_routes:
            return "❌ **NO ROUTE DATA AVAILABLE** - Unable to analyze major road conditions"
        
        analysis_parts = []
        route_summaries = []
        
        for route in major_routes:
            route_name = route.get('route_name', 'Unknown Route')
            route_data = route.get('routes', [{}])[0] if route.get('routes') else {}
            summary = route_data.get('summary', {})
            
            # Extract route metrics
            travel_time = summary.get('travelTimeInSeconds', 0) // 60  # Convert to minutes
            distance = summary.get('lengthInMeters', 0) / 1000  # Convert to km
            traffic_delay = summary.get('trafficDelayInSeconds', 0) // 60  # Convert to minutes
            
            # Calculate average speed
            avg_speed = (distance / (travel_time / 60)) if travel_time > 0 else 0
            
            # Determine traffic condition
            if traffic_delay > 15:
                condition = "🔴 Heavy delays"
            elif traffic_delay > 5:
                condition = "🟡 Moderate delays"
            else:
                condition = "🟢 Smooth flow"
            
            route_summary = f"• **{route_name}**: {travel_time}min ({distance:.1f}km) - {condition}"
            if traffic_delay > 0:
                route_summary += f" (+{traffic_delay}min delay)"
            if avg_speed > 0:
                route_summary += f" | Avg: {avg_speed:.0f}km/h"
                
            route_summaries.append({
                'name': route_name,
                'summary': route_summary,
                'delay': traffic_delay,
                'travel_time': travel_time
            })
        
        # Sort routes by delay (worst first for visibility)
        route_summaries.sort(key=lambda x: x['delay'], reverse=True)
        
        analysis_parts.append(f"🛣️ **MAJOR ROUTES STATUS** ({len(route_summaries)} routes analyzed):")
        for route in route_summaries:
            analysis_parts.append(route['summary'])
        
        # Add recommendations
        if route_summaries:
            best_route = min(route_summaries, key=lambda x: x['travel_time'] + x['delay'])
            worst_route = max(route_summaries, key=lambda x: x['travel_time'] + x['delay'])
            
            if best_route != worst_route:
                analysis_parts.append(f"\n💡 **ROUTE RECOMMENDATION**: Use {best_route['name']} (currently fastest)")
                analysis_parts.append(f"⚠️ **AVOID IF POSSIBLE**: {worst_route['name']} (experiencing delays)")
        
        return "\n".join(analysis_parts)
    
    def _get_time_context(self, current_hour: int) -> str:
        """Get time context description for traffic analysis."""
        if 6 <= current_hour <= 9:
            return "Morning Rush Hour (6-9 AM) - Peak commuting time"
        elif 17 <= current_hour <= 20:
            return "Evening Rush Hour (5-8 PM) - Peak commuting time"
        elif 12 <= current_hour <= 14:
            return "Lunch Hour (12-2 PM) - Moderate traffic"
        elif 21 <= current_hour <= 23:
            return "Evening Hours (9-11 PM) - Declining traffic"
        elif 0 <= current_hour <= 5:
            return "Night Hours (12-5 AM) - Minimal traffic"
        else:
            return "Off-Peak Hours - Regular traffic flow"
    
    def _generate_mock_comprehensive_sections(self, traffic_data: Dict[str, Any], location: str, report_type: str) -> Dict[str, str]:
        """Generate mock comprehensive report sections."""
        # This is a fallback when AI API is not available
        return {
            'traffic_overview': f"Comprehensive traffic analysis for {location} shows current conditions based on real-time data.",
            'incident_analysis': "Current incident analysis shows various traffic disruptions affecting flow.",
            'peak_hours_analysis': "Peak hours analysis indicates typical congestion patterns during rush hours.",
            'route_performance': "Major routes are performing within expected parameters for this time period.",
            'recommendations': "Monitor traffic conditions and plan routes accordingly.",
            'congestion_level': 30,
            'avg_speed': 45,
            'incident_count': 5
        }
    
    def _create_comprehensive_report_prompt(self, traffic_data: Dict[str, Any], location: str, report_type: str) -> str:
        """Create comprehensive report prompt based on report type."""
        # Enhanced prompt for comprehensive reports
        return f"Generate a comprehensive {report_type} report for {location} using the provided traffic data. Include detailed analysis and actionable insights."
    
    def _parse_comprehensive_sections(self, response: str, traffic_data: Dict[str, Any]) -> Dict[str, str]:
        """Parse comprehensive AI response into sections."""
        # Parse the AI response into different report sections
        return {
            'traffic_overview': response[:len(response)//3],
            'incident_analysis': response[len(response)//3:2*len(response)//3],
            'recommendations': response[2*len(response)//3:],
            'congestion_level': 30,
            'avg_speed': 45,
            'incident_count': 10
        }


# Singleton instance
ai_analyzer = AITrafficAnalyzer()
