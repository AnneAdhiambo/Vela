/**
 * Timer utility functions for time formatting and calculations
 */

/**
 * Formats seconds into MM:SS format
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "25:00", "05:30")
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Calculates progress percentage from time remaining and total duration
 * @param timeRemaining - Seconds remaining in timer
 * @param totalDuration - Total duration of timer in seconds
 * @returns Progress as a decimal between 0 and 1
 */
export function calculateProgress(timeRemaining: number, totalDuration: number): number {
  if (totalDuration === 0) return 0
  const progress = (totalDuration - timeRemaining) / totalDuration
  return Math.min(Math.max(progress, 0), 1)
}

/**
 * Calculates SVG stroke-dashoffset for circular progress indicator
 * @param progress - Progress as decimal between 0 and 1
 * @param radius - Circle radius for circumference calculation
 * @returns Stroke dash offset value
 */
export function calculateStrokeDashoffset(progress: number, radius: number = 45): number {
  const circumference = 2 * Math.PI * radius
  return circumference * (1 - progress)
}

/**
 * Converts minutes to seconds
 * @param minutes - Minutes to convert
 * @returns Seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

/**
 * Converts seconds to minutes (rounded)
 * @param seconds - Seconds to convert
 * @returns Minutes (rounded to nearest minute)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60)
}

/**
 * Validates timer duration is within acceptable range
 * @param minutes - Duration in minutes to validate
 * @returns True if valid (5-120 minutes), false otherwise
 */
export function isValidDuration(minutes: number): boolean {
  return minutes >= 5 && minutes <= 120
}

/**
 * Calculates session completion percentage
 * @param timeRemaining - Seconds remaining
 * @param totalDuration - Total session duration in seconds
 * @returns Completion percentage (0-100)
 */
export function getCompletionPercentage(timeRemaining: number, totalDuration: number): number {
  const progress = calculateProgress(timeRemaining, totalDuration)
  return Math.round(progress * 100)
}

/**
 * Determines if a session should show completion animation
 * @param timeRemaining - Seconds remaining
 * @param totalDuration - Total duration in seconds
 * @returns True if session is nearly complete (>95%)
 */
export function shouldShowCompletionAnimation(timeRemaining: number, totalDuration: number): boolean {
  const progress = calculateProgress(timeRemaining, totalDuration)
  return progress >= 0.95
}

/**
 * Gets appropriate timer state description for accessibility
 * @param isActive - Whether timer is active
 * @param isPaused - Whether timer is paused
 * @param timeRemaining - Seconds remaining
 * @returns Descriptive string for screen readers
 */
export function getTimerStateDescription(
  isActive: boolean, 
  isPaused: boolean, 
  timeRemaining: number
): string {
  if (!isActive) {
    return `Timer stopped. ${formatTime(timeRemaining)} ready to start.`
  }
  
  if (isPaused) {
    return `Timer paused. ${formatTime(timeRemaining)} remaining.`
  }
  
  return `Timer running. ${formatTime(timeRemaining)} remaining.`
}