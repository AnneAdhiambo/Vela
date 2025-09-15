import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              Vela is designed with privacy in mind. We collect minimal information necessary to provide our service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Usage statistics (anonymized session data, feature usage)</li>
              <li>Error reports to improve the extension</li>
              <li>Email address (only if you subscribe to our newsletter)</li>
              <li>Spotify account information (only if you connect Spotify)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To provide and improve the Vela extension</li>
              <li>To send you updates and productivity tips (if subscribed)</li>
              <li>To analyze usage patterns and fix bugs</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
            <p className="text-gray-700 mb-4">
              Your data is stored locally in your browser using Chrome's storage APIs. We use industry-standard 
              security measures to protect any data that is transmitted to our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              Vela integrates with Spotify's API to provide music controls. We do not store your Spotify 
              credentials - authentication is handled directly by Spotify.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@vela-app.com" className="text-blue-600 hover:text-blue-700">
                privacy@vela-app.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}