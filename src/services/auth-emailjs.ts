// Authentication service using EmailJS for magic links
import emailjs from '@emailjs/browser'
import { UserProfile } from '../types'

interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_vela_mail'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_vela_magic_link'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key'

class EmailJSAuthService {
  private pendingTokens: Map<string, { email: string; createdAt: number; expiresAt: number }> = new Map()
  private authenticatedUsers: Map<string, UserProfile> = new Map()

  constructor() {
    // Initialize EmailJS
    console.log('Initializing EmailJS with public key:', EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing')
    emailjs.init(EMAILJS_PUBLIC_KEY)
    
    // Load existing tokens and users from storage
    this.loadFromStorage()
  }

  private async loadFromStorage() {
    try {
      // Check if Chrome API is available
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['pendingTokens', 'authenticatedUsers'])
        
        if (result.pendingTokens) {
          this.pendingTokens = new Map(Object.entries(result.pendingTokens))
        }
        
        if (result.authenticatedUsers) {
          this.authenticatedUsers = new Map(Object.entries(result.authenticatedUsers))
        }
      } else {
        // Fallback to localStorage for development
        const pendingTokens = localStorage.getItem('vela_pendingTokens')
        const authenticatedUsers = localStorage.getItem('vela_authenticatedUsers')
        
        if (pendingTokens) {
          this.pendingTokens = new Map(Object.entries(JSON.parse(pendingTokens)))
        }
        
        if (authenticatedUsers) {
          this.authenticatedUsers = new Map(Object.entries(JSON.parse(authenticatedUsers)))
        }
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error)
    }
  }

  private async saveToStorage() {
    try {
      // Check if Chrome API is available
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          pendingTokens: Object.fromEntries(this.pendingTokens),
          authenticatedUsers: Object.fromEntries(this.authenticatedUsers)
        })
      } else {
        // Fallback to localStorage for development
        localStorage.setItem('vela_pendingTokens', JSON.stringify(Object.fromEntries(this.pendingTokens)))
        localStorage.setItem('vela_authenticatedUsers', JSON.stringify(Object.fromEntries(this.authenticatedUsers)))
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error)
    }
  }

  // Generate a secure token
  private generateToken(): string {
    const timestamp = Date.now().toString(36)
    const randomPart = Math.random().toString(36).substring(2, 15)
    const extraRandom = Math.random().toString(36).substring(2, 15)
    return `vela_${timestamp}_${randomPart}_${extraRandom}`
  }

  // Send magic link via EmailJS
  async sendMagicLink(email: string): Promise<boolean> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format')
      }

      // Generate token
      const token = this.generateToken()
      const now = Date.now()
      const expiresAt = now + (15 * 60 * 1000) // 15 minutes

      // Store token
      this.pendingTokens.set(token, {
        email,
        createdAt: now,
        expiresAt
      })

      // Create magic link
      const magicLink = `${window.location.origin}${window.location.pathname}?token=${token}`

      // Send email using EmailJS - match your template parameters exactly
      const templateParams = {
        to_name: email.split('@')[0], // User's name (part before @)
        magic_link: magicLink,
        expiry_minutes: '15',
        to_email: email,
        email: email // Your template expects 'email' parameter
      }

      console.log('🔧 Sending magic link email to:', email)
      console.log('📋 EmailJS Config:', {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing'
      })
      console.log('📧 Template parameters:', JSON.stringify(templateParams, null, 2))
      console.log('🔗 Magic link:', magicLink)
      
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      )

      console.log('EmailJS response:', response)

      if (response.status === 200) {
        await this.saveToStorage()
        console.log('Magic link sent successfully')
        return true
      } else {
        throw new Error(`EmailJS returned status ${response.status}: ${response.text || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending magic link:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to send magic link')
    }
  }

  // Verify magic link token
  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      const tokenData = this.pendingTokens.get(token)
      
      if (!tokenData) {
        return {
          success: false,
          error: 'Invalid magic link'
        }
      }

      // Check if token has expired
      if (Date.now() > tokenData.expiresAt) {
        this.pendingTokens.delete(token)
        await this.saveToStorage()
        return {
          success: false,
          error: 'Magic link has expired'
        }
      }

      // Create or get user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const user: UserProfile = {
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
        createdAt: new Date(),
        lastActiveAt: new Date(),
        isAuthenticated: true
      }

      // Generate auth token
      const authToken = this.generateToken()

      // Store authenticated user
      this.authenticatedUsers.set(authToken, user)

      // Clean up magic link token
      this.pendingTokens.delete(token)
      
      await this.saveToStorage()

      console.log('User authenticated successfully:', tokenData.email)

      return {
        success: true,
        user,
        token: authToken
      }
    } catch (error) {
      console.error('Error verifying magic link:', error)
      return {
        success: false,
        error: 'Authentication failed'
      }
    }
  }

  // Verify auth token
  async verifyToken(token: string): Promise<boolean> {
    try {
      const user = this.authenticatedUsers.get(token)
      if (!user) {
        return false
      }

      // Check if token is too old (30 days)
      const tokenAge = Date.now() - new Date(user.lastActiveAt).getTime()
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

      if (tokenAge > maxAge) {
        this.authenticatedUsers.delete(token)
        await this.saveToStorage()
        return false
      }

      // Update last active time
      user.lastActiveAt = new Date()
      this.authenticatedUsers.set(token, user)
      await this.saveToStorage()

      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  // Get user by token
  async getUserByToken(token: string): Promise<UserProfile | null> {
    try {
      const user = this.authenticatedUsers.get(token)
      return user || null
    } catch (error) {
      console.error('Error getting user by token:', error)
      return null
    }
  }

  // Update user preferences
  async updateUserPreferences(token: string, preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      const user = this.authenticatedUsers.get(token)
      if (!user) {
        return false
      }

      user.preferences = { ...user.preferences, ...preferences }
      user.lastActiveAt = new Date()
      
      this.authenticatedUsers.set(token, user)
      await this.saveToStorage()
      
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  // Logout user
  async logout(token: string): Promise<boolean> {
    try {
      const deleted = this.authenticatedUsers.delete(token)
      if (deleted) {
        await this.saveToStorage()
      }
      return deleted
    } catch (error) {
      console.error('Error during logout:', error)
      return false
    }
  }

  // Clean up expired tokens (call periodically)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = Date.now()
      let hasChanges = false

      // Clean up expired magic link tokens
      for (const [token, data] of this.pendingTokens.entries()) {
        if (now > data.expiresAt) {
          this.pendingTokens.delete(token)
          hasChanges = true
        }
      }

      // Clean up old authenticated users (30+ days inactive)
      const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
      for (const [token, user] of this.authenticatedUsers.entries()) {
        const userAge = now - new Date(user.lastActiveAt).getTime()
        if (userAge > maxAge) {
          this.authenticatedUsers.delete(token)
          hasChanges = true
        }
      }

      if (hasChanges) {
        await this.saveToStorage()
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
    }
  }

  // Get service status
  getStatus(): { pendingTokens: number; authenticatedUsers: number } {
    return {
      pendingTokens: this.pendingTokens.size,
      authenticatedUsers: this.authenticatedUsers.size
    }
  }
}

export const emailJSAuthService = new EmailJSAuthService()

// Clean up expired tokens every hour
setInterval(() => {
  emailJSAuthService.cleanupExpiredTokens()
}, 60 * 60 * 1000)