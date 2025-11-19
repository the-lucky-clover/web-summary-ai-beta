import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const GeminiApiKeyInput = () => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [lastOperation, setLastOperation] = useState(0);

  // Enhanced Security utilities
  const securityUtils = {
    sanitizeInput: useCallback((input) => {
      if (typeof input !== 'string') return '';
      return input
        .trim()
        .replace(/[<>'"&]/g, '')
        .substring(0, 200);
    }, []),

    validateApiKey: useCallback((key) => {
      if (!key || typeof key !== 'string') return false;
      if (!/^AIza[0-9A-Za-z\-_]{35}$/.test(key)) return false;
      const uniqueChars = new Set(key.split('')).size;
      return uniqueChars >= 20;
    }, []),

    checkKeyAge: useCallback((lastUpdated) => {
      if (!lastUpdated) return { status: 'none', days: 0 };
      const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 90) {
        return { status: 'expired', days: Math.floor(daysSinceUpdate) };
      } else if (daysSinceUpdate > 72) { // 80% of 90 days
        return { status: 'warning', days: Math.floor(daysSinceUpdate) };
      }
      return { status: 'healthy', days: Math.floor(daysSinceUpdate) };
    }, []),

    checkRateLimit: useCallback(() => {
      const now = Date.now();
      if (now - lastOperation < 1000) return false;
      setLastOperation(now);
      return true;
    }, [lastOperation]),

    secureCleanup: useCallback(() => {
      setApiKey('');
      if (window.tempApiKey) {
        window.tempApiKey = null;
        delete window.tempApiKey;
      }
    }, [])
  };

  useEffect(() => {
    // Load existing API key from Chrome storage with validation
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey && securityUtils.validateApiKey(result.geminiApiKey)) {
        setApiKey(result.geminiApiKey);
      }
    });

    // Cleanup on unmount
    return () => {
      securityUtils.secureCleanup();
    };
  }, [securityUtils]);

  const handleSave = async () => {
    if (!securityUtils.checkRateLimit()) {
      toast.error('Please wait before performing another action');
      return;
    }

    const sanitizedKey = securityUtils.sanitizeInput(apiKey);

    if (!sanitizedKey) {
      toast.error('Please enter a valid Gemini API key');
      return;
    }

    if (!securityUtils.validateApiKey(sanitizedKey)) {
      toast.error('Invalid Gemini API key format or insufficient entropy');
      return;
    }

    try {
      // Temporary secure storage
      window.tempApiKey = sanitizedKey;

      await chrome.storage.local.set({
        geminiApiKey: sanitizedKey,
        lastUpdated: Date.now(),
        keyVersion: '1.0',
        rotatedAt: Date.now()
      });

      securityUtils.secureCleanup();
      toast.success('Gemini API key saved securely');
    } catch (error) {
      console.warn('Security operation failed:', { context: 'save_api_key', timestamp: Date.now() });
      toast.error('Failed to save API key securely');
      securityUtils.secureCleanup();
    }
  };

  const handleClear = async () => {
    if (!securityUtils.checkRateLimit()) {
      toast.error('Please wait before performing another action');
      return;
    }

    try {
      await chrome.storage.local.remove(['geminiApiKey', 'lastUpdated', 'keyVersion']);
      setApiKey('');
      toast.success('API key cleared securely');
    } catch (error) {
      console.warn('Security operation failed:', { context: 'clear_api_key', timestamp: Date.now() });
      toast.error('Failed to clear API key securely');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
        Google Gemini Flash 2.5 API Key
      </h3>

      <div className="space-y-2">
        <label htmlFor="gemini-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          API Key
        </label>
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            id="gemini-api-key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {isVisible ? (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500"
        >
          Save API Key
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
        >
          Clear
        </button>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Your API key is stored securely in Chrome's local storage and is never transmitted except to Google's Gemini API.</p>
        <p className="mt-1">
          Get your API key from{' '}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800"
          >
            Google AI Studio
          </a>
        </p>
      </div>
    </div>
  );
};

export default GeminiApiKeyInput;