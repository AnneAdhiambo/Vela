# Testing Vela Chrome Extension

This guide explains how to test the Vela Chrome extension locally, including the authentication system.

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Modes

#### Option A: Mock Authentication (Recommended for Testing)
```bash
npm run dev
```

This runs the extension with mock authentication enabled. No backend server required.

#### Option B: Full Development with Local Server
```bash
npm run dev:full
```

This runs both the extension and a local authentication server.

### 3. Load Extension in Chrome

1. Run `npm run build` to build the extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` folder
5. Open a new tab to see Vela

## Testing Authentication

### Mock Authentication (Default in Development)

When running in development mode, the extension uses mock authentication:

**Test Accounts:**
- `test@example.com` (Test User)
- `demo@vela.app` (Demo User)

**How it works:**
1. Enter any of the test emails on the welcome screen
2. Click "Send Magic Link"
3. The mock service will auto-apply the authentication token after 2 seconds
4. You'll be automatically logged in

**Manual Testing:**
- Check the browser console for magic link URLs
- You can manually navigate to the generated magic link URLs
- The development panel (yellow gear icon) provides additional testing tools

### Real API Testing (Optional)

To test with a real backend:

1. Update `src/config/development.ts`:
   ```typescript
   auth: {
     useMockAuth: false, // Disable mock auth
     apiBaseUrl: 'http://localhost:3001/api', // Your API URL
   }
   ```

2. Run your backend server or use the included dev server:
   ```bash
   npm run dev:server
   ```

## Development Features

### Development Panel

When in development mode, you'll see a yellow gear icon in the bottom-left corner. This opens the development panel with:

- **Force Logout**: Test the logout flow
- **Clear All Data**: Reset all stored data
- **Populate Test Data**: Add sample tasks and stats
- **Log Storage State**: View current storage contents

### Console Logging

Development mode provides detailed console logging:
- `🔧 [DEV]` - Development information
- `ℹ️ [INFO]` - General information
- `⚠️ [WARN]` - Warnings
- `❌ [ERROR]` - Errors

### Configuration Options

Edit `src/config/development.ts` to customize testing behavior:

```typescript
export const config = {
  auth: {
    useMockAuth: true,        // Use mock authentication
    mockAutoLogin: true,      // Auto-apply tokens
  },
  features: {
    skipAuthInDev: false,     // Skip auth entirely (for UI testing)
    showDebugInfo: true,      // Show development helpers
  },
  dev: {
    prefillTestData: true,    // Add sample data on load
    logLevel: 'debug',        // Console log level
  }
}
```

## Testing Scenarios

### 1. First-Time User Flow
1. Clear all data using dev panel
2. Refresh the page
3. Should see welcome screen
4. Test magic link authentication

### 2. Returning User Flow
1. Authenticate once
2. Close and reopen browser
3. Should automatically log back in
4. Data should persist

### 3. Cross-Tab Persistence
1. Open multiple new tabs
2. Start a timer in one tab
3. Switch to another tab
4. Timer should continue running
5. Complete session in any tab
6. All tabs should update

### 4. Theme and Settings
1. Open settings from profile dropdown
2. Change theme and accent color
3. Verify changes apply immediately
4. Refresh page to test persistence

### 5. Spotify Integration
1. Connect Spotify account
2. Select a playlist
3. Start a focus session
4. Verify music starts playing
5. Test disconnect functionality

### 6. Notifications
1. Start a focus session
2. Wait for completion (or use dev tools to speed up)
3. Verify completion notification appears
4. Test notification buttons

## Troubleshooting

### Authentication Issues
- Check browser console for error messages
- Verify `config.auth.useMockAuth` is `true` for mock testing
- Use dev panel to clear data and retry

### Extension Not Loading
- Ensure you built the extension (`npm run build`)
- Check Chrome extension developer mode is enabled
- Look for errors in Chrome's extension management page

### Timer Not Persisting
- Check Chrome storage permissions in manifest.json
- Verify background service worker is running
- Use dev panel to check storage state

### Spotify Not Working
- Ensure you have Spotify Premium
- Check if Spotify is running on any device
- Verify client ID and secret in environment variables

## Development Utilities

### Global Dev Utils
In development mode, utilities are available in the browser console:

```javascript
// Clear all data
window.velaDevUtils.clearAllData()

// Populate test data
window.velaDevUtils.populateTestData()

// Show storage state
window.velaDevUtils.showStorageState()
```

### Mock Auth Service
```javascript
// Show available test accounts
window.mockAuthService.getTestUsers()

// Send magic link manually
window.mockAuthService.sendMagicLink('test@example.com')
```

## Production Testing

To test production-like behavior:

1. Set `NODE_ENV=production` or build with `npm run build`
2. Disable mock authentication in config
3. Set up real backend API endpoints
4. Test with real Spotify credentials

## Common Test Cases

- [ ] Welcome screen displays correctly
- [ ] Magic link authentication works
- [ ] Timer starts and completes properly
- [ ] Tasks can be created, edited, and completed
- [ ] Stats persist across sessions
- [ ] Spotify integration connects and plays music
- [ ] Notifications appear on session completion
- [ ] Settings save and apply correctly
- [ ] Theme switching works
- [ ] Cross-tab synchronization functions
- [ ] Data persists after browser restart