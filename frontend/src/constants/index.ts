import { City } from '../types';

// Kenya Cities Configuration
export const KENYA_CITIES: City[] = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    coordinates: [36.8219, -1.2921],
    center: [36.8219, -1.2921],
    zoom: 12
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    coordinates: [39.6682, -4.0435],
    center: [39.6682, -4.0435],
    zoom: 13
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    coordinates: [34.7617, -0.1022],
    center: [34.7617, -0.1022],
    zoom: 14
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    coordinates: [36.0800, -0.3031],
    center: [36.0800, -0.3031],
    zoom: 13
  },
  {
    id: 'eldoret',
    name: 'Eldoret',
    coordinates: [35.2698, 0.5143],
    center: [35.2698, 0.5143],
    zoom: 13
  }
];

// Major Roads by City
export const CITY_ROADS = {
  nairobi: [
    { id: 'all', name: 'All Roads' },
    { id: 'uhuru_highway', name: 'Uhuru Highway' },
    { id: 'mombasa_road', name: 'Mombasa Road' },
    { id: 'waiyaki_way', name: 'Waiyaki Way' },
    { id: 'thika_road', name: 'Thika Road' },
    { id: 'jogoo_road', name: 'Jogoo Road' },
    { id: 'langata_road', name: 'Langata Road' },
    { id: 'ngong_road', name: 'Ngong Road' },
    { id: 'outering_road', name: 'Outering Road' },
    { id: 'eastern_bypass', name: 'Eastern Bypass' },
    { id: 'southern_bypass', name: 'Southern Bypass' },
    { id: 'kenyatta_avenue', name: 'Kenyatta Avenue' },
    { id: 'moi_avenue', name: 'Moi Avenue' }
  ],
  mombasa: [
    { id: 'all', name: 'All Roads' },
    { id: 'digo_road', name: 'Digo Road' },
    { id: 'malindi_road', name: 'Malindi Road' },
    { id: 'moi_avenue_msa', name: 'Moi Avenue' },
    { id: 'nyali_bridge', name: 'Nyali Bridge' },
    { id: 'links_road', name: 'Links Road' },
    { id: 'bamburi_road', name: 'Bamburi Road' },
    { id: 'mama_ngina_drive', name: 'Mama Ngina Drive' },
    { id: 'jomo_kenyatta_avenue', name: 'Jomo Kenyatta Avenue' },
    { id: 'haile_selassie_road', name: 'Haile Selassie Road' },
    { id: 'makupa_causeway', name: 'Makupa Causeway' }
  ],
  kisumu: [
    { id: 'all', name: 'All Roads' },
    { id: 'kakamega_road', name: 'Kakamega Road' },
    { id: 'bondo_road', name: 'Bondo Road' },
    { id: 'kenyatta_highway', name: 'Kenyatta Highway' },
    { id: 'oginga_odinga_street', name: 'Oginga Odinga Street' },
    { id: 'jomo_kenyatta_highway', name: 'Jomo Kenyatta Highway' },
    { id: 'nairobi_road', name: 'Nairobi Road' },
    { id: 'aga_khan_walk', name: 'Aga Khan Walk' },
    { id: 'kondele_road', name: 'Kondele Road' },
    { id: 'milimani_road', name: 'Milimani Road' }
  ],
  nakuru: [
    { id: 'all', name: 'All Roads' },
    { id: 'kenyatta_avenue_nku', name: 'Kenyatta Avenue' },
    { id: 'nakuru_nairobi_highway', name: 'Nakuru-Nairobi Highway' },
    { id: 'nakuru_eldoret_highway', name: 'Nakuru-Eldoret Highway' },
    { id: 'club_road', name: 'Club Road' },
    { id: 'kenya_road', name: 'Kenya Road' },
    { id: 'stadium_road', name: 'Stadium Road' },
    { id: 'mburu_gichua_road', name: 'Mburu Gichua Road' },
    { id: 'biashara_street', name: 'Biashara Street' },
    { id: 'west_road', name: 'West Road' },
    { id: 'lakeside_road', name: 'Lakeside Road' }
  ],
  eldoret: [
    { id: 'all', name: 'All Roads' },
    { id: 'uganda_road', name: 'Uganda Road' },
    { id: 'nairobi_road_eldoret', name: 'Nairobi Road' },
    { id: 'iten_road', name: 'Iten Road' },
    { id: 'kapsabet_road', name: 'Kapsabet Road' },
    { id: 'kitale_road', name: 'Kitale Road' },
    { id: 'eldoret_kaptagat_road', name: 'Eldoret-Kaptagat Road' },
    { id: 'oloo_street', name: 'Oloo Street' },
    { id: 'kenyatta_street', name: 'Kenyatta Street' },
    { id: 'oginga_odinga_street_eldoret', name: 'Oginga Odinga Street' }
  ]
};

// Default city
export const DEFAULT_CITY = KENYA_CITIES[0]; // Nairobi

// Incident Types
export const INCIDENT_TYPES = [
  { id: 'accident', name: 'Accident', icon: '🚗', color: 'red' },
  { id: 'police', name: 'Police', icon: '👮', color: 'blue' },
  { id: 'roadworks', name: 'Roadworks', icon: '🚧', color: 'orange' },
  { id: 'weather', name: 'Weather', icon: '🌧️', color: 'gray' },
  { id: 'other', name: 'Other', icon: '⚠️', color: 'yellow' }
];

// Severity Levels
export const SEVERITY_LEVELS = [
  { id: 'low', name: 'Low', color: 'green' },
  { id: 'medium', name: 'Medium', color: 'yellow' },
  { id: 'high', name: 'High', color: 'red' }
];

// Time Ranges for Analytics
export const TIME_RANGES = [
  { id: 'hour', name: 'Last Hour' },
  { id: 'day', name: 'Last 24 Hours' },
  { id: 'week', name: 'Last Week' },
  { id: 'month', name: 'Last Month' }
];

// Navigation Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MAP: '/map',
  ROUTE_OPTIMIZATION: '/routes',
  ANALYTICS: '/analytics',
  SIMULATION: '/simulation',
  REPORTS: '/reports',
  SUSTAINABILITY: '/sustainability',
  PROFILE: '/profile',
  INCIDENTS: '/incidents',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  TRAFFIC: {
    GET_DATA: '/api/traffic/data/city_summary',
    GET_INCIDENTS: '/api/traffic/data/incidents',
    GET_PREDICTIONS: '/api/traffic/predictions'
  },
  ROUTES: {
    OPTIMIZE: '/api/routes/optimize',
    SAVE: '/api/routes/save',
    GET_SAVED: '/api/routes/saved'
  },
  INCIDENTS: {
    GET_ALL: '/api/incidents',
    CREATE: '/api/incidents',
    UPDATE: '/api/incidents/:id',
    DELETE: '/api/incidents/:id'
  },
  ANALYTICS: {
    GET_DATA: '/api/analytics/data',
    GET_INSIGHTS: '/api/analytics/insights'
  },
  SIMULATION: {
    RUN: '/api/simulation/run',
    GET_SCENARIOS: '/api/simulation/scenarios'
  },
  SUSTAINABILITY: {
    GET_DATA: '/api/sustainability/data',
    GET_TIPS: '/api/sustainability/tips'
  }
};

// Map Configuration
export const MAP_CONFIG = {
  MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_TOKEN || '',
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  DEFAULT_STYLE: 'mapbox://styles/mapbox/streets-v11',
  TRAFFIC_LAYER: true
};

// Colors for Traffic Levels
export const TRAFFIC_COLORS = {
  LOW: '#10B981',      // Green
  MEDIUM: '#F59E0B',   // Yellow
  HIGH: '#EF4444',     // Red
  SEVERE: '#7C2D12'    // Dark Red
};

// Notification Types
export const NOTIFICATION_TYPES = {
  TRAFFIC_ALERT: 'traffic_alert',
  INCIDENT_ALERT: 'incident_alert',
  ROUTE_UPDATE: 'route_update',
  SYSTEM_UPDATE: 'system_update'
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'MoveSmart KE',
  VERSION: '1.0.0',
  DESCRIPTION: 'Kenya\'s AI-Powered Urban Traffic Intelligence App',
  SUPPORT_EMAIL: 'support@movesmart.ke',
  COMPANY: 'MoveSmart Technologies',
  REFRESH_INTERVAL: 30000, // 30 seconds
  MAX_SAVED_ROUTES: 10
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'movesmart_user',
  TOKEN: 'movesmart_token',
  SELECTED_CITY: 'movesmart_selected_city',
  SETTINGS: 'movesmart_settings'
};
