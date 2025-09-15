// Test file for EmailJS authentication service
import { emailJSAuthService } from '../auth-emailjs'

// Mock EmailJS to avoid actual email sending in tests
jest.mock('@emailjs/browser', () => ({
  init: jest.fn(),
  send: jest.fn().mockResolvedValue({ status: 200 })
}))

// Mock Chrome storage API
const mockChromeStorage = {
  local: {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn().mockResolvedValue(undefined)
  }
}

// @ts-ignore
global.chrome = {
  storage: mockChromeStorage
}

describe('EmailJS Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendMagicLink', () => {
    it('should validate email format', async () => {
      await expect(emailJSAuthService.sendMagicLink('invalid-email'))
        .rejects.toThrow('Invalid email format')
    })

    it('should accept valid email format', async () => {
      const result = await emailJSAuthService.sendMagicLink('test@example.com')
      expect(result).toBe(true)
    })

    it('should generate and store token', async () => {
      await emailJSAuthService.sendMagicLink('test@example.com')
      expect(mockChromeStorage.local.set).toHaveBeenCalled()
    })
  })

  describe('verifyMagicLink', () => {
    it('should reject invalid token', async () => {
      const result = await emailJSAuthService.verifyMagicLink('invalid-token')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid magic link')
    })

    it('should create user profile on successful verification', async () => {
      // First send a magic link to create a token
      await emailJSAuthService.sendMagicLink('test@example.com')
      
      // Get the token that was stored (we'll need to mock this)
      const mockToken = 'test-token'
      
      // Mock the token storage
      mockChromeStorage.local.get.mockResolvedValueOnce({
        pendingTokens: {
          [mockToken]: {
            email: 'test@example.com',
            createdAt: Date.now(),
            expiresAt: Date.now() + 15 * 60 * 1000
          }
        }
      })

      const result = await emailJSAuthService.verifyMagicLink(mockToken)
      expect(result.success).toBe(true)
      expect(result.user?.email).toBe('test@example.com')
      expect(result.token).toBeDefined()
    })
  })

  describe('verifyToken', () => {
    it('should return false for non-existent token', async () => {
      mockChromeStorage.local.get.mockResolvedValueOnce({})
      const result = await emailJSAuthService.verifyToken('non-existent-token')
      expect(result).toBe(false)
    })
  })

  describe('getStatus', () => {
    it('should return service status', () => {
      const status = emailJSAuthService.getStatus()
      expect(status).toHaveProperty('pendingTokens')
      expect(status).toHaveProperty('authenticatedUsers')
      expect(typeof status.pendingTokens).toBe('number')
      expect(typeof status.authenticatedUsers).toBe('number')
    })
  })
})