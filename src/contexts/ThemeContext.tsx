import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type AccentColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  accentColor: AccentColor
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue')

  // Detect system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Calculate actual theme based on preference
  const calculateActualTheme = (themePreference: Theme): 'light' | 'dark' => {
    if (themePreference === 'system') {
      return getSystemTheme()
    }
    return themePreference
  }

  // Load theme and accent color from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const result = await chrome.storage.local.get(['theme', 'accentColor'])
        const savedTheme = result.theme as Theme || 'system'
        const savedAccentColor = result.accentColor as AccentColor || 'blue'
        setThemeState(savedTheme)
        setAccentColorState(savedAccentColor)
        setActualTheme(calculateActualTheme(savedTheme))
      } catch (error) {
        // Fallback for non-extension environments (testing)
        const savedTheme = localStorage.getItem('vela-theme') as Theme || 'system'
        const savedAccentColor = localStorage.getItem('vela-accent-color') as AccentColor || 'blue'
        setThemeState(savedTheme)
        setAccentColorState(savedAccentColor)
        setActualTheme(calculateActualTheme(savedTheme))
      }
    }

    loadTheme()
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        setActualTheme(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Set CSS custom properties for theme colors
    if (actualTheme === 'dark') {
      root.style.setProperty('--color-primary', '#6366f1')
      root.style.setProperty('--color-primary-hover', '#4f46e5')
      root.style.setProperty('--color-background', '#111827')
      root.style.setProperty('--color-surface', '#1f2937')
      root.style.setProperty('--color-surface-hover', '#374151')
      root.style.setProperty('--color-text-primary', '#f9fafb')
      root.style.setProperty('--color-text-secondary', '#d1d5db')
      root.style.setProperty('--color-text-muted', '#9ca3af')
      root.style.setProperty('--color-border', '#374151')
      root.style.setProperty('--color-border-light', '#4b5563')
    } else {
      root.style.setProperty('--color-primary', '#4f46e5')
      root.style.setProperty('--color-primary-hover', '#4338ca')
      root.style.setProperty('--color-background', '#ffffff')
      root.style.setProperty('--color-surface', '#f9fafb')
      root.style.setProperty('--color-surface-hover', '#f3f4f6')
      root.style.setProperty('--color-text-primary', '#111827')
      root.style.setProperty('--color-text-secondary', '#374151')
      root.style.setProperty('--color-text-muted', '#6b7280')
      root.style.setProperty('--color-border', '#e5e7eb')
      root.style.setProperty('--color-border-light', '#f3f4f6')
    }
  }, [actualTheme])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    setActualTheme(calculateActualTheme(newTheme))
    
    try {
      await chrome.storage.local.set({ theme: newTheme })
    } catch (error) {
      // Fallback for non-extension environments
      localStorage.setItem('vela-theme', newTheme)
    }
  }

  const setAccentColor = async (newAccentColor: AccentColor) => {
    setAccentColorState(newAccentColor)
    
    try {
      await chrome.storage.local.set({ accentColor: newAccentColor })
    } catch (error) {
      // Fallback for non-extension environments
      localStorage.setItem('vela-accent-color', newAccentColor)
    }
  }

  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    actualTheme,
    accentColor,
    setTheme,
    setAccentColor,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}