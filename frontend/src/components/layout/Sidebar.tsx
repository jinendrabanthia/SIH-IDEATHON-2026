import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Globe,
  Map,
  Backpack,
  Heart,
  Cloud,
  MapPinOff,
  Accessibility,
  BookOpen,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface QuickAccessItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const mainNavItems: NavItem[] = [
    { path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/plan-trip', label: t('nav.planTrip', 'Plan Trip'), icon: <MapPin size={20} /> },
    { path: '/explore', label: t('nav.exploreIndia', 'Explore India'), icon: <Globe size={20} /> },
    { path: '/maps', label: t('nav.maps', 'Maps'), icon: <Map size={20} /> },
    { path: '/my-trips', label: t('nav.myTrips', 'My Trips'), icon: <Backpack size={20} /> },
    { path: '/favorites', label: t('nav.favorites', 'Favorites'), icon: <Heart size={20} /> },
  ];

  const quickAccessItems: QuickAccessItem[] = [
    { path: '/weather', label: 'Weather', icon: <Cloud size={18} /> },
    { path: '/nearby', label: 'Nearby Places', icon: <MapPinOff size={18} /> },
    { path: '/accessibility', label: 'Accessibility', icon: <Accessibility size={18} /> },
    { path: '/travel-guide', label: 'Travel Guide', icon: <BookOpen size={18} /> },
    { path: '/emergency', label: 'Emergency', icon: <AlertCircle size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-40 transition-colors">
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800">
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#1f2937] dark:text-white">
              {/* Outer Ring */}
              <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="transparent"/>
              {/* N, S, E, W Ticks */}
              <path d="M16 3 L16 6 M16 26 L16 29 M3 16 L6 16 M26 16 L29 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              {/* Needle */}
              <path d="M25 7 L18 18 L7 25 L14 14 Z" fill="currentColor"/>
              {/* Center Dot */}
              <circle cx="16" cy="16" r="2.5" className="fill-white dark:fill-gray-900"/>
              <circle cx="16" cy="16" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight">
              <span className="text-[#1f2937] dark:text-white">Marg</span>
              <span className="text-[#16a34a] dark:text-green-400">Darshak</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">AI Travel Assistant</div>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
              isActive(item.path)
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-l-4 border-green-500 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-normal'
            }`}
          >
            <span className={isActive(item.path) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
            {isActive(item.path) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Quick Access Section */}
      <div className="px-3 py-3 mt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
          {t('sidebar.quickAccess', 'Quick Access')}
        </h3>
        <div className="space-y-1">
          {quickAccessItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-normal'
              }`}
            >
              <span className={isActive(item.path) ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs font-bold text-green-700 dark:text-green-400">{t('app.trustBadge100', '100% Verified')}</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-500">{t('app.trustBadge', 'All data verified by Govt. & Official Sources')}</p>
        </div>
      </div>
    </aside>
  );
};
