// Chrome API utilities with fallbacks for development

// Check if we're running in a Chrome extension environment
export const isExtensionEnvironment = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id
}

// Mock Chrome storage for development
const mockStorage = {
  data: new Map<string, any>(),
  
  get: async (keys: string[] | string): Promise<any> => {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    const result: any = {}
    
    for (const key of keyArray) {
      if (mockStorage.data.has(key)) {
        result[key] = mockStorage.data.get(key)
      }
    }
    
    return result
  },
  
  set: async (items: Record<string, any>): Promise<void> => {
    for (const [key, value] of Object.entries(items)) {
      mockStorage.data.set(key, value)
    }
  },
  
  remove: async (keys: string[] | string): Promise<void> => {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArray) {
      mockStorage.data.delete(key)
    }
  }
}

// Mock Chrome runtime for development
const mockRuntime = {
  onMessage: {
    addListener: (callback: Function) => {
      console.log('Mock: Added message listener', callback)
    },
    removeListener: (callback: Function) => {
      console.log('Mock: Removed message listener', callback)
    }
  },
  
  sendMessage: async (message: any): Promise<any> => {
    console.log('Mock: Sending message', message)
    
    // Mock responses for different message types
    switch (message.type) {
      case 'TEST_NOTIFICATION':
        return true
      case 'UPDATE_NOTIFICATION_PREFERENCES':
        return { success: true }
      default:
        return { success: true }
    }
  }
}

// Chrome API wrapper with fallbacks
export const chromeApi = {
  storage: {
    local: isExtensionEnvironment() ? chrome.storage.local : mockStorage
  },
  
  runtime: isExtensionEnvironment() ? chrome.runtime : mockRuntime,
  
  // Check if notifications are available
  notifications: isExtensionEnvironment() && chrome.notifications ? chrome.notifications : null
}

// Initialize mock data for development
if (!isExtensionEnvironment()) {
  // Set default mock data
  mockStorage.set({
    userPreferences: {
      theme: 'system',
      defaultSessionLength: 25,
      defaultBreakLength: 5,
      skipBreaks: false,
      notificationsEnabled: true,
      soundEnabled: true,
      spotifyConnected: false
    },
    todaysTasks: [],
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
}