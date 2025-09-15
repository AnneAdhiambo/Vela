'use client'

import { useState } from 'react'

export default function PolarTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testPolarIntegration = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'test-product',
          successUrl: `${window.location.origin}/success?checkout_id={CHECKOUT_ID}`,
          cancelUrl: `${window.location.origin}/#pricing`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(`Success! Checkout URL: ${data.checkoutUrl}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Polar Integration Test</h3>
      <button
        onClick={testPolarIntegration}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isLoading ? 'Testing...' : 'Test Polar Checkout'}
      </button>
      {result && (
        <div className={`mt-4 p-3 rounded ${result.startsWith('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result}
        </div>
      )}
    </div>
  )
}