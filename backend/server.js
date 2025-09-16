const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '3d034acf7d4345278203a3136a5fddf1';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'cb1b313cd5484a9f9436ed57e4e68086';
const REDIRECT_URI = process.env.REDIRECT_URI || `http://127.0.0.1:${PORT}/callback`;

// Magic link authentication storage
const pendingTokens = new Map(); // token -> { email, createdAt, expiresAt }
const authenticatedUsers = new Map(); // authToken -> user profile
const magicLinkCallbacks = new Map(); // token -> { resolve, reject, timeout }
const magicLinkToAuthToken = new Map(); // magicLinkToken -> authToken

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pendingTokens.entries()) {
    if (now > data.expiresAt) {
      pendingTokens.delete(token);
      const callback = magicLinkCallbacks.get(token);
      if (callback) {
        callback.reject(new Error('Magic link expired'));
        magicLinkCallbacks.delete(token);
      }
    }
  }
}, 5 * 60 * 1000);

// Exchange authorization code for access token
app.post('/api/spotify/token', async (req, res) => {
    try {
        const { code, redirect_uri } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri || REDIRECT_URI,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Spotify token exchange failed:', data);
            return res.status(400).json({ 
                error: 'Token exchange failed', 
                details: data.error_description || data.error 
            });
        }

        res.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type,
            scope: data.scope
        });

    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate Spotify authorization URL
app.get('/api/spotify/auth-url', (req, res) => {
    const scopes = [
        'streaming',
        'user-read-email',
        'user-read-private',
        'user-read-playback-state',
        'user-modify-playback-state',
        'playlist-read-private',
        'playlist-read-collaborative'
    ].join(' ');

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: scopes,
        show_dialog: 'true'
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    res.json({ authUrl });
});

// Serve the callback page
app.get('/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the auth success page
app.get('/auth/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth-success.html'));
});

// Serve the auth callback page
app.get('/auth/callback', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth-callback.html'));
});

// Magic link authentication endpoints

// Generate magic link token
app.post('/api/auth/magic-link', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const now = Date.now();
        const expiresAt = now + (15 * 60 * 1000); // 15 minutes

        // Store token
        pendingTokens.set(token, {
            email,
            createdAt: now,
            expiresAt
        });

        // Create magic link
        const magicLink = `http://${HOST}:${PORT}/api/auth/verify?token=${token}`;

        console.log(`🔗 Generated magic link for ${email}: ${magicLink}`);

        res.json({
            success: true,
            token,
            magicLink,
            expiresAt
        });

    } catch (error) {
        console.error('Error generating magic link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify magic link token (webhook endpoint)
app.get('/api/auth/verify', async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const tokenData = pendingTokens.get(token);
        
        if (!tokenData) {
            return res.status(400).json({ error: 'Invalid or expired magic link' });
        }

        // Check if token has expired
        if (Date.now() > tokenData.expiresAt) {
            pendingTokens.delete(token);
            return res.status(400).json({ error: 'Magic link has expired' });
        }

        // Create user profile
        const userId = `user_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
        const user = {
            id: userId,
            email: tokenData.email,
            displayName: tokenData.email.split('@')[0],
            preferences: {
                theme: 'system',
                accentColor: 'blue',
                defaultSessionLength: 25,
                defaultBreakLength: 5,
                skipBreaks: false,
                notificationsEnabled: true,
                soundEnabled: true,
                spotifyConnected: false,
                motivationalQuotes: true
            },
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isAuthenticated: true
        };

        // Generate auth token
        const authToken = crypto.randomBytes(32).toString('hex');

        // Store authenticated user
        authenticatedUsers.set(authToken, user);

        // Store mapping between magic link token and auth token
        magicLinkToAuthToken.set(token, authToken);

        // Clean up magic link token
        pendingTokens.delete(token);

        // Notify any waiting callbacks
        const callback = magicLinkCallbacks.get(token);
        if (callback) {
            callback.resolve({ user, authToken });
            magicLinkCallbacks.delete(token);
        }

        console.log(`✅ User authenticated: ${tokenData.email}`);

        // Redirect to the auth callback page that will communicate with the extension
        const userData = encodeURIComponent(JSON.stringify(user));
        const redirectUrl = `http://127.0.0.1:3001/auth/callback?token=${authToken}&user=${userData}`;
        
        console.log(`🔗 Redirecting to auth callback: ${redirectUrl}`);
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Error verifying magic link:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Wait for magic link verification (polling endpoint)
app.get('/api/auth/wait/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // First check if token has been consumed (user authenticated)
        const authToken = magicLinkToAuthToken.get(token);
        if (authToken && authenticatedUsers.has(authToken)) {
            // Token has been consumed and user is authenticated
            return res.json({
                success: true,
                status: 'completed',
                message: 'Magic link has been used successfully'
            });
        }

        const tokenData = pendingTokens.get(token);
        
        if (!tokenData) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Check if token has expired
        if (Date.now() > tokenData.expiresAt) {
            pendingTokens.delete(token);
            return res.status(400).json({ error: 'Magic link has expired' });
        }

        // Return token status
        res.json({
            success: true,
            status: 'pending',
            email: tokenData.email,
            expiresAt: tokenData.expiresAt
        });

    } catch (error) {
        console.error('Error checking token status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify auth token
app.post('/api/auth/verify-token', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const user = authenticatedUsers.get(token);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Check if token is too old (30 days)
        const tokenAge = Date.now() - new Date(user.lastActiveAt).getTime();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        if (tokenAge > maxAge) {
            authenticatedUsers.delete(token);
            return res.status(401).json({ error: 'Token has expired' });
        }

        // Update last active time
        user.lastActiveAt = new Date().toISOString();
        authenticatedUsers.set(token, user);

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error verifying auth token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh Spotify token
app.post('/api/spotify/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;
        
        if (!refresh_token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: SPOTIFY_CLIENT_ID,
                client_secret: SPOTIFY_CLIENT_SECRET,
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Spotify token refresh failed:', data);
            return res.status(400).json({ 
                error: 'Token refresh failed', 
                details: data.error_description || data.error 
            });
        }

        res.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token || refresh_token,
            expires_in: data.expires_in,
            token_type: data.token_type,
            scope: data.scope
        });

    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        pendingTokens: pendingTokens.size,
        authenticatedUsers: authenticatedUsers.size
    });
});

app.listen(PORT, HOST, () => {
    console.log(`🚀 Vela Auth Proxy running on http://${HOST}:${PORT}`);
    console.log(`📝 Update your Spotify app redirect URI to: ${REDIRECT_URI}`);
    console.log(`🔗 Magic link verification: http://${HOST}:${PORT}/auth/verify`);
});
