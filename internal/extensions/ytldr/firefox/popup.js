// YTldr - Privacy-First Popup Script

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
  loadApiKey();
  setupEventListeners();
}

function setupEventListeners() {
  // API key management
  document.getElementById('toggle-visibility').addEventListener('click', toggleApiKeyVisibility);
  document.getElementById('save-api-key').addEventListener('click', saveApiKey);

  // Summarization
  document.getElementById('summarize-page').addEventListener('click', summarizeCurrentPage);

  // Batch summarization
  document.getElementById('batch-summarize').addEventListener('click', batchSummarize);

  // Privacy features
  document.getElementById('view-logs').addEventListener('click', viewLogs);
  document.getElementById('clear-logs').addEventListener('click', clearLogs);
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('api-key');
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function loadApiKey() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'get-settings' });
    document.getElementById('api-key').value = response.geminiApiKey || '';
  } catch (error) {
    console.error('Failed to load API key:', error);
  }
}

async function saveApiKey() {
  const apiKey = document.getElementById('api-key').value;

  try {
    await browser.runtime.sendMessage({
      action: 'save-settings',
      settings: { geminiApiKey: apiKey }
    });

    showMessage('API key saved successfully!', 'success');
  } catch (error) {
    showMessage('Failed to save API key: ' + error.message, 'error');
  }
}

async function summarizeCurrentPage() {
  const button = document.getElementById('summarize-page');
  const originalText = button.textContent;

  try {
    button.textContent = 'Extracting content...';
    button.disabled = true;

    // Get current tab
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    // Extract page content
    const response = await browser.tabs.sendMessage(tab.id, { action: 'get-page-info' });

    if (!response || !response.textContent) {
      throw new Error('Could not extract page content');
    }

    button.textContent = 'Summarizing...';

    // Request summarization
    const summaryResponse = await browser.runtime.sendMessage({
      action: 'summarize-text',
      text: response.textContent
    });

    if (summaryResponse.error) {
      throw new Error(summaryResponse.error);
    }

    // Display result
    displaySummary(summaryResponse.summary);

  } catch (error) {
    showMessage('Summarization failed: ' + error.message, 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

async function batchSummarize() {
  const urls = document.getElementById('batch-urls').value.trim().split('\n').filter(url => url.trim());
  const button = document.getElementById('batch-summarize');
  const originalText = button.textContent;

  if (urls.length === 0) {
    showMessage('Please enter at least one URL', 'error');
    return;
  }

  try {
    button.textContent = 'Processing...';
    button.disabled = true;

    const results = [];
    for (const url of urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const textContent = extractTextFromHtml(html);

        const summaryResponse = await browser.runtime.sendMessage({
          action: 'summarize-text',
          text: textContent
        });

        results.push({
          url,
          summary: summaryResponse.error ? `Error: ${summaryResponse.error}` : summaryResponse.summary
        });
      } catch (error) {
        results.push({
          url,
          summary: `Error: ${error.message}`
        });
      }
    }

    displayBatchResults(results);

  } catch (error) {
    showMessage('Batch summarization failed: ' + error.message, 'error');
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

function extractTextFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || doc.body.innerText || '';
}

function displaySummary(summary) {
  const resultDiv = document.getElementById('summary-result');
  const summaryText = document.getElementById('summary-text');

  summaryText.textContent = summary;
  resultDiv.style.display = 'block';

  // Scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function displayBatchResults(results) {
  const resultsDiv = document.getElementById('batch-results');
  resultsDiv.innerHTML = '<h3>Batch Results:</h3>';

  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'batch-result-item';
    item.innerHTML = `
      <strong>${result.url}</strong>
      <p>${result.summary}</p>
    `;
    resultsDiv.appendChild(item);
  });

  resultsDiv.style.display = 'block';
  resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

async function viewLogs() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'get-logs' });
    const logsDisplay = document.getElementById('logs-display');
    const logsContent = document.getElementById('logs-content');

    logsContent.textContent = JSON.stringify(response.logs, null, 2);
    logsDisplay.style.display = logsDisplay.style.display === 'none' ? 'block' : 'none';
  } catch (error) {
    showMessage('Failed to load logs: ' + error.message, 'error');
  }
}

async function clearLogs() {
  if (confirm('Are you sure you want to clear all activity logs?')) {
    try {
      await browser.runtime.sendMessage({ action: 'clear-logs' });
      document.getElementById('logs-display').style.display = 'none';
      showMessage('Logs cleared successfully!', 'success');
    } catch (error) {
      showMessage('Failed to clear logs: ' + error.message, 'error');
    }
  }
}

function showMessage(message, type) {
  // Remove existing message
  const existing = document.querySelector('.message');
  if (existing) existing.remove();

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 15px;
    border-radius: 4px;
    color: white;
    background: ${type === 'success' ? '#10a37f' : '#ef4444'};
    z-index: 1000;
    max-width: 300px;
  `;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}