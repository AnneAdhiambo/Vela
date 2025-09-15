import { useState, useEffect } from 'react'
import { useSpotify } from '../contexts/SpotifyContext'
import { spotifyService, SpotifyAlbum } from '../services/spotify'

export function SpotifyWidget() {
  const { 
    isConnected, 
    isLoading, 
    playlists, 
    selectedPlaylist, 
    connect, 
    disconnect,
    selectPlaylist
  } = useSpotify()
  
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([])
  const [newReleases, setNewReleases] = useState<SpotifyAlbum[]>([])
  const [showMenu, setShowMenu] = useState(false)

  // Load Spotify content when connected
  useEffect(() => {
    if (isConnected) {
      loadSpotifyContent()
    }
  }, [isConnected])

  const loadSpotifyContent = async () => {
    try {
      const [featured, releases] = await Promise.all([
        spotifyService.getFeaturedPlaylists(),
        spotifyService.getNewReleases()
      ])
      
      setFeaturedPlaylists(featured)
      setNewReleases(releases)
    } catch (error) {
      console.error('Error loading Spotify content:', error)
    }
  }

  const handleItemClick = (item: any, type: 'playlist' | 'album' | 'track') => {
    if (type === 'playlist') {
      selectPlaylist(item)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">Connecting to Spotify...</span>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-black dark:bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Spotify</h3>
        </div>

        {/* Connect message */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Connect your Spotify account to play focus music during your sessions
          </p>
          <button 
            onClick={connect}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Connect to Spotify
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black dark:bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Spotify</h3>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[150px]">
              <button
                onClick={() => {
                  disconnect()
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Disconnect Spotify
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Good morning section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Good morning</h4>
            <button className="text-sm text-gray-500 hover:text-gray-700">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {playlists.slice(0, 3).map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleItemClick(playlist, 'playlist')}
                className={`group relative rounded-lg overflow-hidden transition-all ${
                  selectedPlaylist?.id === playlist.id 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:shadow-md'
                }`}
              >
                <div className="aspect-square">
                  {playlist.images[0] ? (
                    <img 
                      src={playlist.images[0].url} 
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">{playlist.name}</p>
                  <p className="text-white/80 text-xs truncate">
                    {playlist.description || `${playlist.tracks.total} tracks`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New releases section */}
        {newReleases.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">New releases for you</h4>
              <button className="text-sm text-gray-500 hover:text-gray-700">See all</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {newReleases.slice(0, 3).map((album) => (
                <button
                  key={album.id}
                  className="group text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="aspect-square mb-2 rounded-lg overflow-hidden">
                    {album.images[0] ? (
                      <img 
                        src={album.images[0].url} 
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate">{album.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {album.artists.map(a => a.name).join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured playlists section */}
        {featuredPlaylists.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Recommended Stations</h4>
              <button className="text-sm text-gray-500 hover:text-gray-700">See all</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featuredPlaylists.slice(0, 3).map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleItemClick(playlist, 'playlist')}
                  className={`group text-left hover:bg-gray-50 rounded-lg p-2 transition-colors ${
                    selectedPlaylist?.id === playlist.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="aspect-square mb-2 rounded-lg overflow-hidden relative">
                    {playlist.images[0] ? (
                      <img 
                        src={playlist.images[0].url} 
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-medium">
                      RADIO
                    </div>
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate">{playlist.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {playlist.description || 'Spotify Radio'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected playlist indicator */}
      {selectedPlaylist && (
        <div className="p-4 bg-green-50 border-t border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Selected: {selectedPlaylist.name}</p>
              <p className="text-xs text-gray-600">Will play when session starts</p>
            </div>
            <button 
              onClick={() => selectPlaylist(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export a function to start playlist from outside the component
export const startSpotifyPlaylist = async (playlistId: string) => {
  try {
    return await spotifyService.playPlaylist(playlistId)
  } catch (error) {
    console.error('Error starting playlist playback:', error)
    return false
  }
}