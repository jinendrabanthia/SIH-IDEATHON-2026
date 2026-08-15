import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Trip {
  id: string;
  route: string;
  datetime: string;
}

const defaultTrips: Trip[] = [
  { id: '1', route: 'Delhi → Jaipur',    datetime: '20 May, 8:00 AM' },
  { id: '2', route: 'Mumbai → Goa',      datetime: '24 May, 10:30 AM' },
  { id: '3', route: 'Bangalore → Leh',   datetime: '28 May, 6:15 AM' },
];

interface UpcomingTripsProps {
  trips?: Trip[];
}

export const UpcomingTripsWidget: React.FC<UpcomingTripsProps> = ({ trips = defaultTrips }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.upcomingTrips', 'Upcoming Trips')}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.nextAdventures', 'Your next adventures')}</p>
      </div>

      {/* Trip list */}
      <div className="space-y-2 mb-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm flex-shrink-0">
                🗺️
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{trip.route}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{trip.datetime}</p>
              </div>
            </div>
            <span className="text-orange-400 text-base">✈️</span>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <Link
        to="/my-trips"
        className="block w-full py-2.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
      >
        {t('dashboard.viewAllTrips', 'View All Trips')}
      </Link>
    </div>
  );
};
