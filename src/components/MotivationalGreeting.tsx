import { useState, useEffect } from 'react'
import { getTimeBasedGreeting } from '../utils/greetings'

const motivationalWords = [
  'achiever', 'champion', 'warrior', 'genius', 'legend', 'master', 'hero', 'star',
  'winner', 'pro', 'expert', 'guru', 'wizard', 'ninja', 'rockstar', 'superstar',
  'phenomenon', 'miracle', 'inspiration', 'beacon', 'trailblazer', 'pioneer',
  'visionary', 'innovator', 'creator', 'builder', 'architect', 'designer',
  'artist', 'performer', 'entertainer', 'storyteller', 'dreamer', 'believer'
]

export function MotivationalGreeting() {
  const [randomWord, setRandomWord] = useState('achiever')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Set random word on mount
    const randomIndex = Math.floor(Math.random() * motivationalWords.length)
    setRandomWord(motivationalWords[randomIndex])
    
    // Change word every 30 seconds for variety
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * motivationalWords.length)
      setRandomWord(motivationalWords[randomIndex])
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const greeting = getTimeBasedGreeting()

  if (!isVisible) return null

  return (
    <div className="gradient-accent rounded-lg p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {greeting === 'Good morning' && '🌅'}
            {greeting === 'Good afternoon' && '☀️'}
            {greeting === 'Good evening' && '🌆'}
            {greeting === 'Good night' && '🌙'}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {greeting}, {randomWord}!
            </h2>
            <p className="text-sm opacity-90">
              Ready to conquer your goals today?
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/70 hover:text-white transition-colors"
          title="Dismiss greeting"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
