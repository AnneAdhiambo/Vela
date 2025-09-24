'use client'

import { Trophy, Heart } from 'lucide-react'

export default function HackathonCard() {
  const handleKiroClick = () => {
    window.open('https://kiro.dev', '_blank')
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Card with 3D effect matching Vela's style */}
          <div 
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border-2 relative"
            style={{
              borderColor: '#e8e0ff',
              boxShadow: '0 10px 25px -3px rgba(144, 70, 255, 0.1), 0 4px 6px -2px rgba(144, 70, 255, 0.05)',
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            {/* Trophy Icon with Vela's purple theme */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Hackathon Submission
            </h2>

            {/* Body Text */}
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
              This project was built for the <strong className="text-gray-900">Kiro.dev Hackathon</strong> - showcasing the power of rapid development and innovative AI integration in modern web applications.
            </p>

            {/* CTA Button matching Vela's button style */}
            <button
              onClick={handleKiroClick}
              className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
              <Heart className="w-4 h-4 mr-2 text-pink-200" />
              Built with ❤️ with Kiro.dev
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
