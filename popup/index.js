// Web Summary AI - Privacy-Focused Popup Script

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
  loadSettings();
  setupEventListeners();
}

function setupEventListeners() {
  // Provider selection
  document.getElementById('provider').addEventListener('change', toggleApiKeyField);

  // Save settings
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  // Summarize page
  document.getElementById('summarize-page').addEventListener('click', summarizeCurrentPage);
}

function toggleApiKeyField() {
  const provider = document.getElementById('provider').value;
  const apiKeyGroup = document.getElementById('api-key-group');
  // Hide API key field for both providers since both are free
  apiKeyGroup.classList.remove('visible');
}

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'get-settings' });
    document.getElementById('provider').value = response.provider || 'huggingface';
    document.getElementById('api-key').value = response.apiKey || '';
    document.getElementById('custom-prompt').value = response.customPrompt || 'Summarize the following text in a clear and concise way:';
    toggleApiKeyField();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  const provider = document.getElementById('provider').value;
  const apiKey = document.getElementById('api-key').value;
  const customPrompt = document.getElementById('custom-prompt').value;

  try {
    await chrome.runtime.sendMessage({
      action: 'save-settings',
      settings: { provider, apiKey, customPrompt }
    });

    showMessage('⚡ Settings saved successfully!', 'success');
  } catch (error) {
    showMessage('❌ Failed to save settings: ' + error.message, 'error');
  }
}

async function summarizeCurrentPage() {
  const button = document.getElementById('summarize-page');
  const originalText = button.innerHTML;

  try {
    button.innerHTML = '🔍 Extracting content...';
    button.disabled = true;

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Extract page content
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'get-page-info' });

    if (!response || !response.textContent) {
      throw new Error('Could not extract page content');
    }

    button.innerHTML = '✨ Summarizing...';

    // Request summarization
    const summaryResponse = await chrome.runtime.sendMessage({
      action: 'summarize-text',
      text: response.textContent
    });

    if (summaryResponse.error) {
      throw new Error(summaryResponse.error);
    }

    // Display result
    displaySummary(summaryResponse.summary);

  } catch (error) {
    showMessage('❌ Summarization failed: ' + error.message, 'error');
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

function displaySummary(summary) {
  const resultDiv = document.getElementById('summary-result');
  const summaryText = document.getElementById('summary-text');

  summaryText.textContent = summary;
  resultDiv.classList.add('visible');

  // Scroll to result
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}

function showMessage(message, type) {
  // Remove existing message
  const existing = document.querySelector('.message');
  if (existing) existing.remove();

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateX(100px)';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}
