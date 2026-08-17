import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ArrowLeft, MapPin, IndianRupee, Clock, Star, Calendar, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Mock data mapping
const destinationData: Record<string, any> = {
  'manali': {
    name: 'Manali',
    state: 'Himachal Pradesh',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&h=600&fit=crop',
    budget: '₹12,000 - ₹18,000',
    duration: '4-5 Days',
    bestTime: 'October to June',
    about: 'Manali is a high-altitude Himalayan resort town in India’s northern Himachal Pradesh state. It has a reputation as a backpacking center and honeymoon destination. Set on the Beas River, it’s a gateway for skiing in the Solang Valley and trekking in Parvati Valley.',
    highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Old Manali']
  },
  'jaipur': {
    name: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&h=600&fit=crop',
    budget: '₹8,000 - ₹15,000',
    duration: '3-4 Days',
    bestTime: 'October to March',
    about: 'Jaipur is the capital of India’s Rajasthan state. It evokes the royal family that once ruled the region and that, in 1727, founded what is now called the Old City, or “Pink City” for its trademark building color.',
    highlights: ['Hawa Mahal', 'Amber Palace', 'City Palace', 'Jantar Mantar']
  },
  'varanasi': {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&h=600&fit=crop',
    budget: '₹6,000 - ₹12,000',
    duration: '2-3 Days',
    bestTime: 'October to March',
    about: 'Varanasi is a city in the northern Indian state of Uttar Pradesh dating to the 11th century B.C. Regarded as the spiritual capital of India, the city draws Hindu pilgrims who bathe in the Ganges River’s sacred waters.',
    highlights: ['Dashashwamedh Ghat', 'Kashi Vishwanath', 'Ganga Aarti', 'Sarnath']
  },
  'kerala': {
    name: 'Kerala',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=600&fit=crop',
    budget: '₹15,000 - ₹25,000',
    duration: '5-7 Days',
    bestTime: 'September to March',
    about: 'Kerala, a state on India\'s tropical Malabar Coast, has nearly 600km of Arabian Sea shoreline. It\'s known for its palm-lined beaches and backwaters, a network of canals.',
    highlights: ['Munnar Tea Gardens', 'Alleppey Backwaters', 'Wayanad', 'Kochi']
  },
  'goa': {
    name: 'Goa',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&h=600&fit=crop',
    budget: '₹10,000 - ₹20,000',
    duration: '3-5 Days',
    bestTime: 'November to February',
    about: 'Goa is a state in western India with coastlines stretching along the Arabian Sea. Its long history as a Portuguese colony prior to 1961 is evident in its preserved 17th-century churches and the area’s tropical spice plantations.',
    highlights: ['Baga Beach', 'Dudhsagar Falls', 'Basilica of Bom Jesus', 'Fort Aguada']
  },
  'agra': {
    name: 'Agra',
    state: 'Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&h=600&fit=crop',
    budget: '₹5,000 - ₹10,000',
    duration: '1-2 Days',
    bestTime: 'October to March',
    about: 'Agra is a city on the banks of the Yamuna river in the northern state of Uttar Pradesh, India. It is a major tourist destination because of its many Mughal-era buildings, most notably the Taj Mahal.',
    highlights: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Fatehpur Sikri']
  },
  'darjeeling': {
    name: 'Darjeeling',
    state: 'West Bengal',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop',
    budget: '₹10,000 - ₹18,000',
    duration: '3-5 Days',
    bestTime: 'April to June',
    about: 'Darjeeling is a town in India\'s West Bengal state, in the Himalayan foothills. Once a summer resort for the British Raj elite, it remains the terminus of the narrow-gauge Darjeeling Himalayan Railway, or "Toy Train". It\'s famed for the distinctive black tea grown on plantations that dot its surrounding slopes.',
    highlights: ['Tiger Hill', 'Darjeeling Himalayan Railway', 'Batasia Loop', 'Tea Gardens']
  },
  'mysore': {
    name: 'Mysore',
    state: 'Karnataka',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=600&fit=crop',
    budget: '₹5,000 - ₹10,000',
    duration: '2-3 Days',
    bestTime: 'October to February',
    about: 'Mysore (or Mysuru), a city in India\'s southwestern Karnataka state, was the capital of the Kingdom of Mysore from 1399 to 1947. In its center is opulent Mysore Palace, seat of the former ruling Wodeyar dynasty.',
    highlights: ['Mysore Palace', 'Chamundeshwari Temple', 'Brindavan Gardens', 'Devaraja Market']
  },
  // Default fallback for others
  'default': {
    name: 'Destination',
    state: 'India',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=600&fit=crop',
    budget: '₹10,000 - ₹20,000',
    duration: '3-5 Days',
    bestTime: 'September to March',
    rating: 4.5,
    about: 'A beautiful destination in India offering rich cultural experiences, stunning landscapes, and unforgettable memories for every traveler.',
    highlights: ['Local Culture', 'Historical Sites', 'Scenic Views', 'Local Cuisine']
  }
};

export const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const destId = id?.toLowerCase() || 'default';
  const data = destinationData[destId] || { ...destinationData['default'], name: id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Destination' };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Explore
        </button>

        {/* Hero Section */}
        <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-lg">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback image if network or unsplash fails
              e.currentTarget.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=600&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <MapPin size={18} />
              <span className="font-medium tracking-wide">{data.state}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{data.name}</h1>
            <div className="flex items-center gap-4 text-white">
              {/* Rating removed as requested */}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="text-orange-500" />
                About {data.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                {data.about}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Top Highlights</h2>
              <div className="grid grid-cols-2 gap-4">
                {data.highlights.map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 font-medium">
                    <span className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-800/30 flex items-center justify-center text-sm">✨</span>
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar / Budget */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              <h3 className="text-xl font-bold mb-6 opacity-90">Trip Estimation</h3>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Estimated Budget</p>
                  <div className="flex items-center gap-2 text-2xl font-black">
                    <IndianRupee size={24} />
                    {data.budget}
                  </div>
                  <p className="text-xs text-orange-200 mt-1">per person (approx)</p>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <p className="text-orange-100 text-sm font-medium mb-1 flex items-center gap-2">
                    <Clock size={16} /> Ideal Duration
                  </p>
                  <p className="text-lg font-bold">{data.duration}</p>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <p className="text-orange-100 text-sm font-medium mb-1 flex items-center gap-2">
                    <Calendar size={16} /> Best Time to Visit
                  </p>
                  <p className="text-lg font-bold">{data.bestTime}</p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/plan-trip')}
                className="w-full mt-8 bg-white text-orange-600 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
              >
                Plan a Trip Here
              </button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};
