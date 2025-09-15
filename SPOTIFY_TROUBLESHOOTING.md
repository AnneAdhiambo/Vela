# Spotify Playback Troubleshooting

## Common Issues and Solutions

### 🎵 "No active device found" Error

**Problem**: Spotify can't find a device to play music on.

**Solutions**:
1. **Open Spotify App**: Make sure Spotify is open on at least one device (phone, computer, etc.)
2. **Start Playing Something**: Play any song in the Spotify app first, then try the web player
3. **Check Spotify Connect**: Look for available devices in Spotify → Connect to a device
4. **Use Spotify Web Player**: Go to https://open.spotify.com and start playing music there

### 🔒 "Premium Required" Error

**Problem**: Some Spotify Web API features require Spotify Premium.

**Solutions**:
- Upgrade to Spotify Premium for full playback control
- Or use the widget to control music that's already playing in Spotify

### 🌐 CORS or Network Errors

**Problem**: Browser blocks requests to Spotify API.

**Solutions**:
1. Make sure you're running on `http://127.0.0.1:3000` (not localhost)
2. Check that your Spotify app redirect URI matches exactly
3. Try refreshing the page and reconnecting

### 🎧 Playback Not Starting

**Troubleshooting Steps**:

1. **Check Device Status**:
   - Open Spotify on your phone/computer
   - Play any song to activate the device
   - Try the web player again

2. **Verify Permissions**:
   - Make sure you granted all permissions during Spotify login
   - Try disconnecting and reconnecting

3. **Test with Spotify Web Player**:
   - Go to https://open.spotify.com
   - If it works there, the issue is with our integration
   - If it doesn't work, it's a Spotify/device issue

4. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab
   - Share any error messages for debugging

### ✅ Best Practices

1. **Always have Spotify open** on at least one device
2. **Start with Spotify Web Player** (https://open.spotify.com) to ensure your account works
3. **Use the same account** for both Spotify app and our integration
4. **Check your internet connection** - streaming requires good connectivity

### 🔧 Quick Test

1. Open https://open.spotify.com in another tab
2. Log in and play any song
3. Come back to our app and try selecting a playlist
4. The music should start playing through the same device

If you're still having issues, the problem is likely with Spotify device detection or Premium requirements.