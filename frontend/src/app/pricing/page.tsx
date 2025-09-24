import PricingCard from '@/components/PricingCard'
import PricingCardWithProductId from '@/components/PricingCardWithProductId'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock the full potential of Vela with our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Using Checkout Link (Simplest) */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Option 1: Checkout Link
            </h2>
            <PricingCard
              productId="checkout-link" // This is just for display
              productName="Vela Premium"
              price={9.99}
              currency="$"
              features={[
                'Unlimited sessions',
                'Advanced analytics',
                'Priority support',
                'Custom themes',
                'Export data',
                'API access'
              ]}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Uses direct checkout link from Polar dashboard
            </p>
          </div>

          {/* Option 2: Using Product ID with Next.js Adapter */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Option 2: Product ID
            </h2>
            <PricingCardWithProductId
              productId="57869ccd-41d2-46fd-9a32-331943b1eb7a" // Your actual Product ID
              productName="Vela Premium"
              price={9.99}
              currency="$"
              features={[
                'Unlimited sessions',
                'Advanced analytics',
                'Priority support',
                'Custom themes',
                'Export data',
                'API access'
              ]}
              customerEmail="user@example.com" // Optional: get from user session
              customerName="John Doe" // Optional: get from user session
              metadata={{
                source: 'pricing-page',
                campaign: 'premium-upgrade'
              }}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Uses Product ID with Next.js adapter for dynamic checkout
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing? Contact our support team.
          </p>
          <a
            href="/portal"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Manage existing subscription
          </a>
        </div>
      </div>
    </div>
  )
}
