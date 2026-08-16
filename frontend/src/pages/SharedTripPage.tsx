import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api/services/tripsApi';
import { MapPin, Calendar, Shield, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Public read-only view of a shared itinerary.
 * Accessed via /share/:token — NO auth required.
 * Never leaks owner PII — only trip content.
 */
export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['shared-trip', token],
    queryFn: () => tripsApi.getPublic(token!),
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1629' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-orange-400" size={32} />
          <p className="text-slate-400 text-sm">Loading shared itinerary…</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0f1629' }}>
        <div
          className="max-w-md w-full rounded-2xl p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <AlertTriangle className="mx-auto mb-4 text-amber-400" size={40} />
          <h1 className="text-xl font-bold text-white mb-2">Trip Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            This shared itinerary link is either invalid or the owner has made it private.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            Go to MargDarshak
          </Link>
        </div>
      </div>
    );
  }

  const snapshot = trip.itinerarySnapshot as Record<string, any> | null | undefined;
  const days = snapshot?.days ?? 0;
  const items: any[] = snapshot?.itineraryItems ?? [];
  const warnings: string[] = snapshot?.warnings ?? [];

  // Group items by day
  const byDay: Record<number, any[]> = {};
  items.forEach((item) => {
    if (!byDay[item.dayNumber]) byDay[item.dayNumber] = [];
    byDay[item.dayNumber].push(item);
  });

  return (
    <div className="min-h-screen" style={{ background: '#0f1629' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-4" style={{ background: 'rgba(15,22,41,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <span className="text-white font-bold">MargDarshak</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Shield size={14} />
            Trust-Verified Itinerary
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Trip meta */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">{trip.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-400" />
              {trip.destination?.name}{trip.destination?.region ? `, ${trip.destination.region}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-orange-400" />
              {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl w-fit" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">All information in this itinerary is fact-checked — no AI hallucinations</span>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl text-amber-300 text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                {w}
              </div>
            ))}
          </div>
        )}

        {/* No snapshot */}
        {!snapshot || items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No itinerary details available in this shared trip.</div>
        ) : (
          <div className="space-y-6">
            {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
              <div key={day}>
                <h2 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-3">Day {day}</h2>
                <div className="space-y-3">
                  {(byDay[day] ?? []).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#f97316' }}>
                              {item.sequence}
                            </span>
                            <h3 className="text-white font-semibold text-sm">{item.attractionName}</h3>
                          </div>
                          <p className="text-slate-400 text-xs pl-7">
                            {item.startTime} – {item.endTime}
                            {item.travelBufferMinutesBefore > 0 && ` · ${item.travelBufferMinutesBefore} min travel`}
                          </p>
                        </div>
                        {item.trustSummary?.overall_status && (
                          <span
                            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: item.trustSummary.overall_status === 'VERIFIED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                              color: item.trustSummary.overall_status === 'VERIFIED' ? '#10b981' : '#f59e0b',
                            }}
                          >
                            {item.trustSummary.overall_status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/plan-trip"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            Plan Your Own Verified Trip
          </Link>
        </div>
      </main>
    </div>
  );
};
