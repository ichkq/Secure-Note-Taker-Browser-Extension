# Secure Note Taker Browser Extension

A Chrome browser extension that allows users to store and manage encrypted notes for specific websites.

## Features

- 🔒 **Encrypted Storage**: Notes are encrypted using Caesar cipher + Base64 encoding before storage
- 🌐 **Domain-Specific**: Notes are organized by website domain
- 📝 **Easy Access**: Floating button on every webpage for quick access
- 💾 **Persistent Storage**: Notes persist across browser sessions
- 🎨 **Modern UI**: Clean and intuitive interface
- ⚡ **Lightweight**: Pure vanilla JavaScript, no frameworks or libraries

## Installation

### For Chrome/Edge

1. **Download the Extension**
   - Clone or download this repository to your local machine

2. **Open Extension Management Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `viso_test` folder containing the extension files
   - The extension should now appear in your extensions list

5. **Create Extension Icons (Optional)**
   - The extension will work without icons, but you can add custom icons
   - Create PNG files named `icon16.png`, `icon48.png`, and `icon128.png`
   - Place them in the extension directory

## Usage

### Adding a Note

**Method 1: Using the Floating Button (Quick Add)**
1. Visit any website
2. Look for the purple floating button in the bottom-right corner
3. Click the "+" button
4. A popup dialog appears on the page
5. Type your note in the text area
6. Click "Save Note" or press Ctrl/Cmd + Enter
7. Note is encrypted and saved automatically!

**Method 2: Using the Extension Icon (Full Interface)**
1. Click the extension icon in your browser toolbar
2. Type your note in the text area
3. Click "Add Note" or press Ctrl/Cmd + Enter
4. View all notes for the current domain

### Viewing Notes

1. Click the extension icon in your browser toolbar
2. All notes for the current website domain will be displayed
3. Each note shows:
   - The note content (decrypted)
   - Timestamp when it was created

### Deleting a Note

1. Open the extension popup
2. Hover over the note you want to delete
3. Click the red "×" button that appears in the top-right corner
4. The note will be deleted immediately

### Organizing Notes

- Notes are automatically organized by website domain
- When you visit different websites, you'll see different notes
- Notes persist across:
  - Page reloads
  - Browser restarts
  - Different pages on the same domain

## File Structure

```
/viso_test
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Popup interface HTML
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── content.js            # Content script (floating button)
├── content.css           # Content script styles
├── background.js         # Service worker
├── utils.js              # Encryption/decryption utilities
└── README.md             # This file
```

## Technical Details

### Architecture

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Storage**: `chrome.storage.local` API
- **Encryption**: Caesar cipher (shift 7) + Base64 encoding
- **Permissions**: `storage`, `activeTab`

### Encryption

Notes are encrypted before storage using a two-step process:

1. **Caesar Cipher**: Each character's code is shifted by 7
2. **Base64 Encoding**: The result is encoded in Base64

This provides basic obfuscation. For production use, consider stronger encryption methods like AES.

### Storage Format

```javascript
{
  "notes": {
    "example.com": [
      {
        "content": "encrypted_content_here",
        "timestamp": 1696723200000,
        "domain": "example.com"
      }
    ]
  }
}
```

## Browser Compatibility

- ✅ **Chrome**: Fully supported (version 88+)
- ✅ **Edge**: Fully supported (Chromium-based)
- ⚠️ **Firefox**: Requires manifest modifications
- ❌ **Safari**: Not supported (requires different extension format)

## Security Considerations

⚠️ **Important Security Notes**:

1. The encryption used is **basic obfuscation**, not military-grade encryption
2. Notes are stored locally in the browser's storage
3. Do NOT store highly sensitive information (passwords, credit cards, etc.)
4. For better security, consider:
   - Using Web Crypto API for stronger encryption
   - Implementing password protection
   - Using server-side storage with proper authentication

## Troubleshooting

### Extension Not Loading
- Ensure Developer Mode is enabled
- Check the console for error messages
- Verify all files are present

### Floating Button Not Appearing
- Refresh the webpage after installing the extension
- Check if the website blocks content scripts
- Open browser console and look for errors

### Notes Not Saving
- Check browser storage permissions
- Verify the domain is being extracted correctly
- Open DevTools → Application → Storage → Local Storage

### Cannot Open Popup from Floating Button
- This is a Manifest V3 limitation
- Users must click the extension icon in the toolbar
- The floating button serves as a reminder/quick indicator

## Development

### Local Development
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Adding New Features
- Modify `popup.js` for UI logic changes
- Modify `content.js` for webpage interaction
- Modify `utils.js` for encryption/utility functions
- Update `manifest.json` for new permissions or scripts

## License

This project is provided as-is for educational and personal use.

## Future Enhancements

Potential improvements for future versions:

- [ ] Stronger encryption (AES-256)
- [ ] Password protection
- [ ] Note categories/tags
- [ ] Search functionality
- [ ] Export/import notes
- [ ] Sync across devices
- [ ] Rich text editor
- [ ] Note sharing
- [ ] Dark mode

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify extension permissions

---

**Version**: 1.0.0  
**Manifest**: V3  
**Completion Time**: 5-6 hours  
**Tech Stack**: Vanilla JavaScript, CSS, HTML

