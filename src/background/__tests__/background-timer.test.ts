describe('Background Timer Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Timer Message Handling', () => {
    it('should handle START_TIMER message', async () => {
      // Mock storage responses
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        todaysStats: {
          date: new Date().toISOString().split('T')[0],
          sessionsStarted: 0,
          sessionsCompleted: 0,
          totalFocusTime: 0,
          tasksCreated: 0,
          tasksCompleted: 0,
          streak: 0
        }
      })
      ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)
      ;(chrome.alarms.create as jest.Mock).mockResolvedValue(undefined)
      ;(chrome.alarms.clear as jest.Mock).mockResolvedValue(true)

      // Import background script to register message handlers
      require('../background')

      // Simulate START_TIMER message
      const mockSendResponse = jest.fn()
      const message = {
        type: 'START_TIMER',
        duration: 25,
        sessionType: 'work'
      }

      // Get the message handler that was registered
      const messageHandler = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0]
      
      // Call the message handler
      const result = messageHandler(message, {}, mockSendResponse)

      // Wait for async operations
      if (result === true) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      // Verify alarm was created
      expect(chrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: 25
      })

      // Verify session state was saved
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          currentSession: expect.objectContaining({
            plannedDuration: 25,
            sessionType: 'work',
            isActive: true,
            isPaused: false
          }),
          timerState: expect.objectContaining({
            isActive: true,
            isPaused: false,
            plannedDuration: 25 * 60 * 1000
          })
        })
      )

      // Verify response was sent
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle STOP_TIMER message', async () => {
      ;(chrome.alarms.clear as jest.Mock).mockResolvedValue(true)
      ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)

      // Import background script
      require('../background')

      const mockSendResponse = jest.fn()
      const message = { type: 'STOP_TIMER' }

      // Get the message handler
      const messageHandler = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0]
      
      // Call the message handler
      const result = messageHandler(message, {}, mockSendResponse)

      // Wait for async operations
      if (result === true) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      // Verify alarms were cleared
      expect(chrome.alarms.clear).toHaveBeenCalledWith('focusTimer')
      expect(chrome.alarms.clear).toHaveBeenCalledWith('pauseTimer')

      // Verify session state was cleared
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        timerState: null
      })

      // Verify response was sent
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true })
    })

    it('should handle GET_TIMER_STATE message', async () => {
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({})

      // Import background script
      require('../background')

      const mockSendResponse = jest.fn()
      const message = { type: 'GET_TIMER_STATE' }

      // Get the message handler
      const messageHandler = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0]
      
      // Call the message handler
      const result = messageHandler(message, {}, mockSendResponse)

      // Wait for async operations
      if (result === true) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      // Verify response was sent with inactive state
      expect(mockSendResponse).toHaveBeenCalledWith({
        isActive: false,
        isPaused: false,
        timeRemaining: 0,
        session: null,
        plannedDuration: 0
      })
    })

    it('should handle PAUSE_TIMER message with active session', async () => {
      const mockSession = {
        id: 'test-session',
        sessionType: 'work',
        plannedDuration: 25,
        isActive: true,
        isPaused: false,
        pausedTime: 0
      }

      const mockTimerState = {
        isActive: true,
        isPaused: false,
        startTime: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        plannedDuration: 25 * 60 * 1000,
        pausedTime: 0
      }

      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        currentSession: mockSession,
        timerState: mockTimerState
      })
      ;(chrome.alarms.get as jest.Mock).mockResolvedValue({
        name: 'focusTimer',
        scheduledTime: Date.now() + 15 * 60 * 1000 // 15 minutes from now
      })
      ;(chrome.alarms.clear as jest.Mock).mockResolvedValue(true)
      ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)

      // Import background script
      require('../background')

      const mockSendResponse = jest.fn()
      const message = { type: 'PAUSE_TIMER' }

      // Get the message handler
      const messageHandler = (chrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0]
      
      // Call the message handler
      const result = messageHandler(message, {}, mockSendResponse)

      // Wait for async operations
      if (result === true) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      // Verify alarm was cleared
      expect(chrome.alarms.clear).toHaveBeenCalledWith('focusTimer')

      // Verify session was updated to paused state
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          currentSession: expect.objectContaining({
            isPaused: true
          }),
          timerState: expect.objectContaining({
            isPaused: true,
            pausedAt: expect.any(Number),
            remainingTime: expect.any(Number)
          })
        })
      )

      // Verify response was sent
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true })
    })
  })

  describe('Timer Completion Handling', () => {
    it('should handle timer completion alarm', async () => {
      const mockSession = {
        id: 'test-session',
        sessionType: 'work',
        plannedDuration: 25,
        pausedTime: 2
      }

      ;(chrome.storage.local.get as jest.Mock).mockImplementation((keys) => {
        if (keys.includes('currentSession')) {
          return Promise.resolve({ currentSession: mockSession })
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
      ;(chrome.storage.local.set as jest.Mock).mockResolvedValue(undefined)
      ;(chrome.notifications.create as jest.Mock).mockResolvedValue(undefined)
      ;(chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined)

      // Import background script
      require('../background')

      // Get the alarm handler
      const alarmHandler = (chrome.alarms.onAlarm.addListener as jest.Mock).mock.calls[0][0]
      
      // Trigger focus timer alarm
      await alarmHandler({ name: 'focusTimer', scheduledTime: Date.now() })

      // Verify session was completed and cleared
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        currentSession: null,
        timerState: null
      })

      // Verify completion notification was shown
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        'session-complete',
        expect.objectContaining({
          title: 'Focus Session Complete!',
          message: 'Great job! You focused for 25 minutes. Time for a break.'
        })
      )

      // Verify UI was notified
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TIMER_COMPLETE',
          sessionType: 'work',
          duration: 25
        })
      )
    })
  })

  describe('Timer State Recovery', () => {
    it('should recover timer state on startup', async () => {
      const startTime = Date.now() - 10 * 60 * 1000 // 10 minutes ago
      
      ;(chrome.storage.local.get as jest.Mock).mockResolvedValue({
        currentSession: { id: 'test' },
        timerState: {
          startTime,
          plannedDuration: 25 * 60 * 1000, // 25 minutes
          pausedTime: 0,
          isPaused: false
        }
      })
      ;(chrome.alarms.create as jest.Mock).mockResolvedValue(undefined)

      // Import background script
      require('../background')

      // Get the startup handler
      const startupHandler = (chrome.runtime.onStartup.addListener as jest.Mock).mock.calls[0][0]
      
      // Trigger startup
      await startupHandler()

      // Should create new alarm with remaining time
      expect(chrome.alarms.create).toHaveBeenCalledWith('focusTimer', {
        delayInMinutes: expect.any(Number)
      })
    })
  })
})