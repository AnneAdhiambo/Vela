import React, { useState } from 'react';
import { spotifyService } from '../services/spotify';

interface SpotifyManualAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function SpotifyManualAuth({ onSuccess, onCancel }: SpotifyManualAuthProps) {
  const [tokenData, setTokenData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const tokens = JSON.parse(tokenData);
      
      // Validate token structure
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Invalid token format. Please ensure you have both access_token and refresh_token.');
      }

      // Save tokens using the service method
      spotifyService.setTokens(tokens.access_token, tokens.refresh_token);
      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid token data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Manual Spotify Authentication</h3>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong>
          </p>
          <ol className="text-sm text-blue-800 mt-2 list-decimal list-inside space-y-1">
            <li>Go to <a href="http://127.0.0.1:3001" target="_blank" className="underline">http://127.0.0.1:3001</a></li>
            <li>Click "Connect to Spotify"</li>
            <li>Authorize the app</li>
            <li>Copy the token data from the page</li>
            <li>Paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token Data (JSON):
            </label>
            <textarea
              value={tokenData}
              onChange={(e) => setTokenData(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"access_token": "...", "refresh_token": "...", ...}'
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !tokenData.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
