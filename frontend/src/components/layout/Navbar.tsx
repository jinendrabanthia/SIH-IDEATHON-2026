import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language || 'en';

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3.5 transition-transform hover:scale-[1.01]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20 shrink-0">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                {t('app.title')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3 w-3" />
                Trustworthy
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              location.pathname === '/'
                ? 'bg-orange-50 text-orange-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/planner"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
              location.pathname === '/planner'
                ? 'bg-orange-50 text-orange-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="h-4 w-4 text-orange-600" />
            {t('nav.planner')}
          </Link>
          <Link
            to="/explore"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              location.pathname === '/explore'
                ? 'bg-orange-50 text-orange-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('nav.attractions')}
          </Link>
          <Link
            to="/analytics"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
              location.pathname === '/analytics'
                ? 'bg-orange-50 text-orange-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Analytics
          </Link>
        </nav>

        {/* Language Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                currentLang.startsWith('en')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => handleLanguageChange('hi')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                currentLang.startsWith('hi')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => handleLanguageChange('or')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                currentLang.startsWith('or')
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
          </div>

          <Link to="/planner">
            <Button size="default" className="hidden sm:inline-flex rounded-xl font-bold">
              {t('hero.startPlanning')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
