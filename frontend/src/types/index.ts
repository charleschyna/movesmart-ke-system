// City and Location Types
export interface City {
  id: string;
  name: string;
  coordinates: [number, number];
  center: [number, number];
  zoom: number;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Traffic and Route Types
export interface TrafficData {
  congestionLevel: number;
  avgTravelTime: number;
  liveIncidents: number;
  aiForecast: string;
  lastUpdated: string;
}

export interface Route {
  id: string;
  start: Location;
  end: Location;
  distance: number;
  duration: number;
  co2Impact: number;
  polyline: string;
  alternativeRoutes?: Route[];
}

export interface RouteOptions {
  avoidTolls: boolean;
  fastest: boolean;
  greenest: boolean;
}

// Incident Types
export interface Incident {
  id: string;
  type: 'accident' | 'police' | 'roadworks' | 'weather' | 'other';
  location: Location;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  userId: string;
  verified: boolean;
  photo?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  defaultCity: string;
  savedRoutes: Route[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  trafficAlerts: boolean;
  incidentAlerts: boolean;
  routeUpdates: boolean;
}

// Analytics Types
export interface PredictionData {
  timestamp: string;
  congestionLevel: number;
  confidence: number;
}

export interface AnalyticsData {
  timeRange: string;
  data: PredictionData[];
  insights: string[];
}

// Scenario Simulation Types
export interface Scenario {
  id: string;
  name: string;
  type: 'weather' | 'event' | 'accident' | 'roadwork';
  description: string;
  parameters: Record<string, any>;
}

export interface SimulationResult {
  scenario: Scenario;
  impactLevel: number;
  affectedRoutes: string[];
  recommendations: string[];
  visualData: any;
}

// Sustainability Types
export interface SustainabilityData {
  co2Saved: number;
  greenRoutesTaken: number;
  ecoScore: number;
  tips: string[];
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Dashboard Types
export interface DashboardStats {
  congestionLevel: number;
  avgTravelTime: number;
  liveIncidents: number;
  aiInsight: string;
}

// Map Types
export interface MapState {
  center: [number, number];
  zoom: number;
  selectedCity: string;
}
