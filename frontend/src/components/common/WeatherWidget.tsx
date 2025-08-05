import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  CloudIcon,
  BoltIcon,
  EyeSlashIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { City } from '../../types';

interface WeatherWidgetProps {
  selectedCity: City;
  onClick?: () => void;
  compact?: boolean;
}

interface CurrentWeather {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ selectedCity, onClick, compact = false }) => {
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock weather data for demonstration
  const mockWeatherData: CurrentWeather = {
    temperature: 24,
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy',
    humidity: 68,
    windSpeed: 12
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setWeatherData(mockWeatherData);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedCity]);

  const getWeatherIcon = (condition: string, size: string = 'w-5 h-5') => {
    const iconClasses = `${size} transition-colors duration-200`;
    
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <SunIcon className={`${iconClasses} text-yellow-500`} />;
      case 'partly-cloudy':
        return <CloudIcon className={`${iconClasses} text-gray-500`} />;
      case 'cloudy':
        return <CloudIcon className={`${iconClasses} text-gray-600`} />;
      case 'rainy':
        return <CloudIcon className={`${iconClasses} text-blue-500`} />;
      case 'thunderstorm':
        return <BoltIcon className={`${iconClasses} text-purple-600`} />;
      case 'fog':
        return <EyeSlashIcon className={`${iconClasses} text-gray-400`} />;
      default:
        return <SunIcon className={`${iconClasses} text-yellow-500`} />;
    }
  };

  const getTrafficImpactColor = (condition: string) => {
    if (condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm')) {
      return 'text-red-500';
    } else if (condition.toLowerCase().includes('fog') || condition.toLowerCase().includes('cloud')) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
        <BeakerIcon className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">Weather unavailable</span>
      </div>
    );
  }

  // Compact mode - only show temperature
  if (compact) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 py-1 transition-all duration-200"
      >
        <div className="flex-shrink-0">
          {getWeatherIcon(weatherData.icon, 'w-4 h-4')}
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {weatherData.temperature}°C
        </span>
        {/* Traffic Impact Dot */}
        <div className={`w-2 h-2 rounded-full ${
          weatherData.condition.toLowerCase().includes('rain') ? 'bg-red-500' :
          weatherData.condition.toLowerCase().includes('cloud') ? 'bg-yellow-500' : 'bg-green-500'
        }`}></div>
      </motion.button>
    );
  }

  // Full mode - show detailed weather info
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200 group"
    >
      {/* Weather Icon */}
      <div className="flex-shrink-0">
        {getWeatherIcon(weatherData.icon)}
      </div>
      
      {/* Weather Info */}
      <div className="hidden md:flex flex-col items-start">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {weatherData.temperature}°C
          </span>
          <span className="text-xs text-gray-500">
            {weatherData.condition}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span>💧 {weatherData.humidity}%</span>
          <span>💨 {weatherData.windSpeed} km/h</span>
          {/* Traffic Impact Indicator */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              weatherData.condition.toLowerCase().includes('rain') ? 'bg-red-500' :
              weatherData.condition.toLowerCase().includes('cloud') ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            <span className="text-xs">Traffic</span>
          </div>
        </div>
      </div>

      {/* Mobile - Show only temp and icon */}
      <div className="md:hidden flex items-center space-x-1">
        <span className="text-sm font-semibold text-gray-900">
          {weatherData.temperature}°
        </span>
        {/* Traffic Impact Dot */}
        <div className={`w-2 h-2 rounded-full ${
          weatherData.condition.toLowerCase().includes('rain') ? 'bg-red-500' :
          weatherData.condition.toLowerCase().includes('cloud') ? 'bg-yellow-500' : 'bg-green-500'
        }`}></div>
      </div>
    </motion.button>
  );
};

export default WeatherWidget;
