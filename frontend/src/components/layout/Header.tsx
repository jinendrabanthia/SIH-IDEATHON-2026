import React, { useState } from 'react';
import { Search, Sun, Moon, Globe, User, LogOut, Settings, LayoutDashboard, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { AuthModal } from '../ui/AuthModal';

import { useTheme } from '../../lib/ThemeContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { isDark, toggle } = useTheme();
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: <LayoutDashboard size={15} /> },
    { path: '/plan-trip', label: t('nav.planTrip', 'Plan Trip') },
    { path: '/explore', label: t('nav.exploreIndia', 'Explore India') },
    { path: '/maps', label: t('nav.maps', 'Maps') },
    { path: '/my-trips', label: t('nav.myTrips', 'My Trips') },
    { path: '/favorites', label: t('nav.favorites', 'Favorites') },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 z-30 gap-4 transition-colors">
      
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Nav Links - Hidden on Mobile */}
      <nav className="hidden lg:flex items-center gap-0.5">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              isActive(link.path)
                ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-b-2 border-green-500'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {link.icon && <span>{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 lg:w-96 pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={18} className="text-gray-200" /> : <Moon size={18} className="text-gray-600" />}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Globe size={15} />
            <span className="text-xs">{i18n.language.toUpperCase()}</span>
          </button>
          {showLanguageMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setShowLanguageMenu(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200 ${
                    i18n.language === lang.code ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold' : ''
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth / Profile Menu */}
        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 transition-colors flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500"
              >
                <span className="text-lg font-bold text-white">{user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}</span>
              </button>
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 w-48">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name || 'User Account'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <User size={15} /> Profile
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <Settings size={15} /> Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700"></div>
                  <button 
                    onClick={() => { setShowProfileMenu(false); logout(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors"
            >
              <User size={15} /> Sign In
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
};
