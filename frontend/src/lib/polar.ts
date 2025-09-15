// Polar API configuration and utilities
export const POLAR_CONFIG = {
  apiUrl: 'https://api.polar.sh/v1',
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  productId: 'vela-premium', // This would be your actual product ID from Polar
  successUrl: process.env.POLAR_SUCCESS_URL!,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#pricing`,
}

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

// Polar API client implementation
export class PolarAPI {
  private accessToken: string
  private baseUrl: string

  constructor(config: { accessToken: string; server?: 'production' | 'sandbox' }) {
    this.accessToken = config.accessToken
    this.baseUrl = config.server === 'sandbox' 
      ? 'https://sandbox-api.polar.sh/v1' 
      : 'https://api.polar.sh/v1'
  }

  async createCheckout(data: CreateCheckoutRequest): Promise<CheckoutSession> {
    // In development, return a mock checkout session
    if (process.env.NODE_ENV === 'development' && !this.accessToken.startsWith('polar_')) {
      return {
        id: `checkout_dev_${Date.now()}`,
        url: `https://checkout.polar.sh/dev/${Date.now()}`,
        status: 'pending',
        amount: 499, // $4.99 in cents
        currency: 'usd',
        product: {
          id: data.productId,
          name: 'Vela Premium'
        },
        createdAt: new Date().toISOString(),
        metadata: data.metadata
      }
    }

    const response = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Polar API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCheckout(id: string): Promise<CheckoutSession> {
    // In development, return a mock checkout session
    if (process.env.NODE_ENV === 'development' && !this.accessToken.startsWith('polar_')) {
      return {
        id: id,
        url: `https://checkout.polar.sh/dev/${id}`,
        status: 'completed',
        amount: 499, // $4.99 in cents
        currency: 'usd',
        product: {
          id: 'vela-premium',
          name: 'Vela Premium'
        },
        customer: {
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        metadata: {
          source: 'vela-landing-page'
        }
      }
    }

    const response = await fetch(`${this.baseUrl}/checkouts/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Polar API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
}

export const polar = new PolarAPI({
  accessToken: POLAR_CONFIG.accessToken,
  server: 'production', // or 'sandbox' for testing
})