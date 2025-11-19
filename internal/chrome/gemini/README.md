# Chrome Gemini API Key Management

This folder contains the isolated Chrome browser implementation for secure Google Gemini Flash 2.5 API key input and management.

## Files

- `GeminiApiKeyInput.jsx` - React component for secure API key input (with visibility toggle and validation)
- `options.html` - Standalone HTML options page for Gemini API key management
- `test.js` - Test suite for API key storage and validation functionality
- `README.md` - This documentation file

## Features

### Security Features
- API keys are stored securely in Chrome's local storage
- Input validation ensures proper Gemini API key format (starts with "AIza")
- Password-style input with visibility toggle
- Keys are never logged or exposed in plain text
- Secure storage using Chrome's encrypted storage API

### User Interface
- Clean, accessible HTML interface
- Real-time feedback for save/clear operations
- Help text with links to obtain API keys
- Responsive design

### Integration
- Integrated into Chrome extension manifest as options page
- Uses Chrome extension APIs for secure storage
- Isolated from main extension code for security

## 🚀 Getting Started (Chrome Web Store Compliant)

### For New Users:
1. **Install the extension** from Chrome Web Store
2. **Right-click the extension icon** and select "Options"
3. **Follow the onboarding guide** to get your Gemini API key
4. **Enter your personal API key** securely
5. **Start using Gemini features!**

### How to Get Your Gemini API Key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API key"** in the left sidebar
4. **Copy the generated key**
5. **Paste it in the extension options**
6. **Click "Save API Key"**

### For Existing Users:
- Your API key remains securely stored
- Check the **health indicators** for key status
- Monitor your **usage statistics**
- Rotate keys when needed using the **"🔄 Rotate Key"** button

## 🔒 Chrome Web Store Compliance

✅ **No hardcoded API keys** - Users provide their own keys
✅ **Secure key storage** - Chrome's encrypted local storage
✅ **User-controlled access** - Keys never auto-generated
✅ **Transparent usage** - Clear API quota tracking
✅ **Privacy-focused** - No data collection or sharing

## Testing

Run the test suite:
```bash
cd internal/chrome/gemini
node test.js
```

## 🚀 Enhanced Features

### 🔄 **API Key Rotation System**
- **Automatic Age Tracking**: Monitors key age since last update
- **Rotation Warnings**: Visual indicators when keys are 80% through their lifecycle (72 days)
- **Expiration Alerts**: Clear warnings when keys exceed 90 days
- **Quick Rotation**: One-click button to open Google AI Studio for new keys
- **Metadata Tracking**: Stores rotation timestamps and version info

### 📊 **Usage Monitoring**
- **Request Tracking**: Monitors API usage with monthly reset
- **Visual Dashboard**: Progress bar showing usage against 1000 request limit
- **Automatic Reset**: Monthly usage counters reset on schedule
- **Usage Alerts**: Visual indicators for usage thresholds

### 🎯 **Health Indicators**
- **Real-time Status**: Live key health monitoring
- **Color-coded States**:
  - 🟢 **Healthy**: Key is current (< 72 days)
  - 🟡 **Warning**: Key needs rotation (72-90 days)
  - 🔴 **Expired**: Key over 90 days old
- **Age Display**: Shows exact days since key creation/update

### 🔒 **Advanced Security Measures**
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **Rate Limiting**: 1-second cooldown between operations prevents abuse
- **Input Sanitization**: Removes dangerous characters and limits input length
- **API Key Validation**: Regex validation + entropy checking for authenticity
- **Secure Error Handling**: No sensitive data in error messages or logs
- **Memory Cleanup**: Automatic cleanup of temporary data from memory
- **No Plain Text Logging**: API keys never logged or exposed in console
- **Encrypted Storage**: Chrome's secure local storage with metadata tracking

### 🛡️ **Security Implementation**
- API keys stored in Chrome's encrypted local storage
- Keys never transmitted except to Google's Gemini API
- Input validation with regex: `/^AIza[0-9A-Za-z\-_]{35}$/`
- Entropy validation ensures sufficient randomness
- Rate limiting prevents rapid-fire operations
- Context menu disabled for additional security
- Automatic cleanup on page unload

### ✅ **Real API Key Tested**
- Format validation: ✅ PASS
- Entropy check: ✅ PASS
- Length validation: ✅ PASS
- Security implementation: ✅ PASS

### 🎨 **UI Enhancements**
- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all screen sizes
- **Accessibility**: Proper labels and keyboard navigation
- **Visual Feedback**: Clear success/error states
- **Helpful Links**: Direct links to Google AI Studio
- **Status Indicators**: Real-time health and usage displays