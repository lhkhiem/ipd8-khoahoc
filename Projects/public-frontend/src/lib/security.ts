/**
 * Security utilities to prevent XSS, open redirect, and other vulnerabilities
 * Protects against React2Shell (CVE-2025-55182) and other Next.js security issues
 */

/**
 * Allowed URL patterns for external links
 */
const ALLOWED_PROTOCOLS = ['https:', 'http:']
const ALLOWED_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'meet.google.com',
  'zoom.us',
  'zoom.com',
  'unsplash.com',
  'images.unsplash.com',
  'www.google.com',
  'google.com',
  'maps.google.com',
]

/**
 * Validates and sanitizes a URL to prevent XSS and open redirect attacks
 * @param url - The URL to validate
 * @param allowedDomains - Optional list of allowed domains
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string | null | undefined, allowedDomains: string[] = ALLOWED_DOMAINS): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Remove any javascript: or data: protocols
  const trimmedUrl = url.trim()
  if (trimmedUrl.toLowerCase().startsWith('javascript:') || 
      trimmedUrl.toLowerCase().startsWith('data:') ||
      trimmedUrl.toLowerCase().startsWith('vbscript:')) {
    return null
  }

  try {
    // Parse URL - this will throw if invalid
    const urlObj = new URL(trimmedUrl, window.location.origin)
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return null
    }

    // Check domain if external URL
    if (urlObj.origin !== window.location.origin) {
      const hostname = urlObj.hostname.toLowerCase()
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )
      
      if (!isAllowed) {
        return null
      }
    }

    // Return sanitized URL
    return urlObj.toString()
  } catch (error) {
    // Invalid URL
    return null
  }
}

/**
 * Validates if a URL is safe for iframe embedding
 * @param url - The URL to validate
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeIframeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()
  
  // Only allow specific iframe-safe domains
  const iframeAllowedDomains = [
    'www.youtube.com',
    'youtube.com',
    'meet.google.com',
    'zoom.us',
  ]

  return sanitizeUrl(trimmedUrl, iframeAllowedDomains)
}

/**
 * Validates and sanitizes a Google Maps embed URL
 * @param url - The Google Maps URL to validate
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeGoogleMapsUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()
  
  // Only allow Google Maps embed URLs
  const googleMapsDomains = [
    'www.google.com',
    'google.com',
    'maps.google.com',
  ]

  // Must be a Google Maps embed URL
  if (!trimmedUrl.includes('google.com/maps/embed')) {
    return null
  }

  // Validate and sanitize
  const sanitized = sanitizeUrl(trimmedUrl, googleMapsDomains)
  
  // Ensure URL is properly formatted for Google Maps embed
  if (sanitized && sanitized.includes('maps/embed')) {
    return sanitized
  }

  return null
}

/**
 * Sanitizes text content to prevent XSS
 * Escapes HTML special characters
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Validates and sanitizes a numeric ID parameter
 * Prevents injection attacks through route parameters
 * @param id - The ID to validate
 * @returns Validated ID or null
 */
export function validateId(id: string | string[] | undefined): string | null {
  if (!id) {
    return null
  }

  const idStr = Array.isArray(id) ? id[0] : id
  
  // Only allow alphanumeric, dash, and underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(idStr)) {
    return null
  }

  // Limit length to prevent DoS
  if (idStr.length > 100) {
    return null
  }

  return idStr
}

/**
 * Validates and sanitizes a slug parameter
 * @param slug - The slug to validate
 * @returns Validated slug or null
 */
export function validateSlug(slug: string | string[] | undefined): string | null {
  if (!slug) {
    return null
  }

  const slugStr = Array.isArray(slug) ? slug[0] : slug
  
  // Only allow lowercase letters, numbers, and hyphens
  if (!/^[a-z0-9-]+$/.test(slugStr)) {
    return null
  }

  // Limit length
  if (slugStr.length > 200) {
    return null
  }

  return slugStr
}

/**
 * Safely opens a URL in a new window
 * Validates URL before opening to prevent XSS and open redirect
 * @param url - URL to open
 * @param target - Target window (default: '_blank')
 * @returns true if opened successfully, false otherwise
 */
export function safeWindowOpen(url: string | null | undefined, target: string = '_blank'): boolean {
  const sanitizedUrl = sanitizeUrl(url)
  
  if (!sanitizedUrl) {
    console.warn('Attempted to open invalid URL:', url)
    return false
  }

  try {
    const newWindow = window.open(sanitizedUrl, target, 'noopener,noreferrer')
    if (!newWindow) {
      console.warn('Failed to open window (may be blocked by popup blocker)')
      return false
    }
    return true
  } catch (error) {
    console.error('Error opening window:', error)
    return false
  }
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates phone number (Vietnamese format)
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Vietnamese phone: 10-11 digits, may start with 0 or +84
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
  return phoneRegex.test(phone.trim().replace(/\s/g, ''))
}

/**
 * Sanitizes file name to prevent path traversal
 * @param filename - File name to sanitize
 * @returns Sanitized file name
 */
export function sanitizeFileName(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file'
  }

  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\\?\*\|<>":]/g, '_')
    .replace(/\.\./g, '_')
    .trim()
    .substring(0, 255) // Limit length
}

