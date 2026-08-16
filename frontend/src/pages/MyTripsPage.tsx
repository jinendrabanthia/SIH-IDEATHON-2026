import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Calendar, MapPin, Share2, Trash2, Lock, Unlock, CheckCircle, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { tripsApi, Trip } from '../api/services/tripsApi';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from '../components/ui/AuthModal';

export const MyTripsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const qc = useQueryClient();

  // Fetch trips only when authenticated
  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['trips', token],
    queryFn: () => tripsApi.list(token!),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tripsApi.delete(id, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });

  const shareMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      tripsApi.setPublic(id, isPublic, token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });

  const copyLink = async (trip: Trip) => {
    if (!trip.shareToken) return;
    const url = `${window.location.origin}/share/${trip.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(trip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColor = (status: Trip['status']) => {
    const map = {
      DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
      PLANNED: 'bg-blue-50 text-blue-600 border-blue-200',
      ACTIVE: 'bg-orange-50 text-orange-600 border-orange-200',
      COMPLETED: 'bg-green-50 text-green-600 border-green-200',
    };
    return map[status] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // Not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Manage and view all your saved and completed trips.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">🧭</div>
            <h2 className="text-xl font-bold text-gray-800">Sign in to see your trips</h2>
            <p className="text-gray-500 text-sm text-center max-w-xs">
              Create an account to save itineraries, share trips with friends, and access them offline.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="mt-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              Sign In / Register
            </button>
          </div>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Logged in as <span className="font-semibold text-gray-800">{user.email}</span></p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 py-12 justify-center text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            Loading your trips…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
            <AlertCircle size={16} />
            Failed to load trips. Please try again.
          </div>
        )}

        {!isLoading && trips.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No trips yet</h3>
            <p className="text-gray-500 text-sm">Plan your first verified itinerary!</p>
          </div>
        )}

        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Link to={`/trips/${trip.id}`} className="text-xl font-bold text-gray-900 truncate hover:text-orange-600 transition-colors">
                      {trip.title}
                    </Link>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                    {trip.isPublic && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">
                        Public
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <MapPin size={14} className="text-orange-500" />
                      {trip.destination?.name}
                      {trip.destination?.region ? `, ${trip.destination.region}` : ''}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <Calendar size={14} className="text-orange-500" />
                      {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {trip.hasSnapshot && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                        <CheckCircle size={12} />
                        Saved Itinerary
                      </span>
                    )}
                  </div>

                  {/* Share link */}
                  {trip.isPublic && trip.shareToken && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
                      <span className="text-xs text-purple-700 font-mono truncate flex-1">
                        {window.location.origin}/share/{trip.shareToken}
                      </span>
                      <button
                        onClick={() => copyLink(trip)}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        {copiedId === trip.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === trip.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    title={trip.isPublic ? 'Make private' : 'Share publicly'}
                    onClick={() => shareMutation.mutate({ id: trip.id, isPublic: !trip.isPublic })}
                    disabled={shareMutation.isPending}
                    className="p-2 rounded-lg transition-colors hover:bg-purple-50"
                  >
                    {trip.isPublic
                      ? <Unlock size={17} className="text-purple-600" />
                      : <Share2 size={17} className="text-gray-500" />
                    }
                  </button>
                  <button
                    title="Delete trip"
                    onClick={() => {
                      if (window.confirm('Delete this trip? This cannot be undone.')) {
                        deleteMutation.mutate(trip.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={17} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
