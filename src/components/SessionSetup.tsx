import { useState, useEffect } from 'react'
import { useSpotify } from '../contexts/SpotifyContext'
import { useApp } from '../contexts/AppContext'

interface SessionSetupProps {
  onStartSession: (duration: number, skipBreaks: boolean) => void
  onDurationChange?: (duration: number) => void
  initialDuration?: number
}

export function SessionSetup({ onStartSession, onDurationChange, initialDuration }: SessionSetupProps) {
  const { state } = useApp()
  const { isConnected, selectedPlaylist } = useSpotify()
  
  // Use user preferences as defaults
  const [duration, setDuration] = useState(initialDuration || state.preferences.defaultSessionLength)
  const [skipBreaks, setSkipBreaks] = useState(state.preferences.skipBreaks)

  // Update duration when preferences change
  useEffect(() => {
    if (!initialDuration) {
      setDuration(state.preferences.defaultSessionLength)
    }
    setSkipBreaks(state.preferences.skipBreaks)
  }, [state.preferences.defaultSessionLength, state.preferences.skipBreaks, initialDuration])

  const handleDurationChange = (change: number) => {
    const newDuration = Math.max(5, Math.min(120, duration + change))
    setDuration(newDuration)
    onDurationChange?.(newDuration)
  }

  const handleStartSession = () => {
    onStartSession(duration, skipBreaks)
  }

  return (
    <div className="text-center w-full">


      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Get ready to focus</h2>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        We'll turn off notifications and app alerts during each session. For longer sessions, we'll add a short break so you can recharge.
      </p>

      {/* Duration selector */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button 
            onClick={() => handleDurationChange(-5)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
        
        <div className="text-6xl font-light text-gray-800 dark:text-gray-200 mb-2">{duration}</div>
        <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">mins</div>
        <div className="w-32 h-px bg-gray-300 dark:bg-gray-600 mx-auto mb-4"></div>
        
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => handleDurationChange(5)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Break info */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {skipBreaks ? "You'll have no breaks" : `You'll get a ${state.preferences.defaultBreakLength}-minute break after ${duration} minutes`}
        </p>
        
        {/* Skip breaks checkbox - only show if not forced by preferences */}
        {!state.preferences.skipBreaks && (
          <label className="flex items-center justify-center space-x-3 text-gray-600 dark:text-gray-400 cursor-pointer">
            <div className="custom-checkbox">
              <input
                type="checkbox"
                checked={skipBreaks}
                onChange={(e) => setSkipBreaks(e.target.checked)}
              />
              <span className="checkmark"></span>
            </div>
            <span>Skip breaks</span>
          </label>
        )}
        
        {state.preferences.skipBreaks && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Breaks are disabled in your settings
          </p>
        )}
      </div>

      {/* Spotify status */}
      {isConnected && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <span className="text-green-700 dark:text-green-400 font-medium">
              {selectedPlaylist 
                ? `🎵 ${selectedPlaylist.name} ready to play` 
                : '🎵 Spotify connected - select a playlist'
              }
            </span>
          </div>
          {selectedPlaylist && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 text-center">
              💡 Make sure Spotify is open on a device for music to play
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStartSession}
        className="w-full btn-accent py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <span>Start focus session</span>
      </button>
    </div>
  )
}