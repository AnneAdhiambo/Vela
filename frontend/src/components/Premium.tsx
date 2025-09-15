'use client'

import { Check, Crown, Zap } from 'lucide-react'
import { useState } from 'react'

const freeFeatures = [
  'Circular focus timer',
  'Basic task management',
  'Daily statistics',
  'Light & dark themes',
  'Chrome sync'
]

const premiumFeatures = [
  'Advanced analytics & insights',
  'Custom timer sounds',
  'Unlimited task projects',
  'Goal setting & tracking',
  'Priority support',
  'Export data',
  'Team collaboration',
  'Advanced Spotify controls'
]

export default function Premium() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // Create Polar checkout session
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'vela-premium',
          successUrl: `${window.location.origin}/success?checkout_id={CHECKOUT_ID}`,
          cancelUrl: `${window.location.origin}/#pricing`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      // Fallback to direct Polar link
      window.open('https://polar.sh/vela', '_blank')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Premium Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Unlock Your Full Potential
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get advanced features and insights to supercharge your productivity journey.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $4.99
                <span className="text-lg text-gray-600 font-normal">/month</span>
              </div>
              <p className="text-gray-600">For serious productivity enthusiasts</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[...freeFeatures, ...premiumFeatures].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className={`${index >= freeFeatures.length ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isLoading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            30-day money-back guarantee • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  )
}