import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { MapPin, Navigation, Clock, Shield, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths in Vite/webpack builds
import L from 'leaflet';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  dayNumber: number;
  sequence: number;
  startTime: string;
  endTime: string;
  trustStatus?: string;
  travelMinutesBefore?: number;
}

// ─── Numbered pin icon factory ─────────────────────────────────────────────

function numberedPin(n: number, color = '#f97316'): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:30px; height:30px; border-radius:50% 50% 50% 0;
      transform:rotate(-45deg); background:${color};
      border:2px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex; align-items:center; justify-content:center;
    ">
      <span style="transform:rotate(45deg); color:#fff; font-size:11px; font-weight:700; line-height:1;">${n}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}

const DAY_COLORS = ['#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899', '#f59e0b', '#3b82f6'];

// ─── Sample data (replaced by real planner output when embedded in PlannerPage) ───

const SAMPLE_STOPS: MapStop[] = [
  { id: '1', name: 'Lingaraj Temple', lat: 20.2395, lon: 85.8340, dayNumber: 1, sequence: 1, startTime: '09:00', endTime: '11:00', trustStatus: 'VERIFIED' },
  { id: '2', name: 'Odisha State Museum', lat: 20.2719, lon: 85.8377, dayNumber: 1, sequence: 2, startTime: '11:30', endTime: '13:30', trustStatus: 'VERIFIED', travelMinutesBefore: 15 },
  { id: '3', name: 'Nandankanan Zoo', lat: 20.3906, lon: 85.8228, dayNumber: 1, sequence: 3, startTime: '14:30', endTime: '17:00', trustStatus: 'COMMUNITY', travelMinutesBefore: 40 },
  { id: '4', name: 'Udayagiri Caves', lat: 20.2552, lon: 85.7813, dayNumber: 2, sequence: 1, startTime: '09:00', endTime: '11:30', trustStatus: 'VERIFIED' },
  { id: '5', name: 'Dhauli Peace Pagoda', lat: 20.1914, lon: 85.8400, dayNumber: 2, sequence: 2, startTime: '12:00', endTime: '14:00', trustStatus: 'VERIFIED', travelMinutesBefore: 25 },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ItineraryMapProps {
  stops?: MapStop[];
  title?: string;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ stops = SAMPLE_STOPS, title }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [selectedStop, setSelectedStop] = useState<MapStop | null>(null);
  const [activeDay, setActiveDay] = useState<number | 'all'>('all');

  const days = [...new Set(stops.map((s) => s.dayNumber))].sort();
  const visibleStops = activeDay === 'all' ? stops : stops.filter((s) => s.dayNumber === activeDay);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const center: L.LatLngTuple = stops.length > 0
      ? [stops.reduce((s, p) => s + p.lat, 0) / stops.length, stops.reduce((s, p) => s + p.lon, 0) / stops.length]
      : [20.5937, 78.9629]; // India center

    leafletMap.current = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView(center, 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []); // eslint-disable-line

  // Re-draw markers & polylines whenever visible stops change
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    if (visibleStops.length === 0) return;

    // Group by day for polylines
    const byDay: Record<number, MapStop[]> = {};
    visibleStops.forEach((s) => {
      if (!byDay[s.dayNumber]) byDay[s.dayNumber] = [];
      byDay[s.dayNumber].push(s);
    });

    Object.entries(byDay).forEach(([dayStr, dayStops]) => {
      const day = Number(dayStr);
      const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
      const sorted = [...dayStops].sort((a, b) => a.sequence - b.sequence);

      // Polyline route
      if (sorted.length > 1) {
        L.polyline(sorted.map((s) => [s.lat, s.lon] as L.LatLngTuple), {
          color,
          weight: 3,
          opacity: 0.7,
          dashArray: '8 4',
        }).addTo(map);
      }

      // Numbered markers
      sorted.forEach((stop) => {
        const marker = L.marker([stop.lat, stop.lon], { icon: numberedPin(stop.sequence, color) })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px; font-family:system-ui">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="background:${color};color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${stop.sequence}</span>
                <strong style="font-size:13px">${stop.name}</strong>
              </div>
              <div style="font-size:11px;color:#666;margin-bottom:4px">${stop.startTime} – ${stop.endTime}</div>
              ${stop.travelMinutesBefore ? `<div style="font-size:11px;color:#888">🚗 ${stop.travelMinutesBefore} min travel</div>` : ''}
              ${stop.trustStatus ? `<div style="font-size:10px;font-weight:600;margin-top:4px;color:${stop.trustStatus === 'VERIFIED' ? '#10b981' : '#f59e0b'}">${stop.trustStatus}</div>` : ''}
            </div>
          `);

        marker.on('click', () => setSelectedStop(stop));
      });
    });

    // Fit bounds
    const bounds = L.latLngBounds(visibleStops.map((s) => [s.lat, s.lon] as L.LatLngTuple));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [visibleStops]);

  return (
    <div className="flex flex-col h-full">
      {/* Day filter tabs */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setActiveDay('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeDay === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All Days
        </button>
        {days.map((day) => {
          const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all`}
              style={activeDay === day
                ? { background: color, color: '#fff' }
                : { background: '#f3f4f6', color: '#374151' }
              }
            >
              Day {day}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Map container */}
        <div
          ref={mapRef}
          className="flex-1 rounded-2xl overflow-hidden border border-gray-200"
          style={{ minHeight: '420px' }}
        />

        {/* Stop list sidebar */}
        <div className="w-full md:w-64 shrink-0 overflow-y-auto space-y-2" style={{ maxHeight: '480px' }}>
          {visibleStops
            .slice()
            .sort((a, b) => a.dayNumber - b.dayNumber || a.sequence - b.sequence)
            .map((stop) => {
              const color = DAY_COLORS[(stop.dayNumber - 1) % DAY_COLORS.length];
              return (
                <button
                  key={stop.id}
                  onClick={() => {
                    setSelectedStop(stop);
                    leafletMap.current?.flyTo([stop.lat, stop.lon], 15, { duration: 0.8 });
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedStop?.id === stop.id ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: color }}
                    >
                      {stop.sequence}
                    </span>
                    <span className="text-xs font-bold text-gray-500">Day {stop.dayNumber}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">{stop.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={10} />
                    {stop.startTime} – {stop.endTime}
                  </div>
                  {stop.travelMinutesBefore ? (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Navigation size={10} />
                      {stop.travelMinutesBefore} min travel
                    </div>
                  ) : null}
                  {stop.trustStatus && (
                    <span className="inline-block mt-1 text-xs font-bold" style={{ color: stop.trustStatus === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>
                      {stop.trustStatus}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// ─── MapsPage wrapper ─────────────────────────────────────────────────────────

export const MapsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Map</h1>
          <p className="text-gray-600">
            Explore itinerary stops on a map — numbered pins, real travel times, and trust status per stop.
          </p>
        </div>

        <div
          className="rounded-2xl p-4 border border-gray-200 bg-white"
          style={{ minHeight: '560px' }}
        >
          <ItineraryMap />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <MapPin size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Numbered Pins</p>
              <p className="text-xs text-gray-500">Visit order from the planner</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Navigation size={18} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Real Travel Times</p>
              <p className="text-xs text-gray-500">Computed via OpenRouteService</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Shield size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Trust Status</p>
              <p className="text-xs text-gray-500">VERIFIED/LIVE per pin</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
