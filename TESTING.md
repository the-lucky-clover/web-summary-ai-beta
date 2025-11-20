# 🧪 Web Summary AI - Testing Guide

## Pre-Testing Setup

### 1. Load Extension in Brave/Chrome

```bash
# Navigate to extensions page
brave://extensions/
# or
chrome://extensions/

# Enable Developer Mode (toggle in top-right)
# Click "Load unpacked"
# Select: /Volumes/USB-HDD/Downloads/Web-Summary-AI
```

### 2. Verify Installation

- ✅ Extension icon appears in toolbar (cyberpunk blue/pink logo)
- ✅ No errors in Extensions page
- ✅ Version shows 2.1.1

---

## Core Functionality Tests

### Test 1: Extension Popup

**Steps:**
1. Click extension icon in toolbar
2. Verify cyberpunk UI loads (glassmorphism, neon colors)
3. Check custom prompt textarea is visible
4. Verify "Summarize Page" button exists

**Expected Result:**
- Popup opens instantly
- UI elements render correctly
- No console errors

---

### Test 2: Page Summarization

**Test URL:** https://en.wikipedia.org/wiki/Artificial_intelligence

**Steps:**
1. Navigate to test URL
2. Click extension icon
3. Click "Summarize Page" button
4. Wait for processing

**Expected Result:**
- Button shows "🔍 Extracting content..."
- Then shows "✨ Summarizing..."
- Summary appears in result box
- Summary is 3-5 bullet points
- No errors displayed

**Fallback Test:**
- If Hugging Face API is busy, local summarization activates
- Should still return bullet points from first 3 sentences

---

### Test 3: Custom Prompt

**Steps:**
1. Click extension icon
2. Modify custom prompt to: "Explain this like I'm 5 years old:"
3. Click "Summarize Page"
4. Review summary

**Expected Result:**
- Custom prompt is saved to chrome.storage
- Summary reflects simplified language style
- Prompt persists after closing/reopening popup

---

### Test 4: Context Menu (Right-Click)

**Steps:**
1. On any webpage, select text (e.g., a paragraph)
2. Right-click selected text
3. Look for "Summarize with Zro-Day GPT" option
4. Click it

**Expected Result:**
- Context menu item appears
- Clicking sends selected text for summarization
- Result displays in new UI element (future enhancement)

---

### Test 5: Settings Persistence

**Steps:**
1. Click extension icon
2. Change provider to "local"
3. Modify custom prompt
4. Close popup
5. Reopen popup

**Expected Result:**
- Provider selection saved
- Custom prompt persists
- Settings loaded from chrome.storage.local

---

### Test 6: Multiple Page Types

Test on various content types:

**News Article:**
- URL: https://www.bbc.com/news
- Should extract clean article text
- Summary should capture key points

**Blog Post:**
- URL: https://blog.google/ (any post)
- Should handle blog formatting
- Extracts main content, ignores sidebar

**Documentation:**
- URL: https://developer.mozilla.org/en-US/docs/Web
- Technical content summarized
- Code blocks handled gracefully

**Social Media (Limited):**
- URL: https://reddit.com (any thread)
- May have mixed results (dynamic content)
- Should not crash

---

## Permission Tests

### Test 7: Minimal Permissions Verification

**Check manifest permissions:**
```bash
cd /Volumes/USB-HDD/Downloads/Web-Summary-AI
grep -A 5 '"permissions"' manifest.json
```

**Expected Permissions ONLY:**
- `storage` - for settings
- `activeTab` - for current page content
- `contextMenus` - for right-click menu

**Should NOT include:**
- ❌ `tabs` (too broad)
- ❌ `<all_urls>` (wildcard access)
- ❌ `webRequest` (intercepts network)
- ❌ `scripting` (removed in v2.1.1)

---

### Test 8: Content Script Scope

**Verify content scripts only match HTTP/HTTPS:**
```bash
grep -A 5 '"content_scripts"' manifest.json
```

**Expected:**
- Matches: `https://*/*` and `http://*/*`
- Run at: `document_idle`
- No `<all_urls>` wildcard

---

## Privacy Tests

### Test 9: No External Tracking

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click extension icon
4. Summarize a page
5. Filter network requests

**Expected Result:**
- ✅ Request to `api-inference.huggingface.co` (AI API)
- ❌ NO requests to:
  - Google Analytics
  - Tracking domains
  - chat.openai.com
  - api.openai.com
  - Any session/auth endpoints

---

### Test 10: Local Storage Audit

**Check stored data:**
```javascript
// Open DevTools console on extension popup
chrome.storage.local.get(null, (items) => console.log(items));
```

**Expected Storage Keys:**
- `provider` - "huggingface" or "local"
- `customPrompt` - user's custom prompt text
- `apiKey` - (optional, not used currently)

**Should NOT store:**
- ❌ User session tokens
- ❌ Access tokens
- ❌ Device IDs (oai-deviceId removed)
- ❌ Browsing history
- ❌ Page content

---

## Error Handling Tests

### Test 11: Offline Mode

**Steps:**
1. Disconnect from internet
2. Try to summarize page
3. Wait for timeout

**Expected Result:**
- Graceful fallback to local summarization
- Error message: "Using local summarization mode"
- Summary still appears (basic extraction)

---

### Test 12: Empty Page

**Steps:**
1. Navigate to `about:blank`
2. Try to summarize

**Expected Result:**
- Error message: "No content to summarize"
- No crash
- Extension remains functional

---

### Test 13: Very Long Content

**Test URL:** https://en.wikipedia.org/wiki/History_of_computing

**Steps:**
1. Navigate to very long article
2. Summarize page

**Expected Result:**
- Content truncated to 10,000 characters
- Summary completes without timeout
- No browser hang

---

## Performance Tests

### Test 14: Response Time

**Measure:**
1. Click "Summarize Page" button
2. Time until summary appears

**Expected:**
- Content extraction: < 1 second
- API response: 2-5 seconds (Hugging Face)
- Local mode: < 1 second
- Total: < 6 seconds

---

### Test 15: Memory Usage

**Check Chrome Task Manager:**
1. Open: Shift+Esc (Chrome/Brave)
2. Find "Web Summary AI" process
3. Monitor memory during summarization

**Expected:**
- Idle: < 10 MB
- Active: < 30 MB
- No memory leaks after repeated use

---

## UI/UX Tests

### Test 16: Cyberpunk Theme

**Visual Checklist:**
- ✅ Dark background (#0a0e27)
- ✅ Neon cyan accents (#00f5ff)
- ✅ Magenta highlights (#ff00ff)
- ✅ Indigo buttons (#6366f1)
- ✅ Glassmorphism blur effects
- ✅ Smooth animations
- ✅ Orbitron font for headings
- ✅ Rounded corners (12-20px)

---

### Test 17: Responsive Layout

**Steps:**
1. Open popup
2. Resize browser window
3. Check layout adapts

**Expected:**
- Popup width: 400px (fixed)
- Height: Auto-adjusts to content
- No horizontal scrolling
- All elements visible

---

## Security Tests

### Test 18: CSP Compliance

**Check Content Security Policy:**
```bash
grep -A 3 '"content_security_policy"' manifest.json
```

**Expected:**
- `script-src 'self'` - only extension scripts
- `object-src 'self'` - no external plugins
- No `unsafe-eval` or `unsafe-inline`

---

### Test 19: XSS Prevention

**Steps:**
1. On a page with user-generated content
2. Select text containing HTML: `<script>alert('XSS')</script>`
3. Right-click → Summarize selection

**Expected Result:**
- Text sanitized before display
- No script execution
- Summary shows plain text only

---

## Browser Compatibility

### Test 20: Chrome Compatibility

**Browsers to Test:**
- ✅ Google Chrome (latest)
- ✅ Brave Browser (latest)
- ✅ Microsoft Edge (latest)
- ⚠️ Firefox (requires manifest conversion)
- ❌ Safari (different extension format)

---

## Regression Tests

After any code changes, re-run:
1. ✅ Test 2 (Page Summarization)
2. ✅ Test 7 (Permissions)
3. ✅ Test 9 (No Tracking)
4. ✅ Test 18 (CSP)

---

## Bug Reporting Template

If you find issues:

```markdown
**Bug:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Browser:** Chrome/Brave/Edge
**Extension Version:** 2.1.1
**Console Errors:** [Paste from DevTools]
**Screenshots:** [If applicable]
```

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Popup UI | ⏳ | Pending manual test |
| Summarization | ⏳ | Test with Wikipedia |
| Custom Prompt | ⏳ | Verify persistence |
| Context Menu | ⏳ | Right-click test |
| Permissions | ✅ | Verified minimal |
| No Tracking | ⏳ | Check network tab |
| Offline Mode | ⏳ | Fallback test |
| Performance | ⏳ | < 6 sec target |

---

## Automated Testing (Future)

```bash
# Run validation script
./test-extension.sh

# Expected output:
# ✓ All core files exist
# ✓ All icons present
# ✓ Valid manifest JSON
# ✓ Minimal permissions
```

---

**Last Updated:** November 19, 2025  
**Version Tested:** 2.1.1  
**Tester:** [Your Name]
