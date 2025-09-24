import { CustomerPortal } from "@polar-sh/nextjs"
import { NextRequest } from "next/server"

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  getCustomerId: async (req: NextRequest) => {
    // You can get the customer ID from:
    // - URL query params: ?customerId=xxx
    // - Session/cookies
    // - JWT token
    // - Database lookup based on user authentication
    
    const url = new URL(req.url)
    const customerId = url.searchParams.get('customerId')
    
    if (!customerId) {
      throw new Error('Customer ID is required')
    }
    
    return customerId
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})
