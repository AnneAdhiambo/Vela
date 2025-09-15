import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { UserProfile, AuthState } from '../types'
import { chromeApi } from '../utils/chrome-api'
import { config, devLog } from '../config/development'
import { emailJSAuthService } from '../services/auth-emailjs'

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }

interface AuthContextType {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  sendMagicLink: (email: string) => Promise<boolean>
  verifyMagicLink: (token: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for magic link token in URL on mount
  useEffect(() => {
    const checkForMagicLinkToken = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const spotifyCode = urlParams.get('code') // Check for Spotify OAuth
      
      // Prioritize magic link authentication over Spotify OAuth
      if (token && !spotifyCode) {
        devLog.info('Found magic link token in URL, attempting verification')
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const success = await verifyMagicLink(token)
        if (success) {
          // Clear token from URL and redirect to dashboard
          const newUrl = window.location.pathname
          window.history.replaceState({}, document.title, newUrl)
        }
        
        dispatch({ type: 'SET_LOADING', payload: false })
        return true // Token was processed
      }
      
      return false // No token in URL
    }

    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // First check for magic link token
        const tokenProcessed = await checkForMagicLinkToken()
        if (tokenProcessed) {
          return // Token was processed, auth state is already updated
        }
        
        // Skip auth entirely in development if configured
        if (config.features.skipAuthInDev) {
          devLog.info('Skipping authentication in development mode')
          dispatch({ type: 'SET_USER', payload: null })
          return
        }
        
        const result = await chromeApi.storage.local.get(['userProfile', 'authToken'])
        
        if (result.userProfile && result.authToken) {
          // Verify token is still valid
          const isValid = await verifyToken(result.authToken)
          if (isValid) {
            console.log('🔒 User authenticated from stored credentials')
            dispatch({ type: 'SET_USER', payload: result.userProfile })
            
            // Clean up any URL parameters for authenticated users
            const urlParams = new URLSearchParams(window.location.search)
            if (urlParams.toString().length > 0) {
              console.log('🧹 Cleaning URL parameters for authenticated user')
              window.history.replaceState({}, document.title, window.location.pathname)
            }
          } else {
            // Token expired, clear auth data
            console.log('🔓 Token expired, clearing auth data')
            await chromeApi.storage.local.remove(['userProfile', 'authToken'])
            dispatch({ type: 'SET_USER', payload: null })
          }
        } else {
          console.log('👤 No stored authentication found')
          dispatch({ type: 'SET_USER', payload: null })
        }
      } catch (error) {
        console.error('Failed to check authentication:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to verify authentication' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const sendMagicLink = async (email: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Use EmailJS service for sending magic links
      console.log('📧 Attempting to send magic link to:', email)
      const success = await emailJSAuthService.sendMagicLink(email)
      
      if (success) {
        console.log('✅ Magic link sent successfully! User should check their email.')
      } else {
        console.log('❌ Failed to send magic link')
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
      return success
    } catch (error) {
      console.error('Error sending magic link:', error)
      
      let errorMessage = 'Failed to send magic link. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('422')) {
          errorMessage = 'Email configuration error. Please check your EmailJS setup.'
        } else if (error.message.includes('recipients address is empty')) {
          errorMessage = 'Email template configuration error. Please contact support.'
        } else if (error.message.includes('Invalid email format')) {
          errorMessage = 'Please enter a valid email address.'
        } else {
          errorMessage = error.message
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  const verifyMagicLink = async (token: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Use EmailJS service for verification
      const result = await emailJSAuthService.verifyMagicLink(token)
      
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      // Store user data and token
      await chromeApi.storage.local.set({
        userProfile: result.user,
        authToken: result.token
      })

      dispatch({ type: 'SET_USER', payload: result.user! })
      return true
    } catch (error) {
      console.error('Error verifying magic link:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Invalid or expired magic link' })
      return false
    }
  }

  const logout = async () => {
    try {
      // Get current auth token
      const result = await chromeApi.storage.local.get(['authToken'])
      if (result.authToken) {
        // Logout from EmailJS service
        await emailJSAuthService.logout(result.authToken)
      }
      
      // Clear local storage
      await chromeApi.storage.local.remove(['userProfile', 'authToken'])
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    state,
    dispatch,
    sendMagicLink,
    verifyMagicLink,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to verify token
async function verifyToken(token: string): Promise<boolean> {
  try {
    return await emailJSAuthService.verifyToken(token)
  } catch (error) {
    devLog.error('Token verification failed:', error)
    return false
  }
}