# Authentication Flow Test Guide

## Test Scenarios

### ✅ Scenario 1: New User Authentication
1. **Clear all data**: Use dev panel to clear all data
2. **Open new tab**: Should show welcome screen
3. **Enter email**: Use a valid email address
4. **Check email**: Click the magic link
5. **Verify**: Should redirect to dashboard, NOT welcome screen

### ✅ Scenario 2: Returning User
1. **Authenticate once** (follow Scenario 1)
2. **Close browser completely**
3. **Reopen and go to new tab**
4. **Verify**: Should show dashboard immediately, NOT welcome screen

### ✅ Scenario 3: Spotify OAuth Flow
1. **Be authenticated** (follow Scenario 1)
2. **Connect Spotify**: Click connect in Spotify widget
3. **Complete OAuth**: Authorize in Spotify
4. **Verify**: Should return to dashboard, NOT welcome screen
5. **Check URL**: Should be clean (no ?code= parameters)

### ✅ Scenario 4: URL Parameter Cleanup
1. **Be authenticated**
2. **Manually add URL params**: Add `?token=test123` to URL
3. **Refresh page**
4. **Verify**: Should show dashboard and clean URL automatically

### ✅ Scenario 5: Magic Link with Existing Session
1. **Be authenticated**
2. **Get another magic link** (from different browser/device)
3. **Click magic link in authenticated browser**
4. **Verify**: Should stay on dashboard, not show welcome screen

## Expected Behaviors

### ✅ Authenticated Users Should NEVER See:
- Welcome screen
- Magic link input form
- "Sign in to Vela" messaging
- Authentication loading states (except initial load)

### ✅ Authenticated Users Should ALWAYS See:
- Dashboard with timer, tasks, stats
- Profile dropdown with user info
- Settings and preferences
- Spotify widget (if connected)

### ✅ URL Handling:
- Magic link tokens should be processed and removed
- Spotify OAuth codes should be processed and removed
- Authenticated users should have clean URLs
- No authentication parameters should persist

## Debugging Steps

### If Welcome Screen Shows for Authenticated User:
1. **Check auth debug panel** (yellow box in top-right)
2. **Verify authentication state**: Should show ✅ Authenticated
3. **Check browser console** for auth-related errors
4. **Clear storage and re-authenticate**

### If Spotify OAuth Doesn't Return to Dashboard:
1. **Check for URL conflicts** (token + code parameters)
2. **Verify authentication state** before OAuth
3. **Check console for Spotify errors**
4. **Ensure user is authenticated before connecting Spotify**

### If URL Parameters Don't Clear:
1. **Check auth guard hook** is working
2. **Verify browser history API** is available
3. **Check for JavaScript errors** preventing cleanup

## Development Commands

```bash
# Clear all data and test fresh authentication
npm run dev
# Open dev panel → Clear All Data → Test authentication

# Check authentication configuration
npm run test-emailjs

# Build and test in extension
npm run build
# Load in Chrome and test all scenarios
```

## Common Issues and Fixes

### Issue: "User sees welcome screen after Spotify OAuth"
**Fix**: Ensure user is authenticated BEFORE connecting Spotify

### Issue: "URL parameters don't clear"
**Fix**: Check that auth guard hook is properly implemented

### Issue: "Authentication state lost after OAuth"
**Fix**: Verify token storage is not being cleared during OAuth

### Issue: "Multiple authentication attempts"
**Fix**: Check for conflicts between magic link and OAuth handling

## Success Criteria

✅ **Authentication Flow Works**:
- New users can sign in with magic links
- Returning users stay authenticated
- No authentication loops or redirects

✅ **Spotify Integration Works**:
- OAuth completes successfully
- Returns to dashboard (not welcome screen)
- URL parameters are cleaned up

✅ **Route Protection Works**:
- Authenticated users never see welcome screen
- URL parameters are automatically cleaned
- Authentication state persists across sessions

✅ **User Experience is Smooth**:
- No flickering between screens
- Fast authentication checks
- Clear error messages when needed