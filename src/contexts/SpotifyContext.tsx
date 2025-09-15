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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (spotifyService.isAuthenticated()) {
        setIsConnected(true)
        await loadPlaylists()
      }
    }
    
    checkAuth()
  }, [])

  // Handle OAuth callback - only for authenticated users
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      const magicToken = urlParams.get('token') // Check for magic link token
      
      // Don't handle Spotify OAuth if there's a magic link token (auth takes priority)
      if (magicToken) {
        console.log('Magic link token found, skipping Spotify OAuth handling')
        return
      }
      
      if (error) {
        console.error('Spotify OAuth error:', error)
        // Clear error from URL and redirect to dashboard
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
      
      if (code) {
        console.log('Received Spotify auth code, exchanging for token...')
        setIsLoading(true)
        try {
          const success = await spotifyService.exchangeCodeForToken(code)
          if (success) {
            console.log('Successfully connected to Spotify!')
            setIsConnected(true)
            await loadPlaylists()
            
            // Clear the code from URL and ensure we stay on dashboard
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Show success message
            console.log('🎵 Spotify connected successfully! You can now select playlists for your focus sessions.')
            
            // Force a small delay to ensure the URL is clean before any redirects
            setTimeout(() => {
              console.log('🏠 Redirected back to dashboard after Spotify connection')
            }, 100)
          } else {
            console.error('Failed to exchange code for token')
          }
        } catch (error) {
          console.error('Error during token exchange:', error)
        }
        setIsLoading(false)
      }
    }

    // Add a small delay to let AuthContext handle magic links first
    const timeoutId = setTimeout(handleCallback, 100)
    return () => clearTimeout(timeoutId)
  }, [])

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await spotifyService.getUserPlaylists()
      setPlaylists(userPlaylists)
    } catch (error) {
      console.error('Error loading playlists:', error)
    }
  }

  const connect = () => {
    const authUrl = spotifyService.getAuthUrl()
    window.location.href = authUrl
  }

  const disconnect = () => {
    spotifyService.disconnect()
    setIsConnected(false)
    setPlaylists([])
    setSelectedPlaylist(null)
    setIsPlaying(false)
  }

  const selectPlaylist = (playlist: SpotifyPlaylist | null) => {
    setSelectedPlaylist(playlist)
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