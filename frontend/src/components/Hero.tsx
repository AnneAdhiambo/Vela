'use client'

import { ArrowRight, Chrome, Play } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  const handleAddToChrome = () => {
    // This would link to the Chrome Web Store
    window.open('https://chrome.google.com/webstore', '_blank')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
            <Chrome className="w-4 h-4 mr-2" />
            Chrome Extension • Free to Install
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Transform Your
            <span className="gradient-text block">New Tab</span>
            Into a Productivity Hub
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Replace your default new tab with a beautiful focus timer, task manager, and progress tracker. 
            Turn every browser moment into a productivity opportunity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={handleAddToChrome}
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Add to Chrome - Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-200 transition-colors duration-200">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>

          {/* Hero Image/Screenshot */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-2">
              <div className="bg-gray-100 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
                {/* Placeholder for actual screenshot */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Chrome className="w-12 h-12 text-blue-600" />
                  </div>
                  <p className="text-gray-500 text-lg">Vela Extension Preview</p>
                  <p className="text-gray-400 text-sm mt-2">Screenshot coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm mb-4">Trusted by productive professionals</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-400 font-semibold">1000+ Users</div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-gray-400 font-semibold">⭐ 4.9 Rating</div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="text-gray-400 font-semibold">Chrome Web Store</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}