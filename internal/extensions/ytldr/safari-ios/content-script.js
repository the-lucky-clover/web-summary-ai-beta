// YTldr - Safari iOS Content Script
// Privacy-First Content Extraction

class ContentExtractor {
  constructor() {
    this.logger = new ContentLogger();
  }

  extractPageContent() {
    this.logger.log('page_content_extraction_started');

    try {
      const content = {
        title: document.title,
        textContent: this.extractTextContent(),
        excerpt: this.extractExcerpt(),
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

  extractTextContent() {
    // Extract main content for Safari
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
    let content = '';

    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        content = element.textContent.trim();
        if (content.length > 100) break;
      }
    }

    if (!content) {
      content = document.body.textContent || '';
    }

    return content.substring(0, 10000);
  }

  extractExcerpt() {
    const content = this.extractTextContent();
    return content.substring(0, 200);
  }

  getFallbackContent() {
    return {
      title: document.title,
      textContent: document.body?.textContent?.substring(0, 10000) || '',
      excerpt: document.body?.textContent?.substring(0, 200) || '',
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
    console.log('[YTldr Safari]', action, entry);
  }

  getLogs() {
    return this.logs;
  }
}

const extractor = new ContentExtractor();

// Safari extension message handling
safari.self.addEventListener('message', (event) => {
  extractor.logger.log('message_received', { action: event.name });

  switch (event.name) {
    case 'get-page-info':
      const info = extractor.extractPageContent();
      safari.self.tab.dispatchMessage('page-info', info);
      break;

    case 'summarize-selection':
      const selectedText = extractor.extractSelectedText();
      if (selectedText) {
        safari.self.tab.dispatchMessage('selected-text', { text: selectedText });
      }
      break;

    case 'get-logs':
      safari.self.tab.dispatchMessage('logs', { logs: extractor.logger.getLogs() });
      break;
  }
});

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  extractor.logger.log('content_script_initialized');
}