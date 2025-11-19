// Web Summary AI - Privacy-Focused Background Script
// No data collection or tracking

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {

  // Create context menu
  chrome.contextMenus.create({
    id: 'summarize-selection',
    title: 'Summarize with Zro-Day GPT',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'summarize-page',
    title: 'Summarize Page with Zro-Day GPT',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-selection') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarize-selection',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'summarize-page') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'summarize-page'
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'summarize-text':
      handleSummarization(request, sendResponse);
      return true; // Keep message channel open for async response

    case 'get-settings':
      chrome.storage.local.get(['apiKey', 'provider', 'customPrompt'], (result) => {
        sendResponse(result);
      });
      return true;

    case 'save-settings':
      chrome.storage.local.set(request.settings, () => {
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

    if (!settings.apiKey && settings.provider !== 'local') {
      throw new Error('API key required for external providers');
    }

    let summary;
    const customPrompt = settings.customPrompt || 'Summarize the following text:';

    if (settings.provider === 'huggingface') {
      summary = await summarizeWithHuggingFace(request.text, customPrompt);
    } else if (settings.provider === 'local') {
      summary = await summarizeLocally(request.text, customPrompt);
    } else {
      throw new Error('Unsupported provider');
    }

    sendResponse({ summary });

  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey', 'provider', 'customPrompt'], (result) => {
      resolve({
        apiKey: result.apiKey || '',
        provider: result.provider || 'huggingface',
        customPrompt: result.customPrompt || 'Summarize the following text in a clear and concise way:'
      });
    });
  });
}

// Using Hugging Face free inference API (no API key required)
async function summarizeWithHuggingFace(text, customPrompt) {
  const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: `${customPrompt}\n\n${text}`,
      parameters: {
        max_length: 200,
        min_length: 50,
        do_sample: false
      }
    })
  });

  if (!response.ok) {
    // Fallback to local summarization if Hugging Face fails
    console.warn('Hugging Face API failed, using local summarization');
    return await summarizeLocally(text, customPrompt);
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.summary_text) {
    return `• ${data[0].summary_text}`;
  }

  // Fallback to local if response format is unexpected
  return await summarizeLocally(text, customPrompt);
}

async function summarizeLocally(text, customPrompt) {
  // Simple local summarization using basic NLP
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const summary = sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n');

  return summary || '• Text is too short to summarize effectively.';
}
