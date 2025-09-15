import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { UserProfile, UserPreferences, Task, DailyStats, TimerState } from '../types'
import { chromeApi } from '../utils/chrome-api'

interface AppState {
  isLoading: boolean
  user: UserProfile | null
  preferences: UserPreferences
  tasks: Task[]
  todaysStats: DailyStats
  timerState: TimerState
  error: string | null
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_TODAYS_STATS'; payload: DailyStats }
  | { type: 'SET_TIMER_STATE'; payload: TimerState }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  clearError: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  accentColor: 'blue',
  defaultSessionLength: 25,
  defaultBreakLength: 5,
  skipBreaks: false,
  notificationsEnabled: true,
  soundEnabled: true,
  spotifyConnected: false,
  motivationalQuotes: true
}

const defaultStats: DailyStats = {
  date: new Date().toISOString().split('T')[0],
  sessionsStarted: 0,
  sessionsCompleted: 0,
  totalFocusTime: 0,
  tasksCreated: 0,
  tasksCompleted: 0,
  streak: 0
}

const defaultTimerState: TimerState = {
  timeRemaining: 25 * 60, // 25 minutes in seconds
  isActive: false,
  isPaused: false,
  sessionType: 'work',
  totalDuration: 25 * 60,
  streak: 0
}

const initialState: AppState = {
  isLoading: true,
  user: null,
  preferences: defaultPreferences,
  tasks: [],
  todaysStats: defaultStats,
  timerState: defaultTimerState,
  error: null
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'SET_TODAYS_STATS':
      return { ...state, todaysStats: action.payload }
    case 'SET_TIMER_STATE':
      return { ...state, timerState: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Load preferences
        const result = await chromeApi.storage.local.get(['userPreferences', 'todaysTasks', 'todaysStats'])
        
        if (result.userPreferences) {
          dispatch({ type: 'SET_PREFERENCES', payload: result.userPreferences })
        }
        
        if (result.todaysTasks) {
          dispatch({ type: 'SET_TASKS', payload: result.todaysTasks })
        }
        
        if (result.todaysStats) {
          dispatch({ type: 'SET_TODAYS_STATS', payload: result.todaysStats })
        }
        
      } catch (error) {
        console.error('Failed to load initial data:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load application data' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadInitialData()
  }, [])

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const updatedPreferences = { ...state.preferences, ...newPreferences }
      dispatch({ type: 'SET_PREFERENCES', payload: updatedPreferences })
      
      await chromeApi.storage.local.set({ userPreferences: updatedPreferences })
    } catch (error) {
      console.error('Failed to update preferences:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save preferences' })
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AppContextType = {
    state,
    dispatch,
    updatePreferences,
    clearError
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}