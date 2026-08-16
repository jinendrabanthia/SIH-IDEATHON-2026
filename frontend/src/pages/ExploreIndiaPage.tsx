import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Search, Filter, Star, MapPin, Tag, CheckCircle } from 'lucide-react';

interface Attraction {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  accessibility: string[];
  verified: boolean;
  emoji: string;
}

export const ExploreIndia: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);

  const categories = ['Heritage', 'Spiritual', 'Architecture', 'Nature', 'Museums & Culture', 'Handicrafts & Art'];

  const attractions: Attraction[] = [
    {
      id: '1',
      name: 'Lingaraj Temple',
      location: 'Bhubaneswar, Odisha',
      category: 'Heritage',
      rating: 4.8,
      accessibility: ['Visual Support', 'Hearing Support'],
      verified: true,
      emoji: '🙏',
    },
    {
      id: '2',
      name: 'Udayagiri & Khandagiri Caves',
      location: 'Bhubaneswar, Odisha',
      category: 'Heritage',
      rating: 4.7,
      accessibility: ['Hearing Support'],
      verified: true,
      emoji: '⛰️',
    },
    {
      id: '3',
      name: 'Odisha State Museum',
      location: 'Bhubaneswar, Odisha',
      category: 'Museums & Culture',
      rating: 4.6,
      accessibility: ['Wheelchair', 'Visual Support', 'Hearing Support'],
      verified: true,
      emoji: '🏛️',
    },
    {
      id: '4',
      name: 'Dhauli Shanti Stupa',
      location: 'Bhubaneswar, Odisha',
      category: 'Spiritual',
      rating: 4.9,
      accessibility: ['Wheelchair'],
      verified: true,
      emoji: '⛩️',
    },
  ];

  const filteredAttractions = attractions.filter((attr) => {
    const matchesSearch =
      attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || attr.category === selectedCategory;
    const matchesAccessibility =
      !wheelchairOnly || attr.accessibility.includes('Wheelchair');
    return matchesSearch && matchesCategory && matchesAccessibility;
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Heritage & Attractions</h1>
          <p className="text-gray-600">Browse verified tourist attractions with full accessibility audits and ground facts.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search attractions by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Filter */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wheelchair"
              checked={wheelchairOnly}
              onChange={(e) => setWheelchairOnly(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="wheelchair" className="text-sm font-semibold text-gray-700">
              ♿ Wheelchair Accessible Only
            </label>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAttractions.map((attraction) => (
            <div
              key={attraction.id}
              className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="relative h-48 bg-gradient-to-br from-orange-200 to-amber-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <span className="text-6xl">{attraction.emoji}</span>
                {attraction.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 flex items-center gap-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{attraction.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                  <MapPin size={16} />
                  {attraction.location}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{attraction.rating}</span>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    {attraction.category}
                  </span>
                </div>

                {/* Accessibility Tags */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Accessibility:</p>
                  <div className="flex flex-wrap gap-2">
                    {attraction.accessibility.map((access) => (
                      <span key={access} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                        {access}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-3 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-orange-200">
                  Audit Verified Facts →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAttractions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No attractions found matching your criteria.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
