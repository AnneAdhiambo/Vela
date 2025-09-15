// Background service worker for Vela Chrome Extension

// Timer management service for accurate background timing
class TimerManager {
  private static readonly TIMER_ALARM_NAME = 'focusTimer'
  private static readonly PAUSE_ALARM_NAME = 'pauseTimer'
  
  async startSession(config: {
    duration: number // minutes
    sessionType: 'work' | 'break'
    sessionId?: string
  }): Promise<void> {
    console.log('Starting timer session:', config)
    
    // Clear any existing alarms
    await this.clearAllTimerAlarms()
    
    // Create new alarm for the session
    await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
      delayInMinutes: config.duration
    })
    
    // Create session object
    const session = {
      id: config.sessionId || Date.now().toString(),
      startTime: new Date(),
      endTime: undefined,
      plannedDuration: config.duration,
      actualDuration: undefined,
      sessionType: config.sessionType,
      completed: false,
      pausedTime: 0,
      tasksWorkedOn: [],
      isActive: true,
      isPaused: false
    }
    
    // Save session state
    await chrome.storage.local.set({ 
      currentSession: session,
      timerState: {
        isActive: true,
        isPaused: false,
        startTime: session.startTime.getTime(),
        plannedDuration: config.duration * 60 * 1000, // Convert to milliseconds
        pausedTime: 0
      }
    })
    
    // Update daily stats
    await this.updateSessionStats('started')
    
    console.log('Timer session started successfully')
  }
  
  async pauseSession(): Promise<void> {
    console.log('Pausing timer session')
    
    const result = await chrome.storage.local.get(['currentSession', 'timerState'])
    if (!result.currentSession || !result.timerState || !result.timerState.isActive) {
      throw new Error('No active session to pause')
    }
    
    // Get current alarm to calculate elapsed time
    const alarm = await chrome.alarms.get(TimerManager.TIMER_ALARM_NAME)
    if (!alarm) {
      throw new Error('No active timer alarm found')
    }
    
    // Calculate elapsed time
    const now = Date.now()
    const elapsedTime = now - result.timerState.startTime - result.timerState.pausedTime
    const remainingTime = result.timerState.plannedDuration - elapsedTime
    
    // Clear the alarm
    await chrome.alarms.clear(TimerManager.TIMER_ALARM_NAME)
    
    // Update session and timer state
    const updatedSession = {
      ...result.currentSession,
      isPaused: true
    }
    
    const updatedTimerState = {
      ...result.timerState,
      isPaused: true,
      pausedAt: now,
      remainingTime: Math.max(0, remainingTime)
    }
    
    await chrome.storage.local.set({
      currentSession: updatedSession,
      timerState: updatedTimerState
    })
    
    console.log('Timer session paused successfully')
  }
  
  async resumeSession(): Promise<void> {
    console.log('Resuming timer session')
    
    const result = await chrome.storage.local.get(['currentSession', 'timerState'])
    if (!result.currentSession || !result.timerState || !result.timerState.isPaused) {
      throw new Error('No paused session to resume')
    }
    
    const now = Date.now()
    const pauseDuration = now - result.timerState.pausedAt
    const remainingMinutes = Math.ceil(result.timerState.remainingTime / 1000 / 60)
    
    // Create new alarm with remaining time
    await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
      delayInMinutes: remainingMinutes
    })
    
    // Update session and timer state
    const updatedSession = {
      ...result.currentSession,
      isPaused: false,
      pausedTime: result.currentSession.pausedTime + Math.ceil(pauseDuration / 1000 / 60)
    }
    
    const updatedTimerState = {
      ...result.timerState,
      isPaused: false,
      pausedTime: result.timerState.pausedTime + pauseDuration,
      pausedAt: undefined,
      remainingTime: undefined
    }
    
    await chrome.storage.local.set({
      currentSession: updatedSession,
      timerState: updatedTimerState
    })
    
    console.log('Timer session resumed successfully')
  }
  
  async stopSession(): Promise<void> {
    console.log('Stopping timer session')
    
    // Clear all timer alarms
    await this.clearAllTimerAlarms()
    
    // Clear session state
    await chrome.storage.local.set({
      currentSession: null,
      timerState: null
    })
    
    console.log('Timer session stopped successfully')
  }
  
  async getTimerState(): Promise<{
    isActive: boolean
    isPaused: boolean
    timeRemaining: number // seconds
    session: any | null
    plannedDuration: number // seconds
  }> {
    const result = await chrome.storage.local.get(['currentSession', 'timerState'])
    
    if (!result.currentSession || !result.timerState) {
      return {
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      }
    }
    
    if (result.timerState.isPaused) {
      return {
        isActive: true,
        isPaused: true,
        timeRemaining: Math.ceil(result.timerState.remainingTime / 1000),
        session: result.currentSession,
        plannedDuration: Math.ceil(result.timerState.plannedDuration / 1000)
      }
    }
    
    // Calculate remaining time for active session
    const alarm = await chrome.alarms.get(TimerManager.TIMER_ALARM_NAME)
    if (!alarm) {
      // Session might have completed, clean up
      await this.stopSession()
      return {
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      }
    }
    
    const now = Date.now()
    const timeRemaining = Math.max(0, alarm.scheduledTime - now)
    
    return {
      isActive: true,
      isPaused: false,
      timeRemaining: Math.ceil(timeRemaining / 1000),
      session: result.currentSession,
      plannedDuration: Math.ceil(result.timerState.plannedDuration / 1000)
    }
  }
  
  async handleTimerComplete(): Promise<void> {
    console.log('Handling timer completion')
    
    const result = await chrome.storage.local.get(['currentSession'])
    if (!result.currentSession) {
      console.log('No active session found for completion')
      return
    }
    
    const session = result.currentSession
    const completedSession = {
      ...session,
      endTime: new Date(),
      actualDuration: session.plannedDuration - Math.ceil(session.pausedTime),
      completed: true,
      isActive: false
    }
    
    // Update session stats
    await this.updateSessionStats('completed', completedSession)
    
    // Get updated stats for notifications
    const statsResult = await chrome.storage.local.get(['todaysStats'])
    const todaysStats = statsResult.todaysStats
    
    // Clear session state
    await chrome.storage.local.set({
      currentSession: null,
      timerState: null
    })
    
    // Show completion notification with session count
    await backgroundNotificationService.showSessionComplete(
      session.sessionType,
      session.plannedDuration,
      todaysStats?.sessionsCompleted || 0
    )
    
    // Check for daily achievements
    if (todaysStats && session.sessionType === 'work') {
      // Show achievement for milestone sessions
      if (todaysStats.sessionsCompleted >= 3 && todaysStats.sessionsCompleted % 3 === 0) {
        setTimeout(() => {
          backgroundNotificationService.showDailyAchievement(
            todaysStats.sessionsCompleted,
            todaysStats.totalFocusTime
          )
        }, 2000) // Delay to avoid notification spam
      }
      
      // Check for streak achievement
      if (todaysStats.sessionsCompleted > 0 && todaysStats.sessionsCompleted % 5 === 0) {
        const streak = Math.floor(todaysStats.sessionsCompleted / 5)
        setTimeout(() => {
          backgroundNotificationService.showStreakAchievement(streak)
        }, 4000)
      }
    }
    
    // Store daily stats with date key for persistence
    const today = new Date().toISOString().split('T')[0]
    await chrome.storage.local.set({
      [`dailyStats_${today}`]: todaysStats
    })
    
    // Notify UI
    chrome.runtime.sendMessage({
      type: 'TIMER_COMPLETE',
      timestamp: Date.now(),
      sessionType: session.sessionType,
      duration: session.plannedDuration,
      session: completedSession,
      todaysStats: todaysStats
    }).catch(error => {
      console.log('No UI to notify about timer completion:', error.message)
    })
    
    console.log('Timer completion handled successfully')
  }
  
  async recoverTimerState(): Promise<void> {
    console.log('Recovering timer state after restart')
    
    const result = await chrome.storage.local.get(['currentSession', 'timerState'])
    if (!result.currentSession || !result.timerState) {
      console.log('No session to recover')
      return
    }
    
    const session = result.currentSession
    const timerState = result.timerState
    
    // Check if session should have completed while offline
    const now = Date.now()
    const sessionStartTime = timerState.startTime
    const totalElapsedTime = now - sessionStartTime - timerState.pausedTime
    const plannedDuration = timerState.plannedDuration
    
    if (totalElapsedTime >= plannedDuration) {
      console.log('Session completed while offline, triggering completion')
      await this.handleTimerComplete()
      return
    }
    
    // Session is still active, restore alarm
    if (!timerState.isPaused) {
      const remainingTime = plannedDuration - totalElapsedTime
      const remainingMinutes = Math.ceil(remainingTime / 1000 / 60)
      
      if (remainingMinutes > 0) {
        await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
          delayInMinutes: remainingMinutes
        })
        console.log(`Timer state recovered, ${remainingMinutes} minutes remaining`)
      } else {
        // Should complete immediately
        await this.handleTimerComplete()
      }
    } else {
      console.log('Session was paused, no alarm needed')
    }
  }
  
  private async clearAllTimerAlarms(): Promise<void> {
    await chrome.alarms.clear(TimerManager.TIMER_ALARM_NAME)
    await chrome.alarms.clear(TimerManager.PAUSE_ALARM_NAME)
  }
  
  private async updateSessionStats(action: 'started' | 'completed', session?: any): Promise<void> {
    const result = await chrome.storage.local.get(['todaysStats'])
    const today = new Date().toISOString().split('T')[0]
    
    let stats = result.todaysStats || {
      date: today,
      sessionsStarted: 0,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      streak: 0
    }
    
    // Reset stats if it's a new day
    if (stats.date !== today) {
      stats = {
        date: today,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      }
    }
    
    if (action === 'started') {
      stats.sessionsStarted += 1
    } else if (action === 'completed' && session) {
      stats.sessionsCompleted += 1
      stats.totalFocusTime += session.actualDuration || session.plannedDuration
    }
    
    await chrome.storage.local.set({ todaysStats: stats })
  }
}

// Notification service functionality (inline to avoid import issues in service worker)
class BackgroundNotificationService {
  private permissionGranted: boolean = true
  private preferences = {
    enabled: true,
    soundEnabled: true,
    requireInteraction: false,
    priority: 1 as 0 | 1 | 2
  }

  async loadPreferences(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['userPreferences'])
      if (result.userPreferences) {
        this.preferences = {
          enabled: result.userPreferences.notificationsEnabled ?? true,
          soundEnabled: result.userPreferences.soundEnabled ?? true,
          requireInteraction: false,
          priority: 1
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  async updatePreferences(newPreferences: Partial<typeof this.preferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences }
    
    try {
      const result = await chrome.storage.local.get(['userPreferences'])
      const updatedUserPreferences = {
        ...result.userPreferences,
        notificationsEnabled: this.preferences.enabled,
        soundEnabled: this.preferences.soundEnabled
      }
      
      await chrome.storage.local.set({ userPreferences: updatedUserPreferences })
    } catch (error) {
      console.error('Error updating notification preferences:', error)
    }
  }

  isEnabled(): boolean {
    return this.permissionGranted && this.preferences.enabled
  }

  async show(id: string, options: {
    title: string
    message: string
    iconUrl?: string
    type?: 'basic' | 'image' | 'list' | 'progress'
    priority?: 0 | 1 | 2
    requireInteraction?: boolean
    silent?: boolean
    contextMessage?: string
    buttons?: Array<{ title: string; iconUrl?: string }>
  }): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log('Notifications are disabled or permission not granted')
      return false
    }

    try {
      const notificationOptions: chrome.notifications.NotificationOptions<true> = {
        type: options.type || 'basic',
        iconUrl: options.iconUrl || 'icons/icon-48.png',
        title: options.title,
        message: options.message,
        priority: options.priority ?? this.preferences.priority,
        requireInteraction: options.requireInteraction ?? this.preferences.requireInteraction,
        silent: options.silent ?? !this.preferences.soundEnabled
      }

      if (options.contextMessage) {
        notificationOptions.contextMessage = options.contextMessage
      }

      if (options.buttons && options.buttons.length > 0) {
        notificationOptions.buttons = options.buttons
      }

      await chrome.notifications.create(id, notificationOptions)
      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }

  async clear(id: string): Promise<boolean> {
    try {
      return await chrome.notifications.clear(id)
    } catch (error) {
      console.error('Error clearing notification:', error)
      return false
    }
  }

  async showSessionComplete(sessionType: 'work' | 'break', duration: number, sessionsToday?: number): Promise<boolean> {
    // Reload preferences to ensure we have the latest settings
    await this.loadPreferences()
    
    const isWorkSession = sessionType === 'work'
    let title = isWorkSession ? 'Focus Session Complete!' : 'Break Time Over!'
    let message = isWorkSession 
      ? `Great job! You focused for ${duration} minutes. Time for a break.`
      : `Break time is over. Ready for another focus session?`
    
    // Add motivational messages based on sessions completed
    if (isWorkSession && sessionsToday) {
      if (sessionsToday >= 8) {
        title = '🔥 Session Complete - You\'re on Fire!'
        message = `Incredible! You've completed ${sessionsToday} sessions today! ${duration} minutes of pure focus.`
      } else if (sessionsToday >= 5) {
        title = '⭐ Session Complete - Amazing Work!'
        message = `Fantastic! ${sessionsToday} sessions completed today! You focused for ${duration} minutes.`
      } else if (sessionsToday >= 3) {
        title = '💪 Session Complete - Great Progress!'
        message = `Excellent! ${sessionsToday} sessions done today! You just focused for ${duration} minutes.`
      } else if (sessionsToday === 1) {
        title = '🎯 First Session Complete!'
        message = `Great start! You focused for ${duration} minutes. Ready for session #2?`
      }
    }
    
    const contextMessage = isWorkSession 
      ? 'Click to start a break or continue working'
      : 'Click to start your next focus session'

    return this.show('session-complete', {
      title,
      message,
      contextMessage,
      priority: 2,
      requireInteraction: true,
      buttons: isWorkSession 
        ? [
            { title: 'Take Break' },
            { title: 'Continue Working' }
          ]
        : [
            { title: 'Start Focus Session' },
            { title: 'Extend Break' }
          ]
    })
  }

  async showDailyAchievement(sessionsCompleted: number, totalFocusTime: number): Promise<boolean> {
    // Reload preferences to ensure we have the latest settings
    await this.loadPreferences()
    
    let title = ''
    let message = ''
    
    if (sessionsCompleted >= 10) {
      title = '🏆 Productivity Master!'
      message = `Incredible! ${sessionsCompleted} sessions and ${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m of focus time today!`
    } else if (sessionsCompleted >= 8) {
      title = '🔥 On Fire Today!'
      message = `Amazing! ${sessionsCompleted} sessions completed with ${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m of focus!`
    } else if (sessionsCompleted >= 5) {
      title = '⭐ Excellent Progress!'
      message = `Great work! ${sessionsCompleted} sessions and ${Math.floor(totalFocusTime / 60)}h ${totalFocusTime % 60}m of productive time!`
    } else if (sessionsCompleted >= 3) {
      title = '💪 Strong Day!'
      message = `Well done! ${sessionsCompleted} sessions completed today. Keep up the momentum!`
    } else {
      return false // Don't show for less than 3 sessions
    }

    return this.show('daily-achievement', {
      title,
      message,
      priority: 1,
      requireInteraction: false
    })
  }

  async showStreakAchievement(streak: number): Promise<boolean> {
    if (streak < 2) return false

    // Reload preferences to ensure we have the latest settings
    await this.loadPreferences()

    const title = `${streak} Day Streak! 🔥`
    const message = `Amazing! You've maintained your productivity streak for ${streak} days.`
    
    return this.show('streak-achievement', {
      title,
      message,
      priority: 1,
      requireInteraction: false
    })
  }

  async showTestNotification(): Promise<boolean> {
    return this.show('test-notification', {
      title: 'Test Notification',
      message: 'This is a test notification from Vela. If you can see this, notifications are working!',
      priority: 1,
      requireInteraction: false
    })
  }
}

const backgroundNotificationService = new BackgroundNotificationService()
const timerManager = new TimerManager()

// Initialize services
backgroundNotificationService.loadPreferences()

// Export classes for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimerManager, BackgroundNotificationService }
}

// Install event
chrome.runtime.onInstalled.addListener(() => {
  console.log('Vela extension installed')
  
  // Initialize default storage
  chrome.storage.local.set({
    currentSession: null,
    timerState: null,
    todaysTasks: [],
    todaysStats: {
      date: new Date().toISOString().split('T')[0],
      sessionsStarted: 0,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      streak: 0
    },
    userPreferences: {
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
  })
})

// Startup event - recover timer state after browser restart
chrome.runtime.onStartup.addListener(async () => {
  console.log('Vela extension starting up')
  await timerManager.recoverTimerState()
})

// Service worker activation - also recover timer state
self.addEventListener('activate', async () => {
  console.log('Service worker activated')
  await timerManager.recoverTimerState()
})

// Handle alarms for timer functionality
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name)
  
  if (alarm.name === 'focusTimer') {
    await timerManager.handleTimerComplete()
  }
})

async function isNotificationsEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(['userPreferences'])
  return result.userPreferences?.notificationsEnabled ?? true
}

// Handle notification clicks
chrome.notifications.onClicked.addListener(async (notificationId) => {
  console.log('Notification clicked:', notificationId)
  
  // Clear the notification
  await chrome.notifications.clear(notificationId)
  
  // Focus the extension tab
  await focusExtensionTab()
  
  // Handle specific notification actions
  switch (notificationId) {
    case 'session-complete':
      // Send message to UI to handle session completion
      chrome.runtime.sendMessage({
        type: 'NOTIFICATION_CLICKED',
        notificationId,
        action: 'session-complete'
      })
      break
      
    case 'task-reminder':
      // Send message to UI to focus on tasks
      chrome.runtime.sendMessage({
        type: 'NOTIFICATION_CLICKED',
        notificationId,
        action: 'focus-tasks'
      })
      break
      
    case 'streak-achievement':
      // Send message to UI to show stats
      chrome.runtime.sendMessage({
        type: 'NOTIFICATION_CLICKED',
        notificationId,
        action: 'show-stats'
      })
      break
  }
})

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  console.log('Notification button clicked:', notificationId, buttonIndex)
  
  // Clear the notification
  await chrome.notifications.clear(notificationId)
  
  // Focus the extension tab
  await focusExtensionTab()
  
  // Handle specific button actions
  if (notificationId === 'session-complete') {
    const action = buttonIndex === 0 ? 'take-break' : 'continue-working'
    chrome.runtime.sendMessage({
      type: 'NOTIFICATION_BUTTON_CLICKED',
      notificationId,
      buttonIndex,
      action
    })
  } else if (notificationId === 'task-reminder') {
    const action = buttonIndex === 0 ? 'view-tasks' : 'dismiss'
    chrome.runtime.sendMessage({
      type: 'NOTIFICATION_BUTTON_CLICKED',
      notificationId,
      buttonIndex,
      action
    })
  }
})

// Handle messages from UI
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)
  
  switch (message.type) {
    case 'START_TIMER':
      timerManager.startSession({
        duration: message.duration,
        sessionType: message.sessionType || 'work',
        sessionId: message.sessionId
      }).then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'PAUSE_TIMER':
      timerManager.pauseSession()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'RESUME_TIMER':
      timerManager.resumeSession()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'STOP_TIMER':
      timerManager.stopSession()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }))
      return true
      
    case 'GET_TIMER_STATE':
      timerManager.getTimerState().then(sendResponse)
        .catch(error => sendResponse({ error: error.message }))
      return true
      
    case 'SHOW_NOTIFICATION':
      showNotification(message.id, message.options).then(sendResponse)
      return true
      
    case 'CLEAR_NOTIFICATION':
      clearNotification(message.id).then(sendResponse)
      return true
      
    case 'TEST_NOTIFICATION':
      testNotification().then(sendResponse)
      return true
      
    case 'UPDATE_NOTIFICATION_PREFERENCES':
      updateNotificationPreferences(message.preferences).then(sendResponse)
      return true
      
    default:
      sendResponse({ error: 'Unknown message type' })
  }
})



// Focus the extension tab or create a new one
async function focusExtensionTab() {
  try {
    // Find existing new tab pages
    const tabs = await chrome.tabs.query({ url: chrome.runtime.getURL('index.html') })
    
    if (tabs.length > 0) {
      // Focus the first existing tab
      await chrome.tabs.update(tabs[0].id!, { active: true })
      await chrome.windows.update(tabs[0].windowId, { focused: true })
    } else {
      // Create a new tab
      await chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
    }
  } catch (error) {
    console.error('Error focusing extension tab:', error)
  }
}

// Show notification via service
async function showNotification(id: string, options: any) {
  try {
    return await backgroundNotificationService.show(id, options)
  } catch (error) {
    console.error('Error showing notification:', error)
    return false
  }
}

// Clear notification via service
async function clearNotification(id: string) {
  try {
    return await backgroundNotificationService.clear(id)
  } catch (error) {
    console.error('Error clearing notification:', error)
    return false
  }
}

// Test notification
async function testNotification() {
  try {
    return await backgroundNotificationService.showTestNotification()
  } catch (error) {
    console.error('Error showing test notification:', error)
    return false
  }
}

// Update notification preferences
async function updateNotificationPreferences(preferences: any) {
  try {
    await backgroundNotificationService.updatePreferences(preferences)
    return { success: true }
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return { success: false, error: error.message }
  }
}