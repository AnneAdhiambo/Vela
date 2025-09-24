import { Checkout } from "@polar-sh/nextjs"

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.POLAR_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?checkout_id={CHECKOUT_ID}`,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  theme: 'light', // Optional: 'light', 'dark', or omit for system preference
})

// This route now accepts query params like:
// /checkout?products=57869ccd-41d2-46fd-9a32-331943b1eb7a&customerEmail=user@example.com
