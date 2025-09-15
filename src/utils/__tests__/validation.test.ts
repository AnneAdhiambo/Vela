import {
  ValidationError,
  validateTask,
  validateFocusSession,
  validateUserProfile,
  validateUserPreferences,
  validateDailyStats,
  validateWeeklyStats,
  validateSessionConfig,
  validateSpotifyTrack,
  validateSpotifyTokens,
  validateArray
} from '../validation'

describe('ValidationError', () => {
  it('should create error with message and field', () => {
    const error = new ValidationError('Test error', 'testField')
    expect(error.message).toBe('Test error')
    expect(error.field).toBe('testField')
    expect(error.name).toBe('ValidationError')
  })
})

describe('validateTask', () => {
  const validTask = {
    id: 'task_123',
    text: 'Test task',
    completed: false,
    createdAt: new Date(),
    order: 0
  }

  it('should validate a valid task', () => {
    const result = validateTask(validTask)
    expect(result).toEqual(validTask)
  })

  it('should validate task with completedAt', () => {
    const taskWithCompletion = {
      ...validTask,
      completed: true,
      completedAt: new Date()
    }
    const result = validateTask(taskWithCompletion)
    expect(result).toEqual(taskWithCompletion)
  })

  it('should throw error for non-object input', () => {
    expect(() => validateTask(null)).toThrow('Task must be an object')
    expect(() => validateTask('string')).toThrow('Task must be an object')
  })

  it('should throw error for invalid id', () => {
    expect(() => validateTask({ ...validTask, id: '' })).toThrow('Task ID must be a non-empty string')
    expect(() => validateTask({ ...validTask, id: 123 })).toThrow('Task ID must be a non-empty string')
  })

  it('should throw error for invalid text', () => {
    expect(() => validateTask({ ...validTask, text: '' })).toThrow('Task text must be a non-empty string')
    expect(() => validateTask({ ...validTask, text: 123 })).toThrow('Task text must be a non-empty string')
  })

  it('should throw error for invalid completed', () => {
    expect(() => validateTask({ ...validTask, completed: 'true' })).toThrow('Task completed must be a boolean')
  })

  it('should throw error for invalid createdAt', () => {
    expect(() => validateTask({ ...validTask, createdAt: 'invalid' })).toThrow('Task createdAt must be a valid Date')
    expect(() => validateTask({ ...validTask, createdAt: new Date('invalid') })).toThrow('Task createdAt must be a valid Date')
  })

  it('should throw error for invalid completedAt', () => {
    expect(() => validateTask({ ...validTask, completedAt: 'invalid' })).toThrow('Task completedAt must be a valid Date or undefined')
  })

  it('should throw error for invalid order', () => {
    expect(() => validateTask({ ...validTask, order: -1 })).toThrow('Task order must be a non-negative number')
    expect(() => validateTask({ ...validTask, order: 'invalid' })).toThrow('Task order must be a non-negative number')
  })
})

describe('validateFocusSession', () => {
  const validSession = {
    id: 'session_123',
    startTime: new Date(),
    plannedDuration: 25,
    sessionType: 'work' as const,
    completed: false,
    pausedTime: 0,
    tasksWorkedOn: ['task_1', 'task_2']
  }

  it('should validate a valid session', () => {
    const result = validateFocusSession(validSession)
    expect(result).toEqual(validSession)
  })

  it('should validate session with optional fields', () => {
    const sessionWithOptionals = {
      ...validSession,
      userId: 'user_123',
      endTime: new Date(),
      actualDuration: 23
    }
    const result = validateFocusSession(sessionWithOptionals)
    expect(result).toEqual(sessionWithOptionals)
  })

  it('should throw error for invalid plannedDuration', () => {
    expect(() => validateFocusSession({ ...validSession, plannedDuration: 0 }))
      .toThrow('Session plannedDuration must be between 1 and 480 minutes')
    expect(() => validateFocusSession({ ...validSession, plannedDuration: 500 }))
      .toThrow('Session plannedDuration must be between 1 and 480 minutes')
  })

  it('should throw error for invalid sessionType', () => {
    expect(() => validateFocusSession({ ...validSession, sessionType: 'invalid' }))
      .toThrow('Session sessionType must be "work" or "break"')
  })

  it('should throw error for invalid tasksWorkedOn', () => {
    expect(() => validateFocusSession({ ...validSession, tasksWorkedOn: 'invalid' }))
      .toThrow('Session tasksWorkedOn must be an array')
    expect(() => validateFocusSession({ ...validSession, tasksWorkedOn: ['', 'valid'] }))
      .toThrow('All task IDs in tasksWorkedOn must be non-empty strings')
  })
})

describe('validateUserPreferences', () => {
  const validPreferences = {
    theme: 'light' as const,
    defaultSessionLength: 25,
    defaultBreakLength: 5,
    skipBreaks: false,
    notificationsEnabled: true,
    soundEnabled: true,
    spotifyConnected: false
  }

  it('should validate valid preferences', () => {
    const result = validateUserPreferences(validPreferences)
    expect(result).toEqual(validPreferences)
  })

  it('should throw error for invalid theme', () => {
    expect(() => validateUserPreferences({ ...validPreferences, theme: 'invalid' }))
      .toThrow('Theme must be "light", "dark", or "system"')
  })

  it('should throw error for invalid session length', () => {
    expect(() => validateUserPreferences({ ...validPreferences, defaultSessionLength: 4 }))
      .toThrow('Default session length must be between 5 and 120 minutes')
    expect(() => validateUserPreferences({ ...validPreferences, defaultSessionLength: 121 }))
      .toThrow('Default session length must be between 5 and 120 minutes')
  })

  it('should throw error for invalid break length', () => {
    expect(() => validateUserPreferences({ ...validPreferences, defaultBreakLength: 0 }))
      .toThrow('Default break length must be between 1 and 60 minutes')
    expect(() => validateUserPreferences({ ...validPreferences, defaultBreakLength: 61 }))
      .toThrow('Default break length must be between 1 and 60 minutes')
  })
})

describe('validateUserProfile', () => {
  const validPreferences = {
    theme: 'light' as const,
    defaultSessionLength: 25,
    defaultBreakLength: 5,
    skipBreaks: false,
    notificationsEnabled: true,
    soundEnabled: true,
    spotifyConnected: false
  }

  const validProfile = {
    id: 'user_123',
    preferences: validPreferences,
    createdAt: new Date(),
    lastActiveAt: new Date()
  }

  it('should validate valid profile', () => {
    const result = validateUserProfile(validProfile)
    expect(result).toEqual(validProfile)
  })

  it('should validate profile with optional fields', () => {
    const profileWithOptionals = {
      ...validProfile,
      email: 'test@example.com',
      displayName: 'Test User'
    }
    const result = validateUserProfile(profileWithOptionals)
    expect(result).toEqual(profileWithOptionals)
  })

  it('should throw error for invalid email', () => {
    expect(() => validateUserProfile({ ...validProfile, email: 'invalid-email' }))
      .toThrow('Profile email must be a valid email address or undefined')
  })

  it('should throw error for missing preferences', () => {
    expect(() => validateUserProfile({ ...validProfile, preferences: undefined }))
      .toThrow('Profile preferences are required')
  })
})

describe('validateDailyStats', () => {
  const validStats = {
    date: '2024-01-15',
    sessionsStarted: 5,
    sessionsCompleted: 4,
    totalFocusTime: 100,
    tasksCreated: 8,
    tasksCompleted: 6,
    streak: 3
  }

  it('should validate valid stats', () => {
    const result = validateDailyStats(validStats)
    expect(result).toEqual(validStats)
  })

  it('should throw error for invalid date format', () => {
    expect(() => validateDailyStats({ ...validStats, date: '15-01-2024' }))
      .toThrow('Date must be in YYYY-MM-DD format')
    expect(() => validateDailyStats({ ...validStats, date: '2024/01/15' }))
      .toThrow('Date must be in YYYY-MM-DD format')
  })

  it('should throw error for negative values', () => {
    expect(() => validateDailyStats({ ...validStats, sessionsStarted: -1 }))
      .toThrow('Sessions started must be a non-negative number')
    expect(() => validateDailyStats({ ...validStats, totalFocusTime: -1 }))
      .toThrow('Total focus time must be a non-negative number')
  })

  it('should throw error for logical inconsistencies', () => {
    expect(() => validateDailyStats({ ...validStats, sessionsCompleted: 6, sessionsStarted: 5 }))
      .toThrow('Sessions completed cannot exceed sessions started')
    expect(() => validateDailyStats({ ...validStats, tasksCompleted: 10, tasksCreated: 8 }))
      .toThrow('Tasks completed cannot exceed tasks created')
  })
})

describe('validateWeeklyStats', () => {
  const validDailyStats = {
    date: '2024-01-15',
    sessionsStarted: 5,
    sessionsCompleted: 4,
    totalFocusTime: 100,
    tasksCreated: 8,
    tasksCompleted: 6,
    streak: 3
  }

  const validWeeklyStats = {
    weekStart: new Date('2024-01-15'),
    dailyStats: Array(7).fill(validDailyStats),
    weeklyTotals: {
      sessions: 28,
      focusTime: 700,
      tasksCompleted: 42
    }
  }

  it('should validate valid weekly stats', () => {
    const result = validateWeeklyStats(validWeeklyStats)
    expect(result).toEqual(validWeeklyStats)
  })

  it('should throw error for invalid daily stats count', () => {
    expect(() => validateWeeklyStats({ ...validWeeklyStats, dailyStats: Array(6).fill(validDailyStats) }))
      .toThrow('Daily stats must contain exactly 7 days')
  })

  it('should throw error for invalid weekly totals', () => {
    expect(() => validateWeeklyStats({ 
      ...validWeeklyStats, 
      weeklyTotals: { ...validWeeklyStats.weeklyTotals, sessions: -1 } 
    })).toThrow('Weekly total sessions must be a non-negative number')
  })
})

describe('validateSessionConfig', () => {
  const validConfig = {
    workDuration: 25,
    breakDuration: 5,
    skipBreaks: false,
    sessionType: 'pomodoro' as const
  }

  it('should validate valid config', () => {
    const result = validateSessionConfig(validConfig)
    expect(result).toEqual(validConfig)
  })

  it('should throw error for invalid work duration', () => {
    expect(() => validateSessionConfig({ ...validConfig, workDuration: 4 }))
      .toThrow('Work duration must be between 5 and 120 minutes')
    expect(() => validateSessionConfig({ ...validConfig, workDuration: 121 }))
      .toThrow('Work duration must be between 5 and 120 minutes')
  })

  it('should throw error for invalid session type', () => {
    expect(() => validateSessionConfig({ ...validConfig, sessionType: 'invalid' }))
      .toThrow('Session type must be "pomodoro", "custom", or "stopwatch"')
  })
})

describe('validateSpotifyTrack', () => {
  const validTrack = {
    name: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 180000,
    progress: 90000
  }

  it('should validate valid track', () => {
    const result = validateSpotifyTrack(validTrack)
    expect(result).toEqual(validTrack)
  })

  it('should throw error for empty strings', () => {
    expect(() => validateSpotifyTrack({ ...validTrack, name: '' }))
      .toThrow('Track name must be a non-empty string')
    expect(() => validateSpotifyTrack({ ...validTrack, artist: '' }))
      .toThrow('Track artist must be a non-empty string')
  })

  it('should throw error for invalid progress', () => {
    expect(() => validateSpotifyTrack({ ...validTrack, progress: 200000, duration: 180000 }))
      .toThrow('Track progress cannot exceed duration')
  })
})

describe('validateSpotifyTokens', () => {
  const validTokens = {
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_123',
    expiresAt: new Date()
  }

  it('should validate valid tokens', () => {
    const result = validateSpotifyTokens(validTokens)
    expect(result).toEqual(validTokens)
  })

  it('should throw error for empty tokens', () => {
    expect(() => validateSpotifyTokens({ ...validTokens, accessToken: '' }))
      .toThrow('Access token must be a non-empty string')
    expect(() => validateSpotifyTokens({ ...validTokens, refreshToken: '' }))
      .toThrow('Refresh token must be a non-empty string')
  })

  it('should throw error for invalid expiry date', () => {
    expect(() => validateSpotifyTokens({ ...validTokens, expiresAt: 'invalid' }))
      .toThrow('Expires at must be a valid Date')
  })
})

describe('validateArray', () => {
  const mockValidator = (item: any) => {
    if (typeof item !== 'string') {
      throw new Error('Item must be a string')
    }
    return item
  }

  it('should validate valid array', () => {
    const result = validateArray(['a', 'b', 'c'], mockValidator, 'testArray')
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('should throw error for non-array input', () => {
    expect(() => validateArray('not-array' as any, mockValidator, 'testArray'))
      .toThrow('testArray must be an array')
  })

  it('should throw error for invalid array item', () => {
    expect(() => validateArray(['a', 123, 'c'], mockValidator, 'testArray'))
      .toThrow('Invalid testArray at index 1: Item must be a string')
  })

  it('should handle empty array', () => {
    const result = validateArray([], mockValidator, 'testArray')
    expect(result).toEqual([])
  })
})