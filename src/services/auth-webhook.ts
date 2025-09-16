// Authentication service using webhook-based magic links
import emailjs from '@emailjs/browser'
import { UserProfile } from '../types'

interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

interface MagicLinkResponse {
  success: boolean
  token?: string
  magicLink?: string
  expiresAt?: number
  error?: string
}

interface TokenStatusResponse {
  success: boolean
  status: 'pending' | 'verified' | 'expired'
  email?: string
  expiresAt?: number
  error?: string
}

class WebhookAuthService {
  private baseUrl: string
  private authToken: string | null = null
  private currentUser: UserProfile | null = null

  // EmailJS configuration - use same as existing EmailJS service
  private EMAILJS_SERVICE_ID = (import.meta as any).env?.VITE_EMAILJS_SERVICE_ID || 'service_b3yn4ot'
  private EMAILJS_TEMPLATE_ID = (import.meta as any).env?.VITE_EMAILJS_TEMPLATE_ID || 'template_iqo2g3r'
  private EMAILJS_PUBLIC_KEY = (import.meta as any).env?.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key'

  constructor() {
    // Use the auth proxy server URL
    this.baseUrl = 'http://127.0.0.1:3001'
    this.loadStoredAuth()
    
    // Initialize EmailJS
    console.log('🔧 EmailJS Configuration:', {
      serviceId: this.EMAILJS_SERVICE_ID,
      templateId: this.EMAILJS_TEMPLATE_ID,
      publicKey: this.EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing'
    })
    
    if (this.EMAILJS_PUBLIC_KEY === 'your_public_key') {
      console.warn('⚠️ EmailJS public key not configured. Please set VITE_EMAILJS_PUBLIC_KEY environment variable.')
    }
    
    emailjs.init(this.EMAILJS_PUBLIC_KEY)
  }

  private async loadStoredAuth() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['vela_auth_token', 'vela_user'])
        if (result.vela_auth_token && result.vela_user) {
          this.authToken = result.vela_auth_token
          this.currentUser = result.vela_user
        }
      } else {
        // Fallback to localStorage for development
        const token = localStorage.getItem('vela_auth_token')
        const user = localStorage.getItem('vela_user')
        if (token && user) {
          this.authToken = token
          this.currentUser = JSON.parse(user)
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error)
    }
  }

  async saveAuthData(token: string, user: UserProfile) {
    return this.saveAuth(token, user)
  }

  private async saveAuth(token: string, user: UserProfile) {
    try {
      this.authToken = token
      this.currentUser = user

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          vela_auth_token: token,
          vela_user: user
        })
      } else {
        // Fallback to localStorage for development
        localStorage.setItem('vela_auth_token', token)
        localStorage.setItem('vela_user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error saving auth:', error)
    }
  }

  private async clearAuth() {
    try {
      this.authToken = null
      this.currentUser = null

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['vela_auth_token', 'vela_user'])
      } else {
        // Fallback to localStorage for development
        localStorage.removeItem('vela_auth_token')
        localStorage.removeItem('vela_user')
      }
    } catch (error) {
      console.error('Error clearing auth:', error)
    }
  }

  // Send magic link request
  async sendMagicLink(email: string): Promise<MagicLinkResponse> {
    try {
      console.log('🔗 Requesting magic link for:', email)
      
      const response = await fetch(`${this.baseUrl}/api/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Magic link request failed:', data)
        return {
          success: false,
          error: data.error || 'Failed to send magic link'
        }
      }

      console.log('✅ Magic link generated:', data.magicLink)

      // Now send the actual email using EmailJS
      try {
        console.log('📧 Sending magic link email via EmailJS...')
        
        const templateParams = {
          to_name: email.split('@')[0], // User's name (part before @)
          magic_link: data.magicLink,
          expiry_minutes: '15',
          to_email: email,
          email: email // Your template expects 'email' parameter
        }

        console.log('📧 EmailJS Config:', {
          serviceId: this.EMAILJS_SERVICE_ID,
          templateId: this.EMAILJS_TEMPLATE_ID,
          publicKey: this.EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing'
        })
        console.log('📧 Template parameters:', JSON.stringify(templateParams, null, 2))
        
        const emailResponse = await emailjs.send(
          this.EMAILJS_SERVICE_ID,
          this.EMAILJS_TEMPLATE_ID,
          templateParams
        )

        console.log('EmailJS response:', emailResponse)

        if (emailResponse.status === 200) {
          console.log('✅ Magic link email sent successfully via EmailJS!')
          console.log('📧 Email sent to:', email)
          console.log('🔗 Magic link:', data.magicLink)
          console.log('⏰ Expires at:', new Date(data.expiresAt).toLocaleString())
        } else {
          console.error('❌ EmailJS failed with status:', emailResponse.status)
          console.error('❌ Response details:', emailResponse)
          throw new Error(`EmailJS returned status ${emailResponse.status}: ${emailResponse.text || 'Unknown error'}`)
        }
      } catch (emailError) {
        console.error('❌ Failed to send email via EmailJS:', emailError)
        // Don't fail the entire request if email sending fails
        // The magic link is still generated and can be used
        console.log('⚠️ Magic link generated but email sending failed. Link:', data.magicLink)
      }

      return data

    } catch (error) {
      console.error('Error sending magic link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Wait for magic link verification (polling)
  async waitForVerification(token: string): Promise<AuthResponse> {
    return new Promise((_resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/auth/wait/${token}`)
          const data: TokenStatusResponse = await response.json()

          if (!response.ok) {
            clearInterval(pollInterval)
            reject(new Error(data.error || 'Verification failed'))
            return
          }

          if (data.status === 'pending') {
            console.log('⏳ Waiting for magic link verification...')
            return
          }

          // Token was verified, now we need to get the auth token
          // This would typically be handled by the success page redirect
          clearInterval(pollInterval)
          reject(new Error('Magic link was clicked but auth token not received'))

        } catch (error) {
          clearInterval(pollInterval)
          reject(error)
        }
      }, 2000) // Poll every 2 seconds

      // Timeout after 15 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        reject(new Error('Magic link verification timeout'))
      }, 15 * 60 * 1000)
    })
  }

  // Verify auth token
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Token verification failed:', data)
        return {
          success: false,
          error: data.error || 'Token verification failed'
        }
      }

      // Save the verified auth
      await this.saveAuth(token, data.user)

      return {
        success: true,
        user: data.user,
        token
      }

    } catch (error) {
      console.error('Error verifying token:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    // First check if we have stored auth data locally
    if (!this.authToken || !this.currentUser) {
      console.log('🔍 No local auth data found')
      return false
    }

    // For basic authentication, just check if we have valid local data
    // Server verification can be done separately if needed
    const hasValidToken = this.authToken && this.authToken.length > 10
    const hasValidUser = this.currentUser && this.currentUser.email && this.currentUser.id
    
    if (hasValidToken && hasValidUser) {
      console.log('✅ Local authentication data is valid')
      return true
    }

    console.log('❌ Local authentication data is invalid')
    return false
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.authToken
  }

  // Logout
  async logout(): Promise<boolean> {
    try {
      await this.clearAuth()
      return true
    } catch (error) {
      console.error('Error during logout:', error)
      return false
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    if (!this.currentUser || !this.authToken) {
      return false
    }

    try {
      this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences }
      await this.saveAuth(this.authToken, this.currentUser)
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  // Get service status
  getStatus() {
    return {
      isAuthenticated: !!this.authToken && !!this.currentUser,
      hasToken: !!this.authToken,
      hasUser: !!this.currentUser
    }
  }
}

export const webhookAuthService = new WebhookAuthService()
