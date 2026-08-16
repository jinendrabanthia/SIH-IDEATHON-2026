import React from 'react';
import { MapPin, CheckCircle, Accessibility, Smile } from 'lucide-react';

const stats = [
  { label: 'States\n8 UTs',            value: '28',      icon: <MapPin size={22} />,        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',  iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Verified\nDestinations',    value: '1,240+',  icon: <CheckCircle size={22} />,   iconBg: 'bg-orange-100 dark:bg-orange-900/30',   iconColor: 'text-orange-500 dark:text-orange-400'  },
  { label: 'Data\nVerified',            value: '96%',     icon: <CheckCircle size={22} />,   iconBg: 'bg-blue-100 dark:bg-blue-900/30',     iconColor: 'text-blue-500 dark:text-blue-400'    },
  { label: 'Accessibility\nAudited',    value: '72%',     icon: <Accessibility size={22} />, iconBg: 'bg-purple-100 dark:bg-purple-900/30',   iconColor: 'text-purple-500 dark:text-purple-400'  },
  { label: 'Happy\nTravelers',          value: '12.5L+',  icon: <Smile size={22} />,         iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',   iconColor: 'text-yellow-500 dark:text-yellow-400'  },
];

export const TravelPulseWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">India Travel Pulse</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Real-time travel insights</p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {stats.map((stat) => (
          <div key={stat.value} className="flex flex-col items-center text-center gap-1.5">
            <div className={`w-10 h-10 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center transition-colors`}>
              {stat.icon}
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight whitespace-pre-line">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
