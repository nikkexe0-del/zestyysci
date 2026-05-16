import React, { useState, useEffect } from 'react';
import { getCurrentApiUrl } from '../services/apiService';

const Navbar = ({ activeSection, setActiveSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(true); // optimistic, hide error until confirmed

  useEffect(() => {
    let cancelled = false;
    getCurrentApiUrl().then(url => {
      if (!cancelled) setApiConfigured(!!url);
    }).catch(() => {
      if (!cancelled) setApiConfigured(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">ZestyyScii</h1>
            {!apiConfigured && (
              <p className="text-xs text-red-500">API not configured</p>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('scienceandfun')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeSection === 'scienceandfun'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              📚 Courses
            </button>

            <button
              onClick={() => setActiveSection('leaderboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeSection === 'leaderboard'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3">
            <div className="px-2 pt-2 space-y-1">
              <button
                onClick={() => { setActiveSection('scienceandfun'); setMobileMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeSection === 'scienceandfun'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                📚 Courses
              </button>

              <button
                onClick={() => { setActiveSection('leaderboard'); setMobileMenuOpen(false); }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                  activeSection === 'leaderboard'
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                🏆 Leaderboard
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
