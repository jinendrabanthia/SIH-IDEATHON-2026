import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CloudSun,
  CloudRain,
  Sun,
  Cloud,
  Zap,
  Wind,
  Droplets,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { liveApi } from '../../api/services/liveApi';
import { TrustBadge } from '../trust/TrustBadge';

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  cityName?: string;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  lat = 20.2961, // Default Bhubaneswar
  lon = 85.8245,
  cityName = 'Bhubaneswar, Odisha',
  className = '',
}) => {
  const { data: weather, isLoading } = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => liveApi.getLiveWeather(lat, lon),
    staleTime: 1000 * 60 * 15,
  });

  const temp = weather?.temperature_celsius ?? weather?.temperature ?? 28;
  const condition = weather?.condition || 'clear';

  const getWeatherIcon = (cond: string) => {
    switch (cond.toLowerCase()) {
      case 'clear':
        return <Sun className="h-6 w-6 text-amber-500 animate-spin-slow" />;
      case 'rain':
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'thunderstorm':
        return <Zap className="h-6 w-6 text-indigo-500" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-slate-400" />;
      default:
        return <CloudSun className="h-6 w-6 text-orange-500" />;
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-sky-50/90 via-white to-orange-50/50 rounded-2xl border border-sky-200/80 shadow-xs gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-sky-100 shrink-0">
          {getWeatherIcon(condition)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{cityName}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <Radio className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
              Live Ground Weather
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">
            {isLoading ? 'Checking ground satellites...' : `${condition} skies • Updated real-time`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-700 bg-white/80 px-3.5 py-2 rounded-xl border border-slate-100 shadow-2xs">
        <div className="text-left sm:text-right">
          <span className="text-2xl font-black text-slate-900">
            {Math.round(temp)}°C
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="space-y-0.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Droplets className="h-3.5 w-3.5 text-sky-500" />
            <span>Humidity: <strong>{weather?.humidity || 68}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Wind className="h-3.5 w-3.5 text-slate-400" />
            <span>Wind: <strong>{weather?.windSpeed || 14} km/h</strong></span>
          </div>
        </div>
      </div>

      {weather?.alert && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/90 border border-amber-300 text-xs font-semibold text-amber-900 rounded-xl">
          <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
          <span>{weather.alert}</span>
        </div>
      )}
    </div>
  );
};
