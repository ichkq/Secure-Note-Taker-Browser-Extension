/**
 * Popup Script - Main extension logic
 */

(function() {
  'use strict';
  
  // DOM Elements
  const notesList = document.getElementById('notesList');
  const emptyState = document.getElementById('emptyState');
  const currentDomainEl = document.getElementById('currentDomain');
  const noteCountEl = document.getElementById('noteCount');
  
  // Current domain
  let currentDomain = '';
  
  /**
   * Initialize the popup
   */
  async function init() {
    // Get current tab domain
    await getCurrentDomain();
    
    // Load notes for current domain
    await loadNotes();
  }
  
  /**
   * Get the current tab's domain
   */
  async function getCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        currentDomain = extractDomain(tab.url);
        currentDomainEl.textContent = currentDomain;
      } else {
        currentDomain = 'unknown';
        currentDomainEl.textContent = 'Unknown Domain';
      }
    } catch (error) {
      console.error('Error getting current domain:', error);
      currentDomain = 'unknown';
      currentDomainEl.textContent = 'Unknown Domain';
    }
  }
  
  /**
   * Load notes from storage for current domain
   */
  async function loadNotes() {
    try {
      const result = await chrome.storage.local.get(['notes']);
      const allNotes = result.notes || {};
      const domainNotes = allNotes[currentDomain] || [];
      
      renderNotes(domainNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      showEmptyState();
    }
  }
  
  /**
   * Render notes to the DOM
   * @param {Array} notes - Array of note objects
   */
  function renderNotes(notes) {
    // Clear existing notes
    notesList.innerHTML = '';
    
    // Update note count
    noteCountEl.textContent = notes.length;
    
    if (notes.length === 0) {
      showEmptyState();
      return;
    }
    
    hideEmptyState();
    
    // Render each note
    notes.forEach((note, index) => {
      const noteElement = createNoteElement(note, index);
      notesList.appendChild(noteElement);
    });
  }
  
  /**
   * Create a note DOM element
   * @param {Object} note - Note object
   * @param {number} index - Note index
   * @returns {HTMLElement} - Note element
   */
  function createNoteElement(note, index) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    noteDiv.dataset.index = index;
    
    // Decrypt note content
    const decryptedContent = decryptText(note.content);
    
    // Format timestamp
    const timestamp = new Date(note.timestamp).toLocaleString();
    
    noteDiv.innerHTML = `
      <div class="note-content">${escapeHtml(decryptedContent)}</div>
      <div class="note-footer">
        <span class="note-timestamp">${timestamp}</span>
      </div>
      <button class="delete-btn" title="Delete note" data-index="${index}">×</button>
    `;
    
    // Add delete event listener
    const deleteBtn = noteDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => handleDeleteNote(index));
    
    return noteDiv;
  }
  
  /**
   * Handle deleting a note
   * @param {number} index - Index of note to delete
   */
  async function handleDeleteNote(index) {
    try {
      const noteElement = document.querySelector(`.note-item[data-index="${index}"]`);
      
      if (noteElement) {
        // Add deleting animation
        noteElement.classList.add('deleting');
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delete from storage
      await deleteNote(index);
      
      // Reload notes
      await loadNotes();
      
      showFeedback('Note deleted');
      
    } catch (error) {
      console.error('Error deleting note:', error);
      showFeedback('Error deleting note', 'error');
    }
  }
  
  /**
   * Delete a note from storage
   * @param {number} index - Index of note to delete
   */
  async function deleteNote(index) {
    const result = await chrome.storage.local.get(['notes']);
    const allNotes = result.notes || {};
    
    if (allNotes[currentDomain] && allNotes[currentDomain][index]) {
      allNotes[currentDomain].splice(index, 1);
      
      // If no more notes for this domain, clean up
      if (allNotes[currentDomain].length === 0) {
        delete allNotes[currentDomain];
      }
      
      await chrome.storage.local.set({ notes: allNotes });
    }
  }
  
  /**
   * Show empty state
   */
  function showEmptyState() {
    emptyState.classList.add('show');
    notesList.style.display = 'none';
  }
  
  /**
   * Hide empty state
   */
  function hideEmptyState() {
    emptyState.classList.remove('show');
    notesList.style.display = 'flex';
  }
  
  /**
   * Show feedback message
   * @param {string} message - Message to show
   * @param {string} type - Type of message (success or error)
   */
  function showFeedback(message, type = 'success') {
    // You can implement a toast notification here
    console.log(`[${type}] ${message}`);
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

