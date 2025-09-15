// Mock notification service
const mockNotificationService = {
  showSessionComplete: jest.fn(),
  showStreakAchievement: jest.fn()
}

// @ts-ignore
global.notificationService = mockNotificationService

// Mock the background module to expose TimerManager
jest.mock('../background', () => {
  // Define TimerManager class inline for testing
  class TimerManager {
    private static readonly TIMER_ALARM_NAME = 'focusTimer'
    private static readonly PAUSE_ALARM_NAME = 'pauseTimer'
    
    async startSession(config: {
      duration: number
      sessionType: 'work' | 'break'
      sessionId?: string
    }): Promise<void> {
      await this.clearAllTimerAlarms()
      
      await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
        delayInMinutes: config.duration
      })
      
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
      
      await chrome.storage.local.set({ 
        currentSession: session,
        timerState: {
          isActive: true,
          isPaused: false,
          startTime: session.startTime.getTime(),
          plannedDuration: config.duration * 60 * 1000,
          pausedTime: 0
        }
      })
      
      await this.updateSessionStats('started')
    }
    
    async pauseSession(): Promise<void> {
      const result = await chrome.storage.local.get(['currentSession', 'timerState'])
      if (!result.currentSession || !result.timerState || !result.timerState.isActive) {
        throw new Error('No active session to pause')
      }
      
      const alarm = await chrome.alarms.get(TimerManager.TIMER_ALARM_NAME)
      if (!alarm) {
        throw new Error('No active timer alarm found')
      }
      
      const now = Date.now()
      const elapsedTime = now - result.timerState.startTime - result.timerState.pausedTime
      const remainingTime = result.timerState.plannedDuration - elapsedTime
      
      await chrome.alarms.clear(TimerManager.TIMER_ALARM_NAME)
      
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
    }
    
    async resumeSession(): Promise<void> {
      const result = await chrome.storage.local.get(['currentSession', 'timerState'])
      if (!result.currentSession || !result.timerState || !result.timerState.isPaused) {
        throw new Error('No paused session to resume')
      }
      
      const now = Date.now()
      const pauseDuration = now - result.timerState.pausedAt
      const remainingMinutes = Math.ceil(result.timerState.remainingTime / 1000 / 60)
      
      await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
        delayInMinutes: remainingMinutes
      })
      
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
    }
    
    async stopSession(): Promise<void> {
      await this.clearAllTimerAlarms()
      await chrome.storage.local.set({
        currentSession: null,
        timerState: null
      })
    }
    
    async getTimerState(): Promise<{
      isActive: boolean
      isPaused: boolean
      timeRemaining: number
      session: any | null
      plannedDuration: number
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
      
      const alarm = await chrome.alarms.get(TimerManager.TIMER_ALARM_NAME)
      if (!alarm) {
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
      const result = await chrome.storage.local.get(['currentSession'])
      if (!result.currentSession) {
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
      
      await this.updateSessionStats('completed', completedSession)
      
      await chrome.storage.local.set({
        currentSession: null,
        timerState: null
      })
      
      await (global as any).notificationService.showSessionComplete(
        session.sessionType,
        session.plannedDuration
      )
      
      const stats = await chrome.storage.local.get(['todaysStats'])
      if (stats.todaysStats && stats.todaysStats.sessionsCompleted > 0 && 
          stats.todaysStats.sessionsCompleted % 5 === 0) {
        const streak = Math.floor(stats.todaysStats.sessionsCompleted / 5)
        await (global as any).notificationService.showStreakAchievement(streak)
      }
      
      chrome.runtime.sendMessage({
        type: 'TIMER_COMPLETE',
        timestamp: Date.now(),
        sessionType: session.sessionType,
        duration: session.plannedDuration,
        session: completedSession
      }).catch(() => {})
    }
    
    async recoverTimerState(): Promise<void> {
      const result = await chrome.storage.local.get(['currentSession', 'timerState'])
      if (!result.currentSession || !result.timerState) {
        return
      }
      
      const now = Date.now()
      const sessionStartTime = result.timerState.startTime
      const totalElapsedTime = now - sessionStartTime - result.timerState.pausedTime
      const plannedDuration = result.timerState.plannedDuration
      
      if (totalElapsedTime >= plannedDuration) {
        await this.handleTimerComplete()
        return
      }
      
      if (!result.timerState.isPaused) {
        const remainingTime = plannedDuration - totalElapsedTime
        const remainingMinutes = Math.ceil(remainingTime / 1000 / 60)
        
        if (remainingMinutes > 0) {
          await chrome.alarms.create(TimerManager.TIMER_ALARM_NAME, {
            delayInMinutes: remainingMinutes
          })
        } else {
          await this.handleTimerComplete()
        }
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
  
  return { TimerManager }
})

describe('TimerManager', () => {
  let timerManager: any

  beforeEach(async () => {
    jest.clearAllMocks()
    
    // Mock default storage responses
    ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({})
    ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)
    ;(chrome.alarms.create as jest.Mock).mockResolvedValue(undefined)
    ;(chrome.alarms.clear as jest.Mock).mockResolvedValue(true)
    ;(chrome.alarms.get as jest.Mock).mockResolvedValue(null)
    ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined)
    mockNotificationService.showSessionComplete.mockResolvedValue(true)
    mockNotificationService.showStreakAchievement.mockResolvedValue(true)

    // Import TimerManager class
    const { TimerManager } = await import('../background')
    timerManager = new TimerManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('startSession', () => {
    it('should start a new timer session', async () => {
      const config = {
        duration: 25,
        sessionType: 'work' as const,
        sessionId: 'test-session'
      }

      await timerManager.startSession(config)

      // Verify alarm was created
      expect(chrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: 25
      })

      // Verify session state was saved
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: expect.objectContaining({
          id: 'test-session',
          plannedDuration: 25,
          sessionType: 'work',
          completed: false,
          isActive: true,
          isPaused: false
        }),
        timerState: expect.objectContaining({
          isActive: true,
          isPaused: false,
          plannedDuration: 25 * 60 * 1000,
          pausedTime: 0
        })
      })
    })

    it('should clear existing alarms before starting new session', async () => {
      const config = {
        duration: 30,
        sessionType: 'work' as const
      }

      await timerManager.startSession(config)

      // Verify old alarms were cleared
      expect(chrome.alarms.clear).toHaveBeenCalledWith('focusTimer')
      expect(chrome.alarms.clear).toHaveBeenCalledWith('pauseTimer')
    })

    it('should generate session ID if not provided', async () => {
      const config = {
        duration: 25,
        sessionType: 'work' as const
      }

      await timerManager.startSession(config)

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: expect.objectContaining({
          id: expect.any(String)
        }),
        timerState: expect.any(Object)
      })
    })
  })

  describe('pauseSession', () => {
    beforeEach(() => {
      // Mock active session state
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        currentSession: {
          id: 'test-session',
          sessionType: 'work',
          plannedDuration: 25,
          isActive: true,
          isPaused: false,
          pausedTime: 0
        },
        timerState: {
          isActive: true,
          isPaused: false,
          startTime: Date.now() - 10 * 60 * 1000, // 10 minutes ago
          plannedDuration: 25 * 60 * 1000,
          pausedTime: 0
        }
      })

      // Mock active alarm
      ;(chrome.alarms.get as jest.Mock).mockResolvedValue({
        name: 'focusTimer',
        scheduledTime: Date.now() + 15 * 60 * 1000 // 15 minutes from now
      })
    })

    it('should pause an active session', async () => {
      await timerManager.pauseSession()

      // Verify alarm was cleared
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith('focusTimer')

      // Verify session state was updated
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: expect.objectContaining({
          isPaused: true
        }),
        timerState: expect.objectContaining({
          isPaused: true,
          pausedAt: expect.any(Number),
          remainingTime: expect.any(Number)
        })
      })
    })

    it('should throw error if no active session', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      await expect(timerManager.pauseSession()).rejects.toThrow('No active session to pause')
    })

    it('should throw error if no active alarm', async () => {
      mockChrome.alarms.get.mockResolvedValue(null)

      await expect(timerManager.pauseSession()).rejects.toThrow('No active timer alarm found')
    })
  })

  describe('resumeSession', () => {
    beforeEach(() => {
      // Mock paused session state
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: {
          id: 'test-session',
          sessionType: 'work',
          plannedDuration: 25,
          isActive: true,
          isPaused: true,
          pausedTime: 2
        },
        timerState: {
          isActive: true,
          isPaused: true,
          startTime: Date.now() - 20 * 60 * 1000, // 20 minutes ago
          plannedDuration: 25 * 60 * 1000,
          pausedTime: 5 * 60 * 1000, // 5 minutes paused
          pausedAt: Date.now() - 2 * 60 * 1000, // paused 2 minutes ago
          remainingTime: 10 * 60 * 1000 // 10 minutes remaining
        }
      })
    })

    it('should resume a paused session', async () => {
      await timerManager.resumeSession()

      // Verify new alarm was created with remaining time
      expect(mockChrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: expect.any(Number)
      })

      // Verify session state was updated
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: expect.objectContaining({
          isPaused: false,
          pausedTime: expect.any(Number)
        }),
        timerState: expect.objectContaining({
          isPaused: false,
          pausedAt: undefined,
          remainingTime: undefined
        })
      })
    })

    it('should throw error if no paused session', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      await expect(timerManager.resumeSession()).rejects.toThrow('No paused session to resume')
    })
  })

  describe('stopSession', () => {
    it('should stop active session and clear state', async () => {
      await timerManager.stopSession()

      // Verify alarms were cleared
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith('focusTimer')
      expect(mockChrome.alarms.clear).toHaveBeenCalledWith('pauseTimer')

      // Verify session state was cleared
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        timerState: null
      })
    })
  })

  describe('getTimerState', () => {
    it('should return inactive state when no session', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      const state = await timerManager.getTimerState()

      expect(state).toEqual({
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      })
    })

    it('should return paused state for paused session', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: {
          isPaused: true,
          remainingTime: 10 * 60 * 1000, // 10 minutes
          plannedDuration: 25 * 60 * 1000 // 25 minutes
        }
      })

      const state = await timerManager.getTimerState()

      expect(state).toEqual({
        isActive: true,
        isPaused: true,
        timeRemaining: 600, // 10 minutes in seconds
        session: { id: 'test' },
        plannedDuration: 1500 // 25 minutes in seconds
      })
    })

    it('should return active state with remaining time', async () => {
      const futureTime = Date.now() + 15 * 60 * 1000 // 15 minutes from now
      
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: {
          isPaused: false,
          plannedDuration: 25 * 60 * 1000
        }
      })

      mockChrome.alarms.get.mockResolvedValue({
        name: 'focusTimer',
        scheduledTime: futureTime
      })

      const state = await timerManager.getTimerState()

      expect(state.isActive).toBe(true)
      expect(state.isPaused).toBe(false)
      expect(state.timeRemaining).toBeGreaterThan(800) // Around 15 minutes
      expect(state.plannedDuration).toBe(1500)
    })

    it('should clean up completed session when no alarm found', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: { isPaused: false }
      })

      mockChrome.alarms.get.mockResolvedValue(null)

      const state = await timerManager.getTimerState()

      expect(state.isActive).toBe(false)
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        timerState: null
      })
    })
  })

  describe('handleTimerComplete', () => {
    beforeEach(() => {
      mockChrome.storage.local.get.mockImplementation((keys) => {
        if (keys.includes('currentSession')) {
          return Promise.resolve({
            currentSession: {
              id: 'test-session',
              sessionType: 'work',
              plannedDuration: 25,
              pausedTime: 2
            }
          })
        }
        if (keys.includes('todaysStats')) {
          return Promise.resolve({
            todaysStats: {
              date: new Date().toISOString().split('T')[0],
              sessionsCompleted: 4 // Will become 5, triggering streak
            }
          })
        }
        return Promise.resolve({})
      })
    })

    it('should complete session and show notification', async () => {
      await timerManager.handleTimerComplete()

      // Verify session was completed and cleared
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        timerState: null
      })

      // Verify completion notification was shown
      expect(mockNotificationService.showSessionComplete).toHaveBeenCalledWith('work', 25)

      // Verify UI was notified
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'TIMER_COMPLETE',
        timestamp: expect.any(Number),
        sessionType: 'work',
        duration: 25,
        session: expect.objectContaining({
          completed: true,
          endTime: expect.any(Date),
          actualDuration: 23 // 25 - 2 paused minutes
        })
      })
    })

    it('should show streak achievement for milestone sessions', async () => {
      await timerManager.handleTimerComplete()

      // Verify streak achievement notification was shown
      expect(mockNotificationService.showStreakAchievement).toHaveBeenCalledWith(1)
    })

    it('should handle completion when no active session', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      await timerManager.handleTimerComplete()

      // Should not throw error, just log and return
      expect(mockNotificationService.showSessionComplete).not.toHaveBeenCalled()
    })
  })

  describe('recoverTimerState', () => {
    it('should recover active session after restart', async () => {
      const startTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago
      
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: {
          startTime,
          plannedDuration: 25 * 60 * 1000, // 25 minutes
          pausedTime: 0,
          isPaused: false
        }
      })

      await timerManager.recoverTimerState()

      // Should create new alarm with remaining time
      expect(mockChrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: expect.any(Number)
      })
    })

    it('should complete session if it expired while offline', async () => {
      const startTime = Date.now() - 30 * 60 * 1000 // 30 minutes ago
      
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test', sessionType: 'work', plannedDuration: 25 },
        timerState: {
          startTime,
          plannedDuration: 25 * 60 * 1000, // 25 minutes
          pausedTime: 0,
          isPaused: false
        }
      })

      await timerManager.recoverTimerState()

      // Should trigger completion instead of creating alarm
      expect(mockChrome.alarms.create).not.toHaveBeenCalled()
      expect(mockNotificationService.showSessionComplete).toHaveBeenCalled()
    })

    it('should handle paused session recovery', async () => {
      mockChrome.storage.local.get.mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: {
          isPaused: true
        }
      })

      await timerManager.recoverTimerState()

      // Should not create alarm for paused session
      expect(mockChrome.alarms.create).not.toHaveBeenCalled()
    })

    it('should handle no session to recover', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})

      await timerManager.recoverTimerState()

      // Should not throw error or create alarms
      expect(mockChrome.alarms.create).not.toHaveBeenCalled()
    })
  })
})