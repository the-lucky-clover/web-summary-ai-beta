# YTLDR - Elite AI-Powered Content Summarization

> "YTLDR @ ytldr.com" - Where cyberpunk meets AI excellence

## 🚀 Overview

YTLDR is an elite SaaS platform that combines cutting-edge AI summarization with a stunning cyberpunk-inspired interface. Built for the modern web with Cloudflare Workers, featuring:

- ⚡ **Lightning Fast**: Cloudflare Workers + Gemini 1.5 Flash
- 🎨 **Elite Design**: WW2 IL-Sturmovik Soviet cyberpunk Banksy Mucha fusion
- 🔒 **Secure Auth**: Magic links, email verification, JWT sessions
- 📧 **Homegrown SMTP**: Custom email server (not Gmail)
- 💾 **Scalable Storage**: D1 database + R2 object storage
- 💳 **Monetization Ready**: Stripe integration with subscription tiers
- 🌐 **Multi-Platform**: Web app, browser extensions, mobile apps

## 🛠️ Tech Stack

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Auth**: JWT + Magic Links
- **Email**: Homegrown SMTP Server
- **AI**: Google Gemini 1.5 Flash

### Frontend
- **Framework**: React + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Deployment**: Cloudflare Pages
- **Design**: Cyberpunk elite with Mucha/Banksy influences

### Extensions
- **Chrome**: Manifest V3
- **Safari**: iOS + Mac support
- **Mobile**: React Native + Expo

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Gemini API key
- Stripe account (for monetization)

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/your-org/ytldr.git
cd ytldr/web-app
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Setup Cloudflare resources**
```bash
# Login to Cloudflare
npx wrangler auth login

# Create D1 database
npx wrangler d1 create ytldr-db

# Create R2 bucket
npx wrangler r2 bucket create ytldr-storage

# Run migrations
npm run db:migrate
```

4. **Deploy**
```bash
npm run deploy
```

## 🎨 Design Philosophy

### Elite Cyberpunk Aesthetic
- **WW2 Inspiration**: IL-Sturmovik Soviet aviation motifs
- **Cyberpunk Elements**: Neon grids, holographic interfaces
- **Banksy Influence**: Street art rebellion, social commentary
- **Mucha Style**: Art Nouveau elegance with modern twist
- **Color Palette**: Deep blues (#0f0f23), neon accents (#ff6b6b, #4ecdc4)

### UX Principles
- **Jumbo Text**: Large, impactful typography
- **Bento Box Layout**: Modular, card-based design
- **URL Input Pill**: Prominent, accessible input field
- **Award-Winning UI**: Clean, intuitive, visually stunning

## 📁 Project Structure

```
web-app/
├── src/
│   ├── index.js          # Main Cloudflare Worker
│   ├── routes/
│   │   ├── auth.js       # Authentication endpoints
│   │   ├── summary.js    # AI summarization API
│   │   ├── user.js       # User management
│   │   └── stripe.js     # Payment processing
│   └── utils/
│       └── smtp.js       # Homegrown email server
├── migrations/
│   └── 001_initial_schema.sql
├── public/               # Static assets
├── package.json
├── wrangler.toml         # Cloudflare config
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - Traditional login
- `POST /api/auth/magic-link` - Passwordless login
- `POST /api/auth/verify-email` - Email verification

### Summarization
- `POST /api/summary` - Generate summary
- `GET /api/summary/history` - Get user summaries
- `POST /api/summary/batch` - Batch process URLs

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/usage` - Get usage statistics

## 💳 Monetization

### Subscription Tiers
- **Free**: 50 summaries/month
- **Pro**: 1000 summaries/month - $9.99
- **Elite**: Unlimited - $29.99

### Stripe Integration
- Secure payment processing
- Subscription management
- Usage tracking
- Revenue analytics

## 🌐 Deployment

### Domain Setup
1. Purchase `ytldr.com` domain
2. Configure Cloudflare DNS
3. Set up SSL certificates
4. Deploy Workers to custom domain

### Environment Variables
```toml
JWT_SECRET = "your-jwt-secret"
GEMINI_API_KEY = "your-gemini-key"
STRIPE_SECRET_KEY = "your-stripe-key"
SMTP_SERVER = "smtp.ytldr.com"
```

## 📱 Multi-Platform Support

### Browser Extensions
- **Chrome**: `chrome://extensions` → Load unpacked
- **Safari**: Xcode build for iOS/Mac

### Mobile Apps
- **iOS**: React Native + Expo
- **Android**: React Native + Expo

### Desktop Apps
- **Mac**: Electron wrapper
- **Windows**: Electron wrapper

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Magic Links**: Passwordless authentication
- **Email Verification**: Account security
- **Rate Limiting**: API abuse protection
- **Data Encryption**: Sensitive data protection
- **Audit Logs**: Complete activity tracking

## 📊 Analytics & Monitoring

- **Real-time Metrics**: Usage statistics
- **Error Tracking**: Comprehensive logging
- **Performance Monitoring**: Response times
- **User Analytics**: Behavior insights

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] Mobile app release
- [ ] Safari extension
- [ ] Advanced AI models
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] White-label solutions

## 📞 Support

- **Email**: support@ytldr.com
- **Discord**: [Join our community](https://discord.gg/ytldr)
- **Docs**: [Full documentation](https://docs.ytldr.com)

---

**Built with ❤️ for the cyberpunk elite**

*YTLDR @ ytldr.com*