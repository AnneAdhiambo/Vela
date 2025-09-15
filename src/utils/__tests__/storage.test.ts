import { ChromeStorageService, StorageError, storageService, createDefaultUserPreferences, createDefaultDailyStats, generateTaskId, generateSessionId, generateUserId, DataSerializer } from '../storage'
import { Task, FocusSession, UserPreferences, DailyStats, ActiveSession } from '../../types'

// Mock Chrome APIs
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      getBytesInUse: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      getBytesInUse: jest.fn(),
      QUOTA_BYTES: 102400
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
}

// @ts-ignore
global.chrome = mockChrome

describe('StorageError', () => {
  it('should create error with message and operation', () => {
    const error = new StorageError('Test error', 'testOperation')
    expect(error.message).toBe('Test error')
    expect(error.operation).toBe('testOperation')
    expect(error.name).toBe('StorageError')
  })
})

describe('ChromeStorageService', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = ChromeStorageService.getInstance()
    jest.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ChromeStorageService.getInstance()
      const instance2 = ChromeStorageService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('getCurrentSession', () => {
    it('should return null when no session exists', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})
      
      const result = await service.getCurrentSession()
      expect(result).toBeNull()
      expect(mockChrome.storage.local.get).toHaveBeenCalledWith('currentSession')
    })

    it('should return validated session when exists', async () => {
      const mockSession = {
        id: 'session_123',
        startTime: new Date(),
        plannedDuration: 25,
        sessionType: 'work',
        completed: false,
        pausedTime: 0,
        tasksWorkedOn: [],
        isActive: true,
        isPaused: false
      }
      
      // Mock the serialized format that would be stored
      const serializedSession = {
        ...mockSession,
        startTime: { __type: 'Date', value: mockSession.startTime.toISOString() }
      }
      
      mockChrome.storage.local.get.mockResolvedValue({ currentSession: serializedSession })
      
      const result = await service.getCurrentSession()
      expect(result?.startTime).toBeInstanceOf(Date)
      expect(result?.id).toBe(mockSession.id)
    })

    it('should throw StorageError on Chrome API failure', async () => {
      mockChrome.storage.local.get.mockRejectedValue(new Error('Chrome API error'))
      
      await expect(service.getCurrentSession()).rejects.toThrow(StorageError)
      await expect(service.getCurrentSession()).rejects.toThrow('Failed to get current session')
    })
  })

  describe('setCurrentSession', () => {
    it('should set valid session', async () => {
      const mockSession: ActiveSession = {
        id: 'session_123',
        startTime: new Date(),
        plannedDuration: 25,
        sessionType: 'work',
        completed: false,
        pausedTime: 0,
        tasksWorkedOn: [],
        isActive: true,
        isPaused: false
      }
      
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      
      await service.setCurrentSession(mockSession)
      
      // Expect the serialized format to be stored
      const expectedCall = mockChrome.storage.local.set.mock.calls[0][0]
      expect(expectedCall.currentSession.startTime.__type).toBe('Date')
      expect(expectedCall.currentSession.id).toBe(mockSession.id)
    })

    it('should set null session', async () => {
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      
      await service.setCurrentSession(null)
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ currentSession: null })
    })

    it('should throw StorageError for invalid session', async () => {
      const invalidSession = { id: '', invalid: true }
      
      await expect(service.setCurrentSession(invalidSession as any)).rejects.toThrow(StorageError)
    })
  })

  describe('getTodaysTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      mockChrome.storage.local.get.mockResolvedValue({})
      
      const result = await service.getTodaysTasks()
      expect(result).toEqual([])
    })

    it('should return validated tasks', async () => {
      const mockTasks = [
        {
          id: 'task_1',
          text: 'Test task',
          completed: false,
          createdAt: new Date(),
          order: 0
        }
      ]
      
      // Mock the serialized format
      const serializedTasks = mockTasks.map(task => ({
        ...task,
        createdAt: { __type: 'Date', value: task.createdAt.toISOString() }
      }))
      
      mockChrome.storage.local.get.mockResolvedValue({ todaysTasks: serializedTasks })
      
      const result = await service.getTodaysTasks()
      expect(result[0].createdAt).toBeInstanceOf(Date)
      expect(result[0].id).toBe(mockTasks[0].id)
    })
  })

  describe('addTask', () => {
    it('should add task to existing tasks', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task_1',
          text: 'Existing task',
          completed: false,
          createdAt: new Date(),
          order: 0
        }
      ]
      
      const newTask: Task = {
        id: 'task_2',
        text: 'New task',
        completed: false,
        createdAt: new Date(),
        order: 1
      }
      
      // Mock serialized format for existing tasks
      const serializedExistingTasks = existingTasks.map(task => ({
        ...task,
        createdAt: { __type: 'Date', value: task.createdAt.toISOString() }
      }))
      
      mockChrome.storage.local.get
        .mockResolvedValueOnce({ todaysTasks: serializedExistingTasks }) // getTodaysTasks
      mockChrome.storage.sync.get
        .mockResolvedValueOnce({ recentTasks: serializedExistingTasks }) // getRecentTasks
      
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      mockChrome.storage.sync.set.mockResolvedValue(undefined)
      
      await service.addTask(newTask)
      
      // Check that the methods were called (serialization happens internally)
      expect(mockChrome.storage.local.set).toHaveBeenCalled()
      expect(mockChrome.storage.sync.set).toHaveBeenCalled()
    })
  })

  describe('updateTask', () => {
    it('should update existing task', async () => {
      const existingTasks: Task[] = [
        {
          id: 'task_1',
          text: 'Original text',
          completed: false,
          createdAt: new Date(),
          order: 0
        }
      ]
      
      // Mock serialized format
      const serializedExistingTasks = existingTasks.map(task => ({
        ...task,
        createdAt: { __type: 'Date', value: task.createdAt.toISOString() }
      }))
      
      mockChrome.storage.local.get
        .mockResolvedValueOnce({ todaysTasks: serializedExistingTasks })
      mockChrome.storage.sync.get
        .mockResolvedValueOnce({ recentTasks: serializedExistingTasks })
      
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      mockChrome.storage.sync.set.mockResolvedValue(undefined)
      
      await service.updateTask('task_1', { text: 'Updated text', completed: true })
      
      // Check that the methods were called
      expect(mockChrome.storage.local.set).toHaveBeenCalled()
      expect(mockChrome.storage.sync.set).toHaveBeenCalled()
    })

    it('should throw error for non-existent task', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ todaysTasks: [] })
      
      await expect(service.updateTask('non_existent', { text: 'Updated' }))
        .rejects.toThrow('Task with ID non_existent not found')
    })
  })

  describe('reorderTasks', () => {
    it('should reorder tasks correctly', async () => {
      const tasks: Task[] = [
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: new Date(), order: 0 },
        { id: 'task_2', text: 'Task 2', completed: false, createdAt: new Date(), order: 1 },
        { id: 'task_3', text: 'Task 3', completed: false, createdAt: new Date(), order: 2 }
      ]
      
      // Mock serialized format
      const serializedTasks = tasks.map(task => ({
        ...task,
        createdAt: { __type: 'Date', value: task.createdAt.toISOString() }
      }))
      
      mockChrome.storage.local.get.mockResolvedValue({ todaysTasks: serializedTasks })
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      
      await service.reorderTasks(0, 2) // Move first task to last position
      
      // Check that the method was called
      expect(mockChrome.storage.local.set).toHaveBeenCalled()
    })

    it('should throw error for invalid indices', async () => {
      const tasks: Task[] = [
        { id: 'task_1', text: 'Task 1', completed: false, createdAt: new Date(), order: 0 }
      ]
      
      // Mock serialized format
      const serializedTasks = tasks.map(task => ({
        ...task,
        createdAt: { __type: 'Date', value: task.createdAt.toISOString() }
      }))
      
      mockChrome.storage.local.get.mockResolvedValue({ todaysTasks: serializedTasks })
      
      await expect(service.reorderTasks(-1, 0)).rejects.toThrow('Invalid task indices for reordering')
      await expect(service.reorderTasks(0, 5)).rejects.toThrow('Invalid task indices for reordering')
    })
  })

  describe('updateDailyStats', () => {
    it('should update stats with current date', async () => {
      const existingStats: DailyStats = {
        date: '2024-01-15',
        sessionsStarted: 2,
        sessionsCompleted: 1,
        totalFocusTime: 25,
        tasksCreated: 3,
        tasksCompleted: 2,
        streak: 1
      }
      
      mockChrome.storage.local.get.mockResolvedValue({ todaysStats: existingStats })
      mockChrome.storage.local.set.mockResolvedValue(undefined)
      
      await service.updateDailyStats({ sessionsCompleted: 2, totalFocusTime: 50 })
      
      const expectedStats = {
        ...existingStats,
        sessionsCompleted: 2,
        totalFocusTime: 50
      }
      
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        todaysStats: expectedStats
      })
    })
  })

  describe('getStorageUsage', () => {
    it('should return storage usage for local storage', async () => {
      mockChrome.storage.local.getBytesInUse.mockResolvedValue(1024)
      
      const result = await service.getStorageUsage('local')
      expect(result).toEqual({ bytesInUse: 1024 })
    })

    it('should return storage usage with quota for sync storage', async () => {
      mockChrome.storage.sync.getBytesInUse.mockResolvedValue(2048)
      
      const result = await service.getStorageUsage('sync')
      expect(result).toEqual({ bytesInUse: 2048, quota: 102400 })
    })
  })

  describe('clearAllData', () => {
    it('should clear both local and sync storage', async () => {
      mockChrome.storage.local.clear.mockResolvedValue(undefined)
      mockChrome.storage.sync.clear.mockResolvedValue(undefined)
      
      await service.clearAllData()
      
      expect(mockChrome.storage.local.clear).toHaveBeenCalled()
      expect(mockChrome.storage.sync.clear).toHaveBeenCalled()
    })
  })
})

describe('Utility Functions', () => {
  describe('createDefaultUserPreferences', () => {
    it('should create default preferences', () => {
      const preferences = createDefaultUserPreferences()
      
      expect(preferences).toEqual({
        theme: 'system',
        defaultSessionLength: 25,
        defaultBreakLength: 5,
        skipBreaks: false,
        notificationsEnabled: true,
        soundEnabled: true,
        spotifyConnected: false
      })
    })
  })

  describe('createDefaultDailyStats', () => {
    it('should create default stats with current date', () => {
      const stats = createDefaultDailyStats()
      const today = new Date().toISOString().split('T')[0]
      
      expect(stats).toEqual({
        date: today,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      })
    })

    it('should create default stats with provided date', () => {
      const customDate = '2024-01-15'
      const stats = createDefaultDailyStats(customDate)
      
      expect(stats.date).toBe(customDate)
    })
  })

  describe('ID Generators', () => {
    it('should generate unique task IDs', () => {
      const id1 = generateTaskId()
      const id2 = generateTaskId()
      
      expect(id1).toMatch(/^task_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^task_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()
      
      expect(id1).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^session_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should generate unique user IDs', () => {
      const id1 = generateUserId()
      const id2 = generateUserId()
      
      expect(id1).toMatch(/^user_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^user_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('storageService singleton', () => {
    it('should export singleton instance', () => {
      expect(storageService).toBeInstanceOf(ChromeStorageService)
      expect(storageService).toBe(ChromeStorageService.getInstance())
    })
  })
})

describe('Error Handling', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = ChromeStorageService.getInstance()
    jest.clearAllMocks()
  })

  it('should handle Chrome API errors gracefully', async () => {
    mockChrome.storage.local.get.mockRejectedValue(new Error('Storage quota exceeded'))
    
    await expect(service.getCurrentSession()).rejects.toThrow(StorageError)
    await expect(service.getCurrentSession()).rejects.toThrow('Failed to get current session')
  })

  it('should handle validation errors in storage operations', async () => {
    const invalidTask = { id: '', text: 'Invalid task' }
    
    await expect(service.addTask(invalidTask as any)).rejects.toThrow(StorageError)
  })

  it('should handle missing Chrome APIs', () => {
    const originalChrome = global.chrome
    // @ts-ignore
    global.chrome = undefined
    
    // Reset singleton to force constructor to run again
    ChromeStorageService.resetInstance()
    
    expect(() => ChromeStorageService.getInstance()).toThrow('Chrome storage API is not available')
    
    global.chrome = originalChrome
    ChromeStorageService.resetInstance() // Reset for other tests
  })
})

describe('Storage Event Listeners', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = ChromeStorageService.getInstance()
    jest.clearAllMocks()
  })

  it('should add storage listener', () => {
    const callback = jest.fn()
    
    service.addStorageListener(callback)
    
    expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalledWith(callback)
  })

  it('should remove storage listener', () => {
    const callback = jest.fn()
    
    service.removeStorageListener(callback)
    
    expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalledWith(callback)
  })
})

describe('Data Export/Import', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = ChromeStorageService.getInstance()
    jest.clearAllMocks()
  })

  it('should export data from both storage areas', async () => {
    const localData = { currentSession: null, todaysTasks: [] }
    const syncData = { userProfile: null, weeklyStats: [] }
    
    // Clear previous mocks and set new ones
    jest.clearAllMocks()
    mockChrome.storage.local.get.mockResolvedValueOnce(localData)
    mockChrome.storage.sync.get.mockResolvedValueOnce(syncData)
    
    const result = await service.exportData()
    
    expect(result.local).toEqual(localData)
    expect(result.sync).toEqual(syncData)
  })

  it('should import data to both storage areas', async () => {
    const importData = {
      local: { currentSession: null },
      sync: { userProfile: null }
    }
    
    mockChrome.storage.local.set.mockResolvedValue(undefined)
    mockChrome.storage.sync.set.mockResolvedValue(undefined)
    
    await service.importData(importData)
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(importData.local)
    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith(importData.sync)
  })

  it('should handle partial import data', async () => {
    const importData = { local: { currentSession: null } }
    
    mockChrome.storage.local.set.mockResolvedValue(undefined)
    
    await service.importData(importData)
    
    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(importData.local)
    expect(mockChrome.storage.sync.set).not.toHaveBeenCalled()
  })
})

describe('DataSerializer', () => {
  describe('serialize', () => {
    it('should serialize Date objects', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const serialized = DataSerializer.serialize(date)
      
      expect(serialized).toEqual({
        __type: 'Date',
        value: '2024-01-15T10:30:00.000Z'
      })
    })

    it('should serialize arrays with Date objects', () => {
      const data = [new Date('2024-01-15T10:30:00Z'), 'string', 123]
      const serialized = DataSerializer.serialize(data)
      
      expect(serialized).toEqual([
        { __type: 'Date', value: '2024-01-15T10:30:00.000Z' },
        'string',
        123
      ])
    })

    it('should serialize objects with Date properties', () => {
      const data = {
        createdAt: new Date('2024-01-15T10:30:00Z'),
        text: 'test',
        count: 5
      }
      const serialized = DataSerializer.serialize(data)
      
      expect(serialized).toEqual({
        createdAt: { __type: 'Date', value: '2024-01-15T10:30:00.000Z' },
        text: 'test',
        count: 5
      })
    })

    it('should handle null and undefined values', () => {
      expect(DataSerializer.serialize(null)).toBe(null)
      expect(DataSerializer.serialize(undefined)).toBe(undefined)
    })
  })

  describe('deserialize', () => {
    it('should deserialize Date objects', () => {
      const serialized = { __type: 'Date', value: '2024-01-15T10:30:00.000Z' }
      const deserialized = DataSerializer.deserialize(serialized)
      
      expect(deserialized).toBeInstanceOf(Date)
      expect(deserialized.toISOString()).toBe('2024-01-15T10:30:00.000Z')
    })

    it('should deserialize arrays with Date objects', () => {
      const serialized = [
        { __type: 'Date', value: '2024-01-15T10:30:00.000Z' },
        'string',
        123
      ]
      const deserialized = DataSerializer.deserialize(serialized)
      
      expect(deserialized[0]).toBeInstanceOf(Date)
      expect(deserialized[1]).toBe('string')
      expect(deserialized[2]).toBe(123)
    })

    it('should deserialize objects with Date properties', () => {
      const serialized = {
        createdAt: { __type: 'Date', value: '2024-01-15T10:30:00.000Z' },
        text: 'test',
        count: 5
      }
      const deserialized = DataSerializer.deserialize(serialized)
      
      expect(deserialized.createdAt).toBeInstanceOf(Date)
      expect(deserialized.text).toBe('test')
      expect(deserialized.count).toBe(5)
    })

    it('should handle null and undefined values', () => {
      expect(DataSerializer.deserialize(null)).toBe(null)
      expect(DataSerializer.deserialize(undefined)).toBe(undefined)
    })
  })

  describe('compress and decompress', () => {
    it('should compress and decompress data correctly', () => {
      const originalData = {
        createdAt: new Date('2024-01-15T10:30:00Z'),
        tasks: [
          { id: '1', text: 'Task 1', completed: false },
          { id: '2', text: 'Task 2', completed: true }
        ],
        count: 42
      }

      const compressed = DataSerializer.compress(originalData)
      expect(typeof compressed).toBe('string')

      const decompressed = DataSerializer.decompress(compressed)
      expect(decompressed.createdAt).toBeInstanceOf(Date)
      expect(decompressed.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z')
      expect(decompressed.tasks).toEqual(originalData.tasks)
      expect(decompressed.count).toBe(42)
    })

    it('should throw error for invalid compressed data', () => {
      expect(() => DataSerializer.decompress('invalid json')).toThrow(StorageError)
    })
  })
})

describe('Enhanced Storage Event Listeners', () => {
  let service: ChromeStorageService

  beforeEach(() => {
    service = ChromeStorageService.getInstance()
    jest.clearAllMocks()
  })

  it('should add enhanced storage listener', () => {
    const callback = jest.fn()
    service.addEnhancedStorageListener(callback)
    
    expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled()
  })

  it('should enable cross-tab sync', () => {
    // Mock window and CustomEvent if they don't exist
    if (typeof global.window === 'undefined') {
      global.window = { dispatchEvent: jest.fn() } as any
    }
    
    if (typeof global.CustomEvent === 'undefined') {
      global.CustomEvent = jest.fn().mockImplementation((type, options) => ({
        type,
        detail: options.detail
      })) as any
    }

    service.enableCrossTabSync()
    expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled()
  })

  it('should listen for specific storage changes', () => {
    const callback = jest.fn()
    const cleanup = service.onStorageChange('todaysTasks', callback)
    
    expect(typeof cleanup).toBe('function')
    expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled()
  })
})