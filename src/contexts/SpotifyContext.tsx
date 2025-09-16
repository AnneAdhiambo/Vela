import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { spotifyService, SpotifyPlaylist } from '../services/spotify'

interface SpotifyContextType {
  isConnected: boolean
  isLoading: boolean
  playlists: SpotifyPlaylist[]
  selectedPlaylist: SpotifyPlaylist | null
  isPlaying: boolean
  connect: () => void
  disconnect: () => void
  selectPlaylist: (playlist: SpotifyPlaylist | null) => void
  playSelectedPlaylist: () => Promise<boolean>
  pausePlayback: () => Promise<boolean>
  resumePlayback: () => Promise<boolean>
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined)

interface SpotifyProviderProps {
  children: ReactNode
}

export function SpotifyProvider({ children }: SpotifyProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Check authentication status on mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🎵 Checking Spotify authentication status...')
      
      // First check if we have tokens locally
      if (spotifyService.hasTokens() && !isConnected) {
        setIsConnected(true)
        await loadPlaylists()
        console.log('🎵 Spotify connected from local tokens')
        return
      }
      
      // Then check with background script
      const isAuth = await spotifyService.isAuthenticated()
      console.log('🎵 Spotify authentication result:', isAuth)
      if (isAuth && !isConnected) {
        setIsConnected(true)
        await loadPlaylists()
        console.log('🎵 Spotify connected and playlists loaded')
      } else if (!isAuth && isConnected) {
        setIsConnected(false)
        setPlaylists([])
        setSelectedPlaylist(null)
        setIsPlaying(false)
        console.log('🎵 Spotify disconnected')
      }
    }
    
    // Check immediately on mount
    checkAuth()
    
    // Check every 30 seconds for authentication changes (reduced frequency)
    const interval = setInterval(checkAuth, 30000)
    
    return () => clearInterval(interval)
  }, []) // Remove isConnected dependency to prevent multiple intervals

  // Listen for Chrome runtime messages from background script
  useEffect(() => {
    const handleMessage = (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.type === 'SPOTIFY_AUTH_SUCCESS' && message.tokens) {
        setIsConnected(true)
        loadPlaylists()
        console.log('✅ Spotify connected via Chrome message!')
        sendResponse({ success: true })
        return true // Indicate that the message was handled
      }
      // Don't handle other message types
      return false
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage)
      
      return () => {
        chrome.runtime.onMessage.removeListener(handleMessage)
      }
    }
  }, [])


  const loadPlaylists = async () => {
    try {
      console.log('🎵 Loading user playlists...')
      const userPlaylists = await spotifyService.getUserPlaylists()
      console.log('🎵 Loaded playlists:', userPlaylists.length, userPlaylists)
      setPlaylists(userPlaylists)
    } catch (error) {
      console.error('Error loading playlists:', error)
    }
  }

  const connect = async () => {
    setIsLoading(true)
    try {
      const success = await spotifyService.connect()
      if (success) {
        setIsConnected(true)
        await loadPlaylists()
        console.log('✅ Spotify connected successfully!')
      } else {
        console.error('Failed to connect to Spotify')
      }
    } catch (error) {
      console.error('Error connecting to Spotify:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    await spotifyService.disconnect()
    setIsConnected(false)
    setPlaylists([])
    setSelectedPlaylist(null)
    setIsPlaying(false)
  }

  const selectPlaylist = async (playlist: SpotifyPlaylist | null) => {
    setSelectedPlaylist(playlist)
    console.log('Selected playlist:', playlist?.name)
    
    // If a session is active, immediately start playing the playlist
    if (playlist) {
      try {
        // Check if there's an active session by checking Chrome storage
        const result = await chrome.storage.local.get(['currentSession', 'timerState'])
        const currentSession = result.currentSession
        const timerState = result.timerState
        
        const isSessionActive = currentSession?.isActive || timerState?.isActive
        
        if (isSessionActive) {
          console.log('🎵 Session is active, starting playlist immediately:', playlist.name)
          await spotifyService.playPlaylist(playlist.id)
          setIsPlaying(true)
        } else {
          console.log('🎵 No active session, playlist will play when session starts')
        }
      } catch (error) {
        console.error('Error checking session state or starting playback:', error)
      }
    }
  }

  const playSelectedPlaylist = async (): Promise<boolean> => {
    if (!selectedPlaylist) {
      console.warn('No playlist selected for playback')
      return false
    }
    
    try {
      console.log(`🎵 Attempting to play playlist: ${selectedPlaylist.name}`)
      const success = await spotifyService.playPlaylist(selectedPlaylist.id)
      if (success) {
        setIsPlaying(true)
        console.log(`✅ Successfully started playing: ${selectedPlaylist.name}`)
      } else {
        console.warn(`⚠️ Failed to start playlist: ${selectedPlaylist.name}`)
      }
      return success
    } catch (error) {
      console.error('❌ Error playing playlist:', error)
      setIsPlaying(false)
      // Re-throw the error so the UI can display it
      throw error
    }
  }

  const pausePlayback = async (): Promise<boolean> => {
    try {
      const success = await spotifyService.pausePlayback()
      if (success) {
        setIsPlaying(false)
      }
      return success
    } catch (error) {
      console.error('Error pausing playback:', error)
      return false
    }
  }

  const resumePlayback = async (): Promise<boolean> => {
    try {
      const success = await spotifyService.resumePlayback()
      if (success) {
        setIsPlaying(true)
      }
      return success
    } catch (error) {
      console.error('Error resuming playback:', error)
      return false
    }
  }

  const value: SpotifyContextType = {
    isConnected,
    isLoading,
    playlists,
    selectedPlaylist,
    isPlaying,
    connect,
    disconnect,
    selectPlaylist,
    playSelectedPlaylist,
    pausePlayback,
    resumePlayback
  }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  )
}

export function useSpotify() {
  const context = useContext(SpotifyContext)
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider')
  }
  return context
}