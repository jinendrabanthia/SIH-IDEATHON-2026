import { apiClient } from '../client';

export interface FavoriteItem {
  id: string;
  attractionId: string;
  createdAt: string;
  attraction: {
    id: string;
    name: string;
    categories: string[];
    latitude: number;
    longitude: number;
    address: string | null;
    description: string | null;
    indoorOutdoor: string;
    accessibilityWheelchair: boolean;
    accessibilityVisual: boolean;
    accessibilityHearing: boolean;
    accessibilityNotes: string | null;
    destinationId: string;
  };
}

export const favoritesApi = {
  getFavorites: async (): Promise<FavoriteItem[]> => {
    const { data } = await apiClient.get<{ data: FavoriteItem[] }>('/favorites');
    return data.data;
  },

  addFavorite: async (attractionId: string): Promise<FavoriteItem> => {
    const { data } = await apiClient.post<{ data: FavoriteItem }>('/favorites', {
      attractionId,
    });
    return data.data;
  },

  removeFavorite: async (attractionId: string): Promise<boolean> => {
    const { data } = await apiClient.delete<{ data: { success: boolean } }>(
      `/favorites/${attractionId}`
    );
    return data.data.success;
  },
};
