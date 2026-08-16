import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';

const PlaceholderPage: React.FC<{ title: string; description: string; icon: string }> = ({
  title,
  description,
  icon,
}) => (
  <MainLayout>
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-8">{description}</p>
      <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-md mx-auto">
        <p className="text-gray-600">This feature is coming soon!</p>
      </div>
    </div>
  </MainLayout>
);

export const WeatherPage: React.FC = () => (
  <PlaceholderPage
    title="Weather"
    description="Real-time weather information for all destinations"
    icon="🌤️"
  />
);

export const NearbyPage: React.FC = () => (
  <PlaceholderPage
    title="Nearby Places"
    description="Discover attractions near your current location"
    icon="📍"
  />
);

export const AccessibilityPage: React.FC = () => (
  <PlaceholderPage
    title="Accessibility Guide"
    description="Find fully accessible places and facilities"
    icon="♿"
  />
);

export const TravelGuidePage: React.FC = () => (
  <PlaceholderPage
    title="Travel Guide"
    description="Comprehensive guides for your perfect trip"
    icon="📚"
  />
);

export const EmergencyPage: React.FC = () => (
  <PlaceholderPage
    title="Emergency Services"
    description="Quick access to emergency contacts and services"
    icon="🚨"
  />
);
