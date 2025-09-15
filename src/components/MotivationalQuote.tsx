import { useState, useEffect } from 'react'
import { motivationalService } from '../services/motivational'
import { MotivationalQuote as Quote } from '../types'
import { useApp } from '../contexts/AppContext'

export function MotivationalQuote() {
  const { state } = useApp()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Only show quotes if user has enabled them
    if (state.preferences.motivationalQuotes) {
      const dailyQuote = motivationalService.getDailyQuote()
      setQuote(dailyQuote)
    }
  }, [state.preferences.motivationalQuotes])

  if (!state.preferences.motivationalQuotes || !quote || !isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800 relative">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="Hide quote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="pr-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1">
            <blockquote className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed mb-2">
              "{quote.text}"
            </blockquote>
            <cite className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              — {quote.author}
            </cite>
          </div>
        </div>
      </div>
    </div>
  )
}