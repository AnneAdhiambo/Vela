'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { initEmailJS, sendWaitlistConfirmation } from '@/lib/emailjs'

export default function WaitlistSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
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
      // Validate form
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('Please fill in all fields')
        return
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address')
        return
      }

      // Check if email already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from('waitlist')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingEntry) {
        setError('This email is already on our waitlist!')
        return
      }

      // Add to waitlist
      const { data: insertData, error: insertError } = await supabase
        .from('waitlist')
        .insert([
          {
            email: formData.email.trim(),
            name: formData.name.trim(),
            status: 'pending'
          }
        ])
        .select()

      if (insertError) {
        throw insertError
      }
      
      // Send confirmation email
      const emailSuccess = await sendWaitlistConfirmation(formData.name.trim(), formData.email.trim())
      
      if (emailSuccess) {
        setEmailSent(true)
      }
      
      setIsSubmitted(true)
    } catch (err) {
      console.error('❌ Error adding to waitlist:', err)
      setError(`Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section id="waitlist" className="py-20" style={{ backgroundColor: '#f8f6ff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#e8e0ff' }}>
            <CheckCircle className="w-10 h-10" style={{ color: '#9046ff' }} />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Welcome to the Vela Waitlist! 🎉
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Thank you for joining our waitlist! We're excited to have you on board.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Mail className="w-6 h-6" style={{ color: '#9046ff' }} />
              <span className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>What happens next?</span>
            </div>
            <ul className="text-gray-600 space-y-3 text-left max-w-md mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emailSent ? '#10b981' : '#9046ff' }}></div>
                <span>
                  {emailSent ? '✅ Confirmation email sent to your inbox' : 'You\'ll receive a confirmation email shortly'}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9046ff' }}></div>
                <span>We'll keep you updated on our progress</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9046ff' }}></div>
                <span>You'll get early access when Vela launches</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9046ff' }}></div>
                <span>Exclusive tips and productivity insights</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
            <p>We're working hard to bring you the best productivity experience.</p>
            <p className="font-semibold text-gray-700 mt-2">Expected launch: Q1 2025</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" className="py-20" style={{ backgroundColor: '#f8f6ff' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#e8e0ff' }}>
            <Clock className="w-8 h-8" style={{ color: '#9046ff' }} />
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Join the Waitlist
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Thank you for your interest! We'll notify you when Vela launches.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                style={{ 
                  fontFamily: 'Manrope, sans-serif',
                  '--tw-ring-color': '#9046ff'
                } as React.CSSProperties}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Joining...
                </div>
              ) : (
                'Join the Waitlist'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
