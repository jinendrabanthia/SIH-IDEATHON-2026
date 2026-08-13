import { env } from '../../shared/config/index.js';
import { cache } from './cache.js';
import { AppError } from '../../shared/middleware/errorHandler.js';

const ROUTING_CACHE_TTL = 86400; // 24 hours (routes rarely change)

export interface RoutingData {
  distance_meters: number;
  duration_seconds: number;
}

export async function getRoute(
  startLat: number, 
  startLon: number, 
  endLat: number, 
  endLon: number, 
  profile: 'driving-car' | 'foot-walking' = 'driving-car'
): Promise<RoutingData> {
  const cacheKey = `route:${profile}:${startLat.toFixed(4)},${startLon.toFixed(4)}->${endLat.toFixed(4)},${endLon.toFixed(4)}`;
  
  const cached = cache.get<RoutingData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${env.ROUTING_API_KEY}&start=${startLon},${startLat}&end=${endLon},${endLat}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OpenRouteService returned ${response.status}`);
    }

    const data = await response.json();
    
    // ORS returns features[0].properties.segments[0]
    const segment = data.features?.[0]?.properties?.segments?.[0];
    
    if (!segment) {
      throw new Error('No route found');
    }

    const routingData: RoutingData = {
      distance_meters: segment.distance,
      duration_seconds: segment.duration,
    };

    cache.set(cacheKey, routingData, ROUTING_CACHE_TTL);
    return routingData;
  } catch (error) {
    console.error('Routing API failed:', error);
    throw new AppError('Routing data unavailable', 503, 'LIVE_DATA_UNAVAILABLE');
  }
}
