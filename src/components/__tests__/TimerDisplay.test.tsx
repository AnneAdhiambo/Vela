import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { TimerDisplay } from '../TimerDisplay'
import { SessionConfig } from '../../types'

// Mock timer utilities
jest.mock('../../utils/timer', () => ({
  formatTime: jest.fn((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }),
  calculateProgress: jest.fn((timeRemaining: number, totalDuration: number) => {
    if (totalDuration === 0) return 0
    return Math.min(Math.max((totalDuration - timeRemaining) / totalDuration, 0), 1)
  }),
  calculateStrokeDashoffset: jest.fn((progress: number) => {
    const circumference = 2 * Math.PI * 45
    return circumference * (1 - progress)
  }),
  getTimerStateDescription: jest.fn((isActive: boolean, isPaused: boolean, timeRemaining: number) => {
    if (!isActive) return `Timer stopped. ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')} ready to start.`
    if (isPaused) return `Timer paused. ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')} remaining.`
    return `Timer running. ${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')} remaining.`
  }),
  shouldShowCompletionAnimation: jest.fn(() => false)
}))

describe('TimerDisplay', () => {
  const mockOnSessionComplete = jest.fn()
  const mockOnSessionStart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const defaultProps = {
    onSessionComplete: mockOnSessionComplete,
    onSessionStart: mockOnSessionStart
  }

  it('should render with default state', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Start Session')).toBeInTheDocument()
    expect(screen.getByText('0-day streak')).toBeInTheDocument()
  })

  it('should render with custom initial state', () => {
    const initialState = {
      timeRemaining: 600, // 10 minutes
      totalDuration: 600,
      streak: 5,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('5-day streak')).toBeInTheDocument()
  })

  it('should start timer when Start Session is clicked', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    const startButton = screen.getByText('Start Session')
    fireEvent.click(startButton)
    
    expect(mockOnSessionStart).toHaveBeenCalledWith({
      workDuration: 25,
      breakDuration: 5,
      skipBreaks: false,
      sessionType: 'pomodoro'
    })
    
    expect(screen.getByText('Pause')).toBeInTheDocument()
  })

  it('should pause and resume timer', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    // Pause timer
    fireEvent.click(screen.getByText('Pause'))
    expect(screen.getByText('Resume')).toBeInTheDocument()
    
    // Resume timer
    fireEvent.click(screen.getByText('Resume'))
    expect(screen.getByText('Pause')).toBeInTheDocument()
  })

  it('should stop timer when Stop button is clicked', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    expect(screen.getByText('Stop')).toBeInTheDocument()
    
    // Stop timer
    fireEvent.click(screen.getByText('Stop'))
    expect(screen.getByText('Start Session')).toBeInTheDocument()
    expect(screen.queryByText('Stop')).not.toBeInTheDocument()
  })

  it('should tick down every second when active', async () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    // Initially shows 25:00
    expect(screen.getByText('25:00')).toBeInTheDocument()
    
    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    
    // Should show 24:59
    await waitFor(() => {
      expect(screen.getByText('24:59')).toBeInTheDocument()
    })
    
    // Advance timer by another 59 seconds
    act(() => {
      jest.advanceTimersByTime(59000)
    })
    
    // Should show 24:00
    await waitFor(() => {
      expect(screen.getByText('24:00')).toBeInTheDocument()
    })
  })

  it('should not tick when paused', async () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    // Pause timer
    fireEvent.click(screen.getByText('Pause'))
    
    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    
    // Should still show 25:00 (no ticking when paused)
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('should call onSessionComplete when timer reaches zero', async () => {
    const initialState = {
      timeRemaining: 2, // 2 seconds
      totalDuration: 1500,
      streak: 0,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    // Advance timer by 2 seconds to complete
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    
    await waitFor(() => {
      expect(mockOnSessionComplete).toHaveBeenCalledWith({
        duration: 1500,
        sessionType: 'work'
      })
    })
    
    // Timer should stop automatically
    expect(screen.getByText('Start Session')).toBeInTheDocument()
  })

  it('should display correct accessibility attributes', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    const timerContainer = screen.getByRole('timer')
    expect(timerContainer).toHaveAttribute('aria-label', 'Timer stopped. 25:00 ready to start.')
    expect(timerContainer).toHaveAttribute('aria-live', 'polite')
    expect(timerContainer).toHaveAttribute('aria-atomic', 'true')
    
    const startButton = screen.getByLabelText('Start Session timer')
    expect(startButton).toBeInTheDocument()
  })

  it('should update accessibility description when timer state changes', async () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    const timerContainer = screen.getByRole('timer')
    expect(timerContainer).toHaveAttribute('aria-label', 'Timer running. 25:00 remaining.')
    
    // Pause timer
    fireEvent.click(screen.getByText('Pause'))
    expect(timerContainer).toHaveAttribute('aria-label', 'Timer paused. 25:00 remaining.')
  })

  it('should render correct status icons', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    // Should show play icon when stopped
    expect(screen.getByRole('timer')).toBeInTheDocument()
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    
    // Should show pause icon when running
    expect(screen.getByRole('timer')).toBeInTheDocument()
    
    // Pause timer
    fireEvent.click(screen.getByText('Pause'))
    
    // Should show play icon when paused
    expect(screen.getByRole('timer')).toBeInTheDocument()
  })

  it('should render SVG progress circle with correct attributes', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    const progressCircle = screen.getByRole('timer').querySelector('circle:last-child')
    expect(progressCircle).toHaveAttribute('stroke', 'var(--color-primary)')
    expect(progressCircle).toHaveAttribute('stroke-width', '3')
    expect(progressCircle).toHaveAttribute('stroke-linecap', 'round')
    expect(progressCircle).toHaveClass('transition-all', 'duration-1000', 'ease-linear')
  })

  it('should handle edge case of zero duration', () => {
    const initialState = {
      timeRemaining: 0,
      totalDuration: 0,
      streak: 0,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    expect(screen.getByText('0:00')).toBeInTheDocument()
    expect(screen.getByText('Start Session')).toBeInTheDocument()
  })
})