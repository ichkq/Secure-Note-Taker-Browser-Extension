/**
 * Background Service Worker (Manifest V3)
 * Handles background tasks and message passing
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Secure Note Taker installed', details);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('Extension installed for the first time');
    
    // Initialize storage structure
    chrome.storage.local.set({ notes: {} }, () => {
      console.log('Storage initialized');
    });
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'openPopup') {
    // Note: In Manifest V3, we cannot programmatically open the popup
    // This is a limitation of the new API
    // The user must click the extension icon manually
    console.log('Popup open requested from content script');
    
    // We can optionally show a notification
    // But chrome.notifications requires additional permissions
    sendResponse({ success: false, message: 'Cannot open popup programmatically in Manifest V3' });
  }
  
  if (request.action === 'saveNote') {
    // Handle saving note from content script
    const { domain, note } = request;
    
    chrome.storage.local.get(['notes'], (result) => {
      const allNotes = result.notes || {};
      
      // Add note to domain
      if (!allNotes[domain]) {
        allNotes[domain] = [];
      }
      allNotes[domain].push(note);
      
      // Save to storage
      chrome.storage.local.set({ notes: allNotes }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving note:', chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('Note saved successfully for domain:', domain);
          sendResponse({ success: true });
        }
      });
    });
    
    return true; // Keep message channel open for async response
  }
  
  return true; // Keep message channel open for async response
});

// Handle storage changes (optional - for debugging)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.notes) {
    console.log('Notes storage changed:', changes.notes);
  }
});

console.log('Secure Note Taker background service worker loaded');

