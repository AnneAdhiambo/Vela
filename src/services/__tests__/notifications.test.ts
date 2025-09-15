import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationService } from '../notifications'

// Mock Chrome APIs
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
    getAll: vi.fn()
  }
}

// @ts-ignore
global.chrome = mockChrome

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn()
    },
    start: vi.fn(),
    stop: vi.fn()
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    }
  })),
  destination: {},
  currentTime: 0
}

// @ts-ignore
global.AudioContext = vi.fn(() => mockAudioContext)
// @ts-ignore
global.webkitAudioContext = vi.fn(() => mockAudioContext)

describe('NotificationService', () => {
  let notificationService: NotificationService
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset singleton instance
    // @ts-ignore - accessing private static property for testing
    NotificationService.instance = undefined
    
    // Mock default storage response
    mockChrome.storage.local.get.mockResolvedValue({
      userPreferences: {
        notificationsEnabled: true,
        soundEnabled: true
      }
    })
    
    notificationService = NotificationService.getInstance()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = NotificationService.getInstance()
      const instance2 = NotificationService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('show', () => {
    it('should show notification when enabled', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.show('test-id', {
        title: 'Test Title',
        message: 'Test Message'
      })
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('test-id', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Test Title',
        message: 'Test Message',
        priority: 1,
        requireInteraction: false,
        silent: false
      })
    })

    it('should not show notification when disabled', async () => {
      // Mock disabled notifications
      mockChrome.storage.local.get.mockResolvedValue({
        userPreferences: {
          notificationsEnabled: false,
          soundEnabled: true
        }
      })
      
      // Create new instance with disabled notifications
      // @ts-ignore
      NotificationService.instance = undefined
      const disabledService = NotificationService.getInstance()
      
      const result = await disabledService.show('test-id', {
        title: 'Test Title',
        message: 'Test Message'
      })
      
      expect(result).toBe(false)
      expect(mockChrome.notifications.create).not.toHaveBeenCalled()
    })

    it('should include buttons when provided', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      await notificationService.show('test-id', {
        title: 'Test Title',
        message: 'Test Message',
        buttons: [
          { title: 'Button 1' },
          { title: 'Button 2' }
        ]
      })
      
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('test-id', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Test Title',
        message: 'Test Message',
        priority: 1,
        requireInteraction: false,
        silent: false,
        buttons: [
          { title: 'Button 1' },
          { title: 'Button 2' }
        ]
      })
    })

    it('should handle notification creation errors', async () => {
      mockChrome.notifications.create.mockRejectedValue(new Error('Creation failed'))
      
      const result = await notificationService.show('test-id', {
        title: 'Test Title',
        message: 'Test Message'
      })
      
      expect(result).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear notification successfully', async () => {
      mockChrome.notifications.clear.mockResolvedValue(true)
      
      const result = await notificationService.clear('test-id')
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('test-id')
    })

    it('should handle clear errors', async () => {
      mockChrome.notifications.clear.mockRejectedValue(new Error('Clear failed'))
      
      const result = await notificationService.clear('test-id')
      
      expect(result).toBe(false)
    })
  })

  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      mockChrome.notifications.getAll.mockResolvedValue({
        'notification-1': {},
        'notification-2': {}
      })
      mockChrome.notifications.clear.mockResolvedValue(true)
      
      await notificationService.clearAll()
      
      expect(mockChrome.notifications.getAll).toHaveBeenCalled()
      expect(mockChrome.notifications.clear).toHaveBeenCalledTimes(2)
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('notification-1')
      expect(mockChrome.notifications.clear).toHaveBeenCalledWith('notification-2')
    })
  })

  describe('showSessionComplete', () => {
    it('should show work session completion notification', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showSessionComplete('work', 25)
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('session-complete', {
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
    })

    it('should show break session completion notification', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showSessionComplete('break', 5)
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('session-complete', {
        title: 'Break Time Over!',
        message: 'Break time is over. Ready for another focus session?',
        contextMessage: 'Click to start your next focus session',
        priority: 2,
        requireInteraction: true,
        buttons: [
          { title: 'Start Focus Session' },
          { title: 'Extend Break' }
        ]
      })
    })
  })

  describe('showTaskReminder', () => {
    it('should show task reminder for multiple tasks', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showTaskReminder(3)
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('task-reminder', {
        title: 'Don\'t Forget Your Tasks!',
        message: 'You have 3 tasks waiting for you.',
        priority: 1,
        buttons: [
          { title: 'View Tasks' }
        ]
      })
    })

    it('should show task reminder for single task', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showTaskReminder(1)
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('task-reminder', {
        title: 'Don\'t Forget Your Tasks!',
        message: 'You have 1 task waiting for you.',
        priority: 1,
        buttons: [
          { title: 'View Tasks' }
        ]
      })
    })

    it('should not show reminder for zero tasks', async () => {
      const result = await notificationService.showTaskReminder(0)
      
      expect(result).toBe(false)
      expect(mockChrome.notifications.create).not.toHaveBeenCalled()
    })
  })

  describe('showStreakAchievement', () => {
    it('should show streak achievement notification', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showStreakAchievement(5)
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('streak-achievement', {
        title: '5 Day Streak! 🔥',
        message: 'Amazing! You\'ve maintained your productivity streak for 5 days.',
        priority: 1,
        requireInteraction: false
      })
    })

    it('should not show achievement for streak less than 2', async () => {
      const result = await notificationService.showStreakAchievement(1)
      
      expect(result).toBe(false)
      expect(mockChrome.notifications.create).not.toHaveBeenCalled()
    })
  })

  describe('showTestNotification', () => {
    it('should show test notification', async () => {
      mockChrome.notifications.create.mockResolvedValue(undefined)
      
      const result = await notificationService.showTestNotification()
      
      expect(result).toBe(true)
      expect(mockChrome.notifications.create).toHaveBeenCalledWith('test-notification', {
        title: 'Test Notification',
        message: 'This is a test notification from Vela. If you can see this, notifications are working!',
        priority: 1,
        requireInteraction: false
      })
    })
  })

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      
      await notificationService.updatePreferences({
        enabled: false,
        soundEnabled: false
      })
      
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        userPreferences: {
          notificationsEnabled: false,
          soundEnabled: false
        }
      })
    })
  })

  describe('getPreferences', () => {
    it('should return current preferences', () => {
      const preferences = notificationService.getPreferences()
      
      expect(preferences).toEqual({
        enabled: true,
        soundEnabled: true,
        requireInteraction: false,
        priority: 1
      })
    })
  })

  describe('isEnabled', () => {
    it('should return true when notifications are enabled', () => {
      expect(notificationService.isEnabled()).toBe(true)
    })

    it('should return false when notifications are disabled', async () => {
      await notificationService.updatePreferences({ enabled: false })
      
      expect(notificationService.isEnabled()).toBe(false)
    })
  })
})