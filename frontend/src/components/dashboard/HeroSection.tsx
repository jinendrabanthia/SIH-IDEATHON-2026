import React, { useState } from 'react';
import { Search, Cloud, ShieldCheck, Accessibility, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroBg from '/hero-image/hero-bg.jpg';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const quickAccessCards = [
    {
      icon: <ShieldCheck size={20} strokeWidth={1.8} />,
      label: 'Verified Places',
      description: '100% Trusted',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: <Cloud size={20} strokeWidth={1.8} />,
      label: 'Live Weather',
      description: 'Real-time Updates',
      color: 'text-blue-400',
      bg: 'bg-blue-50',
    },
    {
      icon: <Accessibility size={20} strokeWidth={1.8} />,
      label: 'Accessible Travel',
      description: 'Explore Friendly',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: <Lock size={20} strokeWidth={1.8} />,
      label: 'Secure & Safe',
      description: 'Govt. Verified',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="mb-6">
      {/* Hero Card */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">

        {/* ── MAIN BANNER: full-width Taj Mahal background ── */}
        <div className="relative overflow-hidden" style={{ minHeight: '240px' }}>

          {/* Background: Taj Mahal full width */}
          <img
            src={heroBg}
            alt="Taj Mahal"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />

          {/* Dark overlay to dim the image */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.30)' }}
          />

          {/* White-to-transparent gradient overlay on left half for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 30%, rgba(255,255,255,0.55) 52%, rgba(255,255,255,0) 68%)',
            }}
          />

          {/* Content pane (left aligned, sits on top of the gradient) */}
          <div className="relative z-10 flex flex-col justify-center px-10 py-9" style={{ maxWidth: '55%' }}>

            {/* Heading — Dark text with India in Tricolor gradient */}
            <div className="relative mb-3">
              {/* Paper-plane + dotted trail positioned relative to the heading */}
              <div className="absolute top-0 right-10 pointer-events-none select-none" style={{ transform: 'translateY(-50%)' }}>
                <svg viewBox="0 0 200 60" width="180" height="60" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                  <path
                    d="M 10 50 Q 60 20, 120 30 Q 160 36, 185 10"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                  <g transform="translate(175, 4) rotate(-35)">
                    <polygon points="0,0 14,5 0,10 3,5" fill="#22c55e" />
                  </g>
                </svg>
              </div>

              <h1 className="text-[44px] lg:text-[56px] font-black leading-[1.1] text-[#0f172a] tracking-tight">
                Explore<br />
                Incredible{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #FF9933 0%, #FF9933 25%, #FFFFFF 50%, #138808 75%, #138808 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))',
                    display: 'inline-block'
                  }}
                >
                  India
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-gray-500 leading-relaxed mb-6" style={{ maxWidth: '300px' }}>
              {t(
                'hero.exploreDesc',
                'Discover verified places, smart itineraries and real-time travel insights across India.'
              )}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch}>
              <div
                className="flex items-center rounded-full border border-gray-200 shadow-sm p-1.5"
                style={{ maxWidth: '400px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}
              >
                <Search className="ml-3 text-gray-400 shrink-0" size={18} />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder', 'Where do you want to explore?')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-3 pr-3 py-2.5 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#138808] hover:bg-green-700 active:scale-95 text-white transition-all flex items-center justify-center"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── BOTTOM STRIP: Quick-access badges ── */}
        <div className="border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100 bg-white">
          {quickAccessCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{card.label}</p>
                <p className="text-xs text-gray-400">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
