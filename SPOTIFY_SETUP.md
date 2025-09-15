# Spotify App Configuration - UPDATED

## ⚠️ IMPORTANT: Update Your Spotify App Settings

You need to **remove** the `/callback` from your Spotify redirect URIs and add the correct URLs.

## Steps to Fix:

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Find Your App**
   - Look for the app with Client ID: `3d034acf7d4345278203a3136a5fddf1`
   - Click on the app name to open settings

3. **Update Redirect URIs** ⭐ **CRITICAL STEP**
   - Click "Edit Settings" 
   - **REMOVE** any URLs with `/callback` (like `http://[::1]:5173/callback`)
   - **ADD** these exact URLs:
     - `http://127.0.0.1:3000`
     - `http://localhost:3000`
   - Click "Save"

4. **Start the Dev Server**
   ```bash
   npm run dev
   ```
   - The app will now run on `http://127.0.0.1:3000`

5. **Test the Integration**
   - Go to `http://127.0.0.1:3000`
   - Click "Connect to Spotify" in the Spotify widget
   - It should redirect to Spotify, then back to your app with the auth code

## Current Configuration:
- **Client ID**: `3d034acf7d4345278203a3136a5fddf1`
- **Client Secret**: `cb1b313cd5484a9f9436ed57e4e68086`
- **Redirect URI**: `http://127.0.0.1:3000` (NO `/callback`!)
- **Dev Server**: `http://127.0.0.1:3000`

## ⚠️ Security Note:
The client secret is included in the frontend code for development purposes only. In a production app, the token exchange should happen on a backend server to keep the client secret secure.

## ✅ What Should Happen:
1. User clicks "Connect to Spotify"
2. Redirects to Spotify OAuth
3. User authorizes the app
4. Spotify redirects to `http://127.0.0.1:3000?code=ABC123...`
5. Our React app detects the `code` parameter and exchanges it for tokens
6. App loads playlists and enables music control

## 🚫 Common Mistakes:
- ❌ Don't add `/callback` to the redirect URI
- ❌ Don't use `http://[::1]:5173/callback`
- ✅ Use `http://127.0.0.1:3000` (no callback path needed)

The OAuth callback is handled directly in the main React app now!