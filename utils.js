/**
 * Encryption and Decryption Utility Functions
 * 
 * SECURITY NOTE: This uses a simple Caesar cipher + Base64 for basic obfuscation.
 * This is NOT cryptographically secure and provides only minimal privacy.
 * 
 * For true security, consider using:
 * - Web Crypto API (crypto.subtle.encrypt/decrypt with AES-GCM)
 * - User-provided password for key derivation
 * 
 * Current implementation provides:
 * - Protection from casual viewing
 * - Basic obfuscation in storage
 * 
 * It does NOT protect against:
 * - Determined attackers
 * - Anyone who can access the extension's storage
 */

const CIPHER_SHIFT = 7; // Caesar cipher shift value

/**
 * Encrypts text using Caesar cipher and Base64 encoding
 * NOTE: This is obfuscation, not cryptographic encryption
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
function encryptText(text) {
  // Input validation
  if (!text || typeof text !== 'string') return '';
  
  // Length validation to prevent abuse
  if (text.length > 10000) {
    console.error('Encryption error: Text too long');
    return '';
  }
  
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
  // Input validation
  if (!encryptedText || typeof encryptedText !== 'string') return '';
  
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
    return '[Corrupted note data]';
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

