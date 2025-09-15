'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    plausible?: (...args: any[]) => void
  }
}

export default function Analytics() {
  useEffect(() => {
    // Google Analytics 4 (uncomment when ready)
    /*
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (GA_MEASUREMENT_ID) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      window.gtag = function() {
        // @ts-ignore
        dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID)
    }
    */

    // Plausible Analytics (uncomment when ready)
    /*
    const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
    if (PLAUSIBLE_DOMAIN) {
      const script = document.createElement('script')
      script.src = 'https://plausible.io/js/script.js'
      script.setAttribute('data-domain', PLAUSIBLE_DOMAIN)
      script.defer = true
      document.head.appendChild(script)
    }
    */
  }, [])

  return null
}

// Utility functions for tracking events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }

  // Plausible
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: properties })
  }
}

export const trackPageView = (url: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }

  // Plausible automatically tracks page views
}