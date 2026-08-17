import React, { useState } from 'react';
import { Search, Cloud, Accessibility } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroBg from '/hero-image/hero-bg.jpg';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

// Custom icons to match the image exactly
const ShieldTickIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="mb-8">
      {/* ── HERO CONTAINER ── */}
      <div className="relative w-full rounded-[32px] overflow-hidden shadow-sm" style={{ minHeight: '520px' }}>
        
        {/* Background Image */}
        <img
          src={heroBg}
          alt="Taj Mahal"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />

        {/* Warm Cream Gradient Overlay (Matches the image fade) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(255, 251, 244, 1) 0%, rgba(255, 251, 244, 0.95) 28%, rgba(255, 251, 244, 0.6) 45%, rgba(255, 255, 255, 0) 65%)',
          }}
        />

        {/* ── LEFT CONTENT CONTENT ── */}
        <div className="relative z-10 flex flex-col justify-center px-12 pt-16 pb-32" style={{ maxWidth: '65%' }}>
          
          {/* Paper-plane + dotted trail */}
          <div className="absolute top-12 left-[300px] pointer-events-none select-none">
            <svg viewBox="0 0 200 60" width="150" height="60" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
              <path
                d="M 10 45 Q 60 20, 110 25 Q 140 28, 165 10"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeDasharray="4 5"
                opacity="0.9"
              />
              <g transform="translate(162, 5) rotate(-35)">
                <polygon points="0,0 12,4 0,8 3,4" fill="#16a34a" />
              </g>
            </svg>
          </div>

          {/* Heading with 3 Custom Gradient Lines */}
          <h1 className="text-[52px] lg:text-[72px] font-black leading-[1.05] tracking-tight mb-5">
            <div
              style={{
                background: 'linear-gradient(90deg, #F97316 0%, #F97316 12%, #0f172a 25%, #0f172a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Explore
            </div>
            <div
              style={{
                background: 'linear-gradient(90deg, #15803d 0%, #15803d 18%, #0f172a 32%, #0f172a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Incredible
            </div>
            <div
              style={{
                background: 'linear-gradient(90deg, #15803d 0%, #15803d 30%, #F97316 60%, #F97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                paddingRight: '10px' // Prevent clipping of italic/large fonts
              }}
            >
              India
            </div>
          </h1>

          {/* Subtitle */}
          <p className="text-[17px] text-gray-600 leading-relaxed mb-8" style={{ maxWidth: '380px' }}>
            {t(
              'hero.exploreDesc',
              'Discover verified places, smart itineraries and real-time travel insights across India.'
            )}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div
              className="flex items-center rounded-full bg-white p-2"
              style={{ 
                maxWidth: '420px', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.06), 0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              <Search className="ml-4 text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Where do you want to explore?')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 pl-3 pr-3 py-3 text-[15px] bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                className="w-12 h-11 rounded-full bg-[#16a34a] hover:bg-green-600 active:scale-95 text-white transition-all flex items-center justify-center shrink-0 mr-1"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* ── BOTTOM FLOATING BADGES ── */}
        <div className="absolute bottom-6 left-6 right-6">
          <div 
            className="flex items-center justify-between bg-white rounded-full px-8 py-5"
            style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
          >
            {/* Badge 1 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <ShieldTickIcon className="w-7 h-7 text-green-600" />
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">Verified Places</p>
                <p className="text-[13px] text-gray-400">100% Trusted</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-100"></div>

            {/* Badge 2 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <Cloud className="w-7 h-7 text-blue-400" />
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">Live Weather</p>
                <p className="text-[13px] text-gray-400">Real-time Updates</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-100"></div>

            {/* Badge 3 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <Accessibility className="w-7 h-7 text-purple-600" />
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">Accessible Travel</p>
                <p className="text-[13px] text-gray-400">Explore Friendly</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-100"></div>

            {/* Badge 4 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <LockIcon className="w-7 h-7 text-orange-500" />
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">Secure & Safe</p>
                <p className="text-[13px] text-gray-400">Govt. Verified</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
