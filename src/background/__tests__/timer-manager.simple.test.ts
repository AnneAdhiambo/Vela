describe('TimerManager Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be able to import background script without errors', async () => {
    expect(() => {
      require('../background')
    }).not.toThrow()
  })

  it('should have chrome APIs available in test environment', () => {
    expect(chrome).toBeDefined()
    expect(chrome.alarms).toBeDefined()
    expect(chrome.storage).toBeDefined()
    expect(chrome.runtime).toBeDefined()
  })

  it('should mock chrome.alarms.create', () => {
    expect(chrome.alarms.create).toBeDefined()
    expect(typeof chrome.alarms.create).toBe('function')
  })

  it('should mock chrome.storage.local', () => {
    expect(chrome.storage.local.get).toBeDefined()
    expect(chrome.storage.local.set).toBeDefined()
    expect(typeof chrome.storage.local.get).toBe('function')
    expect(typeof chrome.storage.local.set).toBe('function')
  })
})