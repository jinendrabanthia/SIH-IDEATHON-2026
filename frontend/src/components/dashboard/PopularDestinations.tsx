import React, { useState } from 'react';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Destination {
  id: string;
  name: string;
  state: string;
  rating: number;
  reviews: string;
  image: string;
  emoji: string;
  emojiBg: string;
}

const defaultDestinations: Destination[] = [
  {
    id: '1',
    name: 'Manali',
    state: 'Himachal Pradesh',
    rating: 4.8,
    reviews: '1.2K',
    emoji: '🏔️',
    emojiBg: 'bg-teal-400',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '2',
    name: 'Jaipur',
    state: 'Rajasthan',
    rating: 4.7,
    reviews: '2.1K',
    emoji: '🏰',
    emojiBg: 'bg-orange-400',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '3',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    rating: 4.9,
    reviews: '3.4K',
    emoji: '🕉️',
    emojiBg: 'bg-purple-400',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '4',
    name: 'Kerala',
    state: 'Kerala',
    rating: 4.8,
    reviews: '1.6K',
    emoji: '🌴',
    emojiBg: 'bg-cyan-400',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '5',
    name: 'Goa',
    state: 'Goa',
    rating: 4.6,
    reviews: '2.8K',
    emoji: '🏖️',
    emojiBg: 'bg-yellow-400',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '6',
    name: 'Agra',
    state: 'Uttar Pradesh',
    rating: 4.8,
    reviews: '3.1K',
    emoji: '🕌',
    emojiBg: 'bg-rose-400',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '7',
    name: 'Darjeeling',
    state: 'West Bengal',
    rating: 4.7,
    reviews: '1.9K',
    emoji: '🚂',
    emojiBg: 'bg-green-400',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop&auto=format',
  },
  {
    id: '8',
    name: 'Mysore',
    state: 'Karnataka',
    rating: 4.6,
    reviews: '2.2K',
    emoji: '🐘',
    emojiBg: 'bg-amber-400',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop&auto=format',
  },
];

interface PopularDestinationsProps {
  destinations?: Destination[];
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  destinations = defaultDestinations,
}) => {
  const [page, setPage] = useState(0);
  const { t } = useTranslation();
  const visible = 4;
  const totalPages = Math.ceil(destinations.length / visible);
  const shown = destinations.slice(page * visible, page * visible + visible);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.popularDestinations', 'Popular Destinations')}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.popularSubtitle', 'Most loved places across India')}</p>
        </div>
        <button className="flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors">
          <span>{t('dashboard.viewAll', 'View All')}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {shown.map((dest) => (
            <div
              key={dest.id}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              {/* Photo */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // fallback gradient if image fails
                    const el = e.currentTarget.parentElement!;
                    e.currentTarget.style.display = 'none';
                    el.style.background = 'linear-gradient(135deg, #fde68a, #fca5a5)';
                  }}
                />

              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{dest.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dest.state}</p>

              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-green-500 w-4' : 'bg-gray-300 dark:bg-gray-700'}`}
              />
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 text-gray-600 dark:text-gray-400"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
