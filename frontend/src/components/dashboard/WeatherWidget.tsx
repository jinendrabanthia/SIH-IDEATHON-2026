import React from 'react';
import { Droplets, Wind, Gauge } from 'lucide-react';
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
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.weather', 'India Weather')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.liveConditions', 'Live Conditions')}</p>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none">⋮</button>
      </div>

      {/* Temperature row */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">⛅</span>
        <div>
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{temperature}°</span>
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-1">C</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{condition}</p>
      <div className="flex items-center gap-1 text-xs text-orange-500 font-medium mb-4">
        <span>📍</span>
        <span>{location}</span>
      </div>

      {/* Stats grid */}
      <div className="space-y-2">
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
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{windSpeed} km/h</span>
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
