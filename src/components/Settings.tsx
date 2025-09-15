import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { UserPreferences } from '../types'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const accentColors = [
  { name: 'Blue', value: 'blue', color: 'bg-blue-500', ring: 'ring-blue-500' },
  { name: 'Green', value: 'green', color: 'bg-green-500', ring: 'ring-green-500' },
  { name: 'Purple', value: 'purple', color: 'bg-purple-500', ring: 'ring-purple-500' },
  { name: 'Pink', value: 'pink', color: 'bg-pink-500', ring: 'ring-pink-500' },
  { name: 'Orange', value: 'orange', color: 'bg-orange-500', ring: 'ring-orange-500' },
  { name: 'Red', value: 'red', color: 'bg-red-500', ring: 'ring-red-500' },
] as const

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { state, updatePreferences } = useApp()
  const { theme, accentColor, setTheme, setAccentColor } = useTheme()
  const { logout } = useAuth()
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(state.preferences)

  // Update local preferences when state changes
  useState(() => {
    setLocalPreferences(state.preferences)
  })

  if (!isOpen) return null

  const handleSave = async () => {
    await updatePreferences(localPreferences)
    onClose()
  }

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const newPreferences = {
      ...localPreferences,
      [key]: value
    }
    setLocalPreferences(newPreferences)
    
    // Apply changes immediately for better UX
    if (key === 'theme') {
      setTheme(value)
    } else if (key === 'accentColor') {
      setAccentColor(value)
    }
    
    // Update preferences immediately (don't wait for save)
    updatePreferences(newPreferences)
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => {
                    setTheme(themeOption)
                    handlePreferenceChange('theme', themeOption)
                  }}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    localPreferences.theme === themeOption
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {themeOption}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Accent Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {accentColors.map((accent) => (
                <button
                  key={accent.value}
                  onClick={() => handlePreferenceChange('accentColor', accent.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    localPreferences.accentColor === accent.value
                      ? `border-${accent.value}-500 bg-${accent.value}-50 dark:bg-${accent.value}-900/20`
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${accent.color}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {accent.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Session Length
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={localPreferences.defaultSessionLength}
                onChange={(e) => handlePreferenceChange('defaultSessionLength', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[60px]">
                {localPreferences.defaultSessionLength} min
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Default Break Length
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={localPreferences.defaultBreakLength}
                onChange={(e) => handlePreferenceChange('defaultBreakLength', parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[50px]">
                {localPreferences.defaultBreakLength} min
              </span>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Enable notifications</span>
              <button
                onClick={() => handlePreferenceChange('notificationsEnabled', !localPreferences.notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localPreferences.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPreferences.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sound notifications</span>
              <button
                onClick={() => handlePreferenceChange('soundEnabled', !localPreferences.soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localPreferences.soundEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPreferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Skip breaks automatically</span>
              <button
                onClick={() => handlePreferenceChange('skipBreaks', !localPreferences.skipBreaks)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localPreferences.skipBreaks ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPreferences.skipBreaks ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Motivational quotes</span>
              <button
                onClick={() => handlePreferenceChange('motivationalQuotes', !localPreferences.motivationalQuotes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localPreferences.motivationalQuotes ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localPreferences.motivationalQuotes ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Account</h3>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}