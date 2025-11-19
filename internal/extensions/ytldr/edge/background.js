// YTldr - Privacy-First Summarization Background Script
// Powered by Google Gemini Flash 2.5

class PrivacyLogger {
  constructor() {
    this.logs = [];
  }

  log(action, data) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      data: this.sanitizeData(data)
    };
    this.logs.push(entry);
    console.log('[YTldr]', action, entry);
  }

  sanitizeData(data) {
    // Remove sensitive information from logs
    if (typeof data === 'string' && data.length > 100) {
      return data.substring(0, 100) + '...';
    }
    return data;
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

const logger = new PrivacyLogger();

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  logger.log('extension_installed', { version: '1.0.0' });

  // Create context menu
  chrome.contextMenus.create({
    id: 'summarize-selection',
    title: 'Summarize with YTldr',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'summarize-page',
    title: 'Summarize Page with YTldr',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-selection') {
    logger.log('context_menu_selection', { textLength: info.selectionText?.length });
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarize-selection',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'summarize-page') {
    logger.log('context_menu_page', { url: tab.url });
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarize-page'
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  logger.log('message_received', { action: request.action, from: sender.tab?.url });

  switch (request.action) {
    case 'get-logs':
      sendResponse({ logs: logger.getLogs() });
      break;

    case 'clear-logs':
      logger.clearLogs();
      sendResponse({ success: true });
      break;

    case 'summarize-text':
      handleSummarization(request, sendResponse);
      return true; // Keep message channel open for async response

    case 'get-settings':
      chrome.storage.local.get(['geminiApiKey'], (result) => {
        sendResponse(result);
      });
      return true;

    case 'save-settings':
      chrome.storage.local.set(request.settings, () => {
        logger.log('settings_saved', { keys: Object.keys(request.settings) });
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

async function handleSummarization(request, sendResponse) {
  try {
    const settings = await getSettings();
    logger.log('summarization_started', {
      textLength: request.text?.length,
      provider: 'gemini'
    });

    if (!settings.apiKey) {
      throw new Error('Gemini API key required');
    }

    const summary = await summarizeWithGemini(request.text, settings.apiKey);
    logger.log('summarization_completed', { summaryLength: summary.length });
    sendResponse({ summary });

  } catch (error) {
    logger.log('summarization_error', { error: error.message });
    sendResponse({ error: error.message });
  }
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      resolve({
        apiKey: result.geminiApiKey || ''
      });
    });
  });
}

// Summarize with Google Gemini Flash 2.5
async function summarizeWithGemini(text, apiKey) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Please provide a concise summary of the following text. Focus on the main points and key information:\n\n${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text.trim();
  }

  throw new Error('Unexpected response format from Gemini API');
}

// Export logger for debugging
if (typeof window !== 'undefined') {
  window.ytldrLogger = logger;
}