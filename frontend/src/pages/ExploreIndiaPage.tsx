import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Search, Filter, Star, MapPin, Tag, CheckCircle, X, Info } from 'lucide-react';

interface Attraction {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  accessibility: string[];
  image: string;
  description: string;
}

export const ExploreIndia: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  const categories = ['Heritage', 'Spiritual', 'Architecture', 'Nature', 'Museums & Culture', 'Handicrafts & Art'];

  const attractions: Attraction[] = [
    {
      id: '1',
      name: 'Taj Mahal',
      location: 'Agra, Uttar Pradesh',
      category: 'Heritage',
      rating: 4.9,
      accessibility: ['Wheelchair', 'Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Taj_Mahal_in_March_2004.jpg',
      description: 'The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in the Indian city of Agra. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. It is considered a masterpiece of architectural style in conception, treatment and execution.'
    },
    {
      id: '2',
      name: 'India Gate',
      location: 'New Delhi, Delhi',
      category: 'Heritage',
      rating: 4.8,
      accessibility: ['Wheelchair', 'Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/India_Gate_in_New_Delhi_03-2016.jpg',
      description: 'The India Gate is a war memorial located astride the Rajpath, on the eastern edge of the "ceremonial axis" of New Delhi. It stands as a memorial to 70,000 soldiers of the British Indian Army who died in between 1914 and 1921 in the First World War.'
    },
    {
      id: '3',
      name: 'Parliament House',
      location: 'New Delhi, Delhi',
      category: 'Architecture',
      rating: 4.7,
      accessibility: ['Wheelchair', 'Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Parliament_House_of_India.jpg',
      description: 'The Sansad Bhavan (Parliament House) is the seat of the Parliament of India. It houses the Lok Sabha and the Rajya Sabha which represent lower and upper houses respectively in India\'s bicameral parliament.'
    },
    {
      id: '4',
      name: 'Jantar Mantar',
      location: 'New Delhi, Delhi',
      category: 'Heritage',
      rating: 4.6,
      accessibility: ['Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Jantar_Mantar_Delhi_India.jpg',
      description: 'Jantar Mantar is an equinoctial sundial, consisting of a gigantic triangular gnomon with the hypotenuse parallel to the Earth\'s axis. It is one of five observatories built by Maharaja Jai Singh II of Jaipur.'
    },
    {
      id: '5',
      name: 'Qutub Minar',
      location: 'New Delhi, Delhi',
      category: 'Heritage',
      rating: 4.8,
      accessibility: ['Wheelchair', 'Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Qutb_Minar_2011.jpg',
      description: 'The Qutb Minar is a minaret and "victory tower" that forms part of the Qutb complex, a UNESCO World Heritage Site in the Mehrauli area of New Delhi, India. The height of Qutb Minar is 72.5 meters.'
    },
    {
      id: '6',
      name: 'Red Fort',
      location: 'New Delhi, Delhi',
      category: 'Heritage',
      rating: 4.8,
      accessibility: ['Wheelchair', 'Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Red_Fort_in_Delhi_03-2016.jpg',
      description: 'The Red Fort or Lal Qila is a historic fort in Old Delhi, India, that served as the main residence of the Mughal Emperors. Emperor Shah Jahan commissioned construction of the Red Fort on 12 May 1638, when he decided to shift his capital from Agra to Delhi.'
    },
    {
      id: '7',
      name: 'Gateway of India',
      location: 'Mumbai, Maharashtra',
      category: 'Architecture',
      rating: 4.7,
      accessibility: ['Wheelchair', 'Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Gateway_of_India_in_March_2018.jpg',
      description: 'The Gateway of India is an arch-monument built in the early twentieth century in the city of Mumbai, in the Indian state of Maharashtra. It was erected to commemorate the landing of King-Emperor George V in 1911.'
    },
    {
      id: '8',
      name: 'Hawa Mahal',
      location: 'Jaipur, Rajasthan',
      category: 'Architecture',
      rating: 4.8,
      accessibility: ['Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Hawa_Mahal%2C_Jaipur%2C_India.jpg',
      description: 'The Hawa Mahal is a palace in the city of Jaipur, India. Built from red and pink sandstone, it is on the edge of the City Palace, Jaipur, and extends to the Zenana, or women\'s chambers.'
    },
    {
      id: '9',
      name: 'Charminar',
      location: 'Hyderabad, Telangana',
      category: 'Heritage',
      rating: 4.7,
      accessibility: ['Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Charminar_Hyderabad_1.jpg',
      description: 'The Charminar is a mosque and monument located in Hyderabad, Telangana, India. Constructed in 1591, the landmark is a global icon of Hyderabad and is listed among the most recognised structures in India.'
    },
    {
      id: '10',
      name: 'Victoria Memorial',
      location: 'Kolkata, West Bengal',
      category: 'Museums & Culture',
      rating: 4.8,
      accessibility: ['Wheelchair', 'Visual Support', 'Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Victoria_Memorial%2C_Kolkata.jpg',
      description: 'The Victoria Memorial is a large marble building in Central Kolkata, which was built between 1906 and 1921. It is dedicated to the memory of Empress Victoria, and is now a museum and tourist destination.'
    },
    {
      id: '11',
      name: 'Golden Temple',
      location: 'Amritsar, Punjab',
      category: 'Spiritual',
      rating: 5.0,
      accessibility: ['Wheelchair', 'Hearing Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Golden_Temple_India.jpg',
      description: 'The Golden Temple, also known as Harmandir Sahib, meaning "abode of God", is a Gurdwara located in the city of Amritsar, Punjab, India. It is the preeminent spiritual site of Sikhism.'
    },
    {
      id: '12',
      name: 'Meenakshi Temple',
      location: 'Madurai, Tamil Nadu',
      category: 'Spiritual',
      rating: 4.9,
      accessibility: ['Wheelchair', 'Visual Support'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Madurai_Meenakshi_Amman_Temple_Overview.jpg',
      description: 'Meenakshi Temple is a historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai, Tamil Nadu, India. It is dedicated to the goddess Meenakshi, a form of Parvati, and her consort, Sundareshwar.'
    }
  ];

  const filteredAttractions = attractions.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? a.category === selectedCategory : true;
    const matchesAccessibility = wheelchairOnly ? a.accessibility.includes('Wheelchair') : true;
    return matchesSearch && matchesCategory && matchesAccessibility;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explore Incredible India</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
              Discover verified heritage sites, natural wonders, and accessible destinations across the country.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
              <Star size={18} className="fill-orange-500" />
              <span>Top Monuments & Sites</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by city (e.g. Delhi) or monument (e.g. Taj Mahal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors">
              <Filter size={18} />
              <span>More Filters</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Types
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
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
            <label htmlFor="wheelchair" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ♿ Wheelchair Accessible Only
            </label>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction, index) => (
            <div
              key={attraction.id}
              onClick={() => setSelectedAttraction(attraction)}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col hover:-translate-y-1 animate-fade-in-up opacity-0"
              style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                <img src={attraction.image} alt={attraction.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white text-sm font-semibold flex items-center gap-1"><Info size={16}/> Click for details</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{attraction.name}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mb-4">
                  <MapPin size={14} />
                  {attraction.location}
                </div>

                <div className="flex items-center justify-between mb-4 mt-auto">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900 dark:text-white">{attraction.rating}</span>
                  </div>
                  <span className="text-xs font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-800">
                    {attraction.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAttractions.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No monuments found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Try adjusting your search criteria, selecting a different category, or searching for a different city.</p>
          </div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedAttraction(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Large Image Header */}
            <div className="h-64 sm:h-72 w-full relative shrink-0 bg-gray-200 dark:bg-gray-800">
              <img src={selectedAttraction.image} alt={selectedAttraction.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2 block">{selectedAttraction.category}</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{selectedAttraction.name}</h2>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={16} />
                  <span>{selectedAttraction.location}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-xl flex items-center gap-2">
                  <Star className="fill-orange-500" size={18} />
                  <span className="font-bold">{selectedAttraction.rating} Rating</span>
                </div>
                {selectedAttraction.accessibility.map(acc => (
                  <div key={acc} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                    {acc === 'Wheelchair' ? '♿' : '👁️'} {acc}
                  </div>
                ))}
              </div>

              {/* Wikipedia-style Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <BookOpen size={20} className="text-orange-500" /> 
                  About {selectedAttraction.name}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {selectedAttraction.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                  Read full article on Wikipedia <X size={14} className="rotate-45" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <button className="py-3.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold transition-colors">
                  Add to My Trip
                </button>
                <button className="py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors shadow-md shadow-orange-500/20">
                  View on Map
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
