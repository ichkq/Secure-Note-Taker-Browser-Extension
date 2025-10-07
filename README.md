# Secure Note Taker Browser Extension

A lightweight Chrome browser extension that enables users to create and manage encrypted, domain-specific notes directly from any webpage.

## Table of Contents

- [Installation](#installation)
- [Encryption Approach](#encryption-approach)
- [Design Decisions](#design-decisions)
- [Known Limitations](#known-limitations)
- [Usage](#usage)


---

## Installation

### Prerequisites

- Google Chrome (version 88 or higher) or Microsoft Edge (Chromium-based)
- Developer mode access to browser extensions

### Installation Steps

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd Secure-Note-Taker-Browser-Extension-main
   ```
   
   Or download and extract the ZIP file from GitHub.

2. **Open Extension Management**
   - **Chrome**: Navigate to `chrome://extensions/`
   - **Edge**: Navigate to `edge://extensions/`

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner of the extensions page

4. **Load the Extension**
   - Click the "Load unpacked" button
   - Select the directory containing the extension files
   - The extension icon should appear in your browser toolbar

5. **Verify Installation**
   - Visit any website
   - A black floating button (➕) should appear in the bottom-right corner
   - Click the extension icon in the toolbar to access the main interface

---

## Encryption Approach

### Overview

The extension implements a **two-layer encryption strategy** combining Caesar cipher transformation with Base64 encoding to provide basic data obfuscation for stored notes.

### Encryption Process

Notes undergo a three-step encryption pipeline before storage:

1. **UTF-8 Encoding**
   - Text is first encoded using `encodeURIComponent()` to properly handle Unicode characters
   - Ensures international character support across different languages

2. **Caesar Cipher Transformation**
   - Each character's ASCII code is shifted by **7 positions**
   - Formula: `encrypted_char = char.code + 7`
   - Provides basic character-level obfuscation

3. **Base64 Encoding**
   - The Caesar-encrypted string is encoded to Base64 using `btoa()`
   - Produces alphanumeric output suitable for safe storage

### Decryption Process

The decryption process reverses the encryption pipeline:

1. Base64 decode → 2. Caesar decipher (shift -7) → 3. UTF-8 decode

### Security Context

**⚠️ Important**: This encryption method provides **basic obfuscation**, not cryptographic security. It protects against casual browsing of browser storage but is not suitable for sensitive data like passwords, financial information, or confidential documents.

For production-grade security, consider implementing:
- **Web Crypto API** (AES-256-GCM encryption)
- **Password-based key derivation** (PBKDF2)
- **End-to-end encryption** with user-controlled keys

---

## Design Decisions

### Architecture Choices

#### 1. **Manifest V3 Compliance**
- **Decision**: Built using Chrome Extension Manifest V3
- **Rationale**: Future-proof design aligned with Chrome's latest standards and security requirements
- **Impact**: Cannot programmatically open popups; requires service worker instead of background scripts

#### 2. **Domain-Based Note Organization**
- **Decision**: Notes are automatically categorized by website domain (`hostname`)
- **Rationale**: Provides contextual relevance and automatic organization without user intervention
- **Implementation**: Uses `window.location.hostname` for domain extraction

#### 3. **Dual Interface Pattern**
- **Decision**: Provides both a floating in-page button and toolbar popup
- **Rationale**: 
  - Floating button: Quick access without context switching
  - Toolbar popup: Full note management interface
- **Benefit**: Balances convenience with functionality

#### 4. **Client-Side Storage Only**
- **Decision**: All data stored locally using `chrome.storage.local`
- **Rationale**: 
  - Privacy-first approach (no server communication)
  - Eliminates dependency on external services
  - Faster read/write operations
- **Trade-off**: No cross-device synchronization

#### 5. **Vanilla JavaScript Implementation**
- **Decision**: No frameworks (React, Vue, etc.)
- **Rationale**: 
  - Minimal bundle size (~10KB total)
  - Reduced complexity and dependencies
  - Faster load times
- **Benefit**: Extension runs efficiently with minimal resource consumption

#### 6. **Message Passing Architecture**
- **Decision**: Content scripts communicate with background service worker via `chrome.runtime.sendMessage`
- **Rationale**: Manifest V3 requirement for isolated script contexts
- **Pattern**: Content script → Background service worker → Storage API

### Storage Schema

```javascript
{
  "notes": {
    "example.com": [
      {
        "content": "base64_encrypted_string",
        "timestamp": 1696723200000,
        "domain": "example.com"
      }
    ]
  }
}
```

### Assumptions

1. Users trust their local browser storage security
2. Basic obfuscation is sufficient for note content
3. Domain-based organization aligns with user mental models
4. Users primarily take notes on a single device
5. Notes are text-based (no rich media support)

---

## Known Limitations

### Security Limitations

1. **Basic Encryption**
   - Caesar cipher + Base64 provides obfuscation, not cryptographic security
   - Vulnerable to reverse engineering
   - **Recommendation**: Do not store sensitive credentials or financial data

2. **Local Storage Vulnerabilities**
   - Notes stored in browser's local storage can be accessed by:
     - Other extensions with storage permissions
     - Malware with file system access
     - Physical access to the device

3. **No Password Protection**
   - Extension does not implement authentication
   - Anyone with access to the browser can view notes

### Functional Limitations

1. **No Programmatic Popup Opening**
   - Manifest V3 restriction prevents content scripts from opening the popup programmatically
   - Floating button serves as a visual reminder only
   - **Workaround**: Users must click the toolbar icon manually

2. **Browser Compatibility**
   - ✅ **Supported**: Chrome 88+, Edge (Chromium)
   - ⚠️ **Requires Modification**: Firefox (Manifest V2/V3 differences)
   - ❌ **Not Supported**: Safari (different extension API)

3. **No Cross-Device Sync**
   - Notes are local to the browser instance
   - No built-in synchronization mechanism
   - **Workaround**: Manual export/import (not yet implemented)

4. **Content Script Injection Blocked on Some Pages**
   - Cannot run on browser internal pages (`chrome://`, `about://`)
   - May be blocked by strict Content Security Policies (CSP)
   - Some enterprise websites may prevent content script execution

5. **No Rich Text Support**
   - Notes are plain text only
   - No formatting, images, or attachments
   - Maximum practical note length: ~10,000 characters (browser storage limit)

6. **Domain Collision**
   - Subdomains share notes with parent domain (e.g., `app.example.com` ≠ `example.com`)
   - No distinction between `http` and `https` versions

### Performance Limitations

1. **Storage Quota**
   - `chrome.storage.local` has a 10MB limit
   - Approximately 5,000-10,000 notes depending on average length

2. **No Search/Filter Functionality**
   - All notes for a domain are displayed at once
   - No built-in search, tags, or categories

### Data Loss Scenarios

1. **Browser Data Clear**: Notes deleted if user clears browser data/cache
2. **Extension Uninstall**: All notes are permanently removed
3. **No Backup Mechanism**: No automatic or manual backup system
