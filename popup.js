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
  const searchInput = document.getElementById('searchInput');
  
  // Current domain and notes
  let currentDomain = '';
  let allDomainNotes = [];
  
  /**
   * Initialize the popup
   */
  async function init() {
    // Get current tab domain
    await getCurrentDomain();
    
    // Load notes for current domain
    await loadNotes();
    
    // Add search event listener
    searchInput.addEventListener('input', handleSearch);
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
      allDomainNotes = allNotes[currentDomain] || [];
      
      renderNotes(allDomainNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      showEmptyState();
    }
  }
  
  /**
   * Handle search input
   */
  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
      // Show all notes if search is empty
      renderNotes(allDomainNotes);
      return;
    }
    
    // Filter notes based on search term
    const filteredNotes = allDomainNotes.filter(note => {
      const decryptedContent = decryptText(note.content).toLowerCase();
      return decryptedContent.includes(searchTerm);
    });
    
    renderNotes(filteredNotes);
    
    // Show "no results" message if no matches (even if there are no notes at all)
    if (filteredNotes.length === 0) {
      showNoResultsMessage();
    }
  }
  
  /**
   * Show no search results message
   */
  function showNoResultsMessage() {
    notesList.innerHTML = `
      <div class="no-results-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="#ccc" stroke-width="2"/>
          <path d="M21 21L16.65 16.65" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
          <line x1="8" y1="11" x2="14" y2="11" stroke="#ccc" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>No notes match your search</p>
      </div>
    `;
    notesList.style.display = 'block';
    emptyState.classList.remove('show');
  }
  
  /**
   * Render notes to the DOM
   * @param {Array} notes - Array of note objects to display
   */
  function renderNotes(notes) {
    // Clear existing notes
    notesList.innerHTML = '';
    
    // Update note count to show total and filtered count
    const totalCount = allDomainNotes.length;
    const filteredCount = notes.length;
    
    if (filteredCount !== totalCount && searchInput.value.trim()) {
      noteCountEl.textContent = `${filteredCount}/${totalCount}`;
    } else {
      noteCountEl.textContent = totalCount;
    }
    
    if (notes.length === 0) {
      showEmptyState();
      return;
    }
    
    hideEmptyState();
    
    // Render each note - use original index from allDomainNotes for deletion
    notes.forEach((note) => {
      const originalIndex = allDomainNotes.indexOf(note);
      const noteElement = createNoteElement(note, originalIndex);
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
      <div class="note-content" data-original-content="${escapeHtml(decryptedContent)}">${escapeHtml(decryptedContent)}</div>
      <div class="note-footer">
        <span class="note-timestamp">${timestamp}</span>
      </div>
      <div class="note-actions">
        <button class="edit-btn" title="Edit note" data-index="${index}">✏️</button>
        <button class="delete-btn" title="Delete note" data-index="${index}">×</button>
      </div>
      <div class="note-edit-actions" style="display: none;">
        <button class="cancel-edit-btn">Cancel</button>
        <button class="save-edit-btn" disabled>Save Changes</button>
      </div>
    `;
    
    // Add edit event listener
    const editBtn = noteDiv.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => handleEditNote(noteDiv, index));
    
    // Add delete event listener
    const deleteBtn = noteDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => handleDeleteNote(index));
    
    return noteDiv;
  }
  
  /**
   * Handle editing a note
   * @param {HTMLElement} noteElement - The note element to edit
   * @param {number} index - Index of note to edit
   */
  function handleEditNote(noteElement, index) {
    // Get elements
    const contentDiv = noteElement.querySelector('.note-content');
    const actionsDiv = noteElement.querySelector('.note-actions');
    const editActionsDiv = noteElement.querySelector('.note-edit-actions');
    const saveBtn = editActionsDiv.querySelector('.save-edit-btn');
    const cancelBtn = editActionsDiv.querySelector('.cancel-edit-btn');
    
    // Store original content
    const originalContent = contentDiv.getAttribute('data-original-content');
    
    // Make content editable
    contentDiv.contentEditable = true;
    contentDiv.focus();
    noteElement.classList.add('editing');
    
    // Show edit actions, hide normal actions
    actionsDiv.style.display = 'none';
    editActionsDiv.style.display = 'flex';
    
    // Move cursor to end of content
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(contentDiv);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Listen for content changes
    const checkForChanges = () => {
      const currentContent = contentDiv.textContent.trim();
      const hasChanged = currentContent !== originalContent && currentContent.length > 0;
      saveBtn.disabled = !hasChanged;
    };
    
    contentDiv.addEventListener('input', checkForChanges);
    contentDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cancelEdit();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!saveBtn.disabled) {
          saveEdit();
        }
      }
    });
    
    // Cancel edit function
    const cancelEdit = () => {
      contentDiv.contentEditable = false;
      contentDiv.textContent = originalContent;
      noteElement.classList.remove('editing');
      actionsDiv.style.display = 'flex';
      editActionsDiv.style.display = 'none';
      contentDiv.removeEventListener('input', checkForChanges);
    };
    
    // Save edit function
    const saveEdit = async () => {
      const newContent = contentDiv.textContent.trim();
      
      if (!newContent) {
        showFeedback('Note cannot be empty', 'error');
        return;
      }
      
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        // Update note in storage
        await updateNote(index, newContent);
        
        // Update the data attribute
        contentDiv.setAttribute('data-original-content', newContent);
        
        // Exit edit mode
        contentDiv.contentEditable = false;
        noteElement.classList.remove('editing');
        actionsDiv.style.display = 'flex';
        editActionsDiv.style.display = 'none';
        
        // Clean up event listener
        contentDiv.removeEventListener('input', checkForChanges);
        
        showFeedback('Note updated successfully!');
        
        // Reload notes to reflect changes
        await loadNotes();
        
        // Re-apply search filter if search is active
        if (searchInput.value.trim()) {
          handleSearch();
        }
        
      } catch (error) {
        console.error('Error updating note:', error);
        showFeedback('Error updating note', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
      }
    };
    
    // Add event listeners to buttons
    cancelBtn.addEventListener('click', cancelEdit);
    saveBtn.addEventListener('click', saveEdit);
  }
  
  /**
   * Update a note in storage
   * @param {number} index - Index of note to update
   * @param {string} newContent - New content for the note
   */
  async function updateNote(index, newContent) {
    const result = await chrome.storage.local.get(['notes']);
    const allNotes = result.notes || {};
    
    if (allNotes[currentDomain] && allNotes[currentDomain][index]) {
      // Encrypt the new content
      const encryptedContent = encryptText(newContent);
      
      // Update the note (keep original timestamp)
      allNotes[currentDomain][index].content = encryptedContent;
      
      await chrome.storage.local.set({ notes: allNotes });
    }
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
      
      // Re-apply search filter if search is active
      if (searchInput.value.trim()) {
        handleSearch();
      }
      
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
   * Show feedback message with visual toast notification
   * @param {string} message - Message to show
   * @param {string} type - Type of message (success or error)
   */
  function showFeedback(message, type = 'success') {
    console.log(`[${type}] ${message}`);
    
    // Create toast notification element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
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

