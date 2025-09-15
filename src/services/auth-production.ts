// Production authentication service for Vela
import { UserProfile } from '../types'

interface AuthResponse {
  success: boolean
  user?: UserProfile
  token?: string
  error?: string
}

class ProductionAuthService {
  private readonly apiBaseUrl: string
  
  constructor(apiBaseUrl: string = 'https://api.vela-app.com') {
    this.apiBaseUrl = apiBaseUrl
  }

  // Send magic link to user's email
  async sendMagicLink(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          redirectUrl: window.location.origin // For proper redirect after auth
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to send magic link')
      }

      return true
    } catch (error) {
      console.error('Error sending magic link:', error)
      throw error
    }
  }

  // Verify magic link token
  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Invalid or expired magic link')
      }

      const userData = await response.json()
      
      const userProfile: UserProfile = {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName || userData.email.split('@')[0],
        preferences: userData.preferences || {
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
        createdAt: new Date(userData.createdAt),
        lastActiveAt: new Date(),
        isAuthenticated: true
      }

      return {
        success: true,
        user: userProfile,
        token: userData.token
      }
    } catch (error) {
      console.error('Error verifying magic link:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  // Verify auth token
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      return response.ok
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  // Refresh user data
  async refreshUserData(token: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const userData = await response.json()
      
      return {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        preferences: userData.preferences,
        createdAt: new Date(userData.createdAt),
        lastActiveAt: new Date(userData.lastActiveAt),
        isAuthenticated: true
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return null
    }
  }

  // Update user preferences on server
  async updateUserPreferences(token: string, preferences: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      })

      return response.ok
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  // Sync user data (tasks, stats, etc.)
  async syncUserData(token: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Error syncing user data:', error)
      return false
    }
  }

  // Get user data from server
  async getUserData(token: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  // Logout (invalidate token on server)
  async logout(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return response.ok
    } catch (error) {
      console.error('Error during logout:', error)
      return false
    }
  }
}

export const productionAuthService = new ProductionAuthService()