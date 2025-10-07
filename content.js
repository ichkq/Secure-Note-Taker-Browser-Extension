/**
 * Content Script - Injects floating button into web pages
 */

(function() {
  'use strict';
  
  // Check if button already exists to prevent duplicates
  if (document.getElementById('secure-note-floating-btn')) {
    return;
  }
  
  // Create floating button
  const floatingBtn = document.createElement('div');
  floatingBtn.id = 'secure-note-floating-btn';
  floatingBtn.className = 'secure-note-btn';
  floatingBtn.title = 'Add Note';
  floatingBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  
  // Add button to page
  document.body.appendChild(floatingBtn);
  
  // Click handler - opens the note popup
  floatingBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    openNotePopup();
  });
  
  /**
   * Opens the note popup dialog
   */
  function openNotePopup() {
    // Check if popup already exists
    let popup = document.getElementById('secure-note-popup');
    
    if (!popup) {
      popup = createNotePopup();
      document.body.appendChild(popup);
    }
    
    // Reset popup state before showing
    const textarea = popup.querySelector('textarea');
    const saveBtn = popup.querySelector('.secure-note-popup-btn-save');
    const message = popup.querySelector('.secure-note-popup-message');
    
    if (textarea) textarea.value = '';
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Add Note';
    }
    if (message) {
      message.textContent = '';
      message.style.display = 'none';
    }
    
    // Show popup with animation
    popup.style.display = 'flex';
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Focus on textarea
    if (textarea) textarea.focus();
  }
  
  /**
   * Creates the note popup element
   */
  function createNotePopup() {
    const popup = document.createElement('div');
    popup.id = 'secure-note-popup';
    popup.className = 'secure-note-popup';
    
    const currentDomain = window.location.hostname;
    
    popup.innerHTML = `
      <div class="secure-note-popup-overlay"></div>
      <div class="secure-note-popup-content">
        <div class="secure-note-popup-header">
          <h3>Secure Notes</h3>
          <div class="secure-note-popup-domain">${currentDomain}</div>
          <button class="secure-note-popup-close" title="Close">&times;</button>
        </div>
        <div class="secure-note-popup-body">
          <textarea 
            class="secure-note-popup-textarea" 
            placeholder="Write your note here..."
            rows="4"
          ></textarea>
        </div>
        <div class="secure-note-popup-footer">
          <button class="secure-note-popup-btn secure-note-popup-btn-cancel">Cancel</button>
          <button class="secure-note-popup-btn secure-note-popup-btn-save">Add Note</button>
        </div>
        <div class="secure-note-popup-message"></div>
      </div>
    `;
    
    // Add event listeners
    const overlay = popup.querySelector('.secure-note-popup-overlay');
    const closeBtn = popup.querySelector('.secure-note-popup-close');
    const cancelBtn = popup.querySelector('.secure-note-popup-btn-cancel');
    const saveBtn = popup.querySelector('.secure-note-popup-btn-save');
    const textarea = popup.querySelector('.secure-note-popup-textarea');
    
    overlay.addEventListener('click', () => closeNotePopup(popup));
    closeBtn.addEventListener('click', () => closeNotePopup(popup));
    cancelBtn.addEventListener('click', () => closeNotePopup(popup));
    saveBtn.addEventListener('click', () => saveNote(popup, textarea.value));
    
    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        saveNote(popup, textarea.value);
      }
      if (e.key === 'Escape') {
        closeNotePopup(popup);
      }
    });
    
    return popup;
  }
  
  /**
   * Closes the note popup
   */
  function closeNotePopup(popup) {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
      // Clear textarea
      const textarea = popup.querySelector('textarea');
      if (textarea) textarea.value = '';
      // Clear message
      const message = popup.querySelector('.secure-note-popup-message');
      if (message) {
        message.textContent = '';
        message.style.display = 'none';
      }
      // Reset button state
      const saveBtn = popup.querySelector('.secure-note-popup-btn-save');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Add Note';
      }
    }, 300);
  }
  
  /**
   * Saves a note
   */
  async function saveNote(popup, content) {
    const textarea = popup.querySelector('textarea');
    const saveBtn = popup.querySelector('.secure-note-popup-btn-save');
    const messageEl = popup.querySelector('.secure-note-popup-message');
    
    // Validate content
    if (!content || !content.trim()) {
      showPopupMessage(messageEl, 'Please write something!', 'error');
      textarea.focus();
      return;
    }
    
    // Disable button during save
    saveBtn.disabled = true;
    saveBtn.textContent = 'Adding...';
    
    try {
      // Get current domain
      const domain = window.location.hostname;
      
      // Encrypt content
      const encryptedContent = encryptText(content.trim());
      
      // Create note object
      const note = {
        content: encryptedContent,
        timestamp: Date.now(),
        domain: domain
      };
      
      // Send message to background script to save note
      const response = await chrome.runtime.sendMessage({
        action: 'saveNote',
        domain: domain,
        note: note
      });
      
      if (response && response.success) {
        // Show success message
        showPopupMessage(messageEl, '✅ Note saved successfully!', 'success');
        
        // Close popup after short delay
        setTimeout(() => closeNotePopup(popup), 1000);
      } else {
        throw new Error(response?.error || 'Failed to save note');
      }
      
    } catch (error) {
      console.error('Error saving note:', error);
      showPopupMessage(messageEl, '❌ Error saving note', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Add Note';
    }
  }
  
  /**
   * Shows a message in the popup
   */
  function showPopupMessage(messageEl, text, type) {
    messageEl.textContent = text;
    messageEl.className = 'secure-note-popup-message ' + type;
    messageEl.style.display = 'block';
  }
  
  // Make button draggable (optional feature for better UX)
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  
  floatingBtn.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  
  function dragStart(e) {
    if (e.target === floatingBtn || floatingBtn.contains(e.target)) {
      initialX = e.clientX - floatingBtn.offsetLeft;
      initialY = e.clientY - floatingBtn.offsetTop;
      isDragging = true;
    }
  }
  
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      
      // Keep button within viewport
      const maxX = window.innerWidth - floatingBtn.offsetWidth;
      const maxY = window.innerHeight - floatingBtn.offsetHeight;
      
      currentX = Math.max(0, Math.min(currentX, maxX));
      currentY = Math.max(0, Math.min(currentY, maxY));
      
      floatingBtn.style.right = 'auto';
      floatingBtn.style.bottom = 'auto';
      floatingBtn.style.left = currentX + 'px';
      floatingBtn.style.top = currentY + 'px';
    }
  }
  
  function dragEnd() {
    isDragging = false;
  }
  
  console.log('Secure Note Taker: Floating button injected');
})();

