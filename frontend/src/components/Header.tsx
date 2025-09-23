'use client'

import Image from 'next/image'
import { Chrome } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      // Hide navbar when scrolling down, show when scrolling up
      setIsVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleJoinWaitlist = () => {
    // Scroll to waitlist section
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="Vela Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Vela
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium" 
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium" 
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              How it Works
            </a>
            <a 
              href="#testimonials" 
              className="text-gray-600 hover:text-purple-600 transition-colors duration-200 font-medium" 
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Testimonials
            </a>
          </nav>

          {/* Join Waitlist Button */}
          <div className="ml-8">
            <button
              onClick={handleJoinWaitlist}
              className="inline-flex items-center px-6 py-2.5 text-white font-semibold rounded-lg transition-all duration-200"
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
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
