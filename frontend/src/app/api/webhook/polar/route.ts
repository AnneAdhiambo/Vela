import { Webhooks } from "@polar-sh/nextjs"

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onCheckoutCreated: async (payload) => {
    console.log('Checkout created:', payload.data)
    // Handle checkout creation
  },
  onCheckoutUpdated: async (payload) => {
    console.log('Checkout updated:', payload.data)
    // Handle checkout updates
  },
  onOrderCreated: async (payload) => {
    console.log('Order created:', payload.data)
    // Handle new order creation
  },
  onOrderPaid: async (payload) => {
    console.log('Order paid:', payload.data)
    // Handle successful payment
    // You can update your database, send confirmation emails, etc.
  },
  onOrderRefunded: async (payload) => {
    console.log('Order refunded:', payload.data)
    // Handle order refunds
  },
  onSubscriptionCreated: async (payload) => {
    console.log('Subscription created:', payload.data)
    // Handle new subscription
  },
  onSubscriptionUpdated: async (payload) => {
    console.log('Subscription updated:', payload.data)
    // Handle subscription changes
  },
  onSubscriptionActive: async (payload) => {
    console.log('Subscription active:', payload.data)
    // Handle subscription becoming active
  },
  onSubscriptionCanceled: async (payload) => {
    console.log('Subscription cancelled:', payload.data)
    // Handle subscription cancellation
  },
  onSubscriptionRevoked: async (payload) => {
    console.log('Subscription revoked:', payload.data)
    // Handle subscription revocation
  },
  onSubscriptionUncanceled: async (payload) => {
    console.log('Subscription uncancelled:', payload.data)
    // Handle subscription cancellation reversal
  },
})
