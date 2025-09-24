// Polar configuration for Next.js adapter
export const POLAR_CONFIG = {
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  productId: process.env.POLAR_PRODUCT_ID || 'vela-premium',
  successUrl: process.env.POLAR_SUCCESS_URL || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/success?checkout_id={CHECKOUT_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#pricing`,
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
}