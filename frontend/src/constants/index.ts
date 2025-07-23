// API Configuration
// In development, use empty string to let Vite proxy handle the requests
// In production, use the full API URL
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://api.movesmart.ke'
  : '';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/',
    GOOGLE_LOGIN: '/auth/google-login/',
  },
  
  // Traffic endpoints
  TRAFFIC: {
    GET_DATA: '/api/traffic/reports/city_summary',
    LIVE_TRAFFIC: '/api/traffic/reports/live_traffic',
    CITY_SUMMARY: '/api/traffic/reports/city_summary',
    INCIDENTS: '/api/traffic/reports/incidents',
    GET_INCIDENTS: '/api/traffic/reports/incidents',
    GET_PREDICTIONS: '/api/traffic/predictions',
    GENERATE_REPORT: '/api/traffic/reports/generate-report',
    GENERATE_COMPREHENSIVE_REPORT: '/api/traffic/reports/generate-comprehensive-report',
  },
  
  // Traffic Reports endpoints
  TRAFFIC_REPORTS: '/api/traffic/reports/',
  TRAFFIC_REPORT_LIST: '/api/traffic/reports/list_reports/',
  TRAFFIC_REPORT_GET: '/api/traffic/reports',
  TRAFFIC_REPORT_DELETE: '/api/traffic/reports',
  TRAFFIC_REPORT_GENERATE: '/api/traffic/reports/generate-report/',
  TRAFFIC_REPORT_DETAILED: '/api/traffic/reports/generate-detailed-report/',
  
  // Routes endpoints
  ROUTES: {
    SAVE: '/api/routes/save',
    GET_SAVED: '/api/routes/saved',
  },
  
  // Incidents endpoints
  INCIDENTS: {
    GET_ALL: '/api/incidents',
    CREATE: '/api/incidents',
    UPDATE: '/api/incidents/:id',
    DELETE: '/api/incidents/:id',
  },
  
  // Analytics endpoints
  ANALYTICS: {
    GET_DATA: '/api/analytics/data',
  },
  
  // Simulation endpoints
  SIMULATION: {
    RUN: '/api/simulation/run',
    GET_SCENARIOS: '/api/simulation/scenarios',
  },
  
  // Sustainability endpoints
  SUSTAINABILITY: {
    GET_DATA: '/api/sustainability/data',
    GET_TIPS: '/api/sustainability/tips',
  },
} as const;

// Default values
export const DEFAULT_COORDINATES = {
  NAIROBI: { lat: -1.2921, lng: 36.8219 },
  MOMBASA: { lat: -4.0435, lng: 39.6682 },
  KISUMU: { lat: -0.1022, lng: 34.7617 },
  NAKURU: { lat: -0.3031, lng: 36.0800 },
  ELDORET: { lat: 0.5143, lng: 35.2698 },
} as const;

// Traffic report configuration
export const TRAFFIC_REPORT_CONFIG = {
  DEFAULT_RADIUS: 10,
  MIN_RADIUS: 5,
  MAX_RADIUS: 25,
  DEFAULT_REPORT_TYPE: 'location',
  REPORT_TYPES: {
    LOCATION: 'location',
    ROUTE: 'route',
    CITY: 'city',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
} as const;

// Colors for congestion levels
export const CONGESTION_COLORS = {
  GOOD: '#10B981',      // Green
  MODERATE: '#F59E0B',  // Yellow
  HEAVY: '#EF4444',     // Red
  SEVERE: '#7C2D12',    // Dark Red
} as const;

// Traffic colors for different levels
export const TRAFFIC_COLORS = {
  LOW: '#10B981',       // Green
  MEDIUM: '#F59E0B',    // Yellow
  HIGH: '#EF4444',      // Red
  SEVERE: '#7C2D12',    // Dark Red
} as const;

// Chart colors for analytics
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',   // Blue
  SECONDARY: '#10B981', // Green
  ACCENT: '#F59E0B',    // Yellow
  DANGER: '#EF4444',    // Red
  INFO: '#6366F1',      // Indigo
  SUCCESS: '#10B981',   // Green
  WARNING: '#F59E0B',   // Yellow
  DARK: '#374151',      // Gray
} as const;

// Dashboard theme colors
export const DASHBOARD_COLORS = {
  BACKGROUND: '#F9FAFB',
  CARD: '#FFFFFF',
  BORDER: '#E5E7EB',
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#6B7280',
  ACCENT: '#3B82F6',
} as const;

// Analysis colors for different metrics
export const ANALYSIS_COLORS = {
  TRAFFIC_FLOW: '#3B82F6',
  CONGESTION: '#EF4444',
  INCIDENTS: '#F59E0B',
  WEATHER: '#06B6D4',
  EVENTS: '#8B5CF6',
  SUSTAINABILITY: '#10B981',
} as const;

// Congestion thresholds
export const CONGESTION_THRESHOLDS = {
  GOOD: 25,
  MODERATE: 50,
  HEAVY: 75,
} as const;

// City Roads Data
export const CITY_ROADS = {
  nairobi: [
    { id: 'all', name: 'All Roads' },
    { id: 'uhuru_highway', name: 'Uhuru Highway' },
    { id: 'waiyaki_way', name: 'Waiyaki Way' },
    { id: 'mombasa_road', name: 'Mombasa Road' },
    { id: 'thika_road', name: 'Thika Road' },
    { id: 'ngong_road', name: 'Ngong Road' },
    { id: 'jogoo_road', name: 'Jogoo Road' },
    { id: 'lang_ata_road', name: 'Lang\'ata Road' },
    { id: 'outer_ring_road', name: 'Outer Ring Road' },
    { id: 'enterprise_road', name: 'Enterprise Road' },
    { id: 'kiambu_road', name: 'Kiambu Road' }
  ],
  mombasa: [
    { id: 'all', name: 'All Roads' },
    { id: 'moi_avenue', name: 'Moi Avenue' },
    { id: 'digo_road', name: 'Digo Road' },
    { id: 'mama_ngina_drive', name: 'Mama Ngina Drive' },
    { id: 'nyali_bridge', name: 'Nyali Bridge' },
    { id: 'links_road', name: 'Links Road' },
    { id: 'malindi_road', name: 'Malindi Road' },
    { id: 'airport_road', name: 'Airport Road' }
  ],
  kisumu: [
    { id: 'all', name: 'All Roads' },
    { id: 'kakamega_road', name: 'Kakamega Road' },
    { id: 'busia_road', name: 'Busia Road' },
    { id: 'kondele_road', name: 'Kondele Road' },
    { id: 'oginga_odinga_street', name: 'Oginga Odinga Street' },
    { id: 'jomo_kenyatta_highway', name: 'Jomo Kenyatta Highway' },
    { id: 'nairobi_road', name: 'Nairobi Road' }
  ],
  nakuru: [
    { id: 'all', name: 'All Roads' },
    { id: 'kenyatta_avenue', name: 'Kenyatta Avenue' },
    { id: 'nairobi_nakuru_highway', name: 'Nairobi-Nakuru Highway' },
    { id: 'eldoret_road', name: 'Eldoret Road' },
    { id: 'nyahururu_road', name: 'Nyahururu Road' },
    { id: 'gilgil_road', name: 'Gilgil Road' },
    { id: 'london_road', name: 'London Road' }
  ],
  eldoret: [
    { id: 'all', name: 'All Roads' },
    { id: 'uganda_road', name: 'Uganda Road' },
    { id: 'nakuru_eldoret_highway', name: 'Nakuru-Eldoret Highway' },
    { id: 'kapsabet_road', name: 'Kapsabet Road' },
    { id: 'kitale_road', name: 'Kitale Road' },
    { id: 'iten_road', name: 'Iten Road' },
    { id: 'west_road', name: 'West Road' }
  ]
} as const;

// Kenya Cities Configuration
export const KENYA_CITIES = [
  {
    id: 'nairobi',
    name: 'Nairobi',
    coordinates: [36.8219, -1.2921] as [number, number],
    center: [36.8219, -1.2921] as [number, number],
    zoom: 12
  },
  {
    id: 'mombasa',
    name: 'Mombasa',
    coordinates: [39.6682, -4.0435] as [number, number],
    center: [39.6682, -4.0435] as [number, number],
    zoom: 12
  },
  {
    id: 'kisumu',
    name: 'Kisumu',
    coordinates: [34.7617, -0.1022] as [number, number],
    center: [34.7617, -0.1022] as [number, number],
    zoom: 12
  },
  {
    id: 'nakuru',
    name: 'Nakuru',
    coordinates: [36.0800, -0.3031] as [number, number],
    center: [36.0800, -0.3031] as [number, number],
    zoom: 12
  },
  {
    id: 'eldoret',
    name: 'Eldoret',
    coordinates: [35.2698, 0.5143] as [number, number],
    center: [35.2698, 0.5143] as [number, number],
    zoom: 12
  }
] as const;

// Default city (Nairobi)
export const DEFAULT_CITY = KENYA_CITIES[0];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'movesmart_token',
  USER: 'movesmart_user',
  PREFERENCES: 'movesmart_preferences',
  REPORT_HISTORY: 'movesmart_report_history',
  LAST_LOCATION: 'movesmart_last_location',
  SELECTED_CITY: 'movesmart_selected_city',
} as const;
