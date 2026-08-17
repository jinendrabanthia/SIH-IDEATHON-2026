import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '../components/layout/MainLayout';
import { Heart, MapPin, Star, Share2 } from 'lucide-react';
import { favoritesApi } from '../api/services/favoritesApi';
import { Link } from 'react-router-dom';

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
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoritesApi.getFavorites,
  });

  const removeMutation = useMutation({
    mutationFn: favoritesApi.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeFavorite = (id: string) => {
    removeMutation.mutate(id);
  };

  const getEmojiForCategory = (categories: string[]) => {
    if (!categories || categories.length === 0) return '🏛️';
    const cat = categories[0].toLowerCase();
    if (cat.includes('heritage') || cat.includes('monument')) return '🏰';
    if (cat.includes('nature') || cat.includes('park')) return '🌲';
    if (cat.includes('museum')) return '🖼️';
    if (cat.includes('temple') || cat.includes('religion')) return '🙏';
    return '🏛️';
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorites</h1>
          <p className="text-gray-600">Your collection of saved attractions and destinations.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading favorites...</div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-40 bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  <span className="text-5xl">{getEmojiForCategory(favorite.attraction.categories)}</span>
                  <button
                    onClick={() => removeFavorite(favorite.attractionId)}
                    disabled={removeMutation.isPending}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors disabled:opacity-50"
                  >
                    <Heart size={18} className="fill-white" />
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{favorite.attraction.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 line-clamp-1">
                    <MapPin size={16} className="shrink-0" />
                    <span className="truncate">{favorite.attraction.address || 'India'}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">4.5</span>
                    </div>
                    {favorite.attraction.categories && favorite.attraction.categories[0] && (
                      <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                        {favorite.attraction.categories[0]}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4">Saved {new Date(favorite.createdAt).toLocaleDateString()}</p>

                  <div className="flex gap-2">
                    <Link to={`/attractions/${favorite.attractionId}`} className="flex-1 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200 text-center">
                      View Details
                    </Link>
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
