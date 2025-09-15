// Debug component to help troubleshoot authentication issues
import { useAuth } from '../contexts/AuthContext'
import { config } from '../config/development'

export function AuthDebug() {
  const { state } = useAuth()

  // Only show in development
  if (!config.features.showDebugInfo) {
    return null
  }

  const urlParams = new URLSearchParams(window.location.search)
  const hasToken = urlParams.has('token')
  const hasSpotifyCode = urlParams.has('code')
  const hasError = urlParams.has('error')

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-xs max-w-xs z-50">
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🐛 Auth Debug</h4>
      <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
        <div>Authenticated: {state.isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {state.isLoading ? '⏳' : '✅'}</div>
        <div>User: {state.user?.email || 'None'}</div>
        <div>URL Token: {hasToken ? '🔑' : '❌'}</div>
        <div>Spotify Code: {hasSpotifyCode ? '🎵' : '❌'}</div>
        <div>Error: {hasError ? '⚠️' : '✅'}</div>
        {state.error && (
          <div className="text-red-600 dark:text-red-400 mt-2">
            Error: {state.error}
          </div>
        )}
      </div>
    </div>
  )
}