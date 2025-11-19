# 🚀 Quick Start Guide - Web Summary AI

## Step 1: Generate Icons 🎨

The extension needs icon files. Choose one method:

### Option A: Browser-Based Generator (Easiest)
1. Open `icon-generator.html` in your web browser
2. Click each "Download" button:
   - Download 128x128
   - Download 48x48
   - Download 32x32
   - Download 16x16
3. Save files as `logo-128.png`, `logo-48.png`, `logo-32.png`, `logo-16.png`
4. Place them in the extension root folder

### Option B: Use Existing Graphics Tool
1. Open `icon.svg` in Figma, Photoshop, Illustrator, or any SVG editor
2. Export at 16x16, 32x32, 48x48, and 128x128 pixels
3. Save as PNG files with names above

### Option C: Use Placeholder (Quick Test)
The extension will work without icons, Chrome just shows a default icon.

---

## Step 2: Load Extension in Chrome 🔧

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `Web-Summary-AI` folder
5. Extension is now installed! ✅

---

## Step 3: Pin & Configure ⚙️

1. Click the **puzzle piece** icon in Chrome toolbar
2. Find "Web Summary AI" and click the **pin icon**
3. Click the extension icon to open popup
4. (Optional) Customize your prompt in "Custom Prompt" field
5. Click **"💾 Save Settings"**

---

## Step 4: Use It! ⚡

### Summarize a Page
1. Navigate to any webpage (try Wikipedia, news articles, blogs)
2. Click the **Web Summary AI** icon
3. Click **"⚡ Summarize Current Page"**
4. Wait a few seconds
5. Read your cyberpunk-styled summary! 🎉

### Summarize Selected Text
1. Select any text on a webpage
2. Right-click the selection
3. Choose **"Summarize with Web Summary AI"**

---

## Troubleshooting 🔧

### "Could not extract page content"
- The page might be blocking content extraction
- Try refreshing the page and trying again
- Some websites (like chrome:// pages) can't be accessed

### Summary takes a long time
- Hugging Face free API can be slow during high traffic
- Try switching to "Local" mode in settings (faster but simpler)

### No icon showing
- Generate the PNG icons using `icon-generator.html`
- Or just use it without icons (works fine!)

---

## VS Code Development 💻

1. Open VS Code
2. File → Open Workspace from File
3. Select `web-summary-ai.code-workspace`
4. Enjoy the cyberpunk-themed workspace!

### Available Commands:
- `Cmd+Shift+B` - Package extension as ZIP
- `Cmd+Shift+P` → "Tasks: Run Task" → Choose task

---

## Privacy Reminder 🔒

- **Zero tracking** - No analytics or telemetry
- **No data collection** - We don't see your data
- **Direct API calls** - Data goes straight to AI provider
- **Local settings only** - Everything stored in your browser

---

## What's Next? 🌟

- Customize your prompt for different use cases
- Try summarizing various types of content
- Share feedback or contribute to the project
- Enjoy a truly private summarization tool!

---

**Made with ⚡ and 🔒 by privacy-focused developers**

*Need help? Check [README.md](README.md) for full documentation*
