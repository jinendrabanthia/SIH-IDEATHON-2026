import { apiClient } from '../client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  title: string;
  destinationId: string;
  destination: {
    id: string;
    name: string;
    region: string | null;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  isPublic: boolean;
  shareToken: string | null;
  hasSnapshot: boolean;
  hasItinerary: boolean;
  itinerarySnapshot?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripPayload {
  destinationId: string;
  title?: string;
  startDate: string;
  endDate: string;
  status?: Trip['status'];
}

export interface UpdateTripPayload {
  title?: string;
  startDate?: string;
  endDate?: string;
  status?: Trip['status'];
  isPublic?: boolean;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

export const tripsApi = {
  /** List current user's trips */
  list: async (token: string): Promise<Trip[]> => {
    const res = await apiClient.get('/trips', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  /** Get a single trip by ID */
  get: async (id: string, token: string): Promise<Trip> => {
    const res = await apiClient.get(`/trips/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  /** Create a new trip */
  create: async (payload: CreateTripPayload, token: string): Promise<Trip> => {
    const res = await apiClient.post('/trips', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  /** Update trip metadata */
  update: async (id: string, payload: UpdateTripPayload, token: string): Promise<Trip> => {
    const res = await apiClient.patch(`/trips/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  /** Save an itinerary snapshot to a trip */
  saveSnapshot: async (
    id: string,
    itinerarySnapshot: Record<string, unknown>,
    token: string,
  ): Promise<{ hasSnapshot: boolean; updatedAt: string; message: string }> => {
    const res = await apiClient.post(
      `/trips/${id}/snapshot`,
      { itinerarySnapshot },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data;
  },

  /** Toggle public sharing. Returns shareToken and shareUrl if made public. */
  setPublic: async (id: string, isPublic: boolean, token: string) => {
    const res = await apiClient.patch(
      `/trips/${id}`,
      { isPublic },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data as { isPublic: boolean; shareToken: string | null; shareUrl: string | null };
  },

  /** Delete a trip */
  delete: async (id: string, token: string): Promise<void> => {
    await apiClient.delete(`/trips/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /** Fetch a publicly shared trip by share token — NO auth required */
  getPublic: async (shareToken: string): Promise<Trip> => {
    const res = await apiClient.get(`/trips/share/${shareToken}`);
    return res.data.data;
  },
};

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const authApi = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', { email, password, name });
    return res.data.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/refresh');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
