'use client'

import { Download, Settings, Zap } from 'lucide-react'

const steps = [
  {
    icon: Download,
    step: '01',
    title: 'Install Extension',
    description: 'Add Vela to Chrome in one click. No signup required to get started.',
    color: 'bg-blue-500'
  },
  {
    icon: Settings,
    step: '02', 
    title: 'Customize Your Setup',
    description: 'Set your preferred timer length, choose your theme, and connect Spotify if desired.',
    color: 'bg-purple-500'
  },
  {
    icon: Zap,
    step: '03',
    title: 'Start Being Productive',
    description: 'Open a new tab and immediately start a focus session. Track tasks and build your streak.',
    color: 'bg-green-500'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your browsing experience into a productivity powerhouse in less than 2 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="text-center relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gray-200 z-0">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                )}

                {/* Step Content */}
                <div className="relative z-10">
                  {/* Icon Circle */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} rounded-full mb-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Step Number */}
                  <div className="text-sm font-bold text-gray-400 mb-2">
                    STEP {step.step}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Screenshot/Demo Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                See Vela in Action
              </h3>
              <p className="text-gray-600">
                Watch how Vela transforms your new tab experience
              </p>
            </div>
            
            {/* Placeholder for screenshot/video */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-500">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}