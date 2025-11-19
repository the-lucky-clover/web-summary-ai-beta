# ⚡ Web Summary AI

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-00f5ff?style=for-the-badge)
![Privacy](https://img.shields.io/badge/tracking-ZERO-00ff00?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-6366f1?style=for-the-badge)

**AI-powered web page summarization with custom prompts**  
*100% Private • Zero Tracking • Cyberpunk Aesthetic*

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Privacy](#privacy) • [Development](#development)

</div>

---

## 🚀 Features

### ⚡ Core Functionality
- **One-Click Summarization** - Summarize any webpage instantly
- **Custom Prompts** - Define your own summarization style
- **Free AI Processing** - Uses Hugging Face free inference API
- **Local Mode** - Basic summarization without external APIs
- **Context Menu** - Right-click to summarize selected text

### 🔒 Privacy First
- ✅ **Zero Tracking** - No analytics, no telemetry, no logging
- ✅ **No Data Collection** - We don't see or store your data
- ✅ **Local Storage Only** - Settings stored in your browser
- ✅ **Direct API Calls** - Your data goes straight to AI provider
- ✅ **Open Source** - Auditable code

### 🎨 Cyberpunk UI
- 3D Glassmorphism design with blur effects
- Neon color scheme (cyan, magenta, indigo)
- Bento box grid layout
- Smooth animations and glowing effects
- Orbitron & Rajdhani fonts
- Dark theme with translucent panels

---

## 📦 Installation

### From Source

1. **Clone or Download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"**
5. **Select** the `Web-Summary-AI` folder
6. **Pin** the extension to your toolbar

### Building Icons

To generate the cyberpunk-styled icons:

1. Open `icon-generator.html` in your browser
2. Click each "Download" button to save PNG files
3. Save as `logo-16.png`, `logo-32.png`, `logo-48.png`, `logo-128.png`

---

## 🎯 Usage

### Basic Summarization

1. **Navigate** to any webpage
2. **Click** the Web Summary AI extension icon
3. **Click** "⚡ Summarize Current Page"
4. **View** your instant summary

### Custom Prompts

1. **Open** the extension popup
2. **Edit** the "Custom Prompt" field
3. **Example prompts:**
   - "Summarize in 3 bullet points"
   - "Extract key facts as a numbered list"
   - "Explain like I'm 5 years old"
   - "Summarize in Spanish"
4. **Click** "💾 Save Settings"
5. **Summarize** with your custom style

### Context Menu

1. **Select** text on any webpage
2. **Right-click** the selection
3. **Choose** "Summarize with Web Summary AI"

---

## 🛡️ Privacy

### What We DON'T Collect
- ❌ No analytics or tracking
- ❌ No user identification
- ❌ No usage logs
- ❌ No telemetry
- ❌ No data storage on our servers (we don't have servers!)

### What Data Leaves Your Browser
- ✅ **Only when you click "Summarize"**
- ✅ **Only to the AI provider you select** (Hugging Face or Local)
- ✅ **Only the page content you're summarizing**
- ✅ **We never see it** - direct API call from your browser

See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details.

---

## 🛠️ Development

### Project Structure

```
Web-Summary-AI/
├── manifest.json              # Extension manifest
├── background/
│   └── index.js              # Background service worker
├── popup/
│   ├── index.html            # Popup UI
│   ├── index.css             # Cyberpunk styles
│   └── index.js              # Popup logic
├── content-script/
│   └── index.js              # Page content extraction
├── _locales/
│   └── en/
│       └── messages.json     # Internationalization
├── icon.svg                  # Vector icon source
├── icon-generator.html       # Icon generation tool
└── logo-*.png               # Extension icons
```

### VS Code Workspace

Open `web-summary-ai.code-workspace` in VS Code for:
- Cyberpunk-themed editor colors
- Pre-configured tasks
- Extension recommendations
- Debug configuration

### Available Tasks

- **📦 Package Extension** - Create distribution ZIP
- **🎨 Open Icon Generator** - Generate PNG icons
- **🧹 Clean Build Artifacts** - Remove temporary files

### Technology Stack

- **Manifest V3** Chrome Extension
- **Vanilla JavaScript** (no frameworks)
- **CSS3** with backdrop-filter & animations
- **Hugging Face API** for AI summarization
- **Chrome Extension APIs** (storage, tabs, contextMenus)

---

## 🎨 Design System

### Color Palette

```css
--bg-dark: #0a0e27
--bg-navy: #1a1d3a
--cyan: #00f5ff
--magenta: #ff00ff
--indigo: #6366f1
--purple: #8b5cf6
--text-light: #e0e7ff
--text-muted: #94a3b8
```

### Typography

- **Headings:** Orbitron (900/700 weight)
- **Body:** Rajdhani (400-600 weight)
- **Code:** Monospace

### Effects

- Glassmorphism with `backdrop-filter: blur(20px)`
- Animated gradient shifts
- Neon glow using `text-shadow` and `box-shadow`
- Smooth `cubic-bezier` transitions

---

## 🔄 Changelog

### Version 2.0.0 (November 2025)
- ✨ **Rebranded** to Web Summary AI
- 🔒 **Removed** all tracking and analytics
- 🎨 **New UI** with cyberpunk glassmorphism design
- ⚡ **Added** custom prompt support
- 📦 **Updated** to Manifest V3
- 🛡️ **Enhanced** privacy guarantees

### Version 1.0.0 (Previous)
- Initial release as Zro-Day GPT

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Areas for Contribution
- Additional AI provider integrations
- UI/UX improvements
- Language translations
- Bug fixes
- Documentation

---

## 📞 Support

- **Issues:** Use GitHub Issues for bug reports
- **Privacy Questions:** See [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Feature Requests:** Open a GitHub Discussion

---

## ⚠️ Disclaimer

This extension sends your page content to third-party AI providers (Hugging Face) when you request summarization. While we don't collect or see your data, the AI provider may have their own data policies. Always review AI provider terms before use.

---

<div align="center">

**Made with ⚡ by developers who care about privacy**

*No tracking • No ads • No data harvesting*

[⬆ Back to Top](#-web-summary-ai)

</div>
