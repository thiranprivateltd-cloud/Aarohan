import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import api from '../services/api';

export const Layout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { cycleFontSize, highContrast, setHighContrast } = useAccessibility();
  const navigate = useNavigate();

  const handleLanguageChange = async (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    if (isAuthenticated) {
      try {
        await api.post('/users/profile', { language: lang });
      } catch (err) {
        console.warn('Failed to update language in backend profile');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isEducatorRole = user?.role === 'educator' || user?.email?.includes('educator');
  const isAdminRole = user?.role === 'admin' || user?.email?.includes('admin');

  return (
    <div className={`min-h-screen flex flex-col bg-[#FDF6EC] text-slate-900 font-lexend ${highContrast ? 'bg-black text-white' : ''}`}>
      {/* Explicit Terracotta Header Background (#C4623A) with High-Contrast White Text */}
      <header className="bg-[#C4623A] text-white shadow-md sticky top-0 z-30" role="banner" style={{ backgroundColor: '#C4623A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2 font-lexend text-white hover:text-amber-100" aria-label="Aarohan Homepage">
            <span aria-hidden="true">🧠</span> {t('brand')}
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 text-xs sm:text-sm font-medium" role="navigation" aria-label="Main Navigation">
            {/* 10 Language Select Dropdown */}
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <select
              id="language-select"
              value={i18n.language}
              onChange={handleLanguageChange}
              aria-label="Select Interface Language"
              className="bg-[#8C3D1D] text-white px-2.5 py-1 rounded text-xs border border-amber-200/40 focus:outline-none focus:ring-2 focus:ring-white font-bold"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="ta" className="bg-slate-800 text-white">தமிழ் (Tamil)</option>
              <option value="hi" className="bg-slate-800 text-white">हिंदी (Hindi)</option>
              <option value="te" className="bg-slate-800 text-white">తెలుగు (Telugu)</option>
              <option value="kn" className="bg-slate-800 text-white">ಕನ್ನಡ (Kannada)</option>
              <option value="ml" className="bg-slate-800 text-white">മലയാളം (Malayalam)</option>
              <option value="bn" className="bg-slate-800 text-white">বাংলা (Bengali)</option>
              <option value="mr" className="bg-slate-800 text-white">मराठी (Marathi)</option>
              <option value="gu" className="bg-slate-800 text-white">ગુજરાતી (Gujarati)</option>
              <option value="pa" className="bg-slate-800 text-white">ਪੰਜਾਬੀ (Punjabi)</option>
            </select>

            {/* Font Size Toggle */}
            <button
              onClick={cycleFontSize}
              aria-label="Adjust font scaling size"
              className="bg-[#8C3D1D] hover:bg-[#6F2F16] text-white px-2 py-1 rounded text-xs font-bold focus:ring-2 focus:ring-white"
            >
              A±
            </button>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              aria-label="Toggle high contrast accessibility mode"
              className="bg-[#8C3D1D] hover:bg-[#6F2F16] text-white px-2 py-1 rounded text-xs font-bold focus:ring-2 focus:ring-white"
            >
              🌓
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-amber-100 font-semibold hidden sm:inline">{t('dashboard')}</Link>
                <Link to="/lesson" className="text-white hover:text-amber-100 font-semibold">{t('lesson')}</Link>
                {isEducatorRole && (
                  <Link to="/educator" className="text-white hover:text-amber-100 font-bold bg-[#8C3D1D] px-2.5 py-1 rounded">{t('educatorPortal')}</Link>
                )}
                {isAdminRole && (
                  <Link to="/admin" className="text-white hover:text-amber-100 font-bold bg-[#8C3D1D] px-2.5 py-1 rounded">{t('adminPanel')}</Link>
                )}
                <button
                  onClick={handleLogout}
                  aria-label="Log out of account"
                  className="bg-[#2F5233] hover:bg-[#244127] text-white px-3 py-1.5 rounded transition font-bold focus:ring-2 focus:ring-white"
                  style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-amber-100 font-semibold">{t('login')}</Link>
                <Link to="/signup" className="bg-white text-[#C4623A] hover:bg-amber-50 px-3 py-1.5 rounded font-bold transition focus:ring-2 focus:ring-white">
                  {t('signup')}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8" role="main" id="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-amber-100/80 text-slate-800 text-xs py-4 text-center border-t border-amber-300/60 font-semibold" role="contentinfo">
        Aarohan — {t('tagline')}
      </footer>
    </div>
  );
};
