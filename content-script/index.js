// Web Summary AI - Privacy-Focused Content Script
// No data collection or tracking

class ContentExtractor {
  extractPageContent() {
    try {
      // Use Readability.js for clean content extraction if available
      if (typeof Readability !== 'undefined') {
        const documentClone = document.cloneNode(true);
        const readability = new Readability(documentClone);
        const article = readability.parse();

        return {
          title: article?.title || document.title,
          textContent: article?.textContent || this.getFallbackContent(),
          excerpt: article?.excerpt || ''
        };
      }
      
      return this.getFallbackContent();
    } catch (error) {
      return this.getFallbackContent();
    }
  }

  getFallbackContent() {
    // Simple content extraction
    const title = document.title;
    const bodyText = document.body?.textContent || '';
    const mainContent = document.querySelector('main')?.textContent ||
                       document.querySelector('article')?.textContent ||
                       bodyText;

    return {
      title,
      textContent: mainContent.substring(0, 10000), // Limit content length
      excerpt: mainContent.substring(0, 200)
    };
  }

  extractSelectedText() {
    const selection = window.getSelection();
    return selection.toString();
  }
}

const extractor = new ContentExtractor();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

    default:
      sendResponse({ error: 'Unknown action' });
  }
});
