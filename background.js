/**
 * Background Service Worker (Manifest V3)
 * Handles background tasks and message passing
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Secure Note Taker installed', details);
  
  try {
    if (details.reason === 'install') {
      // First time installation
      console.log('Extension installed for the first time');
      
      // Initialize storage structure using async/await
      await chrome.storage.local.set({ notes: {} });
      console.log('Storage initialized');
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('Extension updated to version', chrome.runtime.getManifest().version);
    }
  } catch (error) {
    console.error('Error during installation:', error);
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  // Validate request object
  if (!request || typeof request.action !== 'string') {
    sendResponse({ success: false, error: 'Invalid request format' });
    return false;
  }
  
  if (request.action === 'openPopup') {
    // Note: In Manifest V3, we cannot programmatically open the popup
    // This is a limitation of the new API
    // The user must click the extension icon manually
    console.log('Popup open requested from content script');
    
    // We can optionally show a notification
    // But chrome.notifications requires additional permissions
    sendResponse({ success: false, message: 'Cannot open popup programmatically in Manifest V3' });
    return false;
  }
  
  if (request.action === 'saveNote') {
    // Handle saving note from content script using async/await pattern
    handleSaveNote(request, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  // Unknown action
  sendResponse({ success: false, error: 'Unknown action' });
  return false;
});

/**
 * Handles saving a note with proper async/await pattern
 * @param {Object} request - The request object containing domain and note
 * @param {Function} sendResponse - Response callback function
 */
async function handleSaveNote(request, sendResponse) {
  try {
    const { domain, note } = request;
    
    // Validate input
    if (!domain || typeof domain !== 'string') {
      sendResponse({ success: false, error: 'Invalid domain' });
      return;
    }
    
    if (!note || typeof note !== 'object') {
      sendResponse({ success: false, error: 'Invalid note format' });
      return;
    }
    
    // Validate note content length (prevent storage abuse)
    if (note.content && note.content.length > 10000) {
      sendResponse({ success: false, error: 'Note content too large' });
      return;
    }
    
    // Get current notes from storage
    const result = await chrome.storage.local.get(['notes']);
    const allNotes = result.notes || {};
    
    // Add note to domain
    if (!allNotes[domain]) {
      allNotes[domain] = [];
    }
    
    // Limit notes per domain to prevent storage abuse
    if (allNotes[domain].length >= 100) {
      sendResponse({ success: false, error: 'Maximum notes limit reached for this domain' });
      return;
    }
    
    allNotes[domain].push(note);
    
    // Save to storage
    await chrome.storage.local.set({ notes: allNotes });
    console.log('Note saved successfully for domain:', domain);
    sendResponse({ success: true });
    
  } catch (error) {
    console.error('Error saving note:', error);
    sendResponse({ success: false, error: error.message || 'Failed to save note' });
  }
}

// Handle storage changes (optional - for debugging)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.notes) {
    console.log('Notes storage changed:', changes.notes);
  }
});

console.log('Secure Note Taker background service worker loaded');

