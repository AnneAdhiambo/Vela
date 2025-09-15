// Mock authentication service for local development and testing
import { UserProfile } from '../types'

interface MockAuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

class MockAuthService {
  private mockUsers: Record<string, UserProfile> = {
    'test@example.com': {
      id: 'user_123',
      email: 'test@example.com',
      displayName: 'Test User',
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
      createdAt: new Date('2024-01-01'),
      lastActiveAt: new Date(),
      isAuthenticated: true
    },
    'demo@vela.app': {
      id: 'user_456',
      email: 'demo@vela.app',
      displayName: 'Demo User',
      preferences: {
        theme: 'dark',
        accentColor: 'purple',
        defaultSessionLength: 30,
        defaultBreakLength: 10,
        skipBreaks: false,
        notificationsEnabled: true,
        soundEnabled: true,
        spotifyConnected: false,
        motivationalQuotes: true
      },
      createdAt: new Date('2024-01-15'),
      lastActiveAt: new Date(),
      isAuthenticated: true
    }
  }

  private mockTokens: Record<string, string> = {}

  // Simulate sending magic link
  async sendMagicLink(email: string): Promise<boolean> {
    console.log('🔧 [MOCK] Sending magic link to:', email)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate a mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.mockTokens[token] = email
    
    // In a real app, this would send an email
    // For testing, we'll log the magic link to console
    const magicLink = `${window.location.origin}?token=${token}`
    
    console.log('🔧 [MOCK] Magic link generated:', magicLink)
    console.log('🔧 [MOCK] Click this link to simulate email click:', magicLink)
    
    // Auto-apply the token after 2 seconds for easier testing
    setTimeout(() => {
      console.log('🔧 [MOCK] Auto-applying token for testing...')
      const urlParams = new URLSearchParams(window.location.search)
      if (!urlParams.get('token')) {
        const newUrl = `${window.location.pathname}?token=${token}`
        window.history.pushState({}, '', newUrl)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }, 2000)
    
    return true
  }

  // Simulate verifying magic link token
  async verifyMagicLink(token: string): Promise<MockAuthResponse> {
    console.log('🔧 [MOCK] Verifying token:', token)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const email = this.mockTokens[token]
    if (!email) {
      return {
        success: false,
        error: 'Invalid or expired magic link'
      }
    }
    
    // Check if user exists, if not create a new one
    let user = this.mockUsers[email]
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
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
        createdAt: new Date(),
        lastActiveAt: new Date(),
        isAuthenticated: true
      }
      this.mockUsers[email] = user
    }
    
    // Generate auth token
    const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('🔧 [MOCK] Authentication successful for:', email)
    
    return {
      success: true,
      user,
      token: authToken
    }
  }

  // Simulate token verification
  async verifyToken(token: string): Promise<boolean> {
    // For mock purposes, all tokens are valid for 24 hours
    const tokenAge = Date.now() - parseInt(token.split('_')[1] || '0')
    return tokenAge < 24 * 60 * 60 * 1000 // 24 hours
  }

  // Get predefined test users
  getTestUsers(): Array<{ email: string; displayName: string }> {
    return Object.values(this.mockUsers).map(user => ({
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0]
    }))
  }
}

export const mockAuthService = new MockAuthService()

// Development helper to show available test accounts
export const showTestAccounts = () => {
  const testUsers = mockAuthService.getTestUsers()
  console.log('🔧 [MOCK] Available test accounts:')
  testUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.displayName})`)
  })
  console.log('🔧 [MOCK] Use any of these emails to test authentication')
}