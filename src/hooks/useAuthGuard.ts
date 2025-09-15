// Authentication guard hook to prevent authenticated users from seeing login screens
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useAuthGuard() {
  const { state } = useAuth()

  useEffect(() => {
    // If user is authenticated, ensure they never see login-related content
    if (state.isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Clean up any authentication-related URL parameters
      const authParams = ['token', 'code', 'state', 'error']
      let hasAuthParams = false
      
      authParams.forEach(param => {
        if (urlParams.has(param)) {
          hasAuthParams = true
        }
      })
      
      if (hasAuthParams) {
        console.log('🛡️ Auth guard: Cleaning URL parameters for authenticated user')
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [state.isAuthenticated])

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    shouldShowWelcome: !state.isAuthenticated && !state.isLoading
  }
}