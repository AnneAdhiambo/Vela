import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotificationSettings } from '../NotificationSettings'
import { AppProvider } from '../../contexts/AppContext'

// Mock Chrome APIs
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  },
  runtime: {
    sendMessage: vi.fn()
  }
}

// @ts-ignore
global.chrome = mockChrome

// Mock component with AppProvider
const MockedNotificationSettings = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AppProvider>
    <NotificationSettings isOpen={isOpen} onClose={onClose} />
  </AppProvider>
)

describe('NotificationSettings', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock default storage response
    mockChrome.storage.local.get.mockResolvedValue({
      userPreferences: {
        notificationsEnabled: true,
        soundEnabled: true,
        theme: 'system',
        defaultSessionLength: 25,
        defaultBreakLength: 5,
        skipBreaks: false,
        spotifyConnected: false
      },
      todaysTasks: [],
      todaysStats: {
        date: new Date().toISOString().split('T')[0],
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      }
    })
    
    mockChrome.storage.local.set.mockResolvedValue(undefined)
    mockChrome.runtime.sendMessage.mockResolvedValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when closed', () => {
    render(<MockedNotificationSettings isOpen={false} onClose={mockOnClose} />)
    
    expect(screen.queryByText('Notification Settings')).not.toBeInTheDocument()
  })

  it('should render when open', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Notification Settings')).toBeInTheDocument()
    })
  })

  it('should display current notification preferences', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const notificationToggle = screen.getByRole('switch', { name: /enable notifications/i })
      const soundToggle = screen.getByRole('switch', { name: /enable sound/i })
      
      expect(notificationToggle).toBeChecked()
      expect(soundToggle).toBeChecked()
    })
  })

  it('should toggle notification setting', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const notificationToggle = screen.getByRole('switch', { name: /enable notifications/i })
      fireEvent.click(notificationToggle)
    })
    
    await waitFor(() => {
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        userPreferences: expect.objectContaining({
          notificationsEnabled: false
        })
      })
      
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_PREFERENCES',
        preferences: { enabled: false }
      })
    })
  })

  it('should toggle sound setting', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const soundToggle = screen.getByRole('switch', { name: /enable sound/i })
      fireEvent.click(soundToggle)
    })
    
    await waitFor(() => {
      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({
        userPreferences: expect.objectContaining({
          soundEnabled: false
        })
      })
      
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'UPDATE_NOTIFICATION_PREFERENCES',
        preferences: { soundEnabled: false }
      })
    })
  })

  it('should disable sound toggle when notifications are disabled', async () => {
    // Mock disabled notifications
    mockChrome.storage.local.get.mockResolvedValue({
      userPreferences: {
        notificationsEnabled: false,
        soundEnabled: true,
        theme: 'system',
        defaultSessionLength: 25,
        defaultBreakLength: 5,
        skipBreaks: false,
        spotifyConnected: false
      },
      todaysTasks: [],
      todaysStats: {
        date: new Date().toISOString().split('T')[0],
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      }
    })
    
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const soundToggle = screen.getByRole('switch', { name: /enable sound/i })
      expect(soundToggle).toBeDisabled()
    })
  })

  it('should send test notification', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)
    })
    
    await waitFor(() => {
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'TEST_NOTIFICATION'
      })
    })
  })

  it('should show success message after test notification', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Test notification sent successfully!')).toBeInTheDocument()
    })
  })

  it('should show error message when test notification fails', async () => {
    mockChrome.runtime.sendMessage.mockResolvedValue(false)
    
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const testButton = screen.getByText('Test')
      fireEvent.click(testButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Failed to send test notification. Please check your settings.')).toBeInTheDocument()
    })
  })

  it('should close modal when close button is clicked', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close notification settings')
      fireEvent.click(closeButton)
    })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when done button is clicked', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const doneButton = screen.getByText('Done')
      fireEvent.click(doneButton)
    })
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should display notification types information', async () => {
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('Notification Types')).toBeInTheDocument()
      expect(screen.getByText('• Session completion alerts')).toBeInTheDocument()
      expect(screen.getByText('• Break reminders')).toBeInTheDocument()
      expect(screen.getByText('• Streak achievements')).toBeInTheDocument()
      expect(screen.getByText('• Task reminders')).toBeInTheDocument()
    })
  })

  it('should disable test button when notifications are disabled', async () => {
    // Mock disabled notifications
    mockChrome.storage.local.get.mockResolvedValue({
      userPreferences: {
        notificationsEnabled: false,
        soundEnabled: true,
        theme: 'system',
        defaultSessionLength: 25,
        defaultBreakLength: 5,
        skipBreaks: false,
        spotifyConnected: false
      },
      todaysTasks: [],
      todaysStats: {
        date: new Date().toISOString().split('T')[0],
        sessionsStarted: 0,
        sessionsCompleted: 0,
        totalFocusTime: 0,
        tasksCreated: 0,
        tasksCompleted: 0,
        streak: 0
      }
    })
    
    render(<MockedNotificationSettings isOpen={true} onClose={mockOnClose} />)
    
    await waitFor(() => {
      const testButton = screen.getByText('Test')
      expect(testButton).toBeDisabled()
    })
  })
})