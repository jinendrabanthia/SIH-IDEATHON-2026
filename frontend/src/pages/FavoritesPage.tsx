import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Heart, MapPin, Star, Trash2, Share2 } from 'lucide-react';

interface FavoriteAttraction {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  emoji: string;
  savedDate: string;
}

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteAttraction[]>([
    {
      id: '1',
      name: 'Lingaraj Temple',
      location: 'Bhubaneswar, Odisha',
      category: 'Heritage',
      rating: 4.8,
      emoji: '🙏',
      savedDate: '15 Aug 2026',
    },
    {
      id: '2',
      name: 'Taj Mahal',
      location: 'Agra, Uttar Pradesh',
      category: 'Heritage',
      rating: 4.9,
      emoji: '🏰',
      savedDate: '10 Aug 2026',
    },
    {
      id: '3',
      name: 'Odisha State Museum',
      location: 'Bhubaneswar, Odisha',
      category: 'Museums & Culture',
      rating: 4.6,
      emoji: '🏛️',
      savedDate: '8 Aug 2026',
    },
    {
      id: '4',
      name: 'Kerala Backwaters',
      location: 'Kochi, Kerala',
      category: 'Nature',
      rating: 4.8,
      emoji: '🌴',
      savedDate: '5 Aug 2026',
    },
  ]);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorites</h1>
          <p className="text-gray-600">Your collection of saved attractions and destinations.</p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-40 bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  <span className="text-5xl">{favorite.emoji}</span>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <Heart size={18} className="fill-white" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{favorite.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <MapPin size={16} />
                    {favorite.location}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{favorite.rating}</span>
                    </div>
                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      {favorite.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">Saved {favorite.savedDate}</p>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200">
                      View Details
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No favorites yet. Start saving attractions you love!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
