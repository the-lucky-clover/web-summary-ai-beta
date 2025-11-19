import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, setUser }) => {
  const handleLogout = () => {
    localStorage.removeItem('ytldr_token');
    setUser(null);
  };

  return (
    <header className="relative z-50 border-b border-cyan-500/20 backdrop-blur-sm bg-slate-900/80 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Hero Logo in Upper Left */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-pink-400 transition-all duration-300">
              YTLDR
            </div>
            <span className="text-cyan-400 font-mono text-sm group-hover:text-cyan-300 transition-colors duration-300">
              @ ytldr.com
            </span>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/pricing"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* CTA Buttons on Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-cyan-400 font-medium hidden lg:block">
                  Welcome, {user.email.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-all duration-300 hover:border-red-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="px-6 py-2 border-2 border-cyan-500/50 rounded-lg font-bold text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-bold text-white hover:from-cyan-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
                >
                  🚀 Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;