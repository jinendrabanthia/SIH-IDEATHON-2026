import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { HeroSection } from '../components/dashboard/HeroSection';
import { PopularDestinations } from '../components/dashboard/PopularDestinations';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { UpcomingTripsWidget } from '../components/dashboard/UpcomingTripsWidget';
import { RegionalMapWidget } from '../components/dashboard/RegionalMapWidget';
import { TravelPulseWidget } from '../components/dashboard/TravelPulseWidget';
import SpotlightCard from '../components/ui/SpotlightCard';

export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      {/* Two-column layout: left ~60%, right ~40% */}
      <div className="flex gap-6">
        {/* ── Left Column ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Hero Card */}
          <HeroSection onSearch={(query) => console.log('Search:', query)} />

          {/* Popular Destinations */}
          <PopularDestinations />

          {/* 3D Model of India Coming Soon Box */}
          <SpotlightCard className="w-full min-h-[440px] border-2 border-blue-500 dark:border-blue-400 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-center p-8 group transition-all duration-300">
            {/* Background 3D Radial Glow Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* 3D Floating Globe Sphere Visual */}
            <div className="relative z-10 w-28 h-28 mb-6 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-400 to-blue-500 p-1 shadow-2xl shadow-blue-500/30 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-5xl">
                🌏
              </div>
            </div>

            {/* Heading */}
            <h3 className="relative z-10 text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400 mb-3 tracking-wide drop-shadow-md">
              A 3D Model of India Coming Soon
            </h3>
            
            <p className="relative z-10 text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
              Immersive 3D map exploration with topographic elevation, landmark models, and real-time spatial analytics across all Indian states and UTs.
            </p>

            {/* Status Pill */}
            <div className="relative z-10 mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-200 shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
              <span>Next Generation Feature • In Development</span>
            </div>
          </SpotlightCard>
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
