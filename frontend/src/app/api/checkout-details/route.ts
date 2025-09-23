import { NextRequest, NextResponse } from 'next/server'
import { polar } from '@/lib/polar'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkoutId = searchParams.get('checkout_id')

    if (!checkoutId) {
      return NextResponse.json(
        { error: 'Checkout ID is required' },
        { status: 400 }
      )
    }

    // Fetch checkout details using official Polar SDK
    const checkout = await polar.checkouts.get(checkoutId)

    if (!checkout) {
      return NextResponse.json(
        { error: 'Checkout not found' },
        { status: 404 }
      )
    }

    // Return relevant checkout information
    return NextResponse.json({
      id: checkout.id,
      status: checkout.status,
      productName: checkout.product?.name || 'Vela Premium',
      amount: checkout.amount,
      currency: checkout.currency,
      customerEmail: checkout.customer?.email,
      createdAt: checkout.created_at,
    })
  } catch (error) {
    console.error('Error fetching checkout details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout details' },
      { status: 500 }
    )
  }
}