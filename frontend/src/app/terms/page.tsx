import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By installing and using the Vela Chrome extension, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Vela is a Chrome extension that replaces your new tab page with a productivity dashboard 
              featuring a focus timer, task management, and progress tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the extension in compliance with all applicable laws</li>
              <li>Do not attempt to reverse engineer or modify the extension</li>
              <li>Report any bugs or security issues responsibly</li>
              <li>Respect the intellectual property rights of the extension</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Premium Features</h2>
            <p className="text-gray-700 mb-4">
              Some features require a premium subscription. Premium subscriptions are billed monthly 
              and can be cancelled at any time. Refunds are available within 30 days of purchase.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Vela is provided "as is" without warranties. We are not liable for any damages arising 
              from the use of the extension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@vela-app.com" className="text-blue-600 hover:text-blue-700">
                legal@vela-app.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}