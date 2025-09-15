import React, { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { chromeApi } from '../utils/chrome-api'

interface NotificationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { state, updatePreferences } = useApp()
  const [isTestingNotification, setIsTestingNotification] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Reset test result when modal opens
  useEffect(() => {
    if (isOpen) {
      setTestResult(null)
    }
  }, [isOpen])

  const handleNotificationsToggle = async (enabled: boolean) => {
    await updatePreferences({ notificationsEnabled: enabled })
    
    // Send message to background script to update notification service
    chromeApi.runtime.sendMessage({
      type: 'UPDATE_NOTIFICATION_PREFERENCES',
      preferences: { enabled }
    })
  }

  const handleSoundToggle = async (enabled: boolean) => {
    await updatePreferences({ soundEnabled: enabled })
    
    // Send message to background script to update notification service
    chromeApi.runtime.sendMessage({
      type: 'UPDATE_NOTIFICATION_PREFERENCES',
      preferences: { soundEnabled: enabled }
    })
  }

  const handleTestNotification = async () => {
    setIsTestingNotification(true)
    setTestResult(null)
    
    try {
      const response = await chromeApi.runtime.sendMessage({
        type: 'TEST_NOTIFICATION'
      })
      
      if (response) {
        setTestResult('Test notification sent successfully!')
      } else {
        setTestResult('Failed to send test notification. Please check your settings.')
      }
    } catch (error) {
      console.error('Error testing notification:', error)
      setTestResult('Error testing notification. Please try again.')
    } finally {
      setIsTestingNotification(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close notification settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Notifications
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Show notifications when focus sessions complete
              </p>
            </div>
            <button
              onClick={() => handleNotificationsToggle(!state.preferences.notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                state.preferences.notificationsEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={state.preferences.notificationsEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.preferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Sound */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Sound
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Play sound with notifications
              </p>
            </div>
            <button
              onClick={() => handleSoundToggle(!state.preferences.soundEnabled)}
              disabled={!state.preferences.notificationsEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                state.preferences.soundEnabled && state.preferences.notificationsEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              } ${
                !state.preferences.notificationsEnabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              role="switch"
              aria-checked={state.preferences.soundEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  state.preferences.soundEnabled && state.preferences.notificationsEnabled
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Test Notification */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Test Notifications
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Send a test notification to verify settings
                </p>
              </div>
              <button
                onClick={handleTestNotification}
                disabled={!state.preferences.notificationsEnabled || isTestingNotification}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  state.preferences.notificationsEnabled && !isTestingNotification
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isTestingNotification ? 'Sending...' : 'Test'}
              </button>
            </div>
            
            {testResult && (
              <div className={`text-xs p-2 rounded-md ${
                testResult.includes('successfully')
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Notification Types Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Notification Types
            </h3>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Session completion alerts</li>
              <li>• Break reminders</li>
              <li>• Streak achievements</li>
              <li>• Task reminders</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}