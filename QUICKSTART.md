# Quick Start Guide

## Installation (2 minutes)

1. **Open Chrome/Edge**
   - Chrome: Go to `chrome://extensions/`
   - Edge: Go to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle the switch in the top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `viso_test` folder
   - Extension is now installed! ✅

## Testing the Extension (5 minutes)

### Test 1: Floating Button
1. Visit any website (e.g., https://google.com)
2. Look for a purple circular button in the bottom-right corner
3. Click it - you should see a notification
4. ✅ Floating button works!

### Test 2: Add a Note
1. Click the extension icon in your browser toolbar
2. You should see a popup (300x400px)
3. Type a test note: "This is my first secure note!"
4. Click "Add Note" or press Ctrl+Enter (Cmd+Enter on Mac)
5. ✅ Note should appear below!

### Test 3: View Encrypted Storage
1. Open DevTools (F12)
2. Go to Application → Storage → Local Storage → Extension
3. Look for the `notes` key
4. You'll see your note is encrypted (not plain text)
5. ✅ Encryption is working!

### Test 4: Domain Separation
1. Visit https://github.com
2. Add a note: "GitHub note"
3. Visit https://google.com
4. Add a different note: "Google note"
5. Switch between tabs - each domain shows only its notes
6. ✅ Domain separation works!

### Test 5: Persistence
1. Add a note on any website
2. Close Chrome/Edge completely
3. Reopen browser and visit the same website
4. Click extension icon
5. Your note should still be there
6. ✅ Persistence works!

### Test 6: Delete Note
1. Open extension popup
2. Hover over any note
3. Click the red "×" button
4. Note should be deleted with animation
5. ✅ Delete works!

## Common Issues & Solutions

### Issue: Floating button not appearing
**Solution:** Refresh the webpage after installing the extension

### Issue: Extension icon not showing
**Solution:** The extension will work with a default gray icon. See ICONS_GUIDE.md to add custom icons

### Issue: Cannot save notes
**Solution:** 
- Check if extension has storage permission (it should by default)
- Open DevTools console and look for errors

### Issue: Notes not encrypted
**Solution:** 
- Open DevTools → Application → Storage
- The stored content should look like Base64 encoded text
- If you can read it directly, encryption is not working

## Features Checklist

- ✅ Floating button on every webpage
- ✅ Add notes via popup (300x400px)
- ✅ View all notes for current domain
- ✅ Basic encryption (Caesar + Base64)
- ✅ Delete individual notes
- ✅ Cross-page persistence
- ✅ Pure vanilla JavaScript
- ✅ Pure CSS
- ✅ Manifest V3
- ✅ Chrome/Edge compatible
- ✅ Clean, commented code

## Architecture Overview

```
User visits website
    ↓
Content Script injects floating button
    ↓
User clicks extension icon → Popup opens
    ↓
User types note → Content encrypted (utils.js)
    ↓
Encrypted note saved to chrome.storage.local
    ↓
Notes persist across sessions
```

## File Roles

- **manifest.json**: Extension configuration
- **utils.js**: Encryption/decryption functions
- **content.js**: Injects floating button into pages
- **content.css**: Styles for floating button
- **popup.html**: Popup interface structure
- **popup.js**: Popup logic & storage management
- **popup.css**: Popup styling
- **background.js**: Service worker (context menus, etc.)

## Next Steps

1. Test all features thoroughly
2. Add custom icons (optional - see ICONS_GUIDE.md)
3. Try on different websites
4. Test edge cases (special characters, long notes, etc.)
5. Share with others or publish to Chrome Web Store

## Development Tips

### Hot Reload
After making code changes:
1. Go to `chrome://extensions/`
2. Click refresh icon on your extension
3. Reload the webpage you're testing on

### Debugging
- **Popup**: Right-click popup → Inspect
- **Content Script**: F12 on webpage → Console
- **Background**: chrome://extensions/ → Service Worker → Inspect

### Adding Features
Want to add more features? Here are some ideas:
- Search/filter notes
- Export notes to file
- Rich text formatting
- Categories/tags
- Dark mode
- Keyboard shortcuts

Happy coding! 🚀

