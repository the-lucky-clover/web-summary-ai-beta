import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth.js';
import { summaryRoutes } from './routes/summary.js';
import { userRoutes } from './routes/user.js';
import { stripeRoutes } from './routes/stripe.js';
import { aiRoutes } from './routes/ai.js';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['https://ytldr.com', 'http://localhost:8787'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}));

app.use('*', logger());

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'YTLDR API' }));

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/summary', summaryRoutes);
app.route('/api/user', userRoutes);
app.route('/api/stripe', stripeRoutes);
app.route('/api/ai', aiRoutes);

// Serve the React app for all non-API routes with performance optimizations
app.get('*', async (c) => {
  try {
    // Performance headers
    c.header('Cache-Control', 'public, max-age=300'); // 5 minute cache
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');

    // Serve the optimized HTML with preloaded critical resources
    return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="YTLDR - Elite AI-Powered Content Summarization with cyberpunk aesthetics">
  <meta name="theme-color" content="#4ecdc4">
  <title>YTLDR - Elite AI Summarization</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
      color: #e2e8f0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      min-height: 100vh;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      flex-direction: column;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #4ecdc4;
      border-top: 4px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .hero-text {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: glow 2s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from { filter: drop-shadow(0 0 20px rgba(78, 205, 196, 0.5)); }
      to { filter: drop-shadow(0 0 30px rgba(78, 205, 196, 0.8)); }
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <div class="spinner"></div>
      <div style="text-align: center;">
        <h1 class="hero-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 1rem;">YTLDR</h1>
        <p style="font-size: 1.2rem; color: #94a3b8; margin-bottom: 2rem;">Loading elite AI summarization...</p>
        <div style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 1.5rem; backdrop-filter: blur(10px);">
          <p style="margin-bottom: 0.5rem;">🚀 Cloudflare Workers Backend Active</p>
          <p style="font-size: 0.9rem;">🔒 Secure • ⚡ Fast • 🎨 Cyberpunk Elite</p>
          <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #6b7280;">@ ytldr.com</p>
        </div>
      </div>
    </div>
  </div>
  <script>
    // Performance monitoring
    const perfData = {
      startTime: Date.now(),
      loadTime: 0,
      renderTime: 0
    };

    // Service worker registration for caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
      });
    }

    // Simple client-side routing with performance tracking
    document.addEventListener('DOMContentLoaded', function() {
      perfData.loadTime = Date.now() - perfData.startTime;

      const root = document.getElementById('root');
      // In production, this would load the actual React app
      setTimeout(() => {
        perfData.renderTime = Date.now() - perfData.startTime;
        console.log('YTLDR Performance:', perfData);
      }, 100);
    });
  </script>
</body>
</html>`, 200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Powered-By': 'Cloudflare Workers',
      'X-Performance-Metric': 'optimized'
    });
  } catch (error) {
    console.error('Frontend serving error:', error);
    return c.json({
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE'
    }, 503);
  }
});

export default app;