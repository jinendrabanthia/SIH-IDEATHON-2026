import React from 'react';

const regions = [
  { label: 'North India',   count: '312+', color: '#f97316' },
  { label: 'South India',   count: '278+', color: '#8b5cf6' },
  { label: 'East India',    count: '186+', color: '#3b82f6' },
  { label: 'West India',    count: '204+', color: '#10b981' },
  { label: 'North East',    count: '98+',  color: '#ec4899' },
  { label: 'Central India', count: '156+', color: '#f59e0b' },
];

// Simple dotted India map using SVG path approximation
const IndiaMapSVG: React.FC = () => (
  <svg viewBox="0 0 300 340" className="w-full" style={{ maxHeight: '220px' }}>
    {/* Dotted grid background */}
    <defs>
      <pattern id="dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" className="fill-slate-200 dark:fill-slate-700" />
      </pattern>
    </defs>

    {/* India silhouette approximated as a clipped dotted region */}
    {/* We draw dots in a rough India shape */}
    <clipPath id="india-clip">
      <path d="
        M 130,10 L 160,8 L 190,18 L 215,30 L 230,50 L 240,70
        L 250,90 L 255,115 L 258,140 L 250,165 L 240,185
        L 225,200 L 215,220 L 205,240 L 195,260 L 185,275
        L 175,290 L 165,305 L 158,320 L 152,330 L 148,320
        L 142,305 L 132,290 L 122,275 L 110,258 L 98,240
        L 88,220 L 78,200 L 68,180 L 60,158 L 55,135
        L 52,110 L 56,88 L 65,68 L 78,50 L 95,35 L 113,22 Z
      " />
    </clipPath>
    <rect x="0" y="0" width="300" height="340" fill="url(#dots)" clipPath="url(#india-clip)" />

    {/* Region dots */}
    {/* North India */}
    <circle cx="148" cy="65" r="7" fill="#f97316" opacity="0.9" />
    {/* South India */}
    <circle cx="155" cy="260" r="7" fill="#8b5cf6" opacity="0.9" />
    {/* East India */}
    <circle cx="210" cy="155" r="7" fill="#3b82f6" opacity="0.9" />
    {/* West India */}
    <circle cx="88" cy="145" r="7" fill="#10b981" opacity="0.9" />
    {/* North East */}
    <circle cx="235" cy="110" r="7" fill="#ec4899" opacity="0.9" />
    {/* Central India */}
    <circle cx="155" cy="175" r="7" fill="#f59e0b" opacity="0.9" />
  </svg>
);

export const RegionalMapWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Explore India by Region</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Discover destinations across all states & UTs</p>
      </div>

      {/* Map + Legend side by side */}
      <div className="flex gap-3 items-start mb-4">
        {/* Map */}
        <div className="flex-shrink-0" style={{ width: '120px' }}>
          <IndiaMapSVG />
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 pt-2">
          {regions.map((r) => (
            <div key={r.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{r.label}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{r.count} Destinations</span>
            </div>
          ))}
        </div>
      </div>

      {/* Explore All States button */}
      <button className="w-full py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-1">
        Explore All States <span>→</span>
      </button>
    </div>
  );
};
