import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  throttle,
  setCookie,
  getCookie,
  delCookie,
  clearCookie,
  getQueryString,
  getQueryStringByName,
  getScrollTop,
  getDocumentHeight,
  getWindowHeight,
  timestampToTime,
  isMobileOrPc
} from './utils'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should execute immediately when delay threshold is exceeded', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should throttle rapid calls', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should preserve context and arguments', () => {
    const fn = vi.fn(function(this: any, arg1: string, arg2: number) {
      return this.name + arg1 + arg2
    })
    const throttledFn = throttle(fn, 100)
    const context = { name: 'test' }

    ;(throttledFn as any).call(context, 'a', 1)

    expect(fn).toHaveBeenCalledWith('a', 1)
    expect(fn.mock.instances[0]).toBe(context)
  })

  it('should execute after delay when called within threshold', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(50)
    throttledFn()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('cookie functions', () => {
  beforeEach(() => {
    document.cookie = ''
  })

  describe('setCookie', () => {
    it('should set cookie with expiration days', () => {
      setCookie('testCookie', 'testValue', 1)
      expect(document.cookie).toContain('testCookie=testValue')
    })

    it('should set cookie with "100" as special expiration', () => {
      setCookie('specialCookie', 'specialValue', '100' as any)
      expect(document.cookie).toContain('specialCookie=specialValue')
    })

    it('should not set cookie when expiredays is 0 or negative', () => {
      setCookie('zeroCookie', 'value', 0)
      expect(document.cookie).not.toContain('zeroCookie')
    })
  })

  describe('getCookie', () => {
    it('should return cookie value when cookie exists', () => {
      document.cookie = 'myCookie=myValue'
      expect(getCookie('myCookie')).toBe('myValue')
    })

    it('should return empty string when cookie does not exist', () => {
      expect(getCookie('nonExistent')).toBe('')
    })

    it('should handle multiple cookies', () => {
      document.cookie = 'cookie1=value1'
      document.cookie = 'cookie2=value2'
      expect(getCookie('cookie1')).toBe('value1')
      expect(getCookie('cookie2')).toBe('value2')
    })
  })

  describe('delCookie', () => {
    it('should delete existing cookie', () => {
      document.cookie = 'toDelete=deleteValue'
      delCookie('toDelete')
      expect(getCookie('toDelete')).toBe('')
    })

    it('should handle non-existent cookie gracefully', () => {
      delCookie('nonExistent')
    })
  })

  describe('clearCookie', () => {
    it('should clear cookie by setting expiration to -1', () => {
      document.cookie = 'toClear=clearValue'
      clearCookie('toClear')
      expect(getCookie('toClear')).toBe('')
    })
  })
})

describe('query string functions', () => {
  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    delete (window as any).location
    window.location = {
      ...originalLocation,
      search: '?name=John&age=25&city=NewYork'
    } as Location
  })

  afterEach(() => {
    window.location = originalLocation
  })

  describe('getQueryString', () => {
    it('should return array of query strings', () => {
      const result = getQueryString()
      expect(result).toContain('name=John')
      expect(result).toContain('age=25')
      expect(result).toContain('city=NewYork')
    })

    it('should return empty string when no query string', () => {
      window.location = { ...originalLocation, search: '' } as Location
      expect(getQueryString()).toBe('')
    })
  })

  describe('getQueryStringByName', () => {
    it('should return value for existing parameter', () => {
      expect(getQueryStringByName('name')).toBe('John')
      expect(getQueryStringByName('age')).toBe('25')
    })

    it('should return empty string for non-existent parameter', () => {
      expect(getQueryStringByName('nonExistent')).toBe('')
    })
  })
})

describe('scroll and document functions', () => {
  describe('getScrollTop', () => {
    it('should return scroll top value', () => {
      Object.defineProperty(document.body, 'scrollTop', {
        value: 100,
        writable: true,
        configurable: true
      })
      Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 200,
        writable: true,
        configurable: true
      })

      expect(getScrollTop()).toBe(200)
    })
  })

  describe('getDocumentHeight', () => {
    it('should return document height', () => {
      Object.defineProperty(document.body, 'scrollHeight', {
        value: 1000,
        writable: true,
        configurable: true
      })
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1500,
        writable: true,
        configurable: true
      })

      expect(getDocumentHeight()).toBe(1500)
    })
  })

  describe('getWindowHeight', () => {
    it('should return window height in CSS1Compat mode', () => {
      Object.defineProperty(document, 'compatMode', {
        value: 'CSS1Compat',
        writable: true,
        configurable: true
      })
      Object.defineProperty(document.documentElement, 'clientHeight', {
        value: 800,
        writable: true,
        configurable: true
      })

      expect(getWindowHeight()).toBe(800)
    })

    it('should return body client height in non-CSS1Compat mode', () => {
      Object.defineProperty(document, 'compatMode', {
        value: 'BackCompat',
        writable: true,
        configurable: true
      })
      Object.defineProperty(document.body, 'clientHeight', {
        value: 600,
        writable: true,
        configurable: true
      })

      expect(getWindowHeight()).toBe(600)
    })
  })
})

describe('timestampToTime', () => {
  it('should format timestamp with date only when dayMinSecFlag is false', () => {
    const timestamp = new Date('2023-06-15T10:30:45').getTime()
    const result = timestampToTime(timestamp, false)
    expect(result).toBe('2023-06-15 ')
  })

  it('should format timestamp with full datetime when dayMinSecFlag is true', () => {
    const timestamp = new Date('2023-06-15T10:30:45').getTime()
    const result = timestampToTime(timestamp, true)
    expect(result).toBe('2023-06-15 10:30:45')
  })

  it('should pad single digit values with zeros', () => {
    const timestamp = new Date('2023-01-05T08:05:03').getTime()
    const result = timestampToTime(timestamp, true)
    expect(result).toBe('2023-01-05 08:05:03')
  })

  it('should handle Date object input', () => {
    const date = new Date('2023-12-25T23:59:59')
    const result = timestampToTime(date, true)
    expect(result).toBe('2023-12-25 23:59:59')
  })
})

describe('isMobileOrPc', () => {
  let originalUserAgent: string

  beforeEach(() => {
    originalUserAgent = navigator.userAgent
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true
    })
  })

  it('should return true for mobile user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
      configurable: true
    })
    expect(isMobileOrPc()).toBe(true)
  })

  it('should return true for Android user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Android; Mobile; rv:68.0)',
      writable: true,
      configurable: true
    })
    expect(isMobileOrPc()).toBe(true)
  })

  it('should return false for desktop user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
      configurable: true
    })
    expect(isMobileOrPc()).toBe(false)
  })

  it('should return true for iPod user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPod; CPU iPhone OS 14_0 like Mac OS X)',
      writable: true,
      configurable: true
    })
    expect(isMobileOrPc()).toBe(true)
  })

  it('should return true for BlackBerry user agent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900',
      writable: true,
      configurable: true
    })
    expect(isMobileOrPc()).toBe(true)
  })
})
