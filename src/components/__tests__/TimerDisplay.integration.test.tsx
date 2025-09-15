/**
 * Integration tests for TimerDisplay component
 * These tests verify the complete timer functionality
 */

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TimerDisplay } from '../TimerDisplay'

// Mock the timer utilities to avoid complex calculations in integration tests
jest.mock('../../utils/timer', () => ({
  formatTime: (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },
  calculateProgress: (timeRemaining: number, totalDuration: number) => {
    if (totalDuration === 0) return 0
    return Math.min(Math.max((totalDuration - timeRemaining) / totalDuration, 0), 1)
  },
  calculateStrokeDashoffset: (progress: number) => {
    const circumference = 2 * Math.PI * 45
    return circumference * (1 - progress)
  },
  getTimerStateDescription: (isActive: boolean, isPaused: boolean, timeRemaining: number) => {
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    if (!isActive) return `Timer stopped. ${timeStr} ready to start.`
    if (isPaused) return `Timer paused. ${timeStr} remaining.`
    return `Timer running. ${timeStr} remaining.`
  },
  shouldShowCompletionAnimation: () => false
}))

describe('TimerDisplay Integration Tests', () => {
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

  it('should complete a full timer cycle', async () => {
    // Start with a very short timer for testing
    const initialState = {
      timeRemaining: 3,
      totalDuration: 3,
      streak: 0,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    // Verify initial state
    expect(screen.getByText('0:03')).toBeInTheDocument()
    expect(screen.getByText('Start Session')).toBeInTheDocument()
    
    // Start the timer
    fireEvent.click(screen.getByText('Start Session'))
    expect(mockOnSessionStart).toHaveBeenCalled()
    expect(screen.getByText('Pause')).toBeInTheDocument()
    
    // Let timer run for 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText('0:02')).toBeInTheDocument()
    
    // Let timer run for another second
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText('0:01')).toBeInTheDocument()
    
    // Complete the timer
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText('0:00')).toBeInTheDocument()
    
    // Verify session completion was called
    expect(mockOnSessionComplete).toHaveBeenCalledWith({
      duration: 3,
      sessionType: 'work'
    })
    
    // Timer should reset to start state
    expect(screen.getByText('Start Session')).toBeInTheDocument()
  })

  it('should handle pause and resume correctly', () => {
    const initialState = {
      timeRemaining: 10,
      totalDuration: 10,
      streak: 0,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    expect(screen.getByText('Pause')).toBeInTheDocument()
    
    // Run for 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(screen.getByText('0:08')).toBeInTheDocument()
    
    // Pause timer
    fireEvent.click(screen.getByText('Pause'))
    expect(screen.getByText('Resume')).toBeInTheDocument()
    
    // Time should not advance when paused
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(screen.getByText('0:08')).toBeInTheDocument()
    
    // Resume timer
    fireEvent.click(screen.getByText('Resume'))
    expect(screen.getByText('Pause')).toBeInTheDocument()
    
    // Time should advance again
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(screen.getByText('0:07')).toBeInTheDocument()
  })

  it('should handle stop functionality', () => {
    const initialState = {
      timeRemaining: 10,
      totalDuration: 10,
      streak: 0,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    // Start timer
    fireEvent.click(screen.getByText('Start Session'))
    expect(screen.getByText('Stop')).toBeInTheDocument()
    
    // Run for 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(screen.getByText('0:07')).toBeInTheDocument()
    
    // Stop timer
    fireEvent.click(screen.getByText('Stop'))
    
    // Should reset to original time
    expect(screen.getByText('0:10')).toBeInTheDocument()
    expect(screen.getByText('Start Session')).toBeInTheDocument()
    expect(screen.queryByText('Stop')).not.toBeInTheDocument()
  })

  it('should display streak correctly', () => {
    const initialState = {
      timeRemaining: 1500,
      totalDuration: 1500,
      streak: 7,
      isActive: false,
      isPaused: false,
      sessionType: 'work' as const
    }

    render(<TimerDisplay {...defaultProps} initialState={initialState} />)
    
    expect(screen.getByText('7-day streak')).toBeInTheDocument()
  })

  it('should render SVG progress circle with correct structure', () => {
    render(<TimerDisplay {...defaultProps} />)
    
    const timerContainer = screen.getByRole('timer')
    const svg = timerContainer.querySelector('svg')
    const circles = svg?.querySelectorAll('circle')
    
    expect(svg).toBeInTheDocument()
    expect(circles).toHaveLength(2) // Background and progress circles
    
    // Check progress circle attributes
    const progressCircle = circles?.[1]
    expect(progressCircle).toHaveAttribute('stroke', 'var(--color-primary)')
    expect(progressCircle).toHaveAttribute('stroke-width', '3')
    expect(progressCircle).toHaveAttribute('stroke-linecap', 'round')
  })
})