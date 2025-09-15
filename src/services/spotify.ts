// Spotify Web API service
// NOTE: In a production app, the client secret should be handled by a backend server
// For development/demo purposes, we're including it here but this is not secure for production
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '3d034acf7d4345278203a3136a5fddf1'
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'cb1b313cd5484a9f9436ed57e4e68086'
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000'
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative'
].join(' ')

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{ url: string; height: number; width: number }>
  tracks: { total: number }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: { name: string; images: Array<{ url: string }> }
  duration_ms: number
  external_urls: { spotify: string }
}

export interface SpotifyPlaybackState {
  device: {
    id: string
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    type: string
    volume_percent: number
  }
  repeat_state: 'off' | 'track' | 'context'
  shuffle_state: boolean
  context: {
    type: string
    href: string
    external_urls: { spotify: string }
    uri: string
  } | null
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: SpotifyTrack | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
}

export interface SpotifyAlbum {
  id: string
  name: string
  artists: Array<{ name: string }>
  images: Array<{ url: string; height: number; width: number }>
  release_date: string
}

export interface SpotifyShow {
  id: string
  name: string
  description: string
  images: Array<{ url: string; height: number; width: number }>
  publisher: string
}

class SpotifyService {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
  }

  // Generate Spotify authorization URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      show_dialog: 'true'
    })
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      console.log('Exchanging code for token with:', {
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code.substring(0, 10) + '...' // Log partial code for debugging
      })

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Spotify token exchange failed:', data)
        throw new Error(`Failed to exchange code for token: ${data.error_description || data.error}`)
      }

      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      // Store tokens
      localStorage.setItem('spotify_access_token', this.accessToken!)
      if (this.refreshToken) {
        localStorage.setItem('spotify_refresh_token', this.refreshToken!)
      }

      console.log('Successfully obtained Spotify tokens')
      return true
    } catch (error) {
      console.error('Error exchanging code for token:', error)
      return false
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      if (await this.refreshAccessToken()) {
        // Retry the request with new token
        return this.apiRequest(endpoint, options)
      } else {
        throw new Error('Authentication failed')
      }
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`)
    }

    return response.json()
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      this.accessToken = data.access_token
      localStorage.setItem('spotify_access_token', this.accessToken!)

      return true
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }

  // Get user's playlists
  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    try {
      const data = await this.apiRequest('/me/playlists?limit=20')
      return data.items || []
    } catch (error) {
      console.error('Error fetching playlists:', error)
      return []
    }
  }

  // Get new releases
  async getNewReleases(): Promise<SpotifyAlbum[]> {
    try {
      const data = await this.apiRequest('/browse/new-releases?limit=6')
      return data.albums?.items || []
    } catch (error) {
      console.error('Error fetching new releases:', error)
      return []
    }
  }

  // Get featured playlists
  async getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
    try {
      const data = await this.apiRequest('/browse/featured-playlists?limit=6')
      return data.playlists?.items || []
    } catch (error) {
      console.error('Error fetching featured playlists:', error)
      return []
    }
  }

  // Get user's top tracks (for recommendations)
  async getUserTopTracks(): Promise<SpotifyTrack[]> {
    try {
      const data = await this.apiRequest('/me/top/tracks?limit=6&time_range=medium_term')
      return data.items || []
    } catch (error) {
      console.error('Error fetching top tracks:', error)
      return []
    }
  }

  // Get available devices
  async getDevices(): Promise<any[]> {
    try {
      const data = await this.apiRequest('/me/player/devices')
      return data.devices || []
    } catch (error) {
      console.error('Error fetching devices:', error)
      return []
    }
  }

  // Start playback of a playlist
  async playPlaylist(playlistId: string, deviceId?: string): Promise<boolean> {
    try {
      console.log(`🎵 Attempting to play playlist: ${playlistId}`)
      
      // First, check if we have any available devices
      const devices = await this.getDevices()
      console.log('Available devices:', devices)
      
      if (devices.length === 0) {
        throw new Error('No Spotify devices found. Please open Spotify on a device (phone, computer, etc.) first.')
      }

      // Find an active device or use the first available one
      let targetDeviceId = deviceId
      if (!targetDeviceId) {
        const activeDevice = devices.find(d => d.is_active)
        if (activeDevice) {
          targetDeviceId = activeDevice.id
          console.log(`Using active device: ${activeDevice.name}`)
        } else {
          // No active device, try to transfer playback to the first available device
          targetDeviceId = devices[0].id
          console.log(`No active device found, transferring to: ${devices[0].name}`)
          
          // Transfer playback to this device first
          await this.transferPlayback(targetDeviceId)
          // Wait a moment for the transfer to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      const body: any = {
        context_uri: `spotify:playlist:${playlistId}`,
      }

      let endpoint = '/me/player/play'
      if (targetDeviceId) {
        endpoint += `?device_id=${targetDeviceId}`
      }

      console.log(`Making play request to: ${endpoint}`)
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.status === 404) {
        throw new Error('No active device found. Please start Spotify on a device first.')
      }

      if (response.status === 403) {
        throw new Error('Spotify Premium is required to control playback.')
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Spotify API error:', response.status, errorData)
        throw new Error(`Spotify API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      console.log('✅ Successfully started playlist playback')
      return true
    } catch (error) {
      console.error('❌ Error starting playlist playback:', error)
      throw error
    }
  }

  // Transfer playback to a specific device
  async transferPlayback(deviceId: string): Promise<boolean> {
    try {
      console.log(`Transferring playback to device: ${deviceId}`)
      await this.apiRequest('/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        }),
      })
      return true
    } catch (error) {
      console.error('Error transferring playback:', error)
      return false
    }
  }

  // Pause playback
  async pausePlayback(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/pause', {
        method: 'PUT',
      })
      return true
    } catch (error) {
      console.error('Error pausing playback:', error)
      return false
    }
  }

  // Resume playback
  async resumePlayback(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/play', {
        method: 'PUT',
      })
      return true
    } catch (error) {
      console.error('Error resuming playback:', error)
      return false
    }
  }

  // Get current playback state
  async getCurrentPlayback(): Promise<any> {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })
      
      if (response.status === 204) {
        // No content means no active playback
        return null
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error getting current playback:', error)
      return null
    }
  }

  // Skip to next track
  async skipToNext(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/next', {
        method: 'POST',
      })
      return true
    } catch (error) {
      console.error('Error skipping to next track:', error)
      return false
    }
  }

  // Skip to previous track
  async skipToPrevious(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/previous', {
        method: 'POST',
      })
      return true
    } catch (error) {
      console.error('Error skipping to previous track:', error)
      return false
    }
  }

  // Set volume (0-100)
  async setVolume(volume: number): Promise<boolean> {
    try {
      await this.apiRequest(`/me/player/volume?volume_percent=${Math.max(0, Math.min(100, volume))}`, {
        method: 'PUT',
      })
      return true
    } catch (error) {
      console.error('Error setting volume:', error)
      return false
    }
  }

  // Seek to position in current track (milliseconds)
  async seekToPosition(positionMs: number): Promise<boolean> {
    try {
      await this.apiRequest(`/me/player/seek?position_ms=${positionMs}`, {
        method: 'PUT',
      })
      return true
    } catch (error) {
      console.error('Error seeking to position:', error)
      return false
    }
  }

  // Check if user has Spotify Premium (required for playback control)
  async checkPremiumStatus(): Promise<boolean> {
    try {
      const user = await this.apiRequest('/me')
      return user.product === 'premium'
    } catch (error) {
      console.error('Error checking premium status:', error)
      return false
    }
  }

  // Disconnect (clear tokens)
  disconnect(): void {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
  }
}

export const spotifyService = new SpotifyService()