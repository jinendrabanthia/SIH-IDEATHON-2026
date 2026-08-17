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

            {/* Paper-plane + dotted trail */}
            <div className="absolute top-6 right-[-30px] pointer-events-none select-none">
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

            {/* Heading — India Tricolor gradient with fade */}
            <h1 className="text-4xl lg:text-5xl font-black leading-[1.15] mb-3">
              <span
                style={{
                  background: 'linear-gradient(90deg, #FF6B00 0%, #FF9933 30%, #1a1a2e 60%, #1a1a2e 70%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Explore
              </span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #1a1a2e 0%, #1a1a2e 30%, #138808 65%, #0a6b05 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Incredible
              </span>
              {' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF9933 0%, #FF9933 25%, #ffffff 45%, #138808 70%, #0a6b05 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 12px rgba(255,153,51,0.3))',
                }}
              >
                India
              </span>
            </h1>

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
                className="flex items-center rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                style={{ maxWidth: '370px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
              >
                <Search className="ml-3 text-gray-400 shrink-0" size={16} />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder', 'Where do you want to explore?')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-2 pr-3 py-2.5 text-sm bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="m-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 text-white transition-all flex items-center justify-center"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
