'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Download, ArrowRight, Crown } from 'lucide-react'

interface CheckoutDetails {
  id: string
  status: string
  productName: string
  amount: number
  currency: string
  customerEmail?: string
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get('checkout_id')
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (checkoutId) {
      fetchCheckoutDetails(checkoutId)
    } else {
      setError('No checkout ID provided')
      setIsLoading(false)
    }
  }, [checkoutId])

  const fetchCheckoutDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/checkout-details?checkout_id=${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch checkout details')
      }
      const details = await response.json()
      setCheckoutDetails(details)
    } catch (err) {
      console.error('Error fetching checkout details:', err)
      setError('Failed to load purchase details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadExtension = () => {
    // This would link to Chrome Web Store
    window.open('https://chrome.google.com/webstore/detail/vela', '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your purchase...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Success Header */}
      <div className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Vela Premium! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your purchase was successful. You now have access to all premium features.
          </p>

          {checkoutDetails && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                Purchase Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-gray-900">{checkoutDetails.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product:</span>
                  <span className="text-gray-900">{checkoutDetails.productName || 'Vela Premium'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-gray-900">
                    ${(checkoutDetails.amount / 100).toFixed(2)} {checkoutDetails.currency?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">✓ Completed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What's Next?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Download Extension */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. Install the Extension
                </h3>
                <p className="text-gray-600 mb-4">
                  Download Vela from the Chrome Web Store to get started.
                </p>
                <button
                  onClick={handleDownloadExtension}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Add to Chrome
                </button>
              </div>

              {/* Access Premium Features */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2. Unlock Premium Features
                </h3>
                <p className="text-gray-600 mb-4">
                  Sign in with your email to activate premium features.
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg">
                  <Crown className="w-5 h-5 mr-2" />
                  Premium Activated
                </div>
              </div>
            </div>

            {/* Premium Features List */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Your Premium Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Advanced analytics & insights',
                  'Custom timer sounds',
                  'Unlimited task projects',
                  'Goal setting & tracking',
                  'Priority support',
                  'Export data',
                  'Team collaboration',
                  'Advanced Spotify controls'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                Need help getting started? We're here to help!
              </p>
              <a
                href="mailto:support@vela.app"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact Support
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}