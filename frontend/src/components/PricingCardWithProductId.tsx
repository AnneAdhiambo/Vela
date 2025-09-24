'use client'
import { useState } from 'react'

interface PricingCardWithProductIdProps {
  productId: string
  productName: string
  price: number
  currency: string
  features: string[]
  customerEmail?: string
  customerName?: string
  metadata?: Record<string, any>
}

export default function PricingCardWithProductId({
  productId,
  productName,
  price,
  currency,
  features,
  customerEmail,
  customerName,
  metadata = {}
}: PricingCardWithProductIdProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = () => {
    setIsLoading(true)
    
    // Build query params for the checkout route using Product ID
    const params = new URLSearchParams()
    params.set('products', productId) // Use your Product ID here
    
    if (customerEmail) params.set('customerEmail', customerEmail)
    if (customerName) params.set('customerName', customerName)
    if (Object.keys(metadata).length > 0) {
      params.set('metadata', JSON.stringify(metadata))
    }

    // Redirect to checkout with query params
    window.location.href = `/checkout?${params.toString()}`
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{productName}</h3>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {currency} {price}
        </div>
        <p className="text-gray-600">One-time payment</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Processing...' : `Purchase ${productName}`}
      </button>
    </div>
  )
}
