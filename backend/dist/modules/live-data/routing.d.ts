export interface RoutingData {
    distance_meters: number;
    duration_seconds: number;
}
export declare function getRoute(startLat: number, startLon: number, endLat: number, endLon: number, profile?: 'driving-car' | 'foot-walking'): Promise<RoutingData>;
//# sourceMappingURL=routing.d.ts.map