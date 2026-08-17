import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/AuthContext';
import { tripsApi } from '../../api/services/tripsApi';
import { Loader2, MapPin } from 'lucide-react';

interface UpcomingTripsProps {}

export const UpcomingTripsWidget: React.FC<UpcomingTripsProps> = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips-upcoming', token],
    queryFn: () => tripsApi.list(token!),
    enabled: !!token,
  });

  // Filter only upcoming (not completed)
  const upcomingTrips = trips
    .filter((trip) => trip.status !== 'COMPLETED')
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('dashboard.upcomingTrips', 'Upcoming Trips')}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.nextAdventures', 'Your next adventures')}</p>
      </div>

      {/* State checks */}
      {!user ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Sign in to view your custom trips.
        </div>
      ) : isLoading ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="animate-spin text-orange-500" size={14} />
          Fetching trips...
        </div>
      ) : upcomingTrips.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No upcoming trips planned yet.
        </div>
      ) : (
        /* Trip list */
        <div className="space-y-2 mb-4">
          {upcomingTrips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trips/${trip.id}`}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm flex-shrink-0">
                  🗺️
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[160px]">{trip.title}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {new Date(trip.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">➔</span>
            </Link>
          ))}
        </div>
      )}

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
