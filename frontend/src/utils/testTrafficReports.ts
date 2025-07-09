// Test utility for traffic report endpoints
import { API_BASE_URL, API_ENDPOINTS } from '../constants';

export const testTrafficReports = async () => {
  console.log('🧪 Testing Traffic Report Endpoints...');
  
  // Test basic traffic report
  try {
    console.log('📊 Testing Basic Traffic Report...');
    
    const basicResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRAFFIC_REPORT_GENERATE}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'Nairobi',
        report_type: 'location'
      })
    });
    
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('✅ Basic Traffic Report Success:', {
        title: basicData.title,
        location: basicData.location,
        congestion_level: basicData.congestion_level,
        avg_speed: basicData.avg_speed,
        incident_count: basicData.incident_count
      });
    } else {
      console.error('❌ Basic Traffic Report Failed:', await basicResponse.text());
    }
  } catch (error) {
    console.error('❌ Basic Traffic Report Error:', error);
  }
  
  // Test detailed traffic report
  try {
    console.log('📊 Testing Detailed Traffic Report...');
    
    const detailedResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TRAFFIC_REPORT_DETAILED}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'Westlands',
        report_type: 'location',
        radius_km: 12
      })
    });
    
    if (detailedResponse.ok) {
      const detailedData = await detailedResponse.json();
      console.log('✅ Detailed Traffic Report Success:', {
        title: detailedData.title,
        location: detailedData.location,
        congestion_level: detailedData.congestion_level,
        avg_speed: detailedData.avg_speed,
        incident_count: detailedData.incident_count,
        detailed_metrics: detailedData.detailed_metrics
      });
      
      // Show AI analysis preview
      if (detailedData.ai_analysis) {
        console.log('🤖 AI Analysis Preview:', detailedData.ai_analysis.substring(0, 200) + '...');
      }
      
      if (detailedData.ai_recommendations) {
        console.log('💡 AI Recommendations Preview:', detailedData.ai_recommendations.substring(0, 200) + '...');
      }
    } else {
      console.error('❌ Detailed Traffic Report Failed:', await detailedResponse.text());
    }
  } catch (error) {
    console.error('❌ Detailed Traffic Report Error:', error);
  }
  
  console.log('🧪 Traffic Report Tests Complete!');
};

// Test function to be called from browser console
(window as any).testTrafficReports = testTrafficReports;
