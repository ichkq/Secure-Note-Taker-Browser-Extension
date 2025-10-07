/**
 * Encryption and Decryption Utility Functions
 * Uses Base64 encoding combined with a simple Caesar cipher for basic obfuscation
 */

const CIPHER_SHIFT = 7; // Caesar cipher shift value

/**
 * Encrypts text using Caesar cipher and Base64 encoding
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
function encryptText(text) {
  if (!text) return '';
  
  // Apply Caesar cipher
  let caesarEncrypted = '';
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let code = text.charCodeAt(i);
    
    // Shift character code
    caesarEncrypted += String.fromCharCode(code + CIPHER_SHIFT);
  }
  
  // Apply Base64 encoding
  try {
    return btoa(caesarEncrypted);
  } catch (e) {
    console.error('Encryption error:', e);
    return btoa(unescape(encodeURIComponent(caesarEncrypted)));
  }
}

/**
 * Decrypts text encrypted with encryptText function
 * @param {string} encryptedText - The encrypted text
 * @returns {string} - The decrypted text
 */
function decryptText(encryptedText) {
  if (!encryptedText) return '';
  
  try {
    // Decode Base64
    let caesarEncrypted;
    try {
      caesarEncrypted = atob(encryptedText);
    } catch (e) {
      caesarEncrypted = decodeURIComponent(escape(atob(encryptedText)));
    }
    
    // Reverse Caesar cipher
    let decrypted = '';
    for (let i = 0; i < caesarEncrypted.length; i++) {
      let code = caesarEncrypted.charCodeAt(i);
      decrypted += String.fromCharCode(code - CIPHER_SHIFT);
    }
    
    return decrypted;
  } catch (e) {
    console.error('Decryption error:', e);
    return '';
  }
}

/**
 * Extracts domain from URL
 * @param {string} url - The full URL
 * @returns {string} - The domain
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    console.error('URL parsing error:', e);
    return 'unknown';
  }
}

// Make functions available globally for both content script and popup
if (typeof window !== 'undefined') {
  window.encryptText = encryptText;
  window.decryptText = decryptText;
  window.extractDomain = extractDomain;
}

