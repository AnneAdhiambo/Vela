import { useEffect, useState } from 'react'
import { TimerState, SessionConfig } from '../types'
import { 
  formatTime, 
  calculateProgress, 
  calculateStrokeDashoffset,
  getTimerStateDescription
} from '../utils/timer'

// Helper function to check if we're in extension environment
const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id
}

interface TimerDisplayProps {
  onSessionComplete: (session: { duration: number; sessionType: 'work' | 'break' }) => void
  onSessionStart: (sessionConfig: SessionConfig) => void
  onNewSession?: () => void
  onStopSession?: () => void
  initialState?: Partial<TimerState>
}


const defaultTimerState: TimerState = {
  timeRemaining: 25 * 60, // 25 minutes in seconds
  isActive: false,
  isPaused: false,
  sessionType: 'work',
  totalDuration: 25 * 60,
  streak: 2
}

export function TimerDisplay({ onSessionComplete, onSessionStart, onNewSession, onStopSession, initialState }: TimerDisplayProps) {
  const [timerState, setTimerState] = useState({
    ...defaultTimerState,
    ...initialState
  })
  const [, setIsInitialized] = useState(false)

  // Sync with background script for real-time updates
  useEffect(() => {
    if (!isExtensionEnvironment()) {
      return
    }

    const syncWithBackground = async () => {
      try {
        const backgroundState = await chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' })
        console.log('🔄 TimerDisplay syncing with background:', backgroundState)
        
        if (backgroundState && backgroundState.isActive) {
          setTimerState({
            timeRemaining: Math.ceil(backgroundState.timeRemaining),
            totalDuration: Math.ceil(backgroundState.plannedDuration),
            isActive: backgroundState.isActive,
            isPaused: backgroundState.isPaused,
            sessionType: 'work',
            streak: 2
          })
          setIsInitialized(true)
        } else if (backgroundState && !backgroundState.isActive) {
          // Session ended, reset to default state
          setTimerState({
            ...defaultTimerState,
            ...initialState
          })
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Failed to sync timer with background:', error)
      }
    }

    // Always sync immediately on mount
    syncWithBackground()

    // Then sync every second for real-time updates
    const interval = setInterval(syncWithBackground, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Session completion effect
  useEffect(() => {
    if (timerState.isActive && timerState.timeRemaining === 0) {
      onSessionComplete({
        duration: timerState.totalDuration,
        sessionType: timerState.sessionType
      })
    }
  }, [timerState.timeRemaining, timerState.isActive, timerState.totalDuration, timerState.sessionType, onSessionComplete])

  const progress = calculateProgress(timerState.timeRemaining, timerState.totalDuration)
  const strokeDashoffset = calculateStrokeDashoffset(progress)
  // const showCompletionAnimation = shouldShowCompletionAnimation(timerState.timeRemaining, timerState.totalDuration)
  const timerDescription = getTimerStateDescription(timerState.isActive, timerState.isPaused, timerState.timeRemaining)

  const handleStartPause = async () => {
    if (!timerState.isActive) {
      // Start new session
      const sessionConfig: SessionConfig = {
        workDuration: 25,
        breakDuration: 5,
        skipBreaks: false,
        sessionType: 'pomodoro'
      }
      onSessionStart(sessionConfig)
    } else {
      // Pause/Resume existing session
      try {
        if (timerState.isPaused) {
          await chrome.runtime.sendMessage({ type: 'RESUME_TIMER' })
        } else {
          await chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' })
        }
      } catch (error) {
        console.error('Failed to pause/resume timer:', error)
      }
    }
  }

  const handleStop = () => {
    if (onStopSession) {
      onStopSession()
    } else {
      onSessionComplete({
        duration: timerState.totalDuration,
        sessionType: timerState.sessionType
      })
    }
  }

  // const getButtonText = (): string => {
  //   if (!timerState.isActive) return 'Start Session'
  //   if (timerState.isPaused) return 'Resume'
  //   return 'Pause'
  // }

  // const getStatusIcon = () => {
  //   if (!timerState.isActive) {
  //     return (
  //       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
  //         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  //       </svg>
  //     )
  //   }
  //   
  //   if (timerState.isPaused) {
  //     return (
  //       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
  //         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  //       </svg>
  //     )
  //   }
  //   
  //   return (
  //     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
  //       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  //     </svg>
  //   )
  // }

  return (
    <div className="text-center">
      <div 
        className="relative w-40 h-40 mx-auto mb-4"
        role="timer"
        aria-label={timerDescription}
        aria-live="polite"
        aria-atomic="true"
      >
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-indigo-500 dark:text-indigo-400 transition-all duration-1000 ease-linear"
            style={{
              filter: timerState.isActive && !timerState.isPaused 
                ? 'drop-shadow(0 0 8px currentColor)' 
                : 'none'
            }}
          />
        </svg>
        
        {/* Timer display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className="text-2xl font-bold text-gray-800 dark:text-gray-100"
            aria-label={`${formatTime(timerState.timeRemaining)} remaining`}
          >
            {formatTime(timerState.timeRemaining)}
          </div>
          <div className="text-orange-500 dark:text-orange-400 mt-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Streak display */}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {timerState.streak}-day streak
      </div>
      
        {/* Control buttons */}
        {!timerState.isActive && (
          <div className="flex space-x-2 justify-center">
            <button 
              onClick={handleStartPause}
              className="btn-accent px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start
            </button>
            {onNewSession && (
              <button 
                onClick={onNewSession}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                New Session
              </button>
            )}
          </div>
        )}
      
      {timerState.isActive && (
        <div className="flex space-x-2 justify-center">
          <button 
            onClick={handleStartPause}
            className="btn-accent px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {timerState.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={handleStop}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Stop
          </button>
        </div>
      )}
    </div>
  )
}