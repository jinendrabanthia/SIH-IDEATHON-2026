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
      <div className="relative w-full rounded-[28px] overflow-hidden shadow-sm mx-2" style={{ minHeight: '640px' }}>
        
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
          
          {/* Heading */}
          <div className="relative mb-5">
            {/* Paper-plane trail */}
            <div className="absolute pointer-events-none" style={{ top: '-10px', left: '240px' }}>
              <svg viewBox="0 0 200 70" width="160" height="70" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                <path
                  d="M 5 60 Q 55 30, 105 35 Q 145 38, 170 10"
                  fill="none"
                  stroke="url(#planeGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="5 7"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="planeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <g transform="translate(167, 6) rotate(-35)">
                  <polygon points="0,0 13,5 0,10 3,5" fill="#16a34a" />
                </g>
              </svg>
            </div>

            <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.05, letterSpacing: '-1.5px', fontSize: '76px', fontWeight: 700, margin: 0 }}>
              {/* EXPLORE: orange -> dark navy */}
              <span style={{
                background: 'linear-gradient(90deg, #f97316 0%, #f97316 18%, #1e3a5f 42%, #0f2d4a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'block'
              }}>Explore</span>

              {/* INCREDIBLE: green -> teal -> dark navy */}
              <span style={{
                background: 'linear-gradient(90deg, #16a34a 0%, #16a34a 18%, #0d9488 35%, #0369a1 50%, #1e3a5f 65%, #0f2d4a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'block'
              }}>Incredible</span>

              {/* INDIA: per-letter saffron -> green (reliable, no background-clip) */}
              <span style={{ display: 'block', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit' }}>
                <span style={{ color: '#f97316' }}>I</span>
                <span style={{ color: '#fb923c' }}>n</span>
                <span style={{ color: '#d4a017' }}>d</span>
                <span style={{ color: '#4ade80' }}>i</span>
                <span style={{ color: '#16a34a' }}>a</span>
              </span>
            </h1>
          </div>

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
