import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useApp } from '../contexts/AppContext'
import { chromeApi } from '../utils/chrome-api'

interface WeeklyStatsData {
  day: string
  date: string
  sessions: number
  focusTime: number
}

export function StatsChart() {
  const { } = useTheme()
  const { state } = useApp()
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWeeklyStats()
    
    // Listen for session tracking updates
    const handleMessage = (message: any) => {
      if (message.type === 'SESSION_TRACKED' || message.type === 'TIMER_COMPLETE' || message.type === 'STOP_TIMER') {
        console.log('📊 Stats update received, reloading...')
        loadWeeklyStats()
      }
    }
    
    chrome.runtime.onMessage.addListener(handleMessage)
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  const loadWeeklyStats = async () => {
    try {
      setIsLoading(true)
      
      // Get session stats from background script
      const result = await chromeApi.storage.local.get(['sessionStats', 'todaysStats'])
      const sessionStats = result.sessionStats || { sessions: [], totalSessions: 0, totalFocusTime: 0 }
      const todaysStats = result.todaysStats || { totalSessions: 0, totalFocusTime: 0 }
      
      console.log('📊 Loading stats - sessionStats:', sessionStats)
      console.log('📊 Loading stats - todaysStats:', todaysStats)
      
      // Get the last 7 days of stats
      const today = new Date()
      const weeklyData: WeeklyStatsData[] = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        // Get sessions for this specific date
        const daySessions = sessionStats.sessions?.filter((session: any) => session.date === dateStr) || []
        const daySessionsCount = daySessions.length
        const dayFocusTime = daySessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0)
        
        // For today, also check todaysStats as fallback
        const isToday = i === 0
        const sessions = isToday ? Math.max(daySessionsCount, todaysStats.totalSessions || 0) : daySessionsCount
        const focusTime = isToday ? Math.max(dayFocusTime, todaysStats.totalFocusTime || 0) : dayFocusTime
        
        weeklyData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          sessions: sessions,
          focusTime: focusTime
        })
      }
      
      console.log('📊 Weekly data loaded:', weeklyData)
      setWeeklyStats(weeklyData)
    } catch (error) {
      console.error('Error loading weekly stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const maxSessions = Math.max(...weeklyStats.map(d => d.sessions), 1)
  const todaysStats = weeklyStats[weeklyStats.length - 1] || { sessions: 0, focusTime: 0 }
  const totalWeekSessions = weeklyStats.reduce((sum, day) => sum + day.sessions, 0)
  const totalWeekFocusTime = weeklyStats.reduce((sum, day) => sum + day.focusTime, 0)

  if (isLoading) {
    return (
      <div data-testid="stats-chart" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
            </div>
            <div className="text-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="stats-chart" className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">This Week</h3>
        <button 
          onClick={loadWeeklyStats}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh stats"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Today's stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-accent-light rounded-lg">
          <div className="text-2xl font-bold text-accent">
            {todaysStats.sessions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Sessions</div>
        </div>
        <div className="text-center p-3 bg-accent-light rounded-lg">
          <div className="text-2xl font-bold text-accent">
            {Math.floor(todaysStats.focusTime / 60)}h {todaysStats.focusTime % 60}m
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Focus Time</div>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {totalWeekSessions}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Week Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {Math.floor(totalWeekFocusTime / 60)}h {totalWeekFocusTime % 60}m
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Week Focus</div>
        </div>
      </div>

      {/* Weekly chart - Vertical bars */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Daily Sessions</h4>
        <div className="flex items-end justify-between space-x-2 h-32">
          {weeklyStats.map((day, index) => {
            const isToday = index === weeklyStats.length - 1
            const percentage = maxSessions > 0 ? (day.sessions / maxSessions) * 100 : 0
            // Always show bars - minimum 20px for empty bars, scale based on sessions
            const barHeight = day.sessions > 0 ? Math.max(percentage * 0.8, 20) : 20
            
            return (
              <div key={day.date} className="flex flex-col items-center space-y-2 flex-1">
                <div className="flex flex-col items-center space-y-1">
                  <div 
                    className={`w-full rounded-t transition-all duration-700 ease-out ${
                      day.sessions > 0
                        ? (isToday 
                          ? 'bg-accent' 
                          : 'bg-accent-light')
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                    style={{ 
                      height: `${barHeight}px`,
                      transitionDelay: `${index * 100}ms`
                    }}
                  />
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {day.sessions}
                  </div>
                </div>
                <div className={`text-xs font-medium ${
                  isToday 
                    ? 'text-accent' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {day.day}
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          {totalWeekSessions} total sessions this week
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
          {weeklyStats.reduce((sum, day) => sum + (day.sessions || 0), 0)} completed sessions
        </div>
      </div>

      {/* Motivational message */}
      {todaysStats.sessions > 0 && (
        <div className="mt-4 p-3 gradient-accent-light rounded-lg border border-accent">
          <p className="text-sm text-accent-dark text-center">
            {getMotivationalMessage(todaysStats.sessions, state.todaysStats.streak)}
          </p>
        </div>
      )}
    </div>
  )
}

function getMotivationalMessage(sessions: number, streak: number): string {
  if (sessions >= 8) {
    return "🔥 Incredible! You're on fire today with " + sessions + " sessions!"
  } else if (sessions >= 5) {
    return "⭐ Amazing work! " + sessions + " sessions completed today!"
  } else if (sessions >= 3) {
    return "💪 Great progress! " + sessions + " sessions done today!"
  } else if (sessions >= 1) {
    return "🎯 Good start! Keep the momentum going!"
  }
  
  if (streak > 7) {
    return "🏆 " + streak + "-day streak! You're unstoppable!"
  } else if (streak > 3) {
    return "🔥 " + streak + "-day streak! Keep it up!"
  }
  
  return "Ready to start your first session today?"
}