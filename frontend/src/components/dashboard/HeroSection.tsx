import React, { useState } from 'react';
import { Search, Cloud, Handshake, ShieldCheck } from 'lucide-react';
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
    { icon: <ShieldCheck size={18} />, label: t('hero.verifiedPlaces', 'Verified Places'), description: t('hero.trustedDesc', 'Powered by AI Trust'), color: 'text-green-600' },
    { icon: <Cloud size={18} />, label: t('hero.liveWeather', 'Live Updates'), description: t('hero.weatherDesc', 'Weather & Alerts'), color: 'text-blue-500' },
    { icon: <Handshake size={18} />, label: t('hero.accessible', 'Smart Itineraries'), description: t('hero.accessibleDesc', 'Personalized Plans'), color: 'text-purple-500' },
    { icon: <ShieldCheck size={18} />, label: t('hero.secureLabel', 'Platform Impact'), description: t('hero.secureDesc', 'Live Analytics'), color: 'text-orange-500' },
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
      <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
        {/* Top part: text left + image right */}
        <div className="flex" style={{ minHeight: '340px' }}>
          {/* Left — text pane */}
          <div
            className="flex flex-col justify-between p-8 bg-slate-900"
            style={{
              width: '52%',
            }}
          >


            {/* Title */}
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-3"
                  style={{
                    background: 'linear-gradient(90deg, #f97316 0%, #f97316 28%, #ffffff 38%, #ffffff 58%, #22c55e 68%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent'
                  }}>
                Explore Incredible India
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                {t('hero.exploreDesc', 'Access live weather updates, explore popular destinations, and get AI-powered trip summaries across India.')}
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder={t('hero.searchPlaceholder', 'Where do you want to explore?')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-9 pr-4 py-2.5 rounded-l-xl border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-r-xl bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center justify-center"
                >
                  <span className="text-base">→</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right — Taj Mahal image */}
          <div className="flex-1 relative overflow-hidden" style={{ width: '48%' }}>
            <img
              src={heroBg}
              alt="Taj Mahal"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Bottom Strip — Quick Access */}
        <div className="border-t border-gray-100 dark:border-gray-800 grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
          {quickAccessCards.map((card) => (
            <div
              key={card.label}
              className="flex items-center gap-2.5 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              <span className={card.color}>{card.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{card.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
