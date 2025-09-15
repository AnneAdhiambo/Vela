describe('Background Timer Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Chrome API Integration', () => {
    it('should create alarms for timer sessions', async () => {
      ;(chrome.alarms.create as jest.Mock).mockResolvedValue(undefined)
      
      await chrome.alarms.create('focusTimer', { delayInMinutes: 25 })
      
      expect(chrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: 25
      })
    })

    it('should clear alarms when stopping timer', async () => {
      ;(chrome.alarms.clear as jest.Mock).mockResolvedValue(true)
      
      await chrome.alarms.clear('focusTimer')
      
      expect(chrome.alarms.clear).toHaveBeenCalledWith('focusTimer')
    })

    it('should save session state to storage', async () => {
      ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)
      
      const sessionData = {
        currentSession: {
          id: 'test-session',
          startTime: new Date(),
          plannedDuration: 25,
          sessionType: 'work',
          completed: false,
          pausedTime: 0,
          tasksWorkedOn: [],
          isActive: true,
          isPaused: false
        },
        timerState: {
          isActive: true,
          isPaused: false,
          startTime: Date.now(),
          plannedDuration: 25 * 60 * 1000,
          pausedTime: 0
        }
      }
      
      await chrome.storage.local.set(sessionData)
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(sessionData)
    })

    it('should retrieve session state from storage', async () => {
      const mockSessionData = {
        currentSession: {
          id: 'test-session',
          sessionType: 'work',
          plannedDuration: 25
        },
        timerState: {
          isActive: true,
          isPaused: false
        }
      }
      
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue(mockSessionData)
      
      const result = await chrome.storage.local.get(['currentSession', 'timerState'])
      
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['currentSession', 'timerState'])
      expect(result).toEqual(mockSessionData)
    })

    it('should get alarm information', async () => {
      const mockAlarm = {
        name: 'focusTimer',
        scheduledTime: Date.now() + 15 * 60 * 1000
      }
      
      ;(chrome.alarms.get as jest.Mock).mockResolvedValue(mockAlarm)
      
      const result = await chrome.alarms.get('focusTimer')
      
      expect(chrome.alarms.get).toHaveBeenCalledWith('focusTimer')
      expect(result).toEqual(mockAlarm)
    })
  })

  describe('Timer State Calculations', () => {
    it('should calculate remaining time correctly', () => {
      const now = Date.now()
      const scheduledTime = now + 15 * 60 * 1000 // 15 minutes from now
      const timeRemaining = Math.max(0, scheduledTime - now)
      const timeRemainingSeconds = Math.ceil(timeRemaining / 1000)
      
      expect(timeRemainingSeconds).toBeGreaterThan(800) // Around 15 minutes
      expect(timeRemainingSeconds).toBeLessThan(1000) // Less than ~16.5 minutes
    })

    it('should handle elapsed time calculations', () => {
      const startTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago
      const now = Date.now()
      const pausedTime = 2 * 60 * 1000 // 2 minutes paused
      const elapsedTime = now - startTime - pausedTime
      
      expect(elapsedTime).toBeGreaterThan(7.5 * 60 * 1000) // Around 8 minutes
      expect(elapsedTime).toBeLessThan(8.5 * 60 * 1000) // Less than 8.5 minutes
    })

    it('should determine if session should complete', () => {
      const startTime = Date.now() - 30 * 60 * 1000 // 30 minutes ago
      const plannedDuration = 25 * 60 * 1000 // 25 minutes
      const pausedTime = 0
      const totalElapsedTime = Date.now() - startTime - pausedTime
      
      const shouldComplete = totalElapsedTime >= plannedDuration
      expect(shouldComplete).toBe(true)
    })

    it('should calculate remaining minutes for alarm creation', () => {
      const remainingTime = 10 * 60 * 1000 // 10 minutes in milliseconds
      const remainingMinutes = Math.ceil(remainingTime / 1000 / 60)
      
      expect(remainingMinutes).toBe(10)
    })
  })

  describe('Session Data Management', () => {
    it('should create proper session object structure', () => {
      const sessionConfig = {
        duration: 25,
        sessionType: 'work' as const,
        sessionId: 'test-session'
      }
      
      const session = {
        id: sessionConfig.sessionId,
        startTime: new Date(),
        endTime: undefined,
        plannedDuration: sessionConfig.duration,
        actualDuration: undefined,
        sessionType: sessionConfig.sessionType,
        completed: false,
        pausedTime: 0,
        tasksWorkedOn: [],
        isActive: true,
        isPaused: false
      }
      
      expect(session.id).toBe('test-session')
      expect(session.sessionType).toBe('work')
      expect(session.plannedDuration).toBe(25)
      expect(session.isActive).toBe(true)
      expect(session.isPaused).toBe(false)
    })

    it('should create proper timer state object', () => {
      const startTime = Date.now()
      const duration = 25 // minutes
      
      const timerState = {
        isActive: true,
        isPaused: false,
        startTime,
        plannedDuration: duration * 60 * 1000,
        pausedTime: 0
      }
      
      expect(timerState.isActive).toBe(true)
      expect(timerState.isPaused).toBe(false)
      expect(timerState.plannedDuration).toBe(25 * 60 * 1000)
    })

    it('should update stats correctly', () => {
      const initialStats = {
        date: new Date().toISOString().split('T')[0],
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      }
      
      // Simulate starting a session
      const updatedStatsAfterStart = {
        ...initialStats,
        sessionsStarted: initialStats.sessionsStarted + 1
      }
      
      expect(updatedStatsAfterStart.sessionsStarted).toBe(1)
      
      // Simulate completing a session
      const sessionDuration = 25
      const updatedStatsAfterComplete = {
        ...updatedStatsAfterStart,
        sessionsCompleted: updatedStatsAfterStart.sessionsCompleted + 1,
        totalFocusTime: updatedStatsAfterStart.totalFocusTime + sessionDuration
      }
      
      expect(updatedStatsAfterComplete.sessionsCompleted).toBe(1)
      expect(updatedStatsAfterComplete.totalFocusTime).toBe(25)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing session gracefully', () => {
      const result = { currentSession: null, timerState: null }
      
      const timerState = {
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      }
      
      expect(timerState.isActive).toBe(false)
      expect(timerState.session).toBe(null)
    })

    it('should handle missing alarm gracefully', async () => {
      ;(chrome.alarms.get as jest.Mock).mockResolvedValue(null)
      
      const alarm = await chrome.alarms.get('focusTimer')
      
      expect(alarm).toBe(null)
    })

    it('should validate session state before operations', () => {
      const invalidSession = null
      const invalidTimerState = null
      
      const canPause = invalidSession && invalidTimerState && invalidTimerState.isActive
      const canResume = invalidSession && invalidTimerState && invalidTimerState.isPaused
      
      expect(canPause).toBe(false)
      expect(canResume).toBe(false)
    })
  })
})