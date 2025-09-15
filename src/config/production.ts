// Production configuration for Vela Chrome Extension

export const config = {
  // Authentication settings
  auth: {
    useMockAuth: false,
    apiBaseUrl: 'https://api.vela-app.com',
    mockAutoLogin: false,
  },
  
  // Feature flags
  features: {
    skipAuthInDev: false,
    showDebugInfo: false,
    enableMockNotifications: false,
  },
  
  // Production settings
  production: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
  }
}

// Production logger (minimal logging)
export const prodLog = {
  error: (...args: any[]) => {
    console.error('[VELA]', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('[VELA]', ...args)
  },
  info: (...args: any[]) => {
    // Only log important info in production
    if (args[0]?.includes?.('Authentication') || args[0]?.includes?.('Error')) {
      console.info('[VELA]', ...args)
    }
  }
}

// Production utilities
export const prodUtils = {
  // Report errors to monitoring service
  reportError: (error: Error, context?: string) => {
    if (config.production.enableErrorReporting) {
      // In a real app, this would send to Sentry, LogRocket, etc.
      console.error('[VELA ERROR]', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }
  },
  
  // Track performance metrics
  trackPerformance: (metric: string, value: number) => {
    if (config.production.enablePerformanceMonitoring) {
      // In a real app, this would send to analytics service
      console.info('[VELA PERF]', { metric, value, timestamp: Date.now() })
    }
  },
  
  // Track user events
  trackEvent: (event: string, properties?: Record<string, any>) => {
    if (config.production.enableAnalytics) {
      // In a real app, this would send to analytics service
      console.info('[VELA ANALYTICS]', { event, properties, timestamp: Date.now() })
    }
  }
}