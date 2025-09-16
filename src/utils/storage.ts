import { 
  Task, 
  UserProfile, 
  UserPreferences, 
  DailyStats, 
  WeeklyStats,
  ActiveSession
} from '../types'
import { 
  validateTask, 
  validateFocusSession, 
  validateUserProfile, 
  validateUserPreferences,
  validateDailyStats,
  validateWeeklyStats,
  validateArray
} from './validation'

// Storage error class
export class StorageError extends Error {
  constructor(message: string, public operation?: string) {
    super(message)
    this.name = 'StorageError'
  }
}

// Chrome Storage API wrapper with validation and error handling
export class ChromeStorageService {
  private static instance: ChromeStorageService
  
  static getInstance(): ChromeStorageService {
    if (!ChromeStorageService.instance) {
      ChromeStorageService.instance = new ChromeStorageService()
    }
    return ChromeStorageService.instance
  }

  // Method to reset singleton for testing
  static resetInstance(): void {
    ChromeStorageService.instance = undefined as any
  }

  private constructor() {
    // Ensure Chrome extension APIs are available
    if (typeof chrome === 'undefined' || !chrome.storage) {
      throw new StorageError('Chrome storage API is not available')
    }
  }

  // Generic storage operations
  private async getFromStorage<T>(
    area: 'local' | 'sync',
    keys: string | string[] | null = null
  ): Promise<T> {
    try {
      const result = await chrome.storage[area].get(keys)
      // Deserialize data after retrieving
      const deserializedResult: any = {}
      for (const [key, value] of Object.entries(result)) {
        deserializedResult[key] = DataSerializer.deserialize(value)
      }
      return deserializedResult as T
    } catch (error) {
      throw new StorageError(`Failed to get data from ${area} storage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'get')
    }
  }

  private async setToStorage(
    area: 'local' | 'sync',
    data: Record<string, any>
  ): Promise<void> {
    try {
      // Serialize data before storing
      const serializedData: Record<string, any> = {}
      for (const [key, value] of Object.entries(data)) {
        serializedData[key] = DataSerializer.serialize(value)
      }
      await chrome.storage[area].set(serializedData)
    } catch (error) {
      throw new StorageError(`Failed to set data to ${area} storage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'set')
    }
  }

  // @ts-ignore - Method kept for future use
  private async removeFromStorage(
    area: 'local' | 'sync',
    keys: string | string[]
  ): Promise<void> {
    try {
      await chrome.storage[area].remove(keys)
    } catch (error) {
      throw new StorageError(`Failed to remove data from ${area} storage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'remove')
    }
  }

  private async clearStorage(area: 'local' | 'sync'): Promise<void> {
    try {
      await chrome.storage[area].clear()
    } catch (error) {
      throw new StorageError(`Failed to clear ${area} storage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'clear')
    }
  }

  // Local storage operations (fast access data)
  async getCurrentSession(): Promise<ActiveSession | null> {
    try {
      const data = await this.getFromStorage<{ currentSession?: any }>('local', 'currentSession')
      if (!data.currentSession) return null
      
      const session = validateFocusSession(data.currentSession)
      return {
        ...session,
        isActive: data.currentSession.isActive || false,
        isPaused: data.currentSession.isPaused || false
      }
    } catch (error) {
      throw new StorageError(`Failed to get current session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getCurrentSession')
    }
  }

  async setCurrentSession(session: ActiveSession | null): Promise<void> {
    try {
      if (session) {
        validateFocusSession(session)
      }
      await this.setToStorage('local', { currentSession: session })
    } catch (error) {
      throw new StorageError(`Failed to set current session: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setCurrentSession')
    }
  }

  async getTodaysTasks(): Promise<Task[]> {
    try {
      const data = await this.getFromStorage<{ todaysTasks?: any[] }>('local', 'todaysTasks')
      if (!data.todaysTasks) return []
      
      return validateArray(data.todaysTasks, validateTask, 'todaysTasks')
    } catch (error) {
      throw new StorageError(`Failed to get today's tasks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getTodaysTasks')
    }
  }

  async setTodaysTasks(tasks: Task[]): Promise<void> {
    try {
      const validatedTasks = validateArray(tasks, validateTask, 'tasks')
      await this.setToStorage('local', { todaysTasks: validatedTasks })
    } catch (error) {
      throw new StorageError(`Failed to set today's tasks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setTodaysTasks')
    }
  }

  async getTodaysStats(): Promise<DailyStats | null> {
    try {
      const data = await this.getFromStorage<{ todaysStats?: any }>('local', 'todaysStats')
      if (!data.todaysStats) return null
      
      return validateDailyStats(data.todaysStats)
    } catch (error) {
      throw new StorageError(`Failed to get today's stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getTodaysStats')
    }
  }

  async setTodaysStats(stats: DailyStats): Promise<void> {
    try {
      const validatedStats = validateDailyStats(stats)
      await this.setToStorage('local', { todaysStats: validatedStats })
    } catch (error) {
      throw new StorageError(`Failed to set today's stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setTodaysStats')
    }
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await this.getFromStorage<{ userPreferences?: any }>('local', 'userPreferences')
      if (!data.userPreferences) return null
      
      return validateUserPreferences(data.userPreferences)
    } catch (error) {
      throw new StorageError(`Failed to get user preferences: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getUserPreferences')
    }
  }

  async setUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      const validatedPreferences = validateUserPreferences(preferences)
      await this.setToStorage('local', { userPreferences: validatedPreferences })
      // Also sync to cloud storage
      await this.setToStorage('sync', { preferences: validatedPreferences })
    } catch (error) {
      throw new StorageError(`Failed to set user preferences: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setUserPreferences')
    }
  }

  async getLastSync(): Promise<Date | null> {
    try {
      const data = await this.getFromStorage<{ lastSync?: string }>('local', 'lastSync')
      if (!data.lastSync) return null
      
      return new Date(data.lastSync)
    } catch (error) {
      throw new StorageError(`Failed to get last sync: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getLastSync')
    }
  }

  async setLastSync(date: Date): Promise<void> {
    try {
      await this.setToStorage('local', { lastSync: date.toISOString() })
    } catch (error) {
      throw new StorageError(`Failed to set last sync: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setLastSync')
    }
  } 
 // Sync storage operations (cross-device sync data)
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await this.getFromStorage<{ userProfile?: any }>('sync', 'userProfile')
      if (!data.userProfile) return null
      
      return validateUserProfile(data.userProfile)
    } catch (error) {
      throw new StorageError(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getUserProfile')
    }
  }

  async setUserProfile(profile: UserProfile): Promise<void> {
    try {
      const validatedProfile = validateUserProfile(profile)
      await this.setToStorage('sync', { userProfile: validatedProfile })
    } catch (error) {
      throw new StorageError(`Failed to set user profile: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setUserProfile')
    }
  }

  async getRecentTasks(): Promise<Task[]> {
    try {
      const data = await this.getFromStorage<{ recentTasks?: any[] }>('sync', 'recentTasks')
      if (!data.recentTasks) return []
      
      return validateArray(data.recentTasks, validateTask, 'recentTasks')
    } catch (error) {
      throw new StorageError(`Failed to get recent tasks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getRecentTasks')
    }
  }

  async setRecentTasks(tasks: Task[]): Promise<void> {
    try {
      // Limit to last 50 tasks to stay within sync storage limits
      const limitedTasks = tasks.slice(-50)
      const validatedTasks = validateArray(limitedTasks, validateTask, 'tasks')
      await this.setToStorage('sync', { recentTasks: validatedTasks })
    } catch (error) {
      throw new StorageError(`Failed to set recent tasks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setRecentTasks')
    }
  }

  async getWeeklyStats(): Promise<WeeklyStats[]> {
    try {
      const data = await this.getFromStorage<{ weeklyStats?: any[] }>('sync', 'weeklyStats')
      if (!data.weeklyStats) return []
      
      return validateArray(data.weeklyStats, validateWeeklyStats, 'weeklyStats')
    } catch (error) {
      throw new StorageError(`Failed to get weekly stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getWeeklyStats')
    }
  }

  async setWeeklyStats(stats: WeeklyStats[]): Promise<void> {
    try {
      const validatedStats = validateArray(stats, validateWeeklyStats, 'stats')
      await this.setToStorage('sync', { weeklyStats: validatedStats })
    } catch (error) {
      throw new StorageError(`Failed to set weekly stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'setWeeklyStats')
    }
  }

  // Utility methods
  async addTask(task: Task): Promise<void> {
    try {
      const currentTasks = await this.getTodaysTasks()
      const updatedTasks = [...currentTasks, task]
      await this.setTodaysTasks(updatedTasks)
      
      // Also update recent tasks for sync
      const recentTasks = await this.getRecentTasks()
      const updatedRecentTasks = [...recentTasks, task]
      await this.setRecentTasks(updatedRecentTasks)
    } catch (error) {
      throw new StorageError(`Failed to add task: ${error instanceof Error ? error.message : 'Unknown error'}`, 'addTask')
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const currentTasks = await this.getTodaysTasks()
      const taskIndex = currentTasks.findIndex(task => task.id === taskId)
      
      if (taskIndex === -1) {
        throw new StorageError(`Task with ID ${taskId} not found`, 'updateTask')
      }

      const updatedTask = { ...currentTasks[taskIndex], ...updates }
      validateTask(updatedTask)
      
      currentTasks[taskIndex] = updatedTask
      await this.setTodaysTasks(currentTasks)
      
      // Also update in recent tasks
      const recentTasks = await this.getRecentTasks()
      const recentTaskIndex = recentTasks.findIndex(task => task.id === taskId)
      if (recentTaskIndex !== -1) {
        recentTasks[recentTaskIndex] = updatedTask
        await this.setRecentTasks(recentTasks)
      }
    } catch (error) {
      throw new StorageError(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`, 'updateTask')
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const currentTasks = await this.getTodaysTasks()
      const filteredTasks = currentTasks.filter(task => task.id !== taskId)
      
      if (filteredTasks.length === currentTasks.length) {
        throw new StorageError(`Task with ID ${taskId} not found`, 'deleteTask')
      }
      
      await this.setTodaysTasks(filteredTasks)
    } catch (error) {
      throw new StorageError(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`, 'deleteTask')
    }
  }

  async reorderTasks(fromIndex: number, toIndex: number): Promise<void> {
    try {
      const currentTasks = await this.getTodaysTasks()
      
      if (fromIndex < 0 || fromIndex >= currentTasks.length || 
          toIndex < 0 || toIndex >= currentTasks.length) {
        throw new StorageError('Invalid task indices for reordering', 'reorderTasks')
      }

      const reorderedTasks = [...currentTasks]
      const [movedTask] = reorderedTasks.splice(fromIndex, 1)
      reorderedTasks.splice(toIndex, 0, movedTask)
      
      // Update order property
      reorderedTasks.forEach((task, index) => {
        task.order = index
      })
      
      await this.setTodaysTasks(reorderedTasks)
    } catch (error) {
      throw new StorageError(`Failed to reorder tasks: ${error instanceof Error ? error.message : 'Unknown error'}`, 'reorderTasks')
    }
  }

  async updateDailyStats(updates: Partial<DailyStats>): Promise<void> {
    try {
      const currentStats = await this.getTodaysStats()
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      
      const updatedStats: DailyStats = {
        date: today,
        sessionsStarted: 0,
        sessionsCompleted: 0,
        sessionsStopped: 0,
        totalSessions: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0,
        ...currentStats,
        ...updates
      }
      
      await this.setTodaysStats(updatedStats)
    } catch (error) {
      throw new StorageError(`Failed to update daily stats: ${error instanceof Error ? error.message : 'Unknown error'}`, 'updateDailyStats')
    }
  }

  // Storage event listeners for cross-tab synchronization
  addStorageListener(callback: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void): void {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(callback)
    }
  }

  removeStorageListener(callback: (changes: chrome.storage.StorageChange, areaName: string) => void): void {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.removeListener(callback)
    }
  }

  // Enhanced storage change listener with deserialization
  addEnhancedStorageListener(
    callback: (changes: Record<string, { oldValue?: any; newValue?: any }>, areaName: string) => void
  ): void {
    const enhancedCallback = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      const deserializedChanges: Record<string, { oldValue?: any; newValue?: any }> = {}
      
      for (const [key, change] of Object.entries(changes)) {
        deserializedChanges[key] = {
          oldValue: change.oldValue ? DataSerializer.deserialize(change.oldValue) : undefined,
          newValue: change.newValue ? DataSerializer.deserialize(change.newValue) : undefined
        }
      }
      
      callback(deserializedChanges, areaName)
    }

    this.addStorageListener(enhancedCallback)
  }

  // Sync data across tabs when changes occur
  enableCrossTabSync(): void {
    this.addEnhancedStorageListener((changes, areaName) => {
      // Emit custom events for components to listen to
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('vela-storage-change', {
          detail: { changes, areaName }
        })
        window.dispatchEvent(event)
      }
    })
  }

  // Listen for storage changes from other tabs
  onStorageChange(
    key: string,
    callback: (newValue: any, oldValue: any, areaName: string) => void
  ): () => void {
    const listener = (changes: Record<string, { oldValue?: any; newValue?: any }>, areaName: string) => {
      if (changes[key]) {
        callback(changes[key].newValue, changes[key].oldValue, areaName)
      }
    }

    this.addEnhancedStorageListener(listener)

    // Return cleanup function
    return () => {
      // Note: This is a simplified cleanup - in a real implementation,
      // you'd need to track listeners to remove them properly
    }
  }

  // Storage quota and usage information
  async getStorageUsage(area: 'local' | 'sync' = 'local'): Promise<{ bytesInUse: number; quota?: number }> {
    try {
      if (chrome.storage[area].getBytesInUse && typeof chrome.storage[area].getBytesInUse === 'function') {
        const bytesInUse = await chrome.storage[area].getBytesInUse()
        const quota = area === 'sync' ? chrome.storage.sync.QUOTA_BYTES : undefined
        return { bytesInUse, quota }
      }
      return { bytesInUse: 0 }
    } catch (error) {
      throw new StorageError(`Failed to get storage usage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'getStorageUsage')
    }
  }

  // Clear all data (useful for testing and reset)
  async clearAllData(): Promise<void> {
    try {
      await this.clearStorage('local')
      await this.clearStorage('sync')
    } catch (error) {
      throw new StorageError(`Failed to clear all data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'clearAllData')
    }
  }

  // Export/Import functionality for backup
  async exportData(): Promise<{ local: any; sync: any }> {
    try {
      const localData = await this.getFromStorage('local')
      const syncData = await this.getFromStorage('sync')
      return { local: localData, sync: syncData }
    } catch (error) {
      throw new StorageError(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'exportData')
    }
  }

  async importData(data: { local?: any; sync?: any }): Promise<void> {
    try {
      if (data.local) {
        await this.setToStorage('local', data.local)
      }
      if (data.sync) {
        await this.setToStorage('sync', data.sync)
      }
    } catch (error) {
      throw new StorageError(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'importData')
    }
  }
}

// Data serialization and deserialization utilities
export class DataSerializer {
  // Serialize data for storage (handles Date objects and other complex types)
  static serialize(data: any): any {
    if (data === null || data === undefined) {
      return data
    }

    if (data instanceof Date) {
      return { __type: 'Date', value: data.toISOString() }
    }

    if (Array.isArray(data)) {
      return data.map(item => DataSerializer.serialize(item))
    }

    if (typeof data === 'object') {
      const serialized: any = {}
      for (const [key, value] of Object.entries(data)) {
        serialized[key] = DataSerializer.serialize(value)
      }
      return serialized
    }

    return data
  }

  // Deserialize data from storage (reconstructs Date objects and other complex types)
  static deserialize(data: any): any {
    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'object' && data.__type === 'Date') {
      return new Date(data.value)
    }

    if (Array.isArray(data)) {
      return data.map(item => DataSerializer.deserialize(item))
    }

    if (typeof data === 'object') {
      const deserialized: any = {}
      for (const [key, value] of Object.entries(data)) {
        deserialized[key] = DataSerializer.deserialize(value)
      }
      return deserialized
    }

    return data
  }

  // Compress data for storage (simple JSON compression)
  static compress(data: any): string {
    return JSON.stringify(DataSerializer.serialize(data))
  }

  // Decompress data from storage
  static decompress(compressedData: string): any {
    try {
      const parsed = JSON.parse(compressedData)
      return DataSerializer.deserialize(parsed)
    } catch (error) {
      throw new StorageError(`Failed to decompress data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'decompress')
    }
  }
}

// Singleton instance for easy access
export const storageService = ChromeStorageService.getInstance()

// Utility functions for common operations
export const createDefaultUserPreferences = (): UserPreferences => ({
  theme: 'system',
  accentColor: 'blue',
  defaultSessionLength: 25,
  defaultBreakLength: 5,
  skipBreaks: false,
  notificationsEnabled: true,
  soundEnabled: true,
  spotifyConnected: false,
  motivationalQuotes: true
})

export const createDefaultDailyStats = (date?: string): DailyStats => ({
  date: date || new Date().toISOString().split('T')[0],
  sessionsStarted: 0,
  sessionsCompleted: 0,
  sessionsStopped: 0,
  totalSessions: 0,
  totalFocusTime: 0,
  tasksCreated: 0,
  tasksCompleted: 0,
  streak: 0
})

export const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}