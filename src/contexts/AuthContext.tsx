import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { UserProfile, AuthState } from '../types'
import { config, devLog } from '../config/development'
import { webhookAuthService } from '../services/auth-webhook'

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }

interface AuthContextType {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  sendMagicLink: (email: string) => Promise<{ success: boolean; token?: string; magicLink?: string }>
  waitForVerification: (token: string) => Promise<boolean>
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

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        console.log('🔍 Checking authentication state on mount...')
        
        // Skip auth entirely in development if configured
        if (config.features.skipAuthInDev) {
          devLog.info('Skipping authentication in development mode')
          dispatch({ type: 'SET_USER', payload: null })
          return
        }
        
        // Check if user is already authenticated
        const isAuthenticated = await webhookAuthService.isAuthenticated()
        console.log('🔍 Authentication check result:', isAuthenticated)
        
        if (isAuthenticated) {
          const user = webhookAuthService.getCurrentUser()
          console.log('🔒 User authenticated from stored credentials:', user)
          dispatch({ type: 'SET_USER', payload: user })
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

  // Listen for auth success messages from background script
  useEffect(() => {
    const handleMessage = (message: any, sender: any, sendResponse: (response?: any) => void) => {
      console.log('📨 AuthContext received message:', message, 'from sender:', sender)
      
      if (message.type === 'MAGIC_LINK_AUTH_SUCCESS' && message.token && message.user) {
        console.log('🔗 Received magic link auth success from background script')
        console.log('📋 User data:', message.user)
        console.log('🔑 Auth token:', message.token)
        
        // Update the auth context state directly
        dispatch({ type: 'SET_USER', payload: message.user })
        console.log('✅ User authenticated via magic link message')
        
        sendResponse({ received: true })
      }
    }

    // Listen for messages from background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('👂 Setting up message listener for magic link auth')
      chrome.runtime.onMessage.addListener(handleMessage)
      
      return () => {
        console.log('🔇 Removing message listener')
        chrome.runtime.onMessage.removeListener(handleMessage)
      }
    }
  }, [])

  const sendMagicLink = async (email: string): Promise<{ success: boolean; token?: string; magicLink?: string }> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      // Use webhook service for sending magic links
      console.log('📧 Attempting to send magic link to:', email)
      const result = await webhookAuthService.sendMagicLink(email)
      
      if (result.success) {
        console.log('✅ Magic link sent successfully! User should check their email.')
        console.log('🔗 Magic link:', result.magicLink)
      } else {
        console.log('❌ Failed to send magic link:', result.error)
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to send magic link' })
      }
      
      return result
    } catch (error) {
      console.error('Error sending magic link:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      return { success: false }
    }
  }

  const waitForVerification = async (token: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      // Wait for magic link verification
      const result = await webhookAuthService.waitForVerification(token)
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user })
        return true
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (error) {
      console.error('Error waiting for verification:', error)
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Verification failed' })
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = async () => {
    try {
      // Logout from webhook service
      await webhookAuthService.logout()
      dispatch({ type: 'LOGOUT' })
      
      // Redirect to welcome page with logout indicator
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('logged_out', 'true')
      window.location.href = currentUrl.toString()
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if logout service fails, clear local auth and redirect
      dispatch({ type: 'LOGOUT' })
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('logged_out', 'true')
      window.location.href = currentUrl.toString()
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    state,
    dispatch,
    sendMagicLink,
    waitForVerification,
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
