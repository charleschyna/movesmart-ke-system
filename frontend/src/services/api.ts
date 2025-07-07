import services from '@tomtom-international/web-sdk-services';
import axios, { AxiosInstance } from 'axios';
import { 
  APIResponse, 
  User, 
  TrafficData, 
  Route, 
  Incident, 
  AnalyticsData, 
  SimulationResult, 
  SustainabilityData 
} from '../types';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    defaultCity: string;
  }): Promise<APIResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Handle logout error silently
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  // Geocoding Method with fallback
  async geocode(query: string): Promise<{ lat: number; lng: number }> {
    try {
      // Check if TomTom API key exists
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
      if (!apiKey) {
        console.warn('TomTom API key not found, using fallback geocoding');
        return this.fallbackGeocode(query);
      }

      const response = await services.services.geocode({
        key: apiKey,
        address: query,
      });

      const result = response.results?.[0];
      if (result?.position) {
        return {
          lat: result.position.lat,
          lng: result.position.lon
        };
      }

      throw new Error('Location not found');
    } catch (error: any) {
      console.warn('TomTom geocoding failed, using fallback:', error.message);
      return this.fallbackGeocode(query);
    }
  }

  // Fallback geocoding using basic location mapping
  private fallbackGeocode(query: string): { lat: number; lng: number } {
    const locationMap: Record<string, { lat: number; lng: number }> = {
      'nairobi': { lat: -1.2921, lng: 36.8219 },
      'westlands': { lat: -1.2676, lng: 36.8108 },
      'karen': { lat: -1.3197, lng: 36.6859 },
      'kiambu': { lat: -1.1708, lng: 36.8356 },
      'thika': { lat: -1.0332, lng: 37.0694 },
      'kikuyu': { lat: -1.2463, lng: 36.6619 },
      'ruiru': { lat: -1.1455, lng: 36.9618 },
      'limuru': { lat: -1.1138, lng: 36.6424 },
      'jkia': { lat: -1.3192, lng: 36.9276 },
      'cbd': { lat: -1.2841, lng: 36.8155 },
      'upperhill': { lat: -1.2962, lng: 36.8174 },
      'kilimani': { lat: -1.2912, lng: 36.7871 },
      'kawangware': { lat: -1.2728, lng: 36.7341 },
      'kasarani': { lat: -1.2213, lng: 36.8969 },
      'embakasi': { lat: -1.3167, lng: 36.8926 }
    };

    const normalizedQuery = query.toLowerCase().trim();
    
    // Try exact match first
    if (locationMap[normalizedQuery]) {
      return locationMap[normalizedQuery];
    }

    // Try partial match
    for (const [location, coords] of Object.entries(locationMap)) {
      if (normalizedQuery.includes(location) || location.includes(normalizedQuery)) {
        return coords;
      }
    }

    // Default to Nairobi CBD if no match found
    console.warn(`Location "${query}" not found in fallback map, defaulting to Nairobi CBD`);
    return locationMap['cbd'];
  }

  // Traffic Data Methods
  async getTrafficData(cityId: string): Promise<APIResponse<TrafficData>> {
    try {
      // Added a trailing slash to the endpoint to match Django's URL patterns and avoid redirects.
      const response = await this.api.get(`${API_ENDPOINTS.TRAFFIC.GET_DATA}/?city=${cityId}`);
      
      // The backend now sends the data directly, not nested.
      const backendData = response.data; 

      // Transform the backend response to match the frontend's TrafficData interface.
      const transformedData: TrafficData = {
        congestionLevel: backendData.congestionLevel || 0,
        avgTravelTime: backendData.avgTravelTime || 0,
        liveIncidents: backendData.liveIncidents || 0,
        aiForecast: backendData.aiForecast || 'No forecast available',
        lastUpdated: new Date().toISOString() // Add a fresh timestamp
      };
      
      return {
        success: true,
        message: 'Successfully fetched live traffic data.',
        data: transformedData
      };
    } catch (error: any) {
      console.warn('Backend traffic data fetch failed, using fallback data:', error.message);
      
      // Return fallback traffic data
      const fallbackData: TrafficData = {
        congestionLevel: Math.floor(Math.random() * 40) + 30, // 30-70%
        avgTravelTime: Math.floor(Math.random() * 20) + 25, // 25-45 minutes
        liveIncidents: Math.floor(Math.random() * 5), // 0-4 incidents
        aiForecast: 'Traffic conditions are moderate. Consider alternative routes during peak hours.',
        lastUpdated: new Date().toISOString()
      };
      
      return {
        success: true,
        data: fallbackData,
        message: 'Using simulated traffic data (backend unavailable)'
      };
    }
  }

  async getLiveIncidents(cityId: string): Promise<APIResponse<any[]>> {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.TRAFFIC.GET_INCIDENTS}/?city=${cityId}`);
      return {
        success: true,
        message: 'Successfully fetched live incidents.',
        data: response.data
      };
    } catch (error: any) {
      console.error('Failed to fetch live incidents:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch live incidents');
    }
  }

  async getTrafficPredictions(cityId: string, timeRange: string): Promise<APIResponse<AnalyticsData>> {
    try {
      const response = await this.api.get(
        `${API_ENDPOINTS.TRAFFIC.GET_PREDICTIONS}?city=${cityId}&range=${timeRange}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch predictions');
    }
  }

  // Route Methods with fallback
  async optimizeRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    options: {
      avoidTolls?: boolean;
      fastest?: boolean;
      greenest?: boolean;
    }
  ): Promise<APIResponse<Route>> {
    try {
      // Check if TomTom API key exists
      const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;
      if (!apiKey) {
        console.warn('TomTom API key not found, using fallback route calculation');
        return this.fallbackRouteCalculation(start, end, options);
      }

      const routeOptions: any = {
        key: apiKey,
        locations: [`${start.lat},${start.lng}`, `${end.lat},${end.lng}`],
        travelMode: 'car',
        routeType: options.fastest ? 'fastest' : options.greenest ? 'eco' : 'balanced',
        ...(options.avoidTolls && { avoid: ['tollRoads'] }),
      };

      const response = await services.services.calculateRoute(routeOptions);
      
      if (!response.routes || response.routes.length === 0) {
        throw new Error('No routes found');
      }

      const route = response.routes[0];
      const summary = route.summary;

      const transformedRoute: Route = {
        id: `route_${Date.now()}`,
        name: `Route from ${start.lat.toFixed(4)},${start.lng.toFixed(4)} to ${end.lat.toFixed(4)},${end.lng.toFixed(4)}`,
        distance: `${(summary.lengthInMeters / 1000).toFixed(2)} km`,
        duration: `${Math.round(summary.travelTimeInSeconds / 60)} min`,
        estimatedTime: new Date(Date.now() + summary.travelTimeInSeconds * 1000).toLocaleTimeString(),
        co2Impact: `${((summary.fuelConsumptionInLiters || 0) * 2.3).toFixed(2)} kg`,
        fuelCost: `KSh ${((summary.fuelConsumptionInLiters || 0) * 150).toFixed(2)}`,
        toll: (summary.tollDistanceInMeters || 0) > 0,
        type: options.fastest ? 'fastest' : options.greenest ? 'greenest' : 'recommended',
        waypoints: route.legs?.flatMap(leg => 
          leg.points?.slice(0, 5).map(p => `${p.latitude},${p.longitude}`) || []
        ) || [],
        trafficLevel: (summary.trafficDelayInSeconds || 0) > 300 ? 'high' : 
                     (summary.trafficDelayInSeconds || 0) > 60 ? 'medium' : 'low',
        incidents: (summary.totalDelayInSeconds || 0) > 0 ? 1 : 0,
        aiScore: this.calculateAIScore(summary, options),
        description: 'Route calculated using TomTom routing service.'
      };

      return { success: true, data: transformedRoute };
    } catch (error: any) {
      console.warn('TomTom route calculation failed, using fallback:', error.message);
      return this.fallbackRouteCalculation(start, end, options);
    }
  }

  // Calculate AI score based on route characteristics
  private calculateAIScore(summary: any, options: any): number {
    let score = 70; // Base score
    
    // Adjust for travel time (shorter is better)
    const travelMinutes = summary.travelTimeInSeconds / 60;
    if (travelMinutes < 20) score += 15;
    else if (travelMinutes < 40) score += 10;
    else if (travelMinutes > 60) score -= 10;
    
    // Adjust for traffic delay
    const trafficDelay = summary.trafficDelayInSeconds || 0;
    if (trafficDelay < 60) score += 10;
    else if (trafficDelay > 300) score -= 15;
    
    // Adjust for fuel efficiency
    const fuelConsumption = summary.fuelConsumptionInLiters || 0;
    if (fuelConsumption < 2) score += 10;
    else if (fuelConsumption > 5) score -= 5;
    
    // Adjust for tolls if user wants to avoid them
    if (options.avoidTolls && (summary.tollDistanceInMeters || 0) === 0) {
      score += 5;
    }
    
    return Math.max(50, Math.min(100, score));
  }

  // Fallback route calculation using distance estimation
  private fallbackRouteCalculation(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    options: any
  ): Promise<APIResponse<Route>> {
    // Calculate approximate distance using Haversine formula
    const distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const duration = Math.max(10, Math.round(distance * 2.5)); // Rough estimate: 2.5 min per km
    const fuelCost = Math.round(distance * 12); // Rough estimate: KSh 12 per km
    const co2Impact = (distance * 0.21).toFixed(2); // Rough estimate: 0.21 kg CO2 per km
    
    const routeTypes = ['fastest', 'greenest', 'recommended'];
    const routeType = options.fastest ? 'fastest' : options.greenest ? 'greenest' : 'recommended';
    
    const route: Route = {
      id: `fallback_route_${Date.now()}`,
      name: `${routeType.charAt(0).toUpperCase() + routeType.slice(1)} Route (Estimated)`,
      distance: `${distance.toFixed(2)} km`,
      duration: `${duration} min`,
      estimatedTime: new Date(Date.now() + duration * 60 * 1000).toLocaleTimeString(),
      co2Impact: `${co2Impact} kg`,
      fuelCost: `KSh ${fuelCost}`,
      toll: !options.avoidTolls && distance > 15, // Assume tolls for longer routes
      type: routeType as any,
      waypoints: [`${start.lat},${start.lng}`, `${end.lat},${end.lng}`],
      trafficLevel: distance > 20 ? 'medium' : 'low',
      incidents: Math.random() > 0.7 ? 1 : 0,
      aiScore: options.fastest ? 85 : options.greenest ? 80 : 75,
      description: 'Estimated route (TomTom API unavailable)'
    };
    
    return Promise.resolve({ success: true, data: route });
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async saveRoute(route: Partial<Route>): Promise<APIResponse<Route>> {
    try {
      const response = await this.api.post(API_ENDPOINTS.ROUTES.SAVE, route);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save route');
    }
  }

  async getSavedRoutes(): Promise<APIResponse<Route[]>> {
    try {
      const response = await this.api.get(API_ENDPOINTS.ROUTES.GET_SAVED);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch saved routes');
    }
  }

  async getIncidents(cityId: string): Promise<APIResponse<Incident[]>> {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.INCIDENTS.GET_ALL}?city=${cityId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch incidents');
    }
  }

  async createIncident(incident: Partial<Incident>): Promise<APIResponse<Incident>> {
    try {
      const response = await this.api.post(API_ENDPOINTS.INCIDENTS.CREATE, incident);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create incident');
    }
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<APIResponse<Incident>> {
    try {
      const response = await this.api.put(
        API_ENDPOINTS.INCIDENTS.UPDATE.replace(':id', id),
        updates
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update incident');
    }
  }

  async deleteIncident(id: string): Promise<APIResponse<void>> {
    try {
      const response = await this.api.delete(
        API_ENDPOINTS.INCIDENTS.DELETE.replace(':id', id)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete incident');
    }
  }

  // Analytics Methods
  async getAnalyticsData(
    cityId: string,
    timeRange: string,
    road?: string
  ): Promise<APIResponse<AnalyticsData>> {
    try {
      const params = new URLSearchParams({
        city: cityId,
        range: timeRange,
        ...(road && { road })
      });
      
      const response = await this.api.get(`${API_ENDPOINTS.ANALYTICS.GET_DATA}?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }

  // Simulation Methods
  async runSimulation(
    cityId: string,
    scenario: any
  ): Promise<APIResponse<SimulationResult>> {
    try {
      const response = await this.api.post(API_ENDPOINTS.SIMULATION.RUN, {
        city: cityId,
        scenario
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Simulation failed');
    }
  }

  async getScenarios(): Promise<APIResponse<any[]>> {
    try {
      const response = await this.api.get(API_ENDPOINTS.SIMULATION.GET_SCENARIOS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scenarios');
    }
  }

  // Sustainability Methods
  async getSustainabilityData(userId: string): Promise<APIResponse<SustainabilityData>> {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.SUSTAINABILITY.GET_DATA}?user=${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sustainability data');
    }
  }

  async getSustainabilityTips(): Promise<APIResponse<string[]>> {
    try {
      const response = await this.api.get(API_ENDPOINTS.SUSTAINABILITY.GET_TIPS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch sustainability tips');
    }
  }

  // Mock data methods for development
}

export const apiService = new ApiService();
export default apiService;
