'use client'

import { Clock, CheckSquare, Bell, Flame, Music, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: 'Circular Focus Timer',
    description: 'Beautiful Pomodoro timer with visual progress ring. Customize sessions from 5-120 minutes with automatic break reminders.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: CheckSquare,
    title: 'Smart Task Management',
    description: 'Create, edit, and organize tasks with drag-and-drop reordering. Check off completed items and track your daily progress.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get notified when focus sessions complete with both visual and audio alerts. Never lose track of your productivity rhythm.',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Flame,
    title: 'Daily Streaks',
    description: 'Build momentum with streak tracking. See your consecutive days of productivity with motivating water droplet badges.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Music,
    title: 'Spotify Integration',
    description: 'Control your music without leaving your productivity dashboard. Play, pause, and skip tracks to maintain your flow state.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your focus time, completed sessions, and task completion rates with beautiful charts and weekly overviews.',
    color: 'bg-indigo-100 text-indigo-600'
  }
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Focused
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vela combines the best productivity techniques into one seamless experience. 
            Every feature is designed to help you maintain focus and build lasting habits.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="feature-card bg-white rounded-xl p-8 shadow-sm border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-6`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 cursor-pointer">
            See All Features in Action
          </div>
        </div>
      </div>
    </section>
  )
}