import React from 'react';

const regions = [
  { label: 'North India',   count: '312+', color: '#f97316' },
  { label: 'South India',   count: '278+', color: '#8b5cf6' },
  { label: 'East India',    count: '186+', color: '#3b82f6' },
  { label: 'West India',    count: '204+', color: '#10b981' },
  { label: 'North East',    count: '98+',  color: '#ec4899' },
  { label: 'Central India', count: '156+', color: '#f59e0b' },
];

// Geographic projection: x=(lon-68)*8+20, y=(37-lat)*8+20
// Clockwise from NW Kashmir
const INDIA_PATH = `
  M 68,28 L 84,20 L 108,44 L 116,68 L 148,92 L 180,100
  L 204,100 L 252,92
  L 252,116 L 228,124 L 212,140 L 180,140
  L 164,156 L 140,180 L 116,204 L 108,236 L 96,252
  L 92,248 L 84,228 L 68,196 L 60,164
  L 56,148 L 52,140 L 40,148 L 32,144 L 28,132
  L 32,124 L 24,116 L 20,104
  L 47,82 L 70,60 L 68,28 Z
`;

const IndiaMap: React.FC = () => (
  <svg viewBox="12 15 248 244" className="w-full" style={{ maxHeight: '230px' }}>
    <defs>
      <clipPath id="ic">
        <path d={INDIA_PATH} />
      </clipPath>
    </defs>

    {/* Fill */}
    <path d={INDIA_PATH} fill="#eff6ff" className="dark:fill-slate-800/60" />

    {/* Internal dotted dividers clipped to shape */}
    <g clipPath="url(#ic)" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 6" strokeLinecap="round" fill="none">
      <line x1="20" y1="116" x2="252" y2="116" />
      <line x1="20" y1="172" x2="200" y2="172" />
      <line x1="100" y1="20" x2="100" y2="252" />
      <line x1="156" y1="92" x2="156" y2="200" />
    </g>

    {/* Dotted outer border */}
    <path d={INDIA_PATH} fill="none" stroke="#64748b" strokeWidth="2.5"
      strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" />

    {/* Region dots */}
    <circle cx="92"  cy="90"  r="6" fill="#f97316" /> {/* North */}
    <circle cx="220" cy="108" r="6" fill="#ec4899" /> {/* NE */}
    <circle cx="52"  cy="136" r="6" fill="#10b981" /> {/* West */}
    <circle cx="108" cy="144" r="6" fill="#f59e0b" /> {/* Central */}
    <circle cx="156" cy="152" r="6" fill="#3b82f6" /> {/* East */}
    <circle cx="96"  cy="208" r="6" fill="#8b5cf6" /> {/* South */}
  </svg>
);

export const RegionalMapWidget: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
    <div className="mb-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Explore India by Region</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">Discover destinations across all states & UTs</p>
    </div>

    <div className="flex justify-center mb-4">
      <div style={{ width: '200px' }}>
        <IndiaMap />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
      {regions.map((r) => (
        <div key={r.label} className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{r.label}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{r.count}</span>
        </div>
      ))}
    </div>

    <button className="w-full py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1">
      Explore All States <span>→</span>
    </button>
  </div>
);
