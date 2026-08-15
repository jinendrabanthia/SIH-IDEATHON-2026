import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { HeroSection } from '../components/dashboard/HeroSection';
import { PopularDestinations } from '../components/dashboard/PopularDestinations';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { UpcomingTripsWidget } from '../components/dashboard/UpcomingTripsWidget';
import { RegionalMapWidget } from '../components/dashboard/RegionalMapWidget';
import { TravelPulseWidget } from '../components/dashboard/TravelPulseWidget';

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      {/* Two-column layout: left ~60%, right ~40% */}
      <div className="flex gap-6">
        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0">
          {/* Hero Card */}
          <HeroSection onSearch={(query) => console.log('Search:', query)} />

          {/* Popular Destinations */}
          <PopularDestinations />
        </div>

        {/* ── Right Column ── */}
        <div className="flex-shrink-0 space-y-4" style={{ width: '340px' }}>
          {/* Weather */}
          <WeatherWidget />

          {/* Upcoming Trips */}
          <UpcomingTripsWidget />

          {/* India by Region map */}
          <RegionalMapWidget />

          {/* Travel Pulse */}
          <TravelPulseWidget />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-green-500">✓</span> Verified by Government Sources
          </span>
          <span>•</span>
          <span>Powered by AI</span>
          <span>•</span>
          <span>Built for Every Indian Traveler</span>
        </div>
        <div className="font-semibold text-gray-700 italic">
          Dekho Apna Desh 🇮🇳
        </div>
      </footer>
    </MainLayout>
  );
};
