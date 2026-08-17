import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Cloud, MapPin, Calendar, Search, Loader2, Thermometer, CloudRain, Sun, CloudLightning, CloudSnow } from 'lucide-react';

interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export const WeatherPage: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<{ location: string; forecast: WeatherDay[] } | null>(null);

  // Weather codes interpretation (WMO Weather interpretation codes)
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: <Sun className="w-8 h-8 text-yellow-500" />, text: 'Clear sky' };
    if ([1, 2, 3].includes(code)) return { icon: <Cloud className="w-8 h-8 text-gray-400" />, text: 'Partly cloudy' };
    if ([45, 48].includes(code)) return { icon: <Cloud className="w-8 h-8 text-gray-400" />, text: 'Foggy' };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: <CloudRain className="w-8 h-8 text-blue-400" />, text: 'Drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: <CloudRain className="w-8 h-8 text-blue-500" />, text: 'Rain' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: <CloudSnow className="w-8 h-8 text-white" />, text: 'Snow' };
    if ([95, 96, 99].includes(code)) return { icon: <CloudLightning className="w-8 h-8 text-purple-500" />, text: 'Thunderstorm' };
    return { icon: <Cloud className="w-8 h-8 text-gray-400" />, text: 'Unknown' };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    // Maximum 16 days forecast supported by open-meteo for free tier
    const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 16) {
      setError('Cannot fetch weather for more than 16 days ahead');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Step 1: Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('Destination not found. Please try another location.');
      }
      
      const loc = geoData.results[0];
      
      // Step 2: Fetch weather
      // Note: open-meteo takes dates in YYYY-MM-DD format
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`);
      
      if (!weatherRes.ok) {
        throw new Error('Weather data is not available for these dates yet. Try dates within the next 14 days.');
      }

      const weatherData = await weatherRes.json();
      
      if (!weatherData.daily) {
        throw new Error('Could not retrieve daily forecast');
      }

      const forecast: WeatherDay[] = weatherData.daily.time.map((time: string, index: number) => ({
        date: time,
        maxTemp: weatherData.daily.temperature_2m_max[index],
        minTemp: weatherData.daily.temperature_2m_min[index],
        weatherCode: weatherData.daily.weathercode[index],
      }));

      setResults({
        location: `${loc.name}, ${loc.admin1 || loc.country}`,
        forecast
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Cloud className="text-blue-500 w-8 h-8" />
            Trip Weather Forecaster
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Check weather predictions for your upcoming trip destinations.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. Manali, Paris, Tokyo"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="md:col-span-4 flex items-center justify-between">
              {error ? (
                <div className="text-red-500 text-sm font-medium">{error}</div>
              ) : <div />}
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Fetching Forecast...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Get Weather
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Forecast for {results.location}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.forecast.map((day, i) => {
                const info = getWeatherInfo(day.weatherCode);
                const dateObj = new Date(day.date);
                const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                
                return (
                  <div key={day.date} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                    <div className="text-slate-500 dark:text-slate-400 font-medium mb-3">{dateStr}</div>
                    <div className="mb-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-full">
                      {info.icon}
                    </div>
                    <div className="font-semibold text-slate-800 dark:text-white mb-2">{info.text}</div>
                    <div className="flex items-center gap-4 text-sm mt-auto">
                      <div className="flex items-center gap-1 text-blue-500">
                        <Thermometer className="w-4 h-4" />
                        <span>{day.minTemp}°C</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500">
                        <Thermometer className="w-4 h-4" />
                        <span>{day.maxTemp}°C</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
