import { useState } from 'react'
import { config, devUtils } from '../config/development'
import { useAuth } from '../contexts/AuthContext'

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  if (!config.features.showDebugInfo) {
    return null
  }

  return (
    <>
      {/* Dev Panel Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg z-50 transition-colors"
        title="Development Panel"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div className="fixed bottom-16 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🔧 Dev Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* Authentication Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authentication</h4>
              <div className="space-y-2">
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                >
                  Force Logout
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Management</h4>
              <div className="space-y-2">
                <button
                  onClick={devUtils.clearAllData}
                  className="w-full px-3 py-2 text-sm bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded border border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                >
                  Clear All Data
                </button>
                <button
                  onClick={devUtils.populateTestData}
                  className="w-full px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  Populate Test Data
                </button>
                <button
                  onClick={devUtils.showStorageState}
                  className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Log Storage State
                </button>
              </div>
            </div>

            {/* EmailJS Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">EmailJS Status</h4>
              <button
                onClick={devUtils.showEmailJSStatus}
                className="w-full px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
              >
                Check EmailJS Status
              </button>
            </div>

            {/* Configuration Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Configuration</h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>Mode: {devUtils.isProductionMode() ? 'Production' : 'Development'}</div>
                <div>EmailJS Auth: {config.auth.useEmailJS ? '✅' : '❌'}</div>
                <div>Debug Info: {config.features.showDebugInfo ? '✅' : '❌'}</div>
                <div>Test Data: {config.dev.prefillTestData ? '✅' : '❌'}</div>
                <div>Notifications: {config.features.enableNotifications ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}