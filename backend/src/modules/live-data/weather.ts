import { cache } from './cache.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const WEATHER_CACHE_TTL = 3600; // 1 hour

export interface WeatherData {
  temperature_celsius: number;
  condition: string; // Simplified for MVP (clear, rain, clouds, etc)
  is_day: boolean;
}

export async function getLiveWeather(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  
  const cached = cache.get<WeatherData>(cacheKey);
  if (cached) return cached;

  try {
    // Open-Meteo free API (no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const data = await response.json();
    
    const weatherData: WeatherData = {
      temperature_celsius: data.current.temperature_2m,
      is_day: data.current.is_day === 1,
      condition: mapWeatherCode(data.current.weather_code),
    };

    cache.set(cacheKey, weatherData, WEATHER_CACHE_TTL);
    return weatherData;
  } catch (error) {
    console.error('Weather API failed:', error);
    throw new AppError('Live weather data unavailable', 503, 'LIVE_DATA_UNAVAILABLE');
  }
}

// Simple mapping from WMO Weather codes to readable conditions
function mapWeatherCode(code: number): string {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'unknown';
}
