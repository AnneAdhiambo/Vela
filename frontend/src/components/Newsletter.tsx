'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      // This would integrate with Supabase for magic link signup
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate success
      setStatus('success')
      setMessage('Check your email for a magic link to complete signup!')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Updated with Vela
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get productivity tips, feature updates, and exclusive content delivered to your inbox. 
            Join our community of focused professionals.
          </p>
        </div>

        {/* Newsletter Form */}
        <div className="max-w-md mx-auto">
          {status === 'success' ? (
            <div className="bg-green-100 border border-green-200 rounded-lg p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Almost there!
              </h3>
              <p className="text-green-700">
                {message}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={status === 'loading'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Subscribe
                    </>
                  )}
                </button>
              </div>

              {status === 'error' && (
                <div className="flex items-center justify-center text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {message}
                </div>
              )}
            </form>
          )}

          {/* Privacy Note */}
          <p className="text-blue-200 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-center">
          <div>
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-white mb-1">Productivity Tips</h4>
            <p className="text-blue-200 text-sm">Weekly insights to boost your focus</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="font-semibold text-white mb-1">Feature Updates</h4>
            <p className="text-blue-200 text-sm">Be first to know about new features</p>
          </div>
          <div>
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-white mb-1">Community</h4>
            <p className="text-blue-200 text-sm">Connect with like-minded professionals</p>
          </div>
        </div>
      </div>
    </section>
  )
}