import React, { useState } from 'react';
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { City } from '../../types';
import { KENYA_CITIES } from '../../constants';

interface CitySwitcherProps {
  selectedCity: City;
  onCityChange: (city: City) => void;
  className?: string;
}

const CitySwitcher: React.FC<CitySwitcherProps> = ({
  selectedCity,
  onCityChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCitySelect = (city: City) => {
    onCityChange(city);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
      >
        <MapPinIcon className="h-4 w-4 text-gray-500" />
        <span>{selectedCity.name}</span>
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-20 animate-slide-up">
            <div className="py-1">
              {KENYA_CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 ${
                    selectedCity.id === city.id 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{city.name}</span>
                    {selectedCity.id === city.id && (
                      <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CitySwitcher;
