import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Toast } from './Toast'
import { MagicLinkWait } from './MagicLinkWait'

export function WelcomeScreen() {
  const { sendMagicLink, state, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sendingStep, setSendingStep] = useState<'idle' | 'validating' | 'sending' | 'sent' | 'waiting' | 'error'>('idle')
  const [magicLinkToken, setMagicLinkToken] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  // Check if user just logged out and show welcome back message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const loggedOut = urlParams.get('logged_out')
    
    if (loggedOut === 'true') {
      setToast({
        message: '👋 You have been signed out successfully. Sign in again to continue.',
        type: 'info',
        isVisible: true
      })
      
      // Clean up URL parameter
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Check if there's already an auth token in storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['vela_auth_token', 'vela_user'])
          if (result.vela_auth_token && result.vela_user) {
            console.log('🔍 WelcomeScreen found existing auth, user should be redirected')
            // The AuthContext should handle this, but let's log it for debugging
            return
          }
        } else {
          // Fallback to localStorage
          const token = localStorage.getItem('vela_auth_token')
          const user = localStorage.getItem('vela_user')
          if (token && user) {
            console.log('🔍 WelcomeScreen found existing auth in localStorage, user should be redirected')
            return
          }
        }
      } catch (error) {
        console.error('Error checking existing auth in WelcomeScreen:', error)
      }
    }

    checkExistingAuth()
  }, [])

  // Debug: Monitor state changes
  useEffect(() => {
    console.log('🔍 State changed - sendingStep:', sendingStep, 'magicLinkToken:', magicLinkToken ? 'Set' : 'None')
  }, [sendingStep, magicLinkToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setSendingStep('validating')
    clearError() // Clear any previous errors
    
    // Step 1: Validate email format
    setTimeout(() => {
      setSendingStep('sending')
    }, 500)
    
    try {
      const result = await sendMagicLink(email.trim())
      if (result.success && result.token) {
        console.log('✅ Magic link sent successfully')
        console.log('🔗 Magic link:', result.magicLink)
        
        const emailToSend = email.trim()
        
        // Update states for waiting screen
        setSendingStep('waiting')
        setMagicLinkToken(result.token)
        setSentEmail(emailToSend)
        
        setToast({
          message: `🎉 Magic link sent to ${emailToSend}! Check your email inbox and click the link to sign in.`,
          type: 'success',
          isVisible: true
        })
        
        // Reset form after successful send
        setEmail('')
      } else {
        console.log('❌ Magic link sending failed')
        setSendingStep('error')
        setToast({
          message: '❌ Failed to send magic link. Please try again.',
          type: 'error',
          isVisible: true
        })
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
      setSendingStep('error')
      setToast({
        message: '❌ An error occurred. Please try again.',
        type: 'error',
        isVisible: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkSuccess = () => {
    console.log('✅ Magic link verification successful')
    setSendingStep('sent')
    setToast({
      message: '🎉 Welcome to Vela! You are now signed in.',
      type: 'success',
      isVisible: true
    })
  }

  const handleMagicLinkError = (error: string) => {
    console.error('❌ Magic link verification failed:', error)
    setSendingStep('error')
    setToast({
      message: error || 'Magic link verification failed. Please try again.',
      type: 'error',
      isVisible: true
    })
  }

  const handleMagicLinkCancel = () => {
    setMagicLinkToken(null)
    setSendingStep('idle')
    setToast({ message: '', type: 'info', isVisible: false })
  }

  const handleCloseToast = () => {
    setToast({ ...toast, isVisible: false })
  }

  // Show magic link wait screen when waiting for verification
  if (sendingStep === 'waiting' && magicLinkToken) {
    return (
      <MagicLinkWait
        email={sentEmail}
        token={magicLinkToken}
        onSuccess={handleMagicLinkSuccess}
        onError={handleMagicLinkError}
        onCancel={handleMagicLinkCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="max-w-4xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8 animate-slide-in-left">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Transform Every New Tab Into a 
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Productivity Opportunity</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Focus sessions, task management, and progress tracking - all in your new tab page.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Focus Timer</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>Circular progress timer with customizable Pomodoro sessions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '2s' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Task Management</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>Create, organize, and track your daily tasks with drag-and-drop</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Spotify Integration</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>Control your focus music without leaving your dashboard</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Progress Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>Daily statistics, streak counter, and motivational feedback</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Sign in form */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 animate-slide-in-right hover:shadow-3xl transition-all duration-500 animate-glow">
            <div className="text-center mb-8">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-float">
                <img 
                  src="/logo.png" 
                  alt="Vela Logo" 
                  className="w-full h-full object-contain bg-transparent"
                />
              </div>
              
              {/* Show logout message if user just logged out */}
              {new URLSearchParams(window.location.search).get('logged_out') === 'true' ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    See You Soon
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    You have been successfully signed out. Sign in again to continue your productivity journey.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Get Started with Vela
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Sign in with your email to sync your tasks and settings across devices
                  </p>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isLoading || state.isLoading}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-purple-300"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || state.isLoading || !email.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:shadow-lg"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {sendingStep === 'validating' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating email...
                  </>
                ) : sendingStep === 'sending' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending magic link...
                  </>
                ) : sendingStep === 'sent' ? (
                  <>
                    <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Magic link sent!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Magic Link
                  </>
                )}
              </button>
            </form>

            {state.error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-2">{state.error}</p>
                    <button
                      onClick={clearError}
                      className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p style={{ fontFamily: 'Manrope, sans-serif' }}>No password required. We'll send you a secure link to sign in.</p>
            </div>

            {/* Success message when magic link is sent */}
            {sendingStep === 'sent' && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl animate-in fade-in duration-500 shadow-lg">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-bold text-green-800 dark:text-green-200 text-lg">Welcome to Vela!</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 text-center leading-relaxed">
                  You are now signed in and ready to start your productivity journey.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={handleCloseToast}
        duration={5000}
      />
    </div>
  )
}