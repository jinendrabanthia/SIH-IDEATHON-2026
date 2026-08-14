import { apiClient } from '../client';
import { LiveWeatherData, RouteGeometryData } from '../../types/domain';

export const liveApi = {
  getLiveWeather: async (lat: number, lon: number): Promise<LiveWeatherData> => {
    const response = await apiClient.get<{ data: LiveWeatherData }>('/live/weather', {
      params: { lat, lon },
    });
    return response.data.data;
  },

  getRoute: async (
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    profile: 'driving-car' | 'foot-walking' = 'driving-car'
  ): Promise<RouteGeometryData> => {
    const response = await apiClient.get<{ data: RouteGeometryData }>('/live/route', {
      params: { startLat, startLon, endLat, endLon, profile },
    });
    return response.data.data;
  },
};
