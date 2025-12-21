/**
 * Domain utility functions for backend
 * Handles domain configuration from environment variables
 */

/**
 * Get API domain from environment variable
 * Falls back to constructing from FRONTEND_DOMAIN if API_DOMAIN not set
 */
export const getApiDomain = (): string => {
  const apiDomain = process.env.API_DOMAIN || process.env.FRONTEND_DOMAIN;
  if (!apiDomain) {
    // Try to extract from BASE_URL if available
    const baseUrl = process.env.BASE_URL || process.env.API_BASE_URL;
    if (baseUrl) {
      try {
        const url = new URL(baseUrl);
        return url.hostname + (url.port ? `:${url.port}` : '');
      } catch {
        // Invalid URL, fall through to default
      }
    }
    return 'localhost:3103'; // fallback for development
  }
  return apiDomain;
};

/**
 * Get frontend domain from environment variable
 */
export const getFrontendDomain = (): string => {
  if (process.env.FRONTEND_DOMAIN) {
    return process.env.FRONTEND_DOMAIN;
  }
  // Try to extract from WEBSITE_ORIGIN or SITE_URL if available
  const websiteOrigin = process.env.WEBSITE_ORIGIN || process.env.SITE_URL;
  if (websiteOrigin) {
    try {
      const url = new URL(websiteOrigin);
      return url.hostname + (url.port ? `:${url.port}` : '');
    } catch {
      // Invalid URL, fall through to default
    }
  }
  return 'localhost:3103';
};

/**
 * Get admin domain from environment variable
 */
export const getAdminDomain = (): string => {
  const adminDomain = process.env.ADMIN_DOMAIN;
  const frontendDomain = getFrontendDomain();
  return adminDomain || `admin.${frontendDomain}`;
};

/**
 * Get full API URL with protocol
 */
export const getApiUrl = (): string => {
  const domain = getApiDomain();
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  // Remove port if it's included in domain (for localhost)
  const cleanDomain = domain.includes(':') ? domain : domain;
  return `${protocol}://${cleanDomain}`;
};

/**
 * Check if a URL belongs to production domain
 */
export const isProductionDomain = (url: string): boolean => {
  const frontendDomain = process.env.FRONTEND_DOMAIN;
  const apiDomain = process.env.API_DOMAIN;
  
  if (!frontendDomain && !apiDomain) {
    return process.env.NODE_ENV === 'production';
  }
  
  const domains = [frontendDomain, apiDomain].filter(Boolean);
  return domains.some(domain => domain && url.includes(domain));
};

/**
 * Replace IP address with configured API domain
 */
export const replaceIpWithDomain = (url: string): string => {
  const ipPattern = /https?:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?/;
  const ipMatch = url.match(ipPattern);
  
  if (ipMatch) {
    const apiUrl = getApiUrl();
    return url.replace(ipMatch[0], apiUrl);
  }
  
  return url;
};

/**
 * Normalize media URL - replace IP with domain and convert HTTP to HTTPS if needed
 * This is the main function to use for normalizing media URLs in backend
 */
export const normalizeMediaUrl = (value: string | null | undefined): string | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const cleaned = value.replace(/\\/g, '/');
  let url: string;
  
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    url = cleaned;
  } else {
    const baseUrl =
      process.env.FILE_BASE_URL ||
      process.env.CMS_BASE_URL ||
      process.env.API_BASE_URL ||
      getApiUrl();
    url = `${baseUrl}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`;
  }
  
  // Replace IP with domain
  url = replaceIpWithDomain(url);
  
  // Convert HTTP to HTTPS for production domains
  if (url.startsWith('http://')) {
    const isProduction = isProductionDomain(url);
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    
    if (isProduction || (isLocalhost && process.env.FORCE_HTTPS === 'true')) {
      url = url.replace('http://', 'https://');
    }
  }
  
  return url;
};



