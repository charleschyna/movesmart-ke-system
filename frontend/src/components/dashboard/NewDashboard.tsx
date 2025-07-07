import React, { useState, useEffect } from 'react';

// Types
interface TrafficData {
  congestionLevel: number;
  avgTravelTime: number;
  liveIncidents: number;
}

interface City {
  id: string;
  name: string;
  coordinates: [number, number];
}

// Available cities
const cities: City[] = [
  { id: 'nairobi', name: 'Nairobi', coordinates: [-1.2921, 36.8219] },
  { id: 'mombasa', name: 'Mombasa', coordinates: [-4.0435, 39.6682] },
  { id: 'kisumu', name: 'Kisumu', coordinates: [-0.1022, 34.7617] },
  { id: 'nakuru', name: 'Nakuru', coordinates: [-0.3031, 36.0800] },
  { id: 'eldoret', name: 'Eldoret', coordinates: [0.5143, 35.2697] }
];

// API service
const fetchTrafficData = async (city: City): Promise<TrafficData> => {
  const tomTomApiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  if (!tomTomApiKey) {
    console.error("TomTom API key not found. Make sure VITE_TOMTOM_API_KEY is in your .env file.");
    throw new Error("TomTom API key not found.");
  }

  const lat = city.coordinates[0];
  const lon = city.coordinates[1];
  // Create a bounding box of approx 10km x 10km for the API call
  const bbox = `${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}`;

  const trafficFlowUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${tomTomApiKey}&bbox=${bbox}&unit=KMPH`;
  const incidentsUrl = `https://api.tomtom.com/traffic/services/4/incidentDetails/s3/all/${bbox}/json?key=${tomTomApiKey}`;

  const [flowResponse, incidentsResponse] = await Promise.all([
    fetch(trafficFlowUrl),
    fetch(incidentsUrl)
  ]);

  if (!flowResponse.ok || !incidentsResponse.ok) {
    console.error("Failed to fetch data from TomTom API", { flowResponse, incidentsResponse });
    throw new Error("Failed to fetch data from TomTom API.");
  }

  const flowData = await flowResponse.json();
  const incidentsData = await incidentsResponse.json();

  // Process traffic flow data to calculate congestion and average travel time
  let totalSpeed = 0;
  let totalFreeFlowSpeed = 0;
  let segmentCount = 0;
  
  if (flowData?.flowSegmentData?.length > 0) {
    segmentCount = flowData.flowSegmentData.length;
    flowData.flowSegmentData.forEach((segment: any) => {
      totalSpeed += segment.currentSpeed;
      totalFreeFlowSpeed += segment.freeFlowSpeed;
    });
  }
  
  const avgSpeed = segmentCount > 0 ? totalSpeed / segmentCount : 0;
  const avgFreeFlowSpeed = segmentCount > 0 ? totalFreeFlowSpeed / segmentCount : 50; // Default to 50km/h if no data

  const congestionLevel = avgFreeFlowSpeed > 0 ? Math.round((1 - (avgSpeed / avgFreeFlowSpeed)) * 100) : 0;
  const avgTravelTime = avgSpeed > 0 ? Math.round((10 / avgSpeed) * 60) : 20; // Time in minutes for a 10km journey

  // Process incidents data to get the count
  const liveIncidents = incidentsData.tm?.poi?.length || 0;

  return {
    congestionLevel: Math.max(0, Math.min(100, congestionLevel)),
    avgTravelTime,
    liveIncidents
  };
};

const NewDashboard: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<City>(cities[0]);
  const [trafficData, setTrafficData] = useState<TrafficData>({
    congestionLevel: 0,
    avgTravelTime: 0,
    liveIncidents: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch traffic data
  const loadTrafficData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching traffic data for ${selectedCity.name} (${selectedCity.id})`);
      const data = await fetchTrafficData(selectedCity);
      console.log('Received traffic data:', data);
      
      setTrafficData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching traffic data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or city changes
  useEffect(() => {
    loadTrafficData();
  }, [selectedCity]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTrafficData, 30000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  // Get congestion level color
  const getCongestionColor = (level: number): string => {
    if (level < 30) return 'text-green-600';
    if (level < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get congestion level text
  const getCongestionText = (level: number): string => {
    if (level < 30) return 'Light';
    if (level < 70) return 'Moderate';
    return 'Heavy';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <span style={{fontSize: '24px', marginRight: '8px'}}>📊</span>
            <h1 className="text-2xl font-bold text-gray-900">Traffic Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* City Selector */}
            <div className="flex items-center gap-2">
              <span style={{fontSize: '16px'}}>📍</span>
              <select 
                value={selectedCity.id}
                onChange={(e) => {
                  const city = cities.find(c => c.id === e.target.value);
                  if (city) setSelectedCity(city);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cities.map(city => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadTrafficData}
              disabled={loading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: loading ? '#f5f5f5' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{fontSize: '14px', animation: loading ? 'spin 1s linear infinite' : 'none'}}>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Live Status */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-sm text-gray-600">
              {error ? 'Connection Error' : 'Live Data'}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-800">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Traffic Congestion */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Traffic Congestion</h3>
              <span className="text-gray-500">📈</span>
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-bold ${getCongestionColor(trafficData.congestionLevel)}`}>
                {loading ? '...' : `${trafficData.congestionLevel}%`}
              </div>
              <p className="text-xs text-gray-500">
                {getCongestionText(trafficData.congestionLevel)} traffic
              </p>
            </div>
          </div>

          {/* Average Travel Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Avg Travel Time</h3>
              <span className="text-gray-500">⏰</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {loading ? '...' : `${trafficData.avgTravelTime} min`}
              </div>
              <p className="text-xs text-gray-500">
                Per 10km journey
              </p>
            </div>
          </div>

          {/* Live Incidents */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Live Incidents</h3>
              <span className="text-gray-500">⚠️</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {loading ? '...' : trafficData.liveIncidents}
              </div>
              <p className="text-xs text-gray-500">
                Active reports
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">AI Insight</h3>
              <span className="text-gray-500">📊</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                <span className="text-purple-600">🤖</span>
              </div>
              <p className="text-xs text-gray-500">
                Analyzing traffic patterns...
              </p>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-sm font-medium mb-4">Debug Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Selected City:</strong> {selectedCity.name} ({selectedCity.id})
            </div>
            <div>
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            </div>
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Raw Data:</strong> {JSON.stringify(trafficData, null, 2)}
            </div>
          </div>
        </div>

        {/* Test API Button */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4">API Test</h3>
          <button
            onClick={async () => {
              try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/traffic/data/city_summary/?city=${selectedCity.id}`);
                const data = await response.json();
                console.log('Raw API Response:', data);
                alert('Check console for raw API response');
              } catch (err) {
                console.error('API Test Error:', err);
                alert('API test failed - check console');
              }
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Test API Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
