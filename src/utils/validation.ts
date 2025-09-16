import { Task, FocusSession, UserProfile, UserPreferences, DailyStats, WeeklyStats, SessionConfig, SpotifyTrack, SpotifyTokens } from '../types'

// Validation error class
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Helper functions
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

const isValidString = (value: any, minLength = 0): value is string => {
  return typeof value === 'string' && value.length >= minLength
}

const isValidNumber = (value: any, min?: number, max?: number): value is number => {
  if (typeof value !== 'number' || isNaN(value)) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Task validation
export const validateTask = (task: any): Task => {
  if (!task || typeof task !== 'object') {
    throw new ValidationError('Task must be an object')
  }

  if (!isValidString(task.id, 1)) {
    throw new ValidationError('Task ID must be a non-empty string', 'id')
  }

  if (!isValidString(task.text, 1)) {
    throw new ValidationError('Task text must be a non-empty string', 'text')
  }

  if (typeof task.completed !== 'boolean') {
    throw new ValidationError('Task completed must be a boolean', 'completed')
  }

  if (!isValidDate(task.createdAt)) {
    throw new ValidationError('Task createdAt must be a valid Date', 'createdAt')
  }

  if (task.completedAt !== undefined && !isValidDate(task.completedAt)) {
    throw new ValidationError('Task completedAt must be a valid Date or undefined', 'completedAt')
  }

  if (!isValidNumber(task.order, 0)) {
    throw new ValidationError('Task order must be a non-negative number', 'order')
  }

  return {
    id: task.id,
    text: task.text,
    completed: task.completed,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
    order: task.order
  }
}

// FocusSession validation
export const validateFocusSession = (session: any): FocusSession => {
  if (!session || typeof session !== 'object') {
    throw new ValidationError('FocusSession must be an object')
  }

  if (!isValidString(session.id, 1)) {
    throw new ValidationError('Session ID must be a non-empty string', 'id')
  }

  if (session.userId !== undefined && !isValidString(session.userId, 1)) {
    throw new ValidationError('Session userId must be a non-empty string or undefined', 'userId')
  }

  if (!isValidDate(session.startTime)) {
    throw new ValidationError('Session startTime must be a valid Date', 'startTime')
  }

  if (session.endTime !== undefined && !isValidDate(session.endTime)) {
    throw new ValidationError('Session endTime must be a valid Date or undefined', 'endTime')
  }

  if (!isValidNumber(session.plannedDuration, 1, 480)) { // 1-480 minutes (8 hours max)
    throw new ValidationError('Session plannedDuration must be between 1 and 480 minutes', 'plannedDuration')
  }

  if (session.actualDuration !== undefined && !isValidNumber(session.actualDuration, 0)) {
    throw new ValidationError('Session actualDuration must be a non-negative number or undefined', 'actualDuration')
  }

  if (!['work', 'break'].includes(session.sessionType)) {
    throw new ValidationError('Session sessionType must be "work" or "break"', 'sessionType')
  }

  if (typeof session.completed !== 'boolean') {
    throw new ValidationError('Session completed must be a boolean', 'completed')
  }

  if (!isValidNumber(session.pausedTime, 0)) {
    throw new ValidationError('Session pausedTime must be a non-negative number', 'pausedTime')
  }

  if (!Array.isArray(session.tasksWorkedOn)) {
    throw new ValidationError('Session tasksWorkedOn must be an array', 'tasksWorkedOn')
  }

  if (!session.tasksWorkedOn.every((id: any) => isValidString(id, 1))) {
    throw new ValidationError('All task IDs in tasksWorkedOn must be non-empty strings', 'tasksWorkedOn')
  }

  return {
    id: session.id,
    userId: session.userId,
    startTime: session.startTime,
    endTime: session.endTime,
    plannedDuration: session.plannedDuration,
    actualDuration: session.actualDuration,
    sessionType: session.sessionType,
    completed: session.completed,
    pausedTime: session.pausedTime,
    tasksWorkedOn: session.tasksWorkedOn
  }
}

// UserPreferences validation
export const validateUserPreferences = (prefs: any): UserPreferences => {
  if (!prefs || typeof prefs !== 'object') {
    throw new ValidationError('UserPreferences must be an object')
  }

  if (!['light', 'dark', 'system'].includes(prefs.theme)) {
    throw new ValidationError('Theme must be "light", "dark", or "system"', 'theme')
  }

  if (!isValidNumber(prefs.defaultSessionLength, 5, 120)) {
    throw new ValidationError('Default session length must be between 5 and 120 minutes', 'defaultSessionLength')
  }

  if (!isValidNumber(prefs.defaultBreakLength, 1, 60)) {
    throw new ValidationError('Default break length must be between 1 and 60 minutes', 'defaultBreakLength')
  }

  if (typeof prefs.skipBreaks !== 'boolean') {
    throw new ValidationError('Skip breaks must be a boolean', 'skipBreaks')
  }

  if (typeof prefs.notificationsEnabled !== 'boolean') {
    throw new ValidationError('Notifications enabled must be a boolean', 'notificationsEnabled')
  }

  if (typeof prefs.soundEnabled !== 'boolean') {
    throw new ValidationError('Sound enabled must be a boolean', 'soundEnabled')
  }

  if (typeof prefs.spotifyConnected !== 'boolean') {
    throw new ValidationError('Spotify connected must be a boolean', 'spotifyConnected')
  }

  return {
    theme: prefs.theme,
    accentColor: prefs.accentColor || 'blue',
    defaultSessionLength: prefs.defaultSessionLength,
    defaultBreakLength: prefs.defaultBreakLength,
    skipBreaks: prefs.skipBreaks,
    notificationsEnabled: prefs.notificationsEnabled,
    soundEnabled: prefs.soundEnabled,
    spotifyConnected: prefs.spotifyConnected,
    motivationalQuotes: prefs.motivationalQuotes !== undefined ? prefs.motivationalQuotes : true
  }
}

// UserProfile validation
export const validateUserProfile = (profile: any): UserProfile => {
  if (!profile || typeof profile !== 'object') {
    throw new ValidationError('UserProfile must be an object')
  }

  if (!isValidString(profile.id, 1)) {
    throw new ValidationError('Profile ID must be a non-empty string', 'id')
  }

  if (profile.email !== undefined && (!isValidString(profile.email, 1) || !isValidEmail(profile.email))) {
    throw new ValidationError('Profile email must be a valid email address or undefined', 'email')
  }

  if (profile.displayName !== undefined && !isValidString(profile.displayName, 1)) {
    throw new ValidationError('Profile displayName must be a non-empty string or undefined', 'displayName')
  }

  if (!profile.preferences) {
    throw new ValidationError('Profile preferences are required', 'preferences')
  }

  const validatedPreferences = validateUserPreferences(profile.preferences)

  if (!isValidDate(profile.createdAt)) {
    throw new ValidationError('Profile createdAt must be a valid Date', 'createdAt')
  }

  if (!isValidDate(profile.lastActiveAt)) {
    throw new ValidationError('Profile lastActiveAt must be a valid Date', 'lastActiveAt')
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    isAuthenticated: profile.isAuthenticated !== undefined ? profile.isAuthenticated : true,
    preferences: validatedPreferences,
    createdAt: profile.createdAt,
    lastActiveAt: profile.lastActiveAt
  }
}

// DailyStats validation
export const validateDailyStats = (stats: any): DailyStats => {
  if (!stats || typeof stats !== 'object') {
    throw new ValidationError('DailyStats must be an object')
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isValidString(stats.date) || !dateRegex.test(stats.date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format', 'date')
  }

  if (!isValidNumber(stats.sessionsStarted, 0)) {
    throw new ValidationError('Sessions started must be a non-negative number', 'sessionsStarted')
  }

  if (!isValidNumber(stats.sessionsCompleted, 0)) {
    throw new ValidationError('Sessions completed must be a non-negative number', 'sessionsCompleted')
  }

  if (!isValidNumber(stats.totalFocusTime, 0)) {
    throw new ValidationError('Total focus time must be a non-negative number', 'totalFocusTime')
  }

  if (!isValidNumber(stats.tasksCreated, 0)) {
    throw new ValidationError('Tasks created must be a non-negative number', 'tasksCreated')
  }

  if (!isValidNumber(stats.tasksCompleted, 0)) {
    throw new ValidationError('Tasks completed must be a non-negative number', 'tasksCompleted')
  }

  if (!isValidNumber(stats.streak, 0)) {
    throw new ValidationError('Streak must be a non-negative number', 'streak')
  }

  // Logical validation
  if (stats.sessionsCompleted > stats.sessionsStarted) {
    throw new ValidationError('Sessions completed cannot exceed sessions started')
  }

  if (stats.tasksCompleted > stats.tasksCreated) {
    throw new ValidationError('Tasks completed cannot exceed tasks created')
  }

  return {
    date: stats.date,
    sessionsStarted: stats.sessionsStarted,
    sessionsCompleted: stats.sessionsCompleted,
    sessionsStopped: stats.sessionsStopped || 0,
    totalSessions: stats.totalSessions || 0,
    totalFocusTime: stats.totalFocusTime,
    tasksCreated: stats.tasksCreated,
    tasksCompleted: stats.tasksCompleted,
    streak: stats.streak
  }
}

// WeeklyStats validation
export const validateWeeklyStats = (stats: any): WeeklyStats => {
  if (!stats || typeof stats !== 'object') {
    throw new ValidationError('WeeklyStats must be an object')
  }

  if (!isValidDate(stats.weekStart)) {
    throw new ValidationError('Week start must be a valid Date', 'weekStart')
  }

  if (!Array.isArray(stats.dailyStats)) {
    throw new ValidationError('Daily stats must be an array', 'dailyStats')
  }

  if (stats.dailyStats.length !== 7) {
    throw new ValidationError('Daily stats must contain exactly 7 days', 'dailyStats')
  }

  const validatedDailyStats = stats.dailyStats.map((daily: any, index: number) => {
    try {
      return validateDailyStats(daily)
    } catch (error) {
      throw new ValidationError(`Invalid daily stats at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'dailyStats')
    }
  })

  if (!stats.weeklyTotals || typeof stats.weeklyTotals !== 'object') {
    throw new ValidationError('Weekly totals must be an object', 'weeklyTotals')
  }

  if (!isValidNumber(stats.weeklyTotals.sessions, 0)) {
    throw new ValidationError('Weekly total sessions must be a non-negative number', 'weeklyTotals.sessions')
  }

  if (!isValidNumber(stats.weeklyTotals.focusTime, 0)) {
    throw new ValidationError('Weekly total focus time must be a non-negative number', 'weeklyTotals.focusTime')
  }

  if (!isValidNumber(stats.weeklyTotals.tasksCompleted, 0)) {
    throw new ValidationError('Weekly total tasks completed must be a non-negative number', 'weeklyTotals.tasksCompleted')
  }

  return {
    weekStart: stats.weekStart,
    dailyStats: validatedDailyStats,
    weeklyTotals: {
      sessions: stats.weeklyTotals.sessions,
      focusTime: stats.weeklyTotals.focusTime,
      tasksCompleted: stats.weeklyTotals.tasksCompleted
    }
  }
}

// SessionConfig validation
export const validateSessionConfig = (config: any): SessionConfig => {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('SessionConfig must be an object')
  }

  if (!isValidNumber(config.workDuration, 5, 120)) {
    throw new ValidationError('Work duration must be between 5 and 120 minutes', 'workDuration')
  }

  if (!isValidNumber(config.breakDuration, 1, 60)) {
    throw new ValidationError('Break duration must be between 1 and 60 minutes', 'breakDuration')
  }

  if (typeof config.skipBreaks !== 'boolean') {
    throw new ValidationError('Skip breaks must be a boolean', 'skipBreaks')
  }

  if (!['pomodoro', 'custom', 'stopwatch'].includes(config.sessionType)) {
    throw new ValidationError('Session type must be "pomodoro", "custom", or "stopwatch"', 'sessionType')
  }

  return {
    workDuration: config.workDuration,
    breakDuration: config.breakDuration,
    skipBreaks: config.skipBreaks,
    sessionType: config.sessionType
  }
}

// SpotifyTrack validation
export const validateSpotifyTrack = (track: any): SpotifyTrack => {
  if (!track || typeof track !== 'object') {
    throw new ValidationError('SpotifyTrack must be an object')
  }

  if (!isValidString(track.id, 1)) {
    throw new ValidationError('Track id must be a non-empty string', 'id')
  }

  if (!isValidString(track.name, 1)) {
    throw new ValidationError('Track name must be a non-empty string', 'name')
  }

  if (!isValidString(track.album?.name, 1)) {
    throw new ValidationError('Track album name must be a non-empty string', 'album')
  }

  if (!isValidNumber(track.duration_ms, 0)) {
    throw new ValidationError('Track duration must be a non-negative number', 'duration')
  }


  return {
    id: track.id,
    name: track.name,
    artists: track.artists || [],
    album: track.album,
    duration_ms: track.duration_ms,
    external_urls: track.external_urls
  }
}

// SpotifyTokens validation
export const validateSpotifyTokens = (tokens: any): SpotifyTokens => {
  if (!tokens || typeof tokens !== 'object') {
    throw new ValidationError('SpotifyTokens must be an object')
  }

  if (!isValidString(tokens.accessToken, 1)) {
    throw new ValidationError('Access token must be a non-empty string', 'accessToken')
  }

  if (!isValidString(tokens.refreshToken, 1)) {
    throw new ValidationError('Refresh token must be a non-empty string', 'refreshToken')
  }

  if (!isValidDate(tokens.expiresAt)) {
    throw new ValidationError('Expires at must be a valid Date', 'expiresAt')
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt
  }
}

// Utility function to validate arrays of items
export const validateArray = <T>(
  items: any[],
  validator: (item: any) => T,
  fieldName: string
): T[] => {
  if (!Array.isArray(items)) {
    throw new ValidationError(`${fieldName} must be an array`)
  }

  return items.map((item, index) => {
    try {
      return validator(item)
    } catch (error) {
      throw new ValidationError(`Invalid ${fieldName} at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
}