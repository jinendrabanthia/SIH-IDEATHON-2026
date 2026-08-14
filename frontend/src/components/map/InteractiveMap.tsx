import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ItineraryItem, Attraction } from '../../types/domain';
import { TrustBadge } from '../trust/TrustBadge';
import { MapPin, Navigation, Calendar, Eye } from 'lucide-react';

// Custom Map Marker Icon Generator
const createCustomIcon = (sequence?: number, isHighlighted?: boolean, dayNumber?: number) => {
  const bg = isHighlighted ? '#ea580c' : dayNumber === 1 ? '#0284c7' : dayNumber === 2 ? '#16a34a' : '#ea580c';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: ${sequence ? '30px' : '20px'};
        height: ${sequence ? '30px' : '20px'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: ${sequence ? '13px' : '10px'};
        border: 2.5px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        ${sequence ?? ''}
      </div>
    `,
    iconSize: [sequence ? 30 : 20, sequence ? 30 : 20],
    iconAnchor: [sequence ? 15 : 10, sequence ? 15 : 10],
  });
};

// Component to dynamically pan/zoom map to fit pins safely
const MapBoundsUpdater: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;
    try {
      const validPoints = points.filter(([lat, lng]) => typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng));
      if (validPoints.length === 1) {
        map.setView(validPoints[0], 13);
      } else if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints.map(([lat, lng]) => [lat, lng]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      }
    } catch (e) {
      console.warn('MapBoundsUpdater caught error:', e);
    }
  }, [map, points]);

  return null;
};

interface InteractiveMapProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  items?: ItineraryItem[];
  allAttractions?: Attraction[];
  selectedItem?: ItineraryItem | null;
  activeDay?: number | 'ALL';
  onSelectDay?: (day: number | 'ALL') => void;
  onSelectAttraction?: (id: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  zoom = 12,
  items = [],
  allAttractions = [],
  selectedItem,
  activeDay: controlledActiveDay,
  onSelectDay,
  onSelectAttraction,
}) => {
  const [internalActiveDay, setInternalActiveDay] = useState<number | 'ALL'>(1);
  const currentActiveDay = controlledActiveDay !== undefined ? controlledActiveDay : internalActiveDay;

  const handleDayChange = (day: number | 'ALL') => {
    if (onSelectDay) {
      onSelectDay(day);
    } else {
      setInternalActiveDay(day);
    }
  };

  // Find all distinct available days
  const availableDays = Array.from(new Set(items.map((i) => i.dayNumber))).sort((a, b) => a - b);

  // Filter items based on active day toggle
  const displayedItems =
    currentActiveDay === 'ALL'
      ? items
      : items.filter((item) => item.dayNumber === currentActiveDay);

  // Map coordinates for displayed items
  const itineraryCoordinates: [number, number][] = [];
  const markerData = displayedItems.map((item) => {
    const attraction = allAttractions.find((a) => a.id === item.entityId);
    const lat = attraction?.latitude || center[0];
    const lng = attraction?.longitude || center[1];
    itineraryCoordinates.push([lat, lng]);

    return {
      id: item.entityId,
      name: item.attractionName,
      lat,
      lng,
      startTime: item.startTime,
      endTime: item.endTime,
      sequence: item.sequence,
      day: item.dayNumber,
      trustStatus: item.trustSummary.overall_status,
      accessibility: attraction?.accessibilityWheelchair,
    };
  });

  const allPoints: [number, number][] =
    itineraryCoordinates.length > 0
      ? itineraryCoordinates
      : allAttractions.length > 0
      ? allAttractions.map((a) => [a.latitude, a.longitude])
      : [center];

  const polylineColor = currentActiveDay === 1 ? '#0284c7' : currentActiveDay === 2 ? '#16a34a' : '#ea580c';

  return (
    <div className="relative isolate z-0 w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Top Floating Day Selector Bar — only once itinerary exists */}
      {items.length > 0 && availableDays.length > 1 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-1">
          <div className="flex items-center gap-1 px-2 text-slate-500 text-xs font-bold border-r border-slate-200">
            <Calendar className="h-3.5 w-3.5 text-orange-600" />
            <span>Map Day:</span>
          </div>

          {availableDays.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayChange(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentActiveDay === day
                  ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Day {day} ({items.filter((i) => i.dayNumber === day).length} stops)
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleDayChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentActiveDay === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Days
          </button>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater points={allPoints} />

        {/* Polylines for active day route */}
        {itineraryCoordinates.length > 1 && (
          <Polyline
            positions={itineraryCoordinates}
            color={polylineColor}
            weight={4}
            opacity={0.9}
            dashArray="7, 7"
          />
        )}

        {/* Itinerary Markers for Selected Day */}
        {markerData.length > 0
          ? markerData.map((marker) => {
              const isSelected = selectedItem?.entityId === marker.id;
              return (
                <Marker
                  key={`${marker.day}-${marker.id}`}
                  position={[marker.lat, marker.lng]}
                  icon={createCustomIcon(marker.sequence, isSelected, marker.day)}
                  eventHandlers={{
                    click: () => onSelectAttraction?.(marker.id),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-orange-600 uppercase">
                          Day {marker.day} • Stop {marker.sequence}
                        </span>
                        <TrustBadge status={marker.trustStatus} showIcon={false} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {marker.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-slate-400" />
                        {marker.startTime} – {marker.endTime}
                      </p>
                      {marker.accessibility && (
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          ✓ Wheelchair Accessible
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })
          : allAttractions.map((attraction) => (
              <Marker
                key={attraction.id}
                position={[attraction.latitude, attraction.longitude]}
                icon={createCustomIcon(undefined, false)}
                eventHandlers={{
                  click: () => onSelectAttraction?.(attraction.id),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 min-w-[160px]">
                    <h4 className="text-xs font-bold text-slate-900">
                      {attraction.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {attraction.categories.join(', ')}
                    </p>
                    {attraction.accessibilityWheelchair && (
                      <span className="text-[10px] text-emerald-700 font-medium block">
                        ♿ Wheelchair Accessible
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/90 shadow-md text-[11px] text-slate-700 flex items-center gap-3">
        {items.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full border border-white inline-block"
              style={{ backgroundColor: polylineColor }}
            />
            <span>
              {currentActiveDay === 'ALL'
                ? 'All Routes'
                : `Day ${currentActiveDay} Route & Sequence`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-slate-900 border border-white inline-block" />
          <span>{items.length > 0 ? 'Stops' : 'Attractions'}</span>
        </div>
      </div>
    </div>
  );
};
