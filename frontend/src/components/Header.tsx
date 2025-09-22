'use client'

import { Chrome } from 'lucide-react'

export default function Header() {
  const handleJoinWaitlist = () => {
    // Scroll to waitlist section
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9046ff' }}>
              <Chrome className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Vela
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>
              How it Works
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Testimonials
            </a>
          </nav>

          {/* Join Waitlist Button */}
          <button
            onClick={handleJoinWaitlist}
            className="inline-flex items-center px-6 py-2 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: '#9046ff',
              fontFamily: 'Manrope, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9046ff'
            }}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Join Waitlist
          </button>
        </div>
      </div>
    </header>
  )
}
