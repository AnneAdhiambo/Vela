// Development configuration for local testing
export const isDevelopment = (import.meta as any).env?.DEV || process.env.NODE_ENV === 'development'

export const config = {
  // Authentication settings
  auth: {
    useEmailJS: true, // Always use EmailJS for authentication
    apiBaseUrl: 'https://api.vela-app.com', // Production API (not used with EmailJS)
  },
  
  // Feature flags
  features: {
    skipAuthInDev: false, // Set to true to bypass auth entirely in dev
    showDebugInfo: isDevelopment,
    enableNotifications: true,
  },
  
  // Development helpers
  dev: {
    autoCompleteOnboarding: false,
    prefillTestData: isDevelopment,
    logLevel: isDevelopment ? 'debug' : 'error',
  }
}

// Development logger
export const devLog = {
  debug: (...args: any[]) => {
    if (config.dev.logLevel === 'debug') {
      console.log('🔧 [DEV]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (config.features.showDebugInfo) {
      console.info('ℹ️ [INFO]', ...args)
    }
  },
  warn: (...args: any[]) => {
    console.warn('⚠️ [WARN]', ...args)
  },
  error: (...args: any[]) => {
    console.error('❌ [ERROR]', ...args)
  }
}

// Development utilities
export const devUtils = {
  // Clear all local storage for testing
  clearAllData: async () => {
    if (isDevelopment) {
      try {
        await chrome.storage.local.clear()
        await chrome.storage.sync.clear()
        localStorage.clear()
        devLog.info('All data cleared for testing')
      } catch (error) {
        localStorage.clear()
        devLog.info('Local storage cleared (Chrome APIs not available)')
      }
    }
  },
  
  // Populate test data
  populateTestData: async () => {
    if (isDevelopment && config.dev.prefillTestData) {
      const testStats = {
        date: new Date().toISOString().split('T')[0],
        sessionsStarted: 5,
        sessionsCompleted: 4,
        totalFocusTime: 100,
        tasksCreated: 8,
        tasksCompleted: 6,
        streak: 3
      }
      
      const testTasks = [
        { id: '1', text: 'Review project requirements', completed: true, createdAt: new Date(), order: 0 },
        { id: '2', text: 'Implement authentication system', completed: false, createdAt: new Date(), order: 1 },
        { id: '3', text: 'Write unit tests', completed: false, createdAt: new Date(), order: 2 },
      ]
      
      try {
        // Check if Chrome API is available
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({
            todaysStats: testStats,
            todaysTasks: testTasks,
            [`dailyStats_${testStats.date}`]: testStats
          })
          devLog.info('Test data populated')
        } else {
          // Fallback for development environment
          localStorage.setItem('vela_todaysStats', JSON.stringify(testStats))
          localStorage.setItem('vela_todaysTasks', JSON.stringify(testTasks))
          localStorage.setItem(`vela_dailyStats_${testStats.date}`, JSON.stringify(testStats))
          devLog.info('Test data populated (localStorage fallback)')
        }
      } catch (error) {
        devLog.warn('Could not populate test data:', error)
      }
    }
  },
  
  // Show current storage state
  showStorageState: async () => {
    if (isDevelopment) {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const local = await chrome.storage.local.get()
          const sync = await chrome.storage.sync.get()
          devLog.debug('Chrome Local storage:', local)
          devLog.debug('Chrome Sync storage:', sync)
        } else {
          // Show localStorage contents for development
          const localStorageData: Record<string, any> = {}
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith('vela_')) {
              try {
                localStorageData[key] = JSON.parse(localStorage.getItem(key) || '{}')
              } catch {
                localStorageData[key] = localStorage.getItem(key)
              }
            }
          }
          devLog.debug('Local storage (development):', localStorageData)
        }
      } catch (error) {
        devLog.debug('Storage error:', error)
      }
    }
  },
  
  // Show EmailJS service status
  showEmailJSStatus: async () => {
    if (isDevelopment) {
      try {
        const { emailJSAuthService } = await import('../services/auth-emailjs')
        const status = emailJSAuthService.getStatus()
        devLog.debug('EmailJS Auth Service Status:', status)
      } catch (error) {
        devLog.warn('Could not get EmailJS status:', error)
      }
    }
  },
  
  // Check if in production mode
  isProductionMode: () => {
    return !isDevelopment
  }
}

// Make dev utils available globally in development
if (isDevelopment && typeof window !== 'undefined') {
  (window as any).velaDevUtils = devUtils
  devLog.info('Development utilities available at window.velaDevUtils')
}