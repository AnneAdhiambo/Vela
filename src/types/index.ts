// Core data types for Vela Chrome Extension

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  order: number
}

export interface FocusSession {
  id: string
  userId?: string
  startTime: Date
  endTime?: Date
  plannedDuration: number // minutes
  actualDuration?: number // minutes
  sessionType: 'work' | 'break'
  completed: boolean
  pausedTime: number // minutes
  tasksWorkedOn: string[]
}

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  preferences: UserPreferences
  createdAt: Date
  lastActiveAt: Date
  isAuthenticated: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  error: string | null
}

export interface MotivationalQuote {
  text: string
  author: string
  category: 'productivity' | 'motivation' | 'success' | 'focus'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  accentColor: 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red'
  defaultSessionLength: number // minutes
  defaultBreakLength: number // minutes
  skipBreaks: boolean
  notificationsEnabled: boolean
  soundEnabled: boolean
  spotifyConnected: boolean
  motivationalQuotes: boolean
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  sessionsStarted: number
  sessionsCompleted: number
  sessionsStopped: number
  totalSessions: number
  totalFocusTime: number // minutes
  tasksCreated: number
  tasksCompleted: number
  streak: number
}

export interface WeeklyStats {
  weekStart: Date
  dailyStats: DailyStats[]
  weeklyTotals: {
    sessions: number
    focusTime: number
    tasksCompleted: number
  }
}

export interface SessionConfig {
  workDuration: number // minutes
  breakDuration: number // minutes
  skipBreaks: boolean
  sessionType: 'pomodoro' | 'custom' | 'stopwatch'
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  external_urls: { spotify: string }
}

export interface SpotifyPlaybackState {
  device: {
    id: string
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    type: string
    volume_percent: number
  }
  repeat_state: 'off' | 'track' | 'context'
  shuffle_state: boolean
  context: {
    type: string
    href: string
    external_urls: { spotify: string }
    uri: string
  } | null
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: SpotifyTrack | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
}

export interface SpotifyTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

// Chrome Storage interfaces
export interface LocalStorage {
  currentSession: FocusSession | null
  todaysTasks: Task[]
  todaysStats: DailyStats
  userPreferences: UserPreferences
  lastSync: Date
}

export interface SyncStorage {
  userProfile: UserProfile
  preferences: UserPreferences
  recentTasks: Task[] // Last 50 tasks
  weeklyStats: WeeklyStats[]
}

// Timer state interfaces
export interface TimerState {
  timeRemaining: number // seconds
  isActive: boolean
  isPaused: boolean
  sessionType: 'work' | 'break'
  totalDuration: number // seconds
  streak: number
}

export interface ActiveSession extends FocusSession {
  isActive: boolean
  isPaused: boolean
}

// Message types for background script communication
export type BackgroundMessage = 
  | { type: 'START_TIMER'; duration: number; sessionType?: 'work' | 'break'; sessionId?: string }
  | { type: 'STOP_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'GET_TIMER_STATE' }
  | { type: 'TIMER_COMPLETE'; timestamp: number; sessionType: 'work' | 'break'; duration: number; session: FocusSession }
  | { type: 'SHOW_NOTIFICATION'; id: string; options: any }
  | { type: 'CLEAR_NOTIFICATION'; id: string }
  | { type: 'TEST_NOTIFICATION' }
  | { type: 'UPDATE_NOTIFICATION_PREFERENCES'; preferences: any }

export type BackgroundResponse = 
  | { success: boolean; error?: string }
  | { error: string }
  | { isActive: boolean; isPaused: boolean; timeRemaining: number; session: FocusSession | null; plannedDuration: number }