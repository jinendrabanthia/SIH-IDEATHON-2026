import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { Calendar, MapPin, Share2, Trash2, Lock, Unlock, CheckCircle, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { tripsApi, Trip } from '../api/services/tripsApi';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from '../components/ui/AuthModal';

const DRAFT_KEY = 'margdarshak_drafts';

export const MyTripsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all' | 'drafts'>('upcoming');
  const [localDrafts, setLocalDrafts] = useState<any[]>([]);
  const qc = useQueryClient();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    setLocalDrafts(stored);
  }, []);

  const removeDraft = (id: string) => {
    const updated = localDrafts.filter(d => d.id !== id);
    setLocalDrafts(updated);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  };

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

        {/* Tabs */}
        {!isLoading && !error && (trips.length > 0 || localDrafts.length > 0) && (
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
            {(['upcoming', 'completed', 'all', 'drafts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab}
                {tab === 'drafts' && localDrafts.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded-full">{localDrafts.length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Local Drafts Tab */}
        {activeTab === 'drafts' && (
          <div className="space-y-4">
            {localDrafts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No drafts saved</h3>
                <p className="text-gray-500 text-sm">Go to Plan Trip and save a draft to see it here.</p>
              </div>
            )}
            {localDrafts.map((draft) => (
              <div key={draft.id} className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-xl font-bold text-gray-900">{draft.title}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-600 border-slate-200">DRAFT</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-orange-500">🚉</span>
                        {draft.transportMode}
                        {draft.travelClass && ` · ${draft.travelClass.split('–')[0].trim()}`}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-orange-500">📅</span>
                        {draft.startDate || 'No date'} · {draft.duration} days
                      </span>
                      {draft.pnrNumber && (
                        <span className="flex items-center gap-1.5 text-gray-600 font-mono text-xs">
                          PNR: {draft.pnrNumber}
                        </span>
                      )}
                      {draft.flightNumber && (
                        <span className="flex items-center gap-1.5 text-gray-600 font-mono text-xs">
                          Flight: {draft.flightNumber}
                        </span>
                      )}
                    </div>
                    {draft.interests?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {draft.interests.slice(0, 5).map((i: string) => (
                          <span key={i} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeDraft(draft.id)}
                    className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Trips */}
        {activeTab !== 'drafts' && (
        <div className="space-y-4">
          {trips.filter(trip => {
            if (activeTab === 'upcoming') return trip.status !== 'COMPLETED';
            if (activeTab === 'completed') return trip.status === 'COMPLETED';
            return true;
          }).map((trip) => (
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
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </MainLayout>
  );
};
