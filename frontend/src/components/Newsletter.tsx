'use client'

import { useState, useEffect } from 'react'
import { Mail, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { initEmailJS, sendNewsletterWelcome } from '@/lib/emailjs'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate email
      if (!email.trim()) {
        setError('Please enter your email address')
        return
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      // Check if email already exists in subscribers
      const { data: existingSubscriber, error: checkError } = await supabase
        .from('subscribers')
        .select('email')
        .eq('email', email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingSubscriber) {
        setError('This email is already subscribed to our newsletter!')
        return
      }

      // Add to subscribers
      const { data: insertData, error: insertError } = await supabase
        .from('subscribers')
        .insert([
          {
            email: email.trim(),
            status: 'active',
            subscription_type: 'weekly'
          }
        ])
        .select()

      if (insertError) {
        throw insertError
      }
      
      // Send welcome email
      const emailSuccess = await sendNewsletterWelcome(email.trim())
      
      if (emailSuccess) {
        setEmailSent(true)
      }
      
      setIsSubmitted(true)
    } catch (err) {
      console.error('❌ Error subscribing to newsletter:', err)
      setError(`Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="py-16" style={{ backgroundColor: '#f8f6ff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#e8e0ff' }}>
            <CheckCircle className="w-8 h-8" style={{ color: '#9046ff' }} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            You're subscribed! 🎉
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Thank you for subscribing to our weekly newsletter! 
            {emailSent ? ' Check your inbox for a welcome email.' : ' You\'ll receive productivity tips, updates about Vela, and exclusive content every week.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#f8f6ff' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#e8e0ff' }}>
            <Mail className="w-8 h-8" style={{ color: '#9046ff' }} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Stay Updated
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Get weekly productivity tips, Vela updates, and exclusive content delivered to your inbox.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Email Address
              </label>
              <input
                type="email"
                id="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  '--tw-ring-color': '#9046ff'
                } as React.CSSProperties}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600" style={{ fontFamily: 'Manrope, sans-serif' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Subscribing...
                </div>
              ) : (
                'Subscribe to Newsletter'
              )}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center" style={{ fontFamily: 'Manrope, sans-serif' }}>
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}