import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Calendar, MapPin, Users, Edit2, Trash2, Share2, CheckCircle } from 'lucide-react';

interface SavedTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  travelers: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  attractions: number;
  budget: string;
}

export const MyTripsPage: React.FC = () => {
  const [trips] = useState<SavedTrip[]>([
    {
      id: '1',
      destination: 'Delhi → Jaipur',
      startDate: '15 Aug 2026',
      endDate: '20 Aug 2026',
      days: 5,
      travelers: 2,
      status: 'upcoming',
      attractions: 12,
      budget: '₹25,000 - ₹35,000',
    },
    {
      id: '2',
      destination: 'Mumbai → Goa',
      startDate: '24 May 2026',
      endDate: '30 May 2026',
      days: 6,
      travelers: 4,
      status: 'upcoming',
      attractions: 15,
      budget: '₹40,000 - ₹60,000',
    },
    {
      id: '3',
      destination: 'Kerala Backwaters',
      startDate: '1 Jan 2026',
      endDate: '8 Jan 2026',
      days: 7,
      travelers: 3,
      status: 'completed',
      attractions: 18,
      budget: '₹35,000 - ₹50,000',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'ongoing':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-600">Manage and view all your saved and completed trips.</p>
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{trip.destination}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        trip.status,
                      )}`}
                    >
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">START DATE</p>
                      <p className="text-sm font-bold text-gray-900">{trip.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">DURATION</p>
                      <p className="text-sm font-bold text-gray-900">{trip.days} Days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">TRAVELERS</p>
                      <p className="text-sm font-bold text-gray-900">{trip.travelers} People</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">ATTRACTIONS</p>
                      <p className="text-sm font-bold text-gray-900">{trip.attractions} Places</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">BUDGET</p>
                      <p className="text-sm font-bold text-gray-900">{trip.budget}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                      <CheckCircle size={14} />
                      Verified Itinerary
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                      Accessibility Audited
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                    <Edit2 size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No trips yet. Start planning your next adventure!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
