import { MotivationalQuote } from '../types'

const motivationalQuotes: MotivationalQuote[] = [
  // Productivity quotes
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "productivity"
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    category: "productivity"
  },
  {
    text: "It is not enough to be busy. The question is: what are we busy about?",
    author: "Henry David Thoreau",
    category: "productivity"
  },
  {
    text: "Productivity is never an accident. It is always the result of a commitment to excellence.",
    author: "Paul J. Meyer",
    category: "productivity"
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
    category: "productivity"
  },

  // Focus quotes
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "focus"
  },
  {
    text: "The successful warrior is the average person with laser-like focus.",
    author: "Bruce Lee",
    category: "focus"
  },
  {
    text: "Where focus goes, energy flows and results show.",
    author: "Tony Robbins",
    category: "focus"
  },
  {
    text: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    category: "focus"
  },
  {
    text: "The art of being wise is knowing what to overlook.",
    author: "William James",
    category: "focus"
  },

  // Motivation quotes
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "motivation"
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "motivation"
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "motivation"
  },
  {
    text: "You don't have to be great to get started, but you have to get started to be great.",
    author: "Les Brown",
    category: "motivation"
  },

  // Success quotes
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "success"
  },
  {
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
    category: "success"
  },
  {
    text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
    author: "Roy T. Bennett",
    category: "success"
  },
  {
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "success"
  }
]

class MotivationalService {
  private lastQuoteDate: string | null = null
  private currentQuote: MotivationalQuote | null = null

  // Get daily quote (same quote for the entire day)
  getDailyQuote(): MotivationalQuote {
    const today = new Date().toISOString().split('T')[0]
    
    if (this.lastQuoteDate !== today || !this.currentQuote) {
      // Get a new quote for today
      const seed = this.getDateSeed(today)
      const index = seed % motivationalQuotes.length
      this.currentQuote = motivationalQuotes[index]
      this.lastQuoteDate = today
    }
    
    return this.currentQuote
  }

  // Get random quote by category
  getQuoteByCategory(category: MotivationalQuote['category']): MotivationalQuote {
    const categoryQuotes = motivationalQuotes.filter(q => q.category === category)
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length)
    return categoryQuotes[randomIndex] || this.getDailyQuote()
  }

  // Get random quote
  getRandomQuote(): MotivationalQuote {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
    return motivationalQuotes[randomIndex]
  }

  // Get session completion message
  getSessionCompletionMessage(sessionCount: number): string {
    if (sessionCount >= 10) {
      return "🏆 Incredible dedication! You're a productivity champion today!"
    } else if (sessionCount >= 8) {
      return "🔥 You're absolutely crushing it today! Amazing focus!"
    } else if (sessionCount >= 6) {
      return "⭐ Outstanding work! Your consistency is paying off!"
    } else if (sessionCount >= 4) {
      return "💪 Great momentum! You're building excellent habits!"
    } else if (sessionCount >= 2) {
      return "🎯 Nice progress! Keep the focus flowing!"
    } else {
      return "🌟 Great start! Every journey begins with a single step!"
    }
  }

  // Get streak encouragement
  getStreakMessage(streak: number): string {
    if (streak >= 30) {
      return `🏆 ${streak} days! You're a productivity legend!`
    } else if (streak >= 21) {
      return `🔥 ${streak}-day streak! You've built an incredible habit!`
    } else if (streak >= 14) {
      return `⭐ ${streak} days strong! You're unstoppable!`
    } else if (streak >= 7) {
      return `💪 One week streak! You're building momentum!`
    } else if (streak >= 3) {
      return `🎯 ${streak} days in a row! Keep it up!`
    } else {
      return `🌟 Day ${streak}! Every day counts!`
    }
  }

  // Get break time encouragement
  getBreakMessage(): string {
    const breakMessages = [
      "🌱 Take a deep breath. You've earned this break!",
      "☕ Recharge your mind. Great work deserves great rest!",
      "🚶‍♂️ Step away, stretch, and come back stronger!",
      "🧘‍♀️ A rested mind is a productive mind!",
      "🌟 You're doing amazing. Enjoy this moment!",
      "💧 Hydrate, breathe, and prepare for your next session!",
      "🎵 Take a moment to appreciate your progress!",
      "🌸 Rest is not a reward for work done, but a requirement for work to come!"
    ]
    
    const randomIndex = Math.floor(Math.random() * breakMessages.length)
    return breakMessages[randomIndex]
  }

  // Get focus session start message
  getSessionStartMessage(): string {
    const startMessages = [
      "🎯 Time to focus! You've got this!",
      "🚀 Let's make this session count!",
      "💪 Channel your energy into deep work!",
      "⚡ Focus mode activated! Time to shine!",
      "🔥 Ready to create something amazing!",
      "🎨 Your focused mind is your superpower!",
      "🌟 This is your time to make progress!",
      "💎 Transform your potential into results!"
    ]
    
    const randomIndex = Math.floor(Math.random() * startMessages.length)
    return startMessages[randomIndex]
  }

  // Generate a consistent seed from date string
  private getDateSeed(dateStr: string): number {
    let hash = 0
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

export const motivationalService = new MotivationalService()