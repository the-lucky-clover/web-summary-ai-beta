// YTldr - Privacy-First Content Script
// Transparent page content extraction

class ContentExtractor {
  constructor() {
    this.logger = new ContentLogger();
  }

  extractPageContent() {
    this.logger.log('page_content_extraction_started');

    try {
      // Use Readability.js for clean content extraction
      const documentClone = document.cloneNode(true);
      const readability = new Readability(documentClone);
      const article = readability.parse();

      const content = {
        title: article?.title || document.title,
        textContent: article?.textContent || this.getFallbackContent(),
        excerpt: article?.excerpt || '',
        url: window.location.href,
        timestamp: new Date().toISOString()
      };

      this.logger.log('page_content_extracted', {
        titleLength: content.title.length,
        textLength: content.textContent.length,
        url: content.url
      });

      return content;
    } catch (error) {
      this.logger.log('content_extraction_error', { error: error.message });
      return this.getFallbackContent();
    }
  }

  getFallbackContent() {
    // Fallback content extraction
    const title = document.title;
    const bodyText = document.body?.textContent || '';
    const mainContent = document.querySelector('main')?.textContent ||
                       document.querySelector('article')?.textContent ||
                       bodyText;

    return {
      title,
      textContent: mainContent.substring(0, 10000), // Limit content length
      excerpt: mainContent.substring(0, 200),
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  extractSelectedText() {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText) {
      this.logger.log('text_selection_extracted', {
        length: selectedText.length,
        context: selectedText.substring(0, 50)
      });
    }

    return selectedText;
  }
}

class ContentLogger {
  constructor() {
    this.logs = [];
  }

  log(action, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      url: window.location.href,
      ...data
    };
    this.logs.push(entry);
    console.log('[YTldr Content]', action, entry);
  }

  getLogs() {
    return this.logs;
  }
}

const extractor = new ContentExtractor();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  extractor.logger.log('message_received', { action: request.action });

  switch (request.action) {
    case 'summarize-selection':
      const selectedText = extractor.extractSelectedText();
      if (selectedText) {
        sendResponse({ text: selectedText, type: 'selection' });
      } else {
        sendResponse({ error: 'No text selected' });
      }
      break;

    case 'summarize-page':
      const pageContent = extractor.extractPageContent();
      sendResponse({ text: pageContent.textContent, type: 'page', metadata: pageContent });
      break;

    case 'get-page-info':
      const info = extractor.extractPageContent();
      sendResponse(info);
      break;

    case 'get-logs':
      sendResponse({ logs: extractor.logger.getLogs() });
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  extractor.logger.log('content_script_initialized');

  // Add a subtle indicator that the extension is active
  addExtensionIndicator();
}

function addExtensionIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ytldr-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid #6366f1;
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    color: #6366f1;
    z-index: 10000;
    cursor: pointer;
    display: none;
    font-weight: 500;
  `;
  indicator.textContent = 'YTldr Active';
  indicator.title = 'Click to view activity logs';

  indicator.onclick = () => {
    showTransparencyModal();
  };

  document.body.appendChild(indicator);

  // Show indicator on text selection
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString();
    indicator.style.display = selection.length > 10 ? 'block' : 'none';
  });
}

function showTransparencyModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 12px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  `;

  content.innerHTML = `
    <h3>YTldr - Privacy & Transparency Report</h3>
    <p>This extension only processes data when you explicitly request summarization. No hidden data collection.</p>
    <h4>Activity Log:</h4>
    <pre style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">${JSON.stringify(extractor.logger.getLogs(), null, 2)}</pre>
    <button onclick="this.parentElement.parentElement.remove()" style="background: #6366f1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 12px;">Close</button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}