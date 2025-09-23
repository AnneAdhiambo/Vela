import { NextRequest, NextResponse } from 'next/server'
import { polar } from '@/lib/polar'

export async function POST(request: NextRequest) {
  try {
    const { productId, successUrl, cancelUrl } = await request.json()

    if (!productId || !successUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create checkout session using official Polar SDK
    const checkout = await polar.checkouts.create({
      product_id: productId,
      success_url: successUrl,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/#pricing`,
      metadata: {
        source: 'vela-landing-page',
        timestamp: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    })
  } catch (error) {
    console.error('Polar checkout creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}