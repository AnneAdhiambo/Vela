import { Webhooks } from "@polar-sh/nextjs"

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log('Polar webhook received:', payload.type)
    
    // Handle different webhook events
    switch (payload.type) {
      case 'checkout.completed':
        console.log('Checkout completed:', payload.data)
        // Handle successful payment
        // You can update your database, send confirmation emails, etc.
        break
        
      case 'checkout.failed':
        console.log('Checkout failed:', payload.data)
        // Handle failed payment
        break
        
      case 'subscription.created':
        console.log('Subscription created:', payload.data)
        // Handle new subscription
        break
        
      case 'subscription.updated':
        console.log('Subscription updated:', payload.data)
        // Handle subscription changes
        break
        
      case 'subscription.cancelled':
        console.log('Subscription cancelled:', payload.data)
        // Handle subscription cancellation
        break
        
      default:
        console.log('Unhandled webhook event:', payload.type)
    }
  },
})
