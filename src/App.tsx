import { useState, useEffect } from 'react'
import { useApp } from './contexts/AppContext'
import { useSpotify } from './contexts/SpotifyContext'
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
import { DevPanel } from './components/DevPanel'
import { AuthDebug } from './components/AuthDebug'
import { Toast } from './components/Toast'
import { useAuthGuard } from './hooks/useAuthGuard'
import { SessionConfig } from './types'
import { chromeApi, isExtensionEnvironment } from './utils/chrome-api'
import { config, devLog, devUtils } from './config/development'

function App() {
  const { state, clearError } = useApp()
  const { playSelectedPlaylist, selectedPlaylist } = useSpotify()
  const { state: authState } = useAuth()
  const { isAuthenticated, isLoading: authLoading, shouldShowWelcome } = useAuthGuard()
  const [showSessionSetup, setShowSessionSetup] = useState(true)
  const [sessionActive, setSessionActive] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(25) // Duration in minutes
  const [spotifyError, setSpotifyError] = useState<string | null>(null)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info')

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

  // Show success toast when user gets authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setToastMessage(`Welcome back, ${authState.user.displayName || authState.user.email}!`)
      setToastType('success')
    }
  }, [authState.isAuthenticated, authState.user])

  // Listen for messages from background script
  useEffect(() => {
    // Only set up message listeners in extension environment
    if (!isExtensionEnvironment()) {
      return
    }

    const handleMessage = (message: any, sender: any, sendResponse: (response?: any) => void) => {
      console.log('App received message:', message)
      
      switch (message.type) {
        case 'TIMER_COMPLETE':
          handleTimerComplete(message)
          break
          
        case 'NOTIFICATION_CLICKED':
          handleNotificationClick(message)
          break
          
        case 'NOTIFICATION_BUTTON_CLICKED':
          handleNotificationButtonClick(message)
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

  const handleTimerComplete = (message: { sessionType: 'work' | 'break'; duration: number; timestamp: number }) => {
    console.log('Timer completed:', message)
    setSessionActive(false)
    setShowSessionSetup(true)
    
    // Update session completion in state if needed
    // This could trigger additional UI updates or statistics updates
  }

  const handleNotificationClick = (message: { notificationId: string; action: string }) => {
    console.log('Notification clicked:', message)
    
    switch (message.action) {
      case 'session-complete':
        // Focus on timer area
        setShowSessionSetup(true)
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

  const handleSessionComplete = (session: { duration: number; sessionType: 'work' | 'break' }) => {
    console.log('Session completed:', session)
    setSessionActive(false)
    setShowSessionSetup(true)
    // TODO: Update statistics and show notification
  }

  const handleSessionStart = async (sessionConfig: SessionConfig) => {
    console.log('Session started:', sessionConfig)
    setSpotifyError(null) // Clear any previous errors
    
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
    setShowSessionSetup(false)
    // TODO: Initialize session with background script
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
    setShowSessionSetup(true)
  }

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration)
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Vela</h1>
          <ProfileDropdown 
            onOpenSettings={() => setShowSettings(true)}
            onOpenNotificationSettings={() => setShowNotificationSettings(true)} 
          />
        </header>

        {/* Motivational Quote */}
        <div className="mb-6">
          <MotivationalQuote />
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Timer Card - shows either SessionSetup or TimerDisplay */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              {showSessionSetup ? (
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
                  initialState={{ 
                    timeRemaining: selectedDuration * 60,
                    totalDuration: selectedDuration * 60,
                    isActive: sessionActive,
                    isPaused: false,
                    sessionType: 'work',
                    streak: 2
                  }}
                />
              )}
            </div>
            
            {/* Stats - only show when not in session setup */}
            {!showSessionSetup && <StatsChart />}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Tasks */}
            <TaskList />
            
            {/* Spotify Widget */}
            <SpotifyWidget />
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