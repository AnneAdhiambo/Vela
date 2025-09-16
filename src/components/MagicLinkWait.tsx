import React, { useState, useEffect } from 'react'

interface MagicLinkWaitProps {
  email: string
  token: string
  onSuccess: (user: any, authToken: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export const MagicLinkWait: React.FC<MagicLinkWaitProps> = ({
  email,
  token,
  onSuccess,
  onError,
  onCancel
}) => {
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds
  const [isPolling, setIsPolling] = useState(true)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [magicLinkClicked, setMagicLinkClicked] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Check if there's already an auth token in storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['vela_auth_token', 'vela_user'])
          if (result.vela_auth_token && result.vela_user) {
            console.log('🔍 MagicLinkWait found existing auth, stopping polling')
            setIsPolling(false)
            onSuccess(result.vela_user, result.vela_auth_token)
            return
          }
        } else {
          // Fallback to localStorage
          const token = localStorage.getItem('vela_auth_token')
          const user = localStorage.getItem('vela_user')
          if (token && user) {
            console.log('🔍 MagicLinkWait found existing auth in localStorage, stopping polling')
            setIsPolling(false)
            onSuccess(JSON.parse(user), token)
            return
          }
        }
      } catch (error) {
        console.error('Error checking existing auth:', error)
      }
    }

    checkExistingAuth()
  }, [onSuccess])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsPolling(false)
          onError('Magic link has expired. Please try again.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onError])

  // Polling for verification
  useEffect(() => {
    if (!isPolling) return

    const pollForVerification = async () => {
      try {
        setPollingAttempts(prev => prev + 1)
        
        // Check if token is still valid
        const response = await fetch(`http://127.0.0.1:3001/api/auth/wait/${token}`)
        const data = await response.json()

        if (!response.ok) {
          if (data.error === 'Magic link has expired') {
            setIsPolling(false)
            onError('Magic link has expired. Please try again.')
            return
          }
          if (data.error === 'Invalid or expired token') {
            // Token was consumed - this means the user clicked the magic link
            // Stop polling and let the localStorage detection handle the auth
            console.log('🔗 Token was consumed (magic link clicked), stopping polling')
            setIsPolling(false)
            setMagicLinkClicked(true)
            // Don't call onError - this is expected when magic link is clicked
            return
          }
          throw new Error(data.error || 'Verification failed')
        }

        // Check if magic link was completed
        if (data.status === 'completed') {
          console.log('✅ Magic link completed successfully')
          setIsPolling(false)
          // Don't call onSuccess here, let the localStorage check handle it
          return
        }

        // Continue polling if still pending
        if (data.status === 'pending') {
          setTimeout(pollForVerification, 2000) // Poll every 2 seconds
          return
        }

        // If we get here, something went wrong
        throw new Error('Unexpected response from server')

      } catch (error) {
        console.error('Polling error:', error)
        setIsPolling(false)
        onError(error instanceof Error ? error.message : 'Verification failed')
      }
    }

    // Start polling after a short delay
    const timeoutId = setTimeout(pollForVerification, 1000)
    return () => clearTimeout(timeoutId)
  }, [token, isPolling, onError])

  // Listen for auth success from the success page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 MagicLinkWait received message:', event.data, 'from origin:', event.origin)
      
      // Allow messages from localhost (development) and any origin for now
      if (event.origin !== 'http://127.0.0.1:3001' && event.origin !== 'http://localhost:3001') {
        console.log('🚫 MagicLinkWait ignoring message from origin:', event.origin)
        return
      }
      
      if (event.data.type === 'AUTH_SUCCESS' && event.data.token) {
        console.log('✅ MagicLinkWait received auth success, stopping polling')
        setIsPolling(false)
        onSuccess(event.data.user, event.data.token)
      }
    }

    console.log('👂 MagicLinkWait setting up message listener')
    window.addEventListener('message', handleMessage)
    return () => {
      console.log('🔇 MagicLinkWait removing message listener')
      window.removeEventListener('message', handleMessage)
    }
  }, [onSuccess])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = ((15 * 60 - timeRemaining) / (15 * 60)) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Email Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We've sent a magic link to
            </p>

            {/* Email Display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
              <span className="font-mono text-sm text-gray-900 dark:text-white">
                {email}
              </span>
            </div>

            {/* Instructions */}
            <div className="text-left mb-6 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300">1</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Open your email inbox and look for an email from Vela
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300">2</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Click the magic link in the email
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-300">3</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You'll be automatically signed in
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span>Time remaining</span>
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              {magicLinkClicked ? (
                <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Magic link clicked! Checking authentication...</span>
                </div>
              ) : isPolling ? (
                <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Waiting for you to click the link...</span>
                </div>
              ) : (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  Verification failed or expired
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Resend Magic Link
              </button>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400">
                <div>Polling attempts: {pollingAttempts}</div>
                <div>Token: {token.substring(0, 8)}...</div>
                <div>Status: {isPolling ? 'Active' : 'Stopped'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Can't find the email? Check your spam folder or try again.
          </p>
        </div>
      </div>
    </div>
  )
}
