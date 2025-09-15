import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import { SpotifyProvider } from './contexts/SpotifyContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <SpotifyProvider>
            <App />
          </SpotifyProvider>
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)