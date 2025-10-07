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
  
  try {
    // First encode to UTF-8 to handle Unicode characters
    const utf8Encoded = encodeURIComponent(text);
    
    // Apply Caesar cipher
    let caesarEncrypted = '';
    for (let i = 0; i < utf8Encoded.length; i++) {
      let code = utf8Encoded.charCodeAt(i);
      caesarEncrypted += String.fromCharCode(code + CIPHER_SHIFT);
    }
    
    // Apply Base64 encoding
    return btoa(caesarEncrypted);
  } catch (e) {
    console.error('Encryption error:', e);
    return '';
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
    const caesarEncrypted = atob(encryptedText);
    
    // Reverse Caesar cipher
    let utf8Encoded = '';
    for (let i = 0; i < caesarEncrypted.length; i++) {
      let code = caesarEncrypted.charCodeAt(i);
      utf8Encoded += String.fromCharCode(code - CIPHER_SHIFT);
    }
    
    // Decode from UTF-8 to handle Unicode characters
    return decodeURIComponent(utf8Encoded);
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

