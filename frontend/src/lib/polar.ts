// Polar API configuration using official SDK
import { Polar } from "@polar-sh/sdk"

export const POLAR_CONFIG = {
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  productId: process.env.POLAR_PRODUCT_ID || 'vela-premium',
  successUrl: process.env.POLAR_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?checkout_id={CHECKOUT_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#pricing`,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
}

// Initialize Polar API client
export const polar = new Polar({
  accessToken: POLAR_CONFIG.accessToken!,
  server: POLAR_CONFIG.server as 'production' | 'sandbox'
})

// Types for checkout sessions
export interface CheckoutSession {
  id: string
  url: string
  status: string
  amount: number
  currency: string
  product?: {
    id: string
    name: string
  }
  customer?: {
    email: string
    name?: string
  }
  createdAt: string
  metadata?: Record<string, any>
}

export interface CreateCheckoutRequest {
  productId: string
  successUrl: string
  cancelUrl?: string
  metadata?: Record<string, any>
  customerEmail?: string
}