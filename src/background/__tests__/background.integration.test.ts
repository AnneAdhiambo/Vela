import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    },
    onMessage: {
      addListener: jest.fn()
    },
    onStartup: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    getURL: jest.fn()
  },
  alarms: {
    onAlarm: {
      addListener: jest.fn()
    },
    create: jest.fn(),
    clear: jest.fn(),
    get: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    getAll: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    },
    onButtonClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  windows: {
    update: jest.fn()
  }
}

// @ts-ignore
global.chrome = mockChrome

describe('Background Script Notification Integration', () => {
  let onInstalledCallback: () => void
  let onAlarmCallback: (alarm: chrome.alarms.Alarm) => void
  let onMessageCallback: (message: any, sender: any, sendResponse: (response?: any) => void) => void
  let onNotificationClickedCallback: (notificationId: string) => void
  let onNotificationButtonClickedCallback: (notificationId: string, buttonIndex: number) => void

  beforeEach(async () => {
    jest.clearAllMocks()
    
    // Capture event listeners
    mockChrome.runtime.onInstalled.addListener.mockImplementation((callback) => {
      onInstalledCallback = callback
    })
    
    mockChrome.alarms.onAlarm.addListener.mockImplementation((callback) => {
      onAlarmCallback = callback
    })
    
    mockChrome.runtime.onMessage.addListener.mockImplementation((callback) => {
      onMessageCallback = callback
    })
    
    mockChrome.notifications.onClicked.addListener.mockImplementation((callback) => {
      onNotificationClickedCallback = callback
    })
    
    mockChrome.notifications.onButtonClicked.addListener.mockImplementation((callback) => {
      onNotificationButtonClickedCallback = callback
    })
    
    // Mock default responses
    mockChrome.storage.local.get.mockResolvedValue({
      currentSession: null,
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
        notificationsEnabled: true,
        soundEnabled: true
      }
    })
    
    mockChrome.storage.local.set.mockResolvedValue(undefined)
    mockChrome.notifications.create.mockResolvedValue(undefined)
    mockChrome.notifications.clear.mockResolvedValue(true)
    mockChrome.tabs.query.mockResolvedValue([])
    mockChrome.tabs.create.mockResolvedValue({ id: 1 })
    mockChrome.runtime.getURL.mockReturnValue('chrome-extension://test/index.html')
    
    // Import background script to register listeners
    await import('../background')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Installation', () => {
    it('should initialize default storage on install', () => {
      onInstalledCallback()
      
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        todaysTasks: [],
        todaysStats: expect.objectContaining({
          date: expect.any(String),
          sessionsStarted: 0,
          sessionsCompleted: 0,
          totalFocusTime: 0,
          tasksCreated: 0,
          tasksCompleted: 0,
          streak: 0
        }),
        userPreferences: expect.objectContaining({
          notificationsEnabled: true,
          soundEnabled: true
        })
      })
    })
  })

  describe('Timer Completion', () => {
    it('should show notification when focus timer completes', async () => {
      // Mock active session
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: {
          id: 'test-session',
          sessionType: 'work',
          plannedDuration: 25,
          startTime: new Date(),
          completed: false,
          pausedTime: 0,
          tasksWorkedOn: []
        },
        todaysStats: {
          date: new Date().toISOString().split('T')[0],
          sessionsStarted: 1,
          sessionsCompleted: 0,
          totalFocusTime: 0,
          tasksCreated: 0,
          tasksCompleted: 0,
          streak: 0
        }
      })
      
      // Trigger focus timer alarm
      await onAlarmCallback({ name: 'focusTimer', scheduledTime: Date.now() })
      
      // Verify notification was created
      expect(mockChrome.notifications.create).toHaveBeenCalledWith(
        'session-complete',
        expect.objectContaining({
          title: 'Focus Session Complete!',
          message: 'Great job! You focused for 25 minutes. Time for a break.',
          contextMessage: 'Click to start a break or continue working',
          priority: 2,
          requireInteraction: true,
          buttons: [
            { title: 'Take Break' },
            { title: 'Continue Working' }
          ]
        })
      )
      
      // Verify stats were updated
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        todaysStats: expect.objectContaining({
          sessionsCompleted: 1,
          totalFocusTime: 25
        })
      })
    })

    it('should show streak achievement notification', async () => {
      // Mock session that triggers streak achievement
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: {
          id: 'test-session',
          sessionType: 'work',
          plannedDuration: 25,
          startTime: new Date(),
          completed: false,
          pausedTime: 0,
          tasksWorkedOn: []
        },
        todaysStats: {
          date: new Date().toISOString().split('T')[0],
          sessionsStarted: 5,
          sessionsCompleted: 4, // Will become 5, triggering streak
          totalFocusTime: 100,
          tasksCreated: 0,
          tasksCompleted: 0,
          streak: 0
        }
      })
      
      // Trigger focus timer alarm
      await onAlarmCallback({ name: 'focusTimer', scheduledTime: Date.now() })
      
      // Verify streak achievement notification was created
      expect(mockChrome.notifications.create).toHaveBeenCalledWith(
        'streak-achievement',
        expect.objectContaining({
          title: '1 Day Streak! 🔥',
          message: 'Amazing! You\'ve maintained your productivity streak for 1 days.'
        })
      )
    })
  })

  describe('Notification Click Handling', () => {
    it('should handle session complete notification click', async () => {
      mockChrome.tabs.query.mockResolvedValue([{ id: 1, windowId: 1 }])
      
      await onNotificationClickedCallback('session-complete')
      
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('session-complete')
      expect(mockChrome.tabs.update).toHaveBeenCalledWith(1, { active: true })
      expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true })
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'NOTIFICATION_CLICKED',
        notificationId: 'session-complete',
        action: 'session-complete'
      })
    })

    it('should create new tab if extension tab not found', async () => {
      mockChrome.tabs.query.mockResolvedValue([])
      
      await onNotificationClickedCallback('session-complete')
      
      expect(mockChrome.tabs.create).toHaveBeenCalledWith({
        url: 'chrome-extension://test/index.html'
      })
    })

    it('should handle task reminder notification click', async () => {
      mockChrome.tabs.query.mockResolvedValue([{ id: 1, windowId: 1 }])
      
      await onNotificationClickedCallback('task-reminder')
      
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'NOTIFICATION_CLICKED',
        notificationId: 'task-reminder',
        action: 'focus-tasks'
      })
    })
  })

  describe('Notification Button Click Handling', () => {
    it('should handle take break button click', async () => {
      mockChrome.tabs.query.mockResolvedValue([{ id: 1, windowId: 1 }])
      
      await onNotificationButtonClickedCallback('session-complete', 0)
      
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('session-complete')
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'NOTIFICATION_BUTTON_CLICKED',
        notificationId: 'session-complete',
        buttonIndex: 0,
        action: 'take-break'
      })
    })

    it('should handle continue working button click', async () => {
      mockChrome.tabs.query.mockResolvedValue([{ id: 1, windowId: 1 }])
      
      await onNotificationButtonClickedCallback('session-complete', 1)
      
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'NOTIFICATION_BUTTON_CLICKED',
        notificationId: 'session-complete',
        buttonIndex: 1,
        action: 'continue-working'
      })
    })
  })

  describe('Message Handling', () => {
    it('should handle start timer message', async () => {
      const sendResponse = jest.fn()
      
      await onMessageCallback(
        { type: 'START_TIMER', duration: 25, sessionType: 'work' },
        {},
        sendResponse
      )
      
      expect(mockChrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: 25
      })
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle pause timer message', async () => {
      const sendResponse = jest.fn()
      
      // Mock active session
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test', isActive: true, isPaused: false },
        timerState: { isActive: true, isPaused: false, startTime: Date.now() - 10000, plannedDuration: 25 * 60 * 1000, pausedTime: 0 }
      })
      mockChrome.alarms.get.mockResolvedValue({ scheduledTime: Date.now() + 15 * 60 * 1000 })
      
      await onMessageCallback(
        { type: 'PAUSE_TIMER' },
        {},
        sendResponse
      )
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle resume timer message', async () => {
      const sendResponse = jest.fn()
      
      // Mock paused session
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test', isPaused: true },
        timerState: { isPaused: true, remainingTime: 10 * 60 * 1000, pausedAt: Date.now() - 60000 }
      })
      
      await onMessageCallback(
        { type: 'RESUME_TIMER' },
        {},
        sendResponse
      )
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle stop timer message', async () => {
      const sendResponse = jest.fn()
      
      await onMessageCallback(
        { type: 'STOP_TIMER' },
        {},
        sendResponse
      )
      
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith('focusTimer')
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle get timer state message', async () => {
      const sendResponse = jest.fn()
      
      mockChrome.storage.local.get.mockResolvedValue({})
      
      await onMessageCallback(
        { type: 'GET_TIMER_STATE' },
        {},
        sendResponse
      )
      
      expect(sendResponse).toHaveBeenCalledWith({
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      })
    })

    it('should handle test notification message', async () => {
      const sendResponse = jest.fn()
      
      await onMessageCallback(
        { type: 'TEST_NOTIFICATION' },
        {},
        sendResponse
      )
      
      expect(mockChrome.notifications.create).toHaveBeenCalledWith(
        'test-notification',
        expect.objectContaining({
          title: 'Test Notification',
          message: 'This is a test notification from Vela. If you can see this, notifications are working!'
        })
      )
      expect(sendResponse).toHaveBeenCalledWith(true)
    })

    it('should handle show notification message', async () => {
      const sendResponse = jest.fn()
      const notificationOptions = {
        title: 'Custom Notification',
        message: 'Custom message'
      }
      
      await onMessageCallback(
        {
          type: 'SHOW_NOTIFICATION',
          id: 'custom-notification',
          options: notificationOptions
        },
        {},
        sendResponse
      )
      
      expect(mockChrome.notifications.create).toHaveBeenCalledWith(
        'custom-notification',
        expect.objectContaining(notificationOptions)
      )
      expect(sendResponse).toHaveBeenCalledWith(true)
    })

    it('should handle clear notification message', async () => {
      const sendResponse = jest.fn()
      
      await onMessageCallback(
        {
          type: 'CLEAR_NOTIFICATION',
          id: 'test-notification'
        },
        {},
        sendResponse
      )
      
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('test-notification')
      expect(sendResponse).toHaveBeenCalledWith(true)
    })

    it('should handle update notification preferences message', async () => {
      const sendResponse = jest.fn()
      const preferences = { enabled: false, soundEnabled: false }
      
      await onMessageCallback(
        {
          type: 'UPDATE_NOTIFICATION_PREFERENCES',
          preferences
        },
        {},
        sendResponse
      )
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true })
    })
  })
})