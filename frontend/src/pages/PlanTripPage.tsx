import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Calendar, MapPin, Zap, Save } from 'lucide-react';

export const PlanTripPage: React.FC = () => {
  const [tripData, setTripData] = useState({
    destination: 'Bhubaneswar (Odisha, India)',
    startDate: '2026-08-15',
    duration: '2',
    pace: 'Moderate',
    transportMode: 'Optimized Mixed',
    wheelchairAccessible: false,
    interests: [] as string[],
  });

  const interests = [
    'Heritage & Architecture',
    'Temples & Spiritual',
    'Nature & Parks',
    'Local Food & Markets',
    'Museums & Culture',
    'Handicrafts & Art',
  ];

  const handleInterestToggle = (interest: string) => {
    setTripData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <MainLayout>
      {/* Wider container */}
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verified Itinerary Builder</h1>
          <p className="text-gray-600 dark:text-gray-400">Build your personalized trip backed by real hours, wheelchair audits, and transparent travel times.</p>
        </div>

        {/* 6-column grid: form=4 cols, summary=2 cols pushed to col 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">

          {/* ── Main Form (wider) ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Destination */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Destination</label>
              <select
                value={tripData.destination}
                onChange={(e) => setTripData((prev) => ({ ...prev, destination: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
              >
                <option>Bhubaneswar (Odisha, India)</option>
                <option>Delhi (Delhi, India)</option>
                <option>Jaipur (Rajasthan, India)</option>
                <option>Mumbai (Maharashtra, India)</option>
              </select>
            </div>

            {/* Trip Details row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Start Date */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Start Date</label>
                <input
                  type="date"
                  value={tripData.startDate}
                  onChange={(e) => setTripData((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Duration */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Duration (Days)</label>
                <select
                  value={`${tripData.duration} Days`}
                  onChange={(e) => setTripData((prev) => ({ ...prev, duration: e.target.value.replace(' Days', '') }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                >
                  <option>2 Days</option>
                  <option>3 Days</option>
                  <option>5 Days</option>
                  <option>7 Days</option>
                </select>
              </div>

              {/* Travel Pace */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Travel Pace</label>
                <div className="flex gap-2">
                  {['Relaxed', 'Moderate', 'Packed'].map((pace) => (
                    <button
                      key={pace}
                      onClick={() => setTripData((prev) => ({ ...prev, pace }))}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 active:scale-95 ${
                        tripData.pace === pace
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200 dark:shadow-orange-900/40 scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:scale-105 hover:shadow-sm'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transport Mode */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 tracking-widest uppercase">Transport Mode</label>
              <select className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all">
                <option>Optimized Mixed</option>
                <option>Public Transport</option>
                <option>Private Car</option>
                <option>Walking Tour</option>
              </select>
            </div>

            {/* Accessibility */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={tripData.wheelchairAccessible}
                  onChange={(e) => setTripData((prev) => ({ ...prev, wheelchairAccessible: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  ♿ Wheelchair Accessible Stops Only
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-8">Filters only strictly verified accessible venues</p>
            </div>

            {/* Interests & Themes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-widest uppercase">Interests & Themes</label>
              <div className="grid grid-cols-3 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium active:scale-95 ${
                      tripData.interests.includes(interest)
                        ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-400 shadow-sm shadow-orange-100 dark:shadow-orange-900/20 scale-105'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-300 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-105 hover:shadow-sm'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trip Summary (pushed right: col-start-5) ── */}
          <div className="lg:col-span-2 lg:col-start-5">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/50 sticky top-24 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Trip Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{tripData.destination}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{tripData.duration} Days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Travel Pace</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{tripData.pace}</p>
                  </div>
                </div>
              </div>

              {/* Generate Verified Plan — shimmer + bounce icon + glow shadow */}
              <button className="relative w-full overflow-hidden bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mb-3 shadow-lg shadow-orange-300/50 hover:shadow-xl hover:shadow-orange-400/60 hover:scale-[1.03] group">
                {/* shimmer sweep on hover */}
                <span className="absolute inset-0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                <Zap size={18} className="group-hover:animate-bounce relative z-10" />
                <span className="relative z-10">Generate Verified Plan</span>
              </button>

              {/* Save Draft — icon rotates + fill on hover */}
              <button className="relative w-full overflow-hidden border-2 border-orange-400 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.03] hover:shadow-lg hover:shadow-orange-200/50 group">
                <Save size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                Save Draft
              </button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};
