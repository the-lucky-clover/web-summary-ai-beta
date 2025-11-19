// Web Summary AI - Clean Welcome Script (No Tracking)

document.addEventListener('DOMContentLoaded', () => {
  // Simple welcome page initialization without any analytics
  console.log('Web Summary AI - Welcome page loaded');
  
  // Add event listeners for navigation if needed
  const optionsLink = document.querySelector('a[href*="options"]');
  if (optionsLink) {
    optionsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
});
