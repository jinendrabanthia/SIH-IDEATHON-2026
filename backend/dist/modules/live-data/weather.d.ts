export interface WeatherData {
    temperature_celsius: number;
    condition: string;
    is_day: boolean;
}
export declare function getLiveWeather(lat: number, lon: number): Promise<WeatherData>;
/**
 * Feature 5: Weather-Aware Warnings
 * Fetches the daily forecast for a location to check for extreme conditions (Temp > 40C or heavy rain)
 */
export declare function getWeatherWarnings(lat: number, lon: number, startDate: Date, endDate: Date): Promise<string[]>;
//# sourceMappingURL=weather.d.ts.map