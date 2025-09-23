'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    company: 'Tech Startup',
    avatar: 'SC',
    rating: 5,
    text: 'Vela has completely changed how I approach my workday. Instead of getting distracted when I open new tabs, I\'m immediately reminded of my goals and can start a focus session. My productivity has increased by at least 40%.'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Software Engineer',
    company: 'Fortune 500',
    avatar: 'MR',
    rating: 5,
    text: 'The Spotify integration is genius! I can control my focus playlist without switching tabs. The circular timer is beautiful and the streak feature keeps me motivated. Best productivity extension I\'ve ever used.'
  },
  {
    name: 'Emily Watson',
    role: 'Marketing Manager',
    company: 'Agency',
    avatar: 'EW',
    rating: 5,
    text: 'I love how clean and minimal Vela is. It doesn\'t overwhelm me with features I don\'t need. The task management is perfect for daily planning, and seeing my streak grow is incredibly motivating.'
  },
  {
    name: 'David Kim',
    role: 'Freelance Writer',
    company: 'Independent',
    avatar: 'DK',
    rating: 5,
    text: 'As someone who works from home, staying focused is crucial. Vela turns every new tab into a productivity reminder. The statistics help me understand my work patterns and optimize my schedule.'
  },
  {
    name: 'Lisa Thompson',
    role: 'UX Researcher',
    company: 'Design Studio',
    avatar: 'LT',
    rating: 5,
    text: 'The attention to detail in Vela is impressive. The animations are smooth, the design is gorgeous, and it actually helps me stay focused. I\'ve recommended it to my entire team.'
  },
  {
    name: 'Alex Johnson',
    role: 'Student',
    company: 'University',
    avatar: 'AJ',
    rating: 5,
    text: 'Perfect for studying! The Pomodoro timer helps me break down long study sessions, and tracking my progress keeps me motivated. The dark mode is easy on the eyes during late-night study sessions.'
  }
]

const trustBadges = [
  { name: 'Chrome Web Store', rating: '4.9/5', users: '1000+' },
  { name: 'Product Hunt', rating: '#1 Product', users: '500+ upvotes' },
  { name: 'User Reviews', rating: '4.8/5', users: '200+ reviews' }
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Loved by Productive People
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Join thousands of professionals who have transformed their productivity with Vela.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-blue-200 mb-4" />
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#f8f6ff' }}>
                  <span className="font-semibold text-sm" style={{ color: '#9046ff', fontFamily: 'Manrope, sans-serif' }}>
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Trusted Across Platforms
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Consistently rated as one of the best productivity extensions by users worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f8f6ff' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9046ff' }}>
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {badge.rating}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {badge.name}
                </div>
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {badge.users}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}