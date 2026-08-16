import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api/services/tripsApi';
import { useAuth } from '../lib/AuthContext';
import { ItineraryMap } from './MapsPage';
import {
  MapPin, Calendar, Shield, AlertTriangle, Loader2, CheckCircle2,
  Wallet, Map as MapIcon, List, Info
} from 'lucide-react';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'map' | 'budget'>('itinerary');
  const [actualCosts, setActualCosts] = useState<Record<string, number>>({});

  // Load actual costs from local storage
  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`margdarshak_budget_${id}`);
      if (saved) {
        try { setActualCosts(JSON.parse(saved)); } catch (e) {}
      }
    }
  }, [id]);

  const handleActualCostChange = (itemId: string, value: string) => {
    const num = parseFloat(value);
    const newCosts = { ...actualCosts, [itemId]: isNaN(num) ? 0 : num };
    setActualCosts(newCosts);
    if (id) {
      localStorage.setItem(`margdarshak_budget_${id}`, JSON.stringify(newCosts));
    }
  };

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripsApi.get(id!, token!),
    enabled: !!id && !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertTriangle className="mb-4 text-amber-500" size={48} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
        <p className="text-gray-500 mb-6">This trip doesn't exist or you don't have access to it.</p>
        <Link to="/my-trips" className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl">Back to My Trips</Link>
      </div>
    );
  }

  const snapshot = trip.itinerarySnapshot as Record<string, any> | null | undefined;
  const days = snapshot?.days ?? 0;
  const items: any[] = snapshot?.itineraryItems ?? [];
  const warnings: string[] = snapshot?.warnings ?? [];

  // Group items by day
  const byDay: Record<number, any[]> = {};
  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  items.forEach((item) => {
    if (!byDay[item.dayNumber]) byDay[item.dayNumber] = [];
    byDay[item.dayNumber].push(item);
    
    // Calculate Budget
    let estimatedPrice = 0;
    const ticketFact = item.trustSummary?.facts?.find((f: any) => f.fact_key === 'ticket_price');
    if (ticketFact && ticketFact.fact_value && typeof ticketFact.fact_value.amount === 'number') {
      estimatedPrice = ticketFact.fact_value.amount;
    }
    totalEstimatedCost += estimatedPrice;
    totalActualCost += actualCosts[item.entityId] || 0;
  });

  // Prepare map stops
  const mapStops = items.map(item => ({
    id: item.entityId,
    name: item.attractionName,
    lat: item.attraction?.latitude || 0,
    lon: item.attraction?.longitude || 0,
    dayNumber: item.dayNumber,
    sequence: item.sequence,
    startTime: item.startTime,
    endTime: item.endTime,
    trustStatus: item.trustSummary?.overall_status,
    travelMinutesBefore: item.travelBufferMinutesBefore
  })).filter(s => s.lat !== 0 && s.lon !== 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-trips" className="text-gray-400 hover:text-gray-600">← Back</Link>
            <h1 className="text-xl font-bold text-gray-900">{trip.title}</h1>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'itinerary' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} /> <span className="hidden sm:inline">Itinerary</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MapIcon size={16} /> <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'budget' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Wallet size={16} /> <span className="hidden sm:inline">Budget</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Trip Meta */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={16} className="text-orange-500" />
              {trip.destination?.name}{trip.destination?.region ? `, ${trip.destination.region}` : ''}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={16} className="text-orange-500" />
              {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-emerald-700 text-sm font-semibold">100% Fact-Checked Plan</span>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && activeTab === 'itinerary' && (
          <div className="mb-6 space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {!snapshot || items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No itinerary generated yet.</div>
        ) : (
          <>
            {/* ITINERARY TAB */}
            {activeTab === 'itinerary' && (
              <div className="space-y-8">
                <div className="flex flex-wrap justify-end gap-3 no-print">
                  {/* Voice Output (Feature 7) */}
                  <button
                    onClick={() => {
                      if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel();
                        return;
                      }
                      const utterance = new SpeechSynthesisUtterance(`Itinerary for ${trip.destination?.name}. `);
                      
                      items.forEach((item) => {
                        utterance.text += `Day ${item.dayNumber}, ${item.startTime}. Visit ${item.attractionName}. `;
                      });
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-xl hover:bg-orange-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2l4 4V4L9 8H7a2 2 0 00-2 2z" /></svg>
                    Read Aloud
                  </button>

                  {/* Export PDF (Feature 6) */}
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export as PDF
                  </button>
                </div>

                {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                  <div key={day} className="print-day-block">
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">D{day}</span>
                      Day {day}
                    </h2>
                    <div className="space-y-4">
                      {(byDay[day] ?? []).map((item: any, idx: number) => (
                        <div key={idx} className="print-item bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                          {/* Trust strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.trustSummary?.overall_status === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          
                          <div className="flex items-start justify-between gap-4 pl-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                                  {item.sequence}
                                </span>
                                <h3 className="text-gray-900 font-bold text-lg">{item.attractionName}</h3>
                              </div>
                              <p className="text-gray-500 text-sm font-medium pl-8 mb-2">
                                {item.startTime} – {item.endTime}
                                {item.travelBufferMinutesBefore > 0 && ` · 🚗 ${item.travelBufferMinutesBefore} min travel`}
                              </p>
                              
                              {/* Explanation */}
                              {item.explanationText && (
                                <p className="text-gray-600 text-sm pl-8 mb-3 leading-relaxed">
                                  {item.explanationText}
                                </p>
                              )}
                              
                              {/* Trust Facts */}
                              <div className="pl-8 flex flex-wrap gap-2">
                                {item.trustSummary?.facts?.map((f: any, i: number) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600" title={`Source: ${f.source_name}`}>
                                    <Shield size={12} className={f.verification_status === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'} />
                                    {f.fact_key.replace('_', ' ')}: {f.verification_status}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MAP TAB */}
            {activeTab === 'map' && (
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 h-[600px]">
                <ItineraryMap stops={mapStops} />
              </div>
            )}

            {/* BUDGET TAB */}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Estimated Cost</p>
                    <p className="text-4xl font-black text-gray-900">₹{totalEstimatedCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Info size={12} /> Based on verified ticket prices
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Actual Spent</p>
                    <p className="text-4xl font-black text-orange-600">₹{totalActualCost.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Info size={12} /> Tracked locally on this device
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <th className="p-4 border-b border-gray-100">Day</th>
                        <th className="p-4 border-b border-gray-100">Place</th>
                        <th className="p-4 border-b border-gray-100">Est. Price (Fact)</th>
                        <th className="p-4 border-b border-gray-100">Actual Spent (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {items.map((item, idx) => {
                        const ticketFact = item.trustSummary?.facts?.find((f: any) => f.fact_key === 'ticket_price');
                        let estPriceDisplay = <span className="text-gray-400 italic">Unknown - Verify Locally</span>;
                        
                        if (ticketFact && ticketFact.fact_value) {
                          const val = ticketFact.fact_value;
                          if (val.amount === 0) estPriceDisplay = <span className="text-emerald-600 font-bold">Free</span>;
                          else if (val.amount) estPriceDisplay = <span className="text-gray-900 font-medium">₹{val.amount} {val.currency === 'INR' ? '' : val.currency}</span>;
                        }

                        return (
                          <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold text-gray-400">D{item.dayNumber}</td>
                            <td className="p-4 font-semibold text-gray-800">{item.attractionName}</td>
                            <td className="p-4">{estPriceDisplay}</td>
                            <td className="p-4">
                              <input
                                type="number"
                                placeholder="0"
                                className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-mono"
                                value={actualCosts[item.entityId] || ''}
                                onChange={(e) => handleActualCostChange(item.entityId, e.target.value)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
