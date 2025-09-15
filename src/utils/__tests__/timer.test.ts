import {
  formatTime,
  calculateProgress,
  calculateStrokeDashoffset,
  minutesToSeconds,
  secondsToMinutes,
  isValidDuration,
  getCompletionPercentage,
  shouldShowCompletionAnimation,
  getTimerStateDescription
} from '../timer'

describe('Timer Utilities', () => {
  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(30)).toBe('0:30')
      expect(formatTime(60)).toBe('1:00')
      expect(formatTime(90)).toBe('1:30')
      expect(formatTime(3600)).toBe('60:00')
      expect(formatTime(3661)).toBe('61:01')
    })

    it('should pad seconds with leading zero', () => {
      expect(formatTime(5)).toBe('0:05')
      expect(formatTime(65)).toBe('1:05')
      expect(formatTime(605)).toBe('10:05')
    })

    it('should handle edge cases', () => {
      expect(formatTime(-1)).toBe('-1:59')
      expect(formatTime(0.5)).toBe('0:00')
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(1500, 1500)).toBe(0) // No progress
      expect(calculateProgress(750, 1500)).toBe(0.5) // Half progress
      expect(calculateProgress(0, 1500)).toBe(1) // Complete
    })

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 0)).toBe(0) // Zero duration
      expect(calculateProgress(1500, 1000)).toBe(0) // Time remaining > total (clamped to 0)
      expect(calculateProgress(-100, 1500)).toBe(1) // Negative time remaining (clamped to 1)
    })

    it('should clamp values between 0 and 1', () => {
      expect(calculateProgress(2000, 1000)).toBe(0) // Over 100%
      expect(calculateProgress(-500, 1000)).toBe(1) // Under 0%
    })
  })

  describe('calculateStrokeDashoffset', () => {
    it('should calculate stroke dash offset correctly', () => {
      const radius = 45
      const circumference = 2 * Math.PI * radius
      
      expect(calculateStrokeDashoffset(0, radius)).toBe(circumference) // No progress
      expect(calculateStrokeDashoffset(0.5, radius)).toBe(circumference * 0.5) // Half progress
      expect(calculateStrokeDashoffset(1, radius)).toBe(0) // Complete
    })

    it('should use default radius when not provided', () => {
      const defaultRadius = 45
      const circumference = 2 * Math.PI * defaultRadius
      
      expect(calculateStrokeDashoffset(0)).toBe(circumference)
      expect(calculateStrokeDashoffset(1)).toBe(0)
    })
  })

  describe('minutesToSeconds', () => {
    it('should convert minutes to seconds', () => {
      expect(minutesToSeconds(0)).toBe(0)
      expect(minutesToSeconds(1)).toBe(60)
      expect(minutesToSeconds(25)).toBe(1500)
      expect(minutesToSeconds(0.5)).toBe(30)
    })
  })

  describe('secondsToMinutes', () => {
    it('should convert seconds to minutes and round', () => {
      expect(secondsToMinutes(0)).toBe(0)
      expect(secondsToMinutes(60)).toBe(1)
      expect(secondsToMinutes(1500)).toBe(25)
      expect(secondsToMinutes(90)).toBe(2) // Rounds 1.5 to 2
      expect(secondsToMinutes(30)).toBe(1) // Rounds 0.5 to 1
    })
  })

  describe('isValidDuration', () => {
    it('should validate duration ranges', () => {
      expect(isValidDuration(4)).toBe(false) // Too short
      expect(isValidDuration(5)).toBe(true) // Minimum valid
      expect(isValidDuration(25)).toBe(true) // Typical value
      expect(isValidDuration(120)).toBe(true) // Maximum valid
      expect(isValidDuration(121)).toBe(false) // Too long
    })

    it('should handle edge cases', () => {
      expect(isValidDuration(0)).toBe(false)
      expect(isValidDuration(-5)).toBe(false)
      expect(isValidDuration(5.5)).toBe(true) // Decimal values
    })
  })

  describe('getCompletionPercentage', () => {
    it('should calculate completion percentage', () => {
      expect(getCompletionPercentage(1500, 1500)).toBe(0) // 0%
      expect(getCompletionPercentage(750, 1500)).toBe(50) // 50%
      expect(getCompletionPercentage(0, 1500)).toBe(100) // 100%
    })

    it('should round to nearest integer', () => {
      expect(getCompletionPercentage(1000, 1500)).toBe(33) // 33.33% rounded to 33%
      expect(getCompletionPercentage(500, 1500)).toBe(67) // 66.67% rounded to 67%
    })
  })

  describe('shouldShowCompletionAnimation', () => {
    it('should determine when to show completion animation', () => {
      expect(shouldShowCompletionAnimation(1500, 1500)).toBe(false) // 0% complete
      expect(shouldShowCompletionAnimation(100, 1500)).toBe(true) // >95% complete
      expect(shouldShowCompletionAnimation(75, 1500)).toBe(true) // 95% complete
      expect(shouldShowCompletionAnimation(76, 1500)).toBe(false) // <95% complete
      expect(shouldShowCompletionAnimation(0, 1500)).toBe(true) // 100% complete
    })
  })

  describe('getTimerStateDescription', () => {
    it('should provide appropriate descriptions for different states', () => {
      expect(getTimerStateDescription(false, false, 1500)).toBe('Timer stopped. 25:00 ready to start.')
      expect(getTimerStateDescription(true, true, 900)).toBe('Timer paused. 15:00 remaining.')
      expect(getTimerStateDescription(true, false, 600)).toBe('Timer running. 10:00 remaining.')
    })

    it('should handle edge cases', () => {
      expect(getTimerStateDescription(false, true, 0)).toBe('Timer stopped. 0:00 ready to start.')
      expect(getTimerStateDescription(true, false, 0)).toBe('Timer running. 0:00 remaining.')
    })
  })
})