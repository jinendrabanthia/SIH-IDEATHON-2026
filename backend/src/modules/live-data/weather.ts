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

    const data = (await response.json()) as {
      current: { temperature_2m: number; is_day: number; weather_code: number };
    };
    
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

/**
 * Feature 5: Weather-Aware Warnings
 * Fetches the daily forecast for a location to check for extreme conditions (Temp > 40C or heavy rain)
 */
export async function getWeatherWarnings(lat: number, lon: number, startDate: Date, endDate: Date): Promise<string[]> {
  const cacheKey = `weather-warnings:${lat.toFixed(2)}:${lon.toFixed(2)}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`;
  
  const cached = cache.get<string[]>(cacheKey);
  if (cached) return cached;

  const warnings: string[] = [];
  try {
    // Get daily maximum temperatures and precipitation sum for up to 16 days ahead
    // Open-Meteo free tier supports 16 days daily forecast
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum,weather_code&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) return warnings;

    const data = (await response.json()) as {
      daily?: {
        time?: string[];
        temperature_2m_max?: number[];
        precipitation_sum?: number[];
        weather_code?: number[];
      };
    };
    const daily = data.daily;
    if (!daily || !daily.time) return warnings;

    let hasExtremeHeat = false;
    let hasHeavyRain = false;

    for (let i = 0; i < daily.time.length; i++) {
      const forecastDate = new Date(daily.time[i]);
      // If the forecast date is within our trip window
      if (forecastDate >= startDate && forecastDate <= endDate) {
        if ((daily.temperature_2m_max?.[i] ?? 0) > 40) {
          hasExtremeHeat = true;
        }
        if ((daily.precipitation_sum?.[i] ?? 0) > 20 || [63, 65, 67, 81, 82, 95, 96, 99].includes(daily.weather_code?.[i] ?? 0)) {
          hasHeavyRain = true;
        }
      }
    }

    if (hasExtremeHeat) {
      warnings.push("Extreme Heat Advisory: Temperatures are forecasted to exceed 40°C. Plan outdoor activities early morning or evening and stay hydrated.");
    }
    if (hasHeavyRain) {
      warnings.push("Heavy Rain Advisory: Heavy rainfall is forecasted during your trip. Ensure indoor backups for outdoor activities.");
    }

    cache.set(cacheKey, warnings, 3600 * 12); // Cache for 12 hours
    return warnings;
  } catch (error) {
    console.error('Weather forecast API failed:', error);
    return warnings; // fail silently so planner doesn't break
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
