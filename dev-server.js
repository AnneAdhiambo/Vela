// Simple development server for testing authentication API
// Run with: node dev-server.js

const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Mock user database
const users = new Map()
const tokens = new Map()

// Send magic link endpoint
app.post('/api/auth/magic-link', (req, res) => {
  const { email } = req.body
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }
  
  // Generate a token
  const token = `dev_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Store token with email
  tokens.set(token, {
    email,
    createdAt: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
  })
  
  // In a real app, you'd send an email here
  console.log(`🔗 Magic link for ${email}: http://localhost:3000?token=${token}`)
  
  res.json({ success: true, message: 'Magic link sent' })
})

// Verify magic link token
app.get('/api/auth/verify', (req, res) => {
  const { token } = req.query
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' })
  }
  
  const tokenData = tokens.get(token)
  
  if (!tokenData) {
    return res.status(400).json({ error: 'Invalid token' })
  }
  
  if (Date.now() > tokenData.expiresAt) {
    tokens.delete(token)
    return res.status(400).json({ error: 'Token expired' })
  }
  
  // Create or get user
  let user = users.get(tokenData.email)
  if (!user) {
    user = {
      id: `user_${Date.now()}`,
      email: tokenData.email,
      displayName: tokenData.email.split('@')[0],
      createdAt: new Date().toISOString(),
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
      }
    }
    users.set(tokenData.email, user)
  }
  
  // Generate auth token
  const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Clean up magic link token
  tokens.delete(token)
  
  res.json({
    ...user,
    token: authToken
  })
})

// Verify auth token
app.post('/api/auth/verify-token', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header' })
  }
  
  const token = authHeader.substring(7)
  
  // For development, all auth tokens are valid for 24 hours
  const tokenAge = Date.now() - parseInt(token.split('_')[1] || '0')
  const isValid = tokenAge < 24 * 60 * 60 * 1000 // 24 hours
  
  if (isValid) {
    res.json({ valid: true })
  } else {
    res.status(401).json({ error: 'Token expired' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Development auth server running on http://localhost:${PORT}`)
  console.log(`📧 Magic links will be logged to console`)
})