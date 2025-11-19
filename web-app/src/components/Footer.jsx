import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
              YTLDR
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Elite AI-powered content summarization with cyberpunk aesthetics.
              Built for the modern web with enterprise-grade security.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <span className="text-2xl">𝕏</span>
              </a>
              <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors">
                <span className="text-2xl">𝔻</span>
              </a>
              <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                <span className="text-2xl">𝔾</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">API</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Browser Extension</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 YTLDR. All rights reserved. Built with ❤️ for the cyberpunk elite.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Security</a>
          </div>
        </div>

        {/* Cyberpunk Accent */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>SECURE • PRIVATE • ELITE</span>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
            <span>AI POWERED</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;