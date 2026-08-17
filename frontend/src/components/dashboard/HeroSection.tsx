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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
      <div className="relative w-full rounded-[32px] overflow-hidden shadow-sm" style={{ minHeight: '540px' }}>
        
        {/* Background Image */}
        <img
          src={heroBg}
          alt="Taj Mahal"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
        />

        {/* Warm Cream Gradient Overlay (Matches the image fade perfectly) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(255, 251, 244, 1) 0%, rgba(255, 251, 244, 0.98) 25%, rgba(255, 251, 244, 0.7) 45%, rgba(255, 255, 255, 0) 65%)',
          }}
        />

        {/* ── LEFT CONTENT CONTENT ── */}
        <div className="relative z-10 flex flex-col justify-center px-14 pt-16 pb-36" style={{ maxWidth: '65%' }}>
          
          {/* Heading with Exact Gradient Matches */}
          <h1 className="text-[64px] lg:text-[76px] font-black leading-[1.05] tracking-tight mb-5 select-none">
            
            {/* EXPLORE */}
            <div className="relative inline-block">
              <span
                style={{
                  background: 'linear-gradient(90deg, #ea580c 0%, #f97316 20%, #0f172a 40%, #0f172a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                Explore
              </span>
              
              {/* Paper-plane positioned accurately relative to "Explore" */}
              <div className="absolute top-0 right-0 translate-x-[90%] -translate-y-[20%] pointer-events-none">
                <svg viewBox="0 0 200 60" width="160" height="60" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  <path
                    d="M 10 45 Q 60 20, 110 25 Q 140 28, 165 10"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeDasharray="5 6"
                    opacity="0.9"
                  />
                  <g transform="translate(162, 5) rotate(-35)">
                    <polygon points="0,0 12,4 0,8 3,4" fill="#16a34a" />
                  </g>
                </svg>
              </div>
            </div>
            
            <br />
            
            {/* INCREDIBLE */}
            <div
              style={{
                background: 'linear-gradient(90deg, #16a34a 0%, #15803d 30%, #0f172a 55%, #0f172a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              Incredible
            </div>
            
            <br />
            
            {/* INDIA */}
            <div
              style={{
                background: 'linear-gradient(90deg, #16a34a 0%, #15803d 30%, #ea580c 65%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                paddingRight: '10px',
                display: 'inline-block'
              }}
            >
              India
            </div>
          </h1>

          {/* Subtitle */}
          <p className="text-[17px] text-gray-600 font-medium leading-relaxed mb-8" style={{ maxWidth: '400px' }}>
            {t(
              'hero.exploreDesc',
              'Discover verified places, smart itineraries and real-time travel insights across India.'
            )}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch}>
            <div
              className="flex items-center rounded-full bg-white p-1.5"
              style={{ 
                maxWidth: '440px', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
                border: '1px solid rgba(229,231,235,0.5)'
              }}
            >
              <Search className="ml-4 mr-2 text-gray-400 shrink-0" size={20} strokeWidth={2.5} />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder', 'Where do you want to explore?')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-2 py-3.5 text-[15.5px] bg-transparent focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#16a34a] hover:bg-green-600 active:scale-95 text-white transition-all flex items-center justify-center shrink-0 mr-1 shadow-sm"
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
            style={{ 
              boxShadow: '0 12px 35px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid rgba(229,231,235,0.6)'
            }}
          >
            {/* Badge 1 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <ShieldTickIcon className="w-7 h-7 text-[#16a34a]" />
              <div>
                <p className="text-[14.5px] font-bold text-gray-900 leading-snug">Verified Places</p>
                <p className="text-[13.5px] text-gray-400 font-medium">100% Trusted</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-200"></div>

            {/* Badge 2 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <Cloud className="w-7 h-7 text-[#3b82f6]" strokeWidth={2.2} />
              <div>
                <p className="text-[14.5px] font-bold text-gray-900 leading-snug">Live Weather</p>
                <p className="text-[13.5px] text-gray-400 font-medium">Real-time Updates</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-200"></div>

            {/* Badge 3 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <Accessibility className="w-7 h-7 text-[#9333ea]" strokeWidth={2.2} />
              <div>
                <p className="text-[14.5px] font-bold text-gray-900 leading-snug">Accessible Travel</p>
                <p className="text-[13.5px] text-gray-400 font-medium">Explore Friendly</p>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-10 bg-gray-200"></div>

            {/* Badge 4 */}
            <div className="flex items-center gap-4 flex-1 justify-center">
              <LockIcon className="w-7 h-7 text-[#f97316]" />
              <div>
                <p className="text-[14.5px] font-bold text-gray-900 leading-snug">Secure & Safe</p>
                <p className="text-[13.5px] text-gray-400 font-medium">Govt. Verified</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
