import { useState, useEffect } from 'react'
import { useApp } from './contexts/AppContext'
import { useSpotify } from './contexts/SpotifyContext'
import { useTheme } from './contexts/ThemeContext'
import { spotifyService } from './services/spotify'
import { useAuth } from './contexts/AuthContext'
import { LoadingScreen } from './components/LoadingSpinner'
import { WelcomeScreen } from './components/WelcomeScreen'
import { TimerDisplay } from './components/TimerDisplay'
import { ProfileDropdown } from './components/ProfileDropdown'
import { TaskList } from './components/TaskList'
import { StatsChart } from './components/StatsChart'
import { SpotifyWidget } from './components/SpotifyWidget'
import { SessionSetup } from './components/SessionSetup'
import { NotificationSettings } from './components/NotificationSettings'
import { Settings } from './components/Settings'
import { MotivationalQuote } from './components/MotivationalQuote'
import { MotivationalGreeting } from './components/MotivationalGreeting'
import { DevPanel } from './components/DevPanel'
import { AuthDebug } from './components/AuthDebug'
import { Toast } from './components/Toast'
import { useAuthGuard } from './hooks/useAuthGuard'
import { SessionConfig } from './types'
import { chromeApi, isExtensionEnvironment } from './utils/chrome-api'
import { config, devLog, devUtils } from './config/development'
import './styles/accent-colors.css'

function App() {
  const { state, clearError } = useApp()
  const { playSelectedPlaylist, selectedPlaylist } = useSpotify()
  const { state: authState } = useAuth()
  const { accentColor } = useTheme()
  const { isLoading: authLoading, shouldShowWelcome } = useAuthGuard()
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionStopped, setSessionStopped] = useState(false) // Track if session was manually stopped
  const [selectedDuration, setSelectedDuration] = useState(25) // Duration in minutes
  const [spotifyError, setSpotifyError] = useState<string | null>(null)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [restoredTimerState, setRestoredTimerState] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')
  const [isLoading, setIsLoading] = useState(true)

  // Development setup
  useEffect(() => {
    if (config.features.showDebugInfo) {
      devLog.info('Vela Chrome Extension - Development Mode')
      devLog.info('Available dev utilities:', Object.keys(devUtils))
      
      // Populate test data if configured
      if (config.dev.prefillTestData) {
        devUtils.populateTestData()
      }
    }
  }, [])

  // Show success toast when user gets authenticated (only on first login, not refresh)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Only show welcome toast if we don't have a stored session (indicating first login)
      const checkFirstLogin = async () => {
        try {
          const result = await chrome.storage.local.get(['hasShownWelcomeToast'])
          if (!result.hasShownWelcomeToast) {
            setToastMessage(`Welcome back, ${authState.user?.displayName || authState.user?.email}!`)
      setToastType('success')
            await chrome.storage.local.set({ hasShownWelcomeToast: true })
          }
        } catch (error) {
          console.error('Failed to check welcome toast state:', error)
        }
      }
      checkFirstLogin()
    }
  }, [authState.isAuthenticated, authState.user])

  // Load session state from storage on mount and sync with background script
  useEffect(() => {
    const loadSessionState = async () => {
      try {
        // First load from local storage
        const result = await chrome.storage.local.get(['currentSession', 'timerState'])
        const currentSession = result.currentSession
        const timerState = result.timerState
        
        if (currentSession?.isActive || timerState?.isActive) {
          setSessionActive(true)
          console.log('🔄 Restored active session from storage')
        }

        // Then sync with background script for real-time state
        if (isExtensionEnvironment()) {
          const backgroundState = await chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' })
          console.log('📱 Background timer state:', backgroundState)
          
          if (backgroundState && backgroundState.isActive) {
            setSessionActive(true)
            console.log('🔄 Synced with background script - session is active')
            
            // If we have timer details, update the selected duration and store timer state
            if (backgroundState.timeRemaining && backgroundState.plannedDuration) {
              const durationInMinutes = Math.ceil(backgroundState.plannedDuration / 60)
              setSelectedDuration(durationInMinutes)
              setRestoredTimerState(backgroundState)
              console.log('🔄 Restored timer duration:', durationInMinutes, 'minutes')
              console.log('🔄 Time remaining:', Math.ceil(backgroundState.timeRemaining / 60), 'minutes')
              console.log('🔄 Timer paused:', backgroundState.isPaused)
            }
          } else if (backgroundState && !backgroundState.isActive) {
            // Background script says no active session, make sure UI reflects this
            setSessionActive(false)
            console.log('🔄 Background script confirms no active session')
          }
        }
      } catch (error) {
        console.error('Failed to load session state:', error)
      } finally {
        // Hide loading overlay after state is loaded
        setTimeout(() => setIsLoading(false), 500) // Small delay for smooth transition
      }
    }

    if (isExtensionEnvironment()) {
      loadSessionState()
    } else {
      // In non-extension environment, hide loading immediately
      setIsLoading(false)
    }
  }, [])

  // Listen for messages from background script
  useEffect(() => {
    // Only set up message listeners in extension environment
    if (!isExtensionEnvironment()) {
      return
    }

    const handleMessage = (message: any, _sender: any, sendResponse: (response?: any) => void) => {
      console.log('App received message:', message)
      
      switch (message.type) {
        case 'TIMER_COMPLETE':
          handleTimerComplete(message)
          break
          
        case 'TIMER_STARTED':
          setSessionActive(true)
          setToastMessage('Session started! Focus time begins now 🎯')
          setToastType('success')
          break
          
        case 'TIMER_STOPPED':
          setSessionActive(false)
          break
          
        case 'TIMER_PAUSED':
          setToastMessage('Session paused ⏸️')
          setToastType('info')
          break
          
        case 'TIMER_RESUMED':
          setToastMessage('Session resumed ▶️')
          setToastType('info')
          break
          
        case 'NOTIFICATION_CLICKED':
          handleNotificationClick(message)
          break
          
        case 'NOTIFICATION_BUTTON_CLICKED':
          handleNotificationButtonClick(message)
          break
          
        case 'SPOTIFY_AUTH_SUCCESS':
          // Let Spotify context handle this
          break
          
        case 'GET_TIMER_STATE':
          // This is handled by the sync function, not here
          break
          
        default:
          console.log('Unknown message type:', message.type)
      }
      
      sendResponse({ received: true })
    }

    // Add message listener
    chromeApi.runtime.onMessage.addListener(handleMessage)
    
    // Cleanup
    return () => {
      chromeApi.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  // Periodic sync with background script to keep UI in sync
  useEffect(() => {
    if (!isExtensionEnvironment()) {
      return
    }

    const syncWithBackground = async () => {
      try {
        const backgroundState = await chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' })
        console.log('🔄 Background state response:', backgroundState)
        if (backgroundState && typeof backgroundState.isActive === 'boolean') {
          const shouldBeActive = backgroundState.isActive
          if (shouldBeActive !== sessionActive) {
            setSessionActive(shouldBeActive)
            console.log('🔄 Synced session state with background:', shouldBeActive)
            
            // Update restored timer state if session is active
            if (shouldBeActive && backgroundState.timeRemaining && backgroundState.plannedDuration) {
              setRestoredTimerState(backgroundState)
              console.log('🔄 Updated restored timer state from background')
            } else if (!shouldBeActive) {
              setRestoredTimerState(null)
            }
          }
        } else {
          console.log('🔄 No valid background state received, keeping current state')
        }
      } catch (error) {
        console.error('Failed to sync with background script:', error)
      }
    }

    // Sync immediately on mount
    syncWithBackground()

    // Then sync every 2 seconds for real-time updates across tabs
    const syncInterval = setInterval(syncWithBackground, 2000)
    
    return () => clearInterval(syncInterval)
  }, [sessionActive])

  const handleTimerComplete = async (message: { sessionType: 'work' | 'break'; duration: number; timestamp: number }) => {
    console.log('Timer completed:', message)
    setSessionActive(false)
    
    // Stop Spotify playback when session completes
    try {
      if (selectedPlaylist) {
        console.log('🎵 Stopping Spotify playback after session completion')
        await spotifyService.pausePlayback()
      }
    } catch (error) {
      console.error('Failed to stop Spotify playback:', error)
    }
    
    // Update session completion in state if needed
    // This could trigger additional UI updates or statistics updates
  }

  const handleNotificationClick = (message: { notificationId: string; action: string }) => {
    console.log('Notification clicked:', message)
    
    switch (message.action) {
      case 'session-complete':
        // Focus on timer area
        setSessionActive(false)
        break
        
      case 'focus-tasks':
        // Scroll to or highlight tasks section
        const tasksElement = document.querySelector('[data-testid="task-list"]')
        if (tasksElement) {
          tasksElement.scrollIntoView({ behavior: 'smooth' })
        }
        break
        
      case 'show-stats':
        // Focus on stats section
        const statsElement = document.querySelector('[data-testid="stats-chart"]')
        if (statsElement) {
          statsElement.scrollIntoView({ behavior: 'smooth' })
        }
        break
    }
  }

  const handleNotificationButtonClick = (message: { notificationId: string; buttonIndex: number; action: string }) => {
    console.log('Notification button clicked:', message)
    
    switch (message.action) {
      case 'take-break':
        // Start a break session
        const breakConfig: SessionConfig = {
          workDuration: 5,
          breakDuration: 5,
          skipBreaks: false,
          sessionType: 'custom'
        }
        handleSessionStart(breakConfig)
        break
        
      case 'continue-working':
        // Start another work session
        const workConfig: SessionConfig = {
          workDuration: selectedDuration,
          breakDuration: 5,
          skipBreaks: true,
          sessionType: 'pomodoro'
        }
        handleSessionStart(workConfig)
        break
        
      case 'view-tasks':
        // Focus on tasks
        const tasksElement = document.querySelector('[data-testid="task-list"]')
        if (tasksElement) {
          tasksElement.scrollIntoView({ behavior: 'smooth' })
        }
        break
    }
  }

  const handleSessionComplete = async (session: { duration: number; sessionType: 'work' | 'break' }) => {
    console.log('Session completed:', session)
    setSessionActive(false)
    
    // Show success toast
    setToastMessage('🎉 Session completed! Great work!')
    setToastType('success')
    
        // Track the session as completed
        try {
          console.log('📊 Tracking completed session:', {
            completed: true,
            duration: session.duration,
            timestamp: Date.now()
          })
          await chrome.runtime.sendMessage({
            type: 'TRACK_SESSION',
            sessionData: {
              completed: true,
              duration: session.duration,
              timestamp: Date.now()
            }
          })
        } catch (error) {
          console.error('Failed to track completed session:', error)
        }
  }


  const handleSessionStart = async (sessionConfig: SessionConfig) => {
    console.log('Session started:', sessionConfig)
    setSpotifyError(null) // Clear any previous errors
    setRestoredTimerState(null) // Clear any restored state
    setSessionStopped(false) // Reset stopped state when starting new session
    
    // Start session with background script
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'START_TIMER',
        duration: sessionConfig.workDuration,
        sessionType: 'work',
        sessionId: Date.now().toString()
      })
      
      if (response && response.success) {
        console.log('✅ Session started with background script')
      } else {
        console.warn('⚠️ Failed to start session with background script')
      }
    } catch (error) {
      console.error('❌ Error starting session with background script:', error)
    }
    
    // Start Spotify playlist if one is selected
    if (selectedPlaylist) {
      try {
        console.log('🎵 Starting Spotify playlist:', selectedPlaylist.name)
        const success = await playSelectedPlaylist()
        if (success) {
          console.log('✅ Successfully started playing:', selectedPlaylist.name)
        } else {
          console.warn('⚠️ Failed to start playlist playback')
          setSpotifyError('Failed to start music playback. Please check your Spotify connection.')
        }
      } catch (error) {
        console.error('❌ Failed to start playlist:', error)
        if (error instanceof Error) {
          setSpotifyError(error.message)
          console.error('Spotify Error:', error.message)
        } else {
          setSpotifyError('Failed to start music playback. Please try again.')
        }
      }
    } else {
      console.log('🔇 No Spotify playlist selected - starting session without music')
    }
    
    setSessionActive(true)
  }

  const handleSetupSession = (duration: number, skipBreaks: boolean) => {
    setSelectedDuration(duration)
    const sessionConfig: SessionConfig = {
      workDuration: duration,
      breakDuration: 5,
      skipBreaks,
      sessionType: 'pomodoro'
    }
    handleSessionStart(sessionConfig)
  }

  const handleNewSession = () => {
    setSessionActive(false)
    setSessionStopped(false) // Reset stopped state to go back to setup
  }

  const handleStopSession = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'STOP_TIMER'
      })
      
      if (response && response.success) {
        console.log('✅ Session stopped with background script')
        
        // Stop Spotify playback when session is stopped
        try {
          if (selectedPlaylist) {
            console.log('🎵 Stopping Spotify playback after session stop')
            await spotifyService.pausePlayback()
          }
        } catch (error) {
          console.error('Failed to stop Spotify playback:', error)
        }
        
        // Show toast notification for stopped session
        setToastMessage('Session stopped - marked as uncompleted')
        setToastType('info')
        
        // Track the session as uncompleted - calculate actual elapsed time
        const actualElapsedTime = restoredTimerState 
          ? Math.ceil((restoredTimerState.plannedDuration - restoredTimerState.timeRemaining) / 60) // Convert to minutes
          : 0 // Fallback to 0 if no timer state
        
        console.log('📊 Tracking stopped session:', {
          completed: false,
          plannedDuration: restoredTimerState ? Math.ceil(restoredTimerState.plannedDuration / 60) : selectedDuration,
          actualElapsedTime: actualElapsedTime,
          timestamp: Date.now()
        })
        await chrome.runtime.sendMessage({
          type: 'TRACK_SESSION',
          sessionData: {
            completed: false,
            duration: actualElapsedTime, // Use actual elapsed time, not planned duration
            timestamp: Date.now()
          }
        })
      } else {
        console.warn('⚠️ Failed to stop session with background script')
      }
    } catch (error) {
      console.error('❌ Error stopping session with background script:', error)
    }
    
    setSessionActive(false)
    setSessionStopped(true) // Mark session as stopped (stays on timer page)
    setRestoredTimerState(null) // Clear restored state
  }

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration)
  }

  const handleLogout = () => {
    setToastMessage('👋 You have been signed out successfully')
    setToastType('info')
  }

  // Show loading screen while checking authentication
  if (authLoading || authState.isLoading) {
    return <LoadingScreen />
  }

  // Auth guard: Show welcome screen ONLY if user should see it
  if (shouldShowWelcome) {
    return <WelcomeScreen />
  }

  // Show loading screen while loading app data for authenticated users
  if (state.isLoading) {
    return <LoadingScreen />
  }

  // At this point, user is definitely authenticated and should see the dashboard
  console.log('🏠 Rendering dashboard for authenticated user')

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors relative theme-${accentColor}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
          <div className="text-center">
            {/* Shimmer Effect */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-ping opacity-20"></div>
            </div>
            
            {/* Loading Text with Shimmer */}
            <div className="space-y-2">
              <div className="h-6 w-48 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 mx-auto bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            </div>
            
            {/* Animated Dots */}
            <div className="flex justify-center space-x-1 mt-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Vela Logo" 
                className="w-10 h-10 object-contain bg-transparent"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Vela</h1>
          </div>
          <ProfileDropdown 
            onOpenSettings={() => setShowSettings(true)}
            onOpenNotificationSettings={() => setShowNotificationSettings(true)}
            onLogout={handleLogout}
          />
        </header>

        {/* Motivational Greeting */}
        <div className="mb-6">
          <MotivationalGreeting />
        </div>

        {/* Motivational Quote */}
        <div className="mb-6">
          <MotivationalQuote />
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Timer Card - shows either SessionSetup or TimerDisplay */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 relative overflow-hidden">
              {/* Shimmer effect for timer card */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-700/20 animate-pulse"></div>
              )}
              
              {!sessionActive && !sessionStopped ? (
                <SessionSetup 
                  onStartSession={handleSetupSession} 
                  onDurationChange={handleDurationChange}
                  initialDuration={selectedDuration}
                />
              ) : (
                <TimerDisplay
                  onSessionComplete={handleSessionComplete}
                  onSessionStart={handleSessionStart}
                  onNewSession={handleNewSession}
                  onStopSession={handleStopSession}
                  initialState={restoredTimerState ? {
                    timeRemaining: Math.ceil(restoredTimerState.timeRemaining),
                    totalDuration: Math.ceil(restoredTimerState.plannedDuration),
                    isActive: restoredTimerState.isActive,
                    isPaused: restoredTimerState.isPaused,
                    sessionType: 'work',
                    streak: 2
                  } : { 
                    timeRemaining: selectedDuration * 60,
                    totalDuration: selectedDuration * 60,
                    isActive: sessionActive,
                    isPaused: false,
                    sessionType: 'work',
                    streak: 2
                  }}
                  key={sessionActive ? 'active' : 'inactive'}
                />
              )}
            </div>
            
            {/* Stats - show when session is active or when session was stopped */}
            {(sessionActive || sessionStopped) && <StatsChart />}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Tasks */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-gray-700/10 animate-pulse rounded-lg"></div>
              )}
            <TaskList />
            </div>
            
            {/* Spotify Widget */}
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-gray-700/10 animate-pulse rounded-lg"></div>
              )}
            <SpotifyWidget />
            </div>
          </div>
        </div>

        {/* Error display */}
        {(state.error || spotifyError) && (
          <div className="fixed bottom-4 right-4 max-w-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 border-red-500">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{state.error || spotifyError}</p>
                </div>
                <button 
                  onClick={() => {
                    if (state.error) clearError()
                    if (spotifyError) setSpotifyError(null)
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <NotificationSettings 
          isOpen={showNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
        
        <Settings 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Development Panel */}
        <DevPanel />
        
        {/* Authentication Debug (development only) */}
        <AuthDebug />
        
        {/* Toast Notifications */}
        <Toast
          message={toastMessage || ''}
          type={toastType}
          isVisible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </div>
  )
}

export default App