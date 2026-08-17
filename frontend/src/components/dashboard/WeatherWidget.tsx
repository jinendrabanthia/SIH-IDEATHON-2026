import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Gauge, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WeatherWidgetProps {
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
  aqi?: number;
  location?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  temperature = 28,
  condition = 'Partly Cloudy',
  humidity = 62,
  windSpeed = 14,
  aqi = 58,
  location = 'New Delhi',
}) => {
  const { t } = useTranslation();
  const [currentTemp, setCurrentTemp] = useState(temperature);
  const [currentLocation, setCurrentLocation] = useState(location);
  const [currentWind, setCurrentWind] = useState(windSpeed);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            if (data.current_weather) {
              setCurrentTemp(Math.round(data.current_weather.temperature));
              setCurrentWind(Math.round(data.current_weather.windspeed));
            }

            // Reverse Geocoding to get actual city name
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || 'Current Location';
            setCurrentLocation(city);
          } catch (e) {
            console.error("Failed to fetch weather", e);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLoading(false);
        }
      );
    }
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.weather', 'India Weather')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.liveConditions', 'Live Conditions')}</p>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">⋮</button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      )}

      {/* Temperature row */}
      <div className="flex items-center gap-3 mb-1 relative z-10">
        <span className="text-3xl">⛅</span>
        <div>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{currentTemp}°</span>
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-1">C</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 relative z-10">{condition}</p>
      <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mb-4 relative z-10">
        <span>📍</span>
        <span>{currentLocation}</span>
      </div>

      {/* Stats grid */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Droplets size={14} className="text-blue-400" />
            <span>{t('dashboard.humidity', 'Humidity')}</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{humidity}%</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Wind size={14} className="text-blue-400" />
            <span>{t('dashboard.wind', 'Wind')}</span>
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{currentWind} km/h</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Gauge size={14} className="text-green-500" />
            <span>{t('dashboard.aqi', 'AQI')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{aqi}</span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Good</span>
          </div>
        </div>
      </div>
    </div>
  );
};
