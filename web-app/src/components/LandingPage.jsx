import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsTyping(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">YT</span>
            </div>
            <span className="text-xl font-bold">YTldr</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#extensions" className="text-gray-300 hover:text-white transition-colors">Extensions</a>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Privacy-First
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                AI Summarization
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience secure, transparent AI summarization powered by Google Gemini.
              No data harvesting, no hidden tracking - just pure privacy-first content processing.
            </p>

            {/* Search Input Pill */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder="Enter URL, paste content, or describe what you need..."
                    className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                    style={{
                      boxShadow: isTyping
                        ? '0 0 30px rgba(56, 189, 248, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-3 rounded-full hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                'Privacy-First Design',
                'Google Gemini AI',
                'Batch URL Processing',
                'Browser Extensions',
                'No Data Harvesting',
                'Transparent Processing'
              ].map((feature, index) => (
                <span
                  key={feature}
                  className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">10M+</div>
                <div className="text-gray-400">Summaries Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">50ms</div>
                <div className="text-gray-400">Response Time</div>
              </div>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Privacy-First AI Features
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Zero Data Harvesting',
                  description: 'Your data stays yours. No tracking, no selling, no hidden data collection.'
                },
                {
                  icon: '🤖',
                  title: 'Google Gemini AI',
                  description: 'Powered by Google\'s most advanced AI model for accurate, contextual summaries.'
                },
                {
                  icon: '📱',
                  title: 'Browser Extensions',
                  description: 'Chrome, Safari iOS, and Safari macOS extensions for seamless integration.'
                },
                {
                  icon: '⚡',
                  title: 'Batch Processing',
                  description: 'Process multiple URLs simultaneously with our efficient batch summarization.'
                },
                {
                  icon: '👁️',
                  title: 'Transparent Processing',
                  description: 'View detailed logs of all processing activity. Complete transparency guaranteed.'
                },
                {
                  icon: '🛡️',
                  title: 'Secure API Keys',
                  description: 'Your Gemini API key is stored securely and never leaves your device.'
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Our Story
              </span>
            </h2>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p className="text-lg">
                  We were initially surprised to learn about the potentially evil exodus of personal data being leaked from popular summarization extensions. The privacy announcement was fed to consumers saying "we don't want your data" - but we felt fleeced.
                </p>

                <p>
                  Yet we recalled the age-old adage: <em>"if the product is free, you are the product."</em> It's true! We were in the process of reporting these data-leaking extensions when we discovered something remarkable.
                </p>

                <p>
                  Through curiosity itself, we set out to improve on the concept we discovered. I had never reverse engineered anything before, and it was exhilarating! Finding hidden data leaking extensions made us feel like bug bounty hunters.
                </p>

                <p>
                  That's why we built YTldr - a privacy-first alternative that charges a modest amount to maintain true data privacy. No data harvesting, no hidden tracking, just transparent, secure AI summarization powered by Google Gemini.
                </p>

                <div className="border-l-4 border-cyan-400 pl-6 mt-8">
                  <p className="text-cyan-400 font-medium italic">
                    "Building trust through transparency and charging fairly for privacy protection."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Trial */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold mb-4">7-Day Free Trial</h3>
                <div className="text-4xl font-black mb-4">$0</div>
                <ul className="text-gray-400 space-y-2 mb-8">
                  <li>• Full access to all features</li>
                  <li>• Google Gemini AI summaries</li>
                  <li>• Batch URL processing</li>
                  <li>• Browser extensions</li>
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  Start Free Trial
                </button>
              </div>

              {/* Monthly */}
              <div className="bg-white/5 backdrop-blur-sm border border-cyan-400/50 rounded-2xl p-8 text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-400 text-black px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-2xl font-bold mb-4">Monthly</h3>
                <div className="text-4xl font-black mb-4">$1.99</div>
                <ul className="text-gray-400 space-y-2 mb-8">
                  <li>• Everything in Free Trial</li>
                  <li>• Unlimited summaries</li>
                  <li>• Priority processing</li>
                  <li>• Data broker removal</li>
                  <li>• Cancel anytime</li>
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
                >
                  Subscribe Monthly
                </button>
              </div>

              {/* Annual */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-2xl font-bold mb-4">Annual</h3>
                <div className="text-4xl font-black mb-2">$19.99</div>
                <div className="text-green-400 text-sm mb-4">Save 17%</div>
                <ul className="text-gray-400 space-y-2 mb-8">
                  <li>• Everything in Monthly</li>
                  <li>• 2 months free</li>
                  <li>• Advanced features</li>
                  <li>• Premium support</li>
                  <li>• Early access to updates</li>
                </ul>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                >
                  Subscribe Annual
                </button>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold mb-3">🔒 Secure Payments with Stripe</h3>
                <p className="text-gray-400 mb-4">
                  All subscriptions are processed securely through Stripe with bank-grade encryption.
                  Your payment information is never stored on our servers.
                </p>
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
                  <span>🔐 SSL Encrypted</span>
                  <span>•</span>
                  <span>💳 PCI Compliant</span>
                  <span>•</span>
                  <span>🛡️ Fraud Protection</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extensions Section */}
        <section id="extensions" className="py-20 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Browser Extensions
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Download YTldr for your preferred browser and platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-xl font-bold mb-3">Chrome Extension</h3>
                <p className="text-gray-400 mb-4">Full-featured extension with Gemini integration</p>
                <div className="text-2xl font-bold text-cyan-400 mb-2">FREE</div>
                <button className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300">
                  Download Chrome
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">🦊</div>
                <h3 className="text-xl font-bold mb-3">Firefox Extension</h3>
                <p className="text-gray-400 mb-4">Premium cross-platform extension with native performance</p>
                <div className="text-2xl font-bold text-orange-400 mb-2">$4.99</div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all duration-300">
                  Firefox Add-ons - $4.99
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">💙</div>
                <h3 className="text-xl font-bold mb-3">Edge Extension</h3>
                <p className="text-gray-400 mb-4">Native Windows integration with premium UX</p>
                <div className="text-2xl font-bold text-blue-400 mb-2">$4.99</div>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                  Edge Add-ons - $4.99
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-3">Safari iOS</h3>
                <p className="text-gray-400 mb-4">Premium mobile experience with native iOS design</p>
                <div className="text-2xl font-bold text-green-400 mb-2">$4.99</div>
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300">
                  App Store - $4.99
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">🖥️</div>
                <h3 className="text-xl font-bold mb-3">Safari macOS</h3>
                <p className="text-gray-400 mb-4">Native macOS application with premium design</p>
                <div className="text-2xl font-bold text-purple-400 mb-2">$4.99</div>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300">
                  Mac App Store - $4.99
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="text-4xl mb-4">🐧</div>
                <h3 className="text-xl font-bold mb-3">Linux Native</h3>
                <p className="text-gray-400 mb-4">Premium native Linux application with GTK design</p>
                <div className="text-2xl font-bold text-yellow-400 mb-2">$4.99</div>
                <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-300">
                  Flathub - $4.99
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">💎 Premium Design & UX Excellence</h3>
                <p className="text-gray-400 mb-6">
                  Every YTldr application is crafted with meticulous attention to design and user experience.
                  Native platform integration, beautiful animations, and intuitive workflows that set the standard for AI applications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎨</div>
                    <h4 className="font-bold mb-2">Native Design Language</h4>
                    <p className="text-sm text-gray-400">Each platform uses its native design system - Material Design on Android, Human Interface Guidelines on iOS, Fluent Design on Windows.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <h4 className="font-bold mb-2">Performance Optimized</h4>
                    <p className="text-sm text-gray-400">Lightning-fast AI processing with smooth 60fps animations and instant responsiveness across all platforms.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <h4 className="font-bold mb-2">Privacy by Design</h4>
                    <p className="text-sm text-gray-400">Zero data collection, local processing, and transparent operation logs that you can review anytime.</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="font-bold mb-4">💰 Premium Pricing Strategy</h4>
                  <p className="text-gray-400 mb-4">
                    $4.99 one-time purchase reflects our commitment to quality. Each application is professionally designed,
                    thoroughly tested, and maintained with regular updates. This pricing supports sustainable development
                    while remaining accessible to users who value privacy and quality.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-cyan-400 font-bold">FREE</div>
                      <div className="text-gray-500">Chrome Extension</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-bold">$4.99</div>
                      <div className="text-gray-500">Premium Native Apps</div>
                    </div>
                    <div>
                      <div className="text-purple-400 font-bold">$1.99/mo</div>
                      <div className="text-gray-500">Web Subscription</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"> Privacy-First AI</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join users who value their privacy and data security
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Start Free Trial
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;