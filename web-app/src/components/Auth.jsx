import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎭 Magic link sent! Check your email and click the link to sign in.');
      } else {
        setMessage(data.error || 'Failed to send magic link');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Cyberpunk Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-4">
              YTLDR
            </h1>
            <p className="text-gray-400">Elite Access Portal</p>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-400"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-bold text-white hover:from-cyan-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending Magic Link...</span>
                </div>
              ) : (
                '🎭 Send Magic Link'
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${
              message.includes('sent')
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-red-500/20 border border-red-500/50 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              No passwords required. Just magic links sent to your email.
            </p>
          </div>

          {/* Cyberpunk Accents */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;