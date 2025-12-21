// API configuration
// This file centralizes API URLs to avoid hardcoding localhost

const DEFAULT_BACKEND_PORT = 3103;

const buildUrlFromWindow = (port: number) => {
  if (typeof window === 'undefined') {
    return null;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
};

let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3103';
let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || apiBaseUrl;

const trimTrailingSlash = (url: string) => {
  if (!url) return url;
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

if (typeof window !== 'undefined') {
  const runtimeUrl = buildUrlFromWindow(DEFAULT_BACKEND_PORT);
  if (!process.env.NEXT_PUBLIC_API_URL && runtimeUrl) {
    apiBaseUrl = runtimeUrl;
  }
  if (!process.env.NEXT_PUBLIC_BACKEND_URL && runtimeUrl) {
    backendUrl = runtimeUrl;
  }
}

export const API_BASE_URL = apiBaseUrl;
export const BACKEND_URL = backendUrl;

export const resolveApiBaseUrl = () => {
  // Always prefer explicit env variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If no env var, use the default
  return apiBaseUrl;
  
  // NOTE: Removed runtime URL building from window.location
  // because it causes issues when frontend runs on different port than backend
  // Frontend should always set NEXT_PUBLIC_API_URL explicitly
};

export const resolveBackendUrl = () => {
  if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_BACKEND_URL) {
    const runtimeUrl = buildUrlFromWindow(DEFAULT_BACKEND_PORT);
    if (runtimeUrl) {
      return runtimeUrl;
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || backendUrl;
};

export const getNormalizedApiBaseUrl = () => trimTrailingSlash(resolveApiBaseUrl());

export const getNormalizedBackendUrl = () => trimTrailingSlash(resolveBackendUrl());

export const buildApiUrl = (path = '') => {
  const base = getNormalizedApiBaseUrl();
  if (!path) return base;
  
  // If base already ends with /api and path starts with /api, remove duplicate
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api') && normalizedPath.startsWith('/api')) {
    normalizedPath = normalizedPath.substring(4); // Remove '/api' prefix
  }
  
  return `${base}${normalizedPath}`;
};

/**
 * Helper to build API URL from API_BASE_URL constant
 * Handles duplicate /api/api/ automatically
 */
export const buildApiUrlFromBase = (baseUrl: string, path: string): string => {
  if (!path) return baseUrl;
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // If baseUrl already ends with /api and path starts with /api, remove duplicate
  if (baseUrl.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${baseUrl}${normalizedPath.substring(4)}`;
  }
  
  return `${baseUrl}${normalizedPath}`;
};

export const buildBackendUrl = (path = '') => {
  const base = getNormalizedBackendUrl();
  if (!path) return base;
  
  // Remove /api from base if path starts with /uploads (static files)
  // Static files should be served from root domain, not /api
  let normalizedBase = base;
  if (path.startsWith('/uploads') && base.endsWith('/api')) {
    normalizedBase = base.slice(0, -4); // Remove '/api'
  }
  
  return path.startsWith('/') ? `${normalizedBase}${path}` : `${normalizedBase}/${path}`;
};

export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  // If path already has protocol, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Otherwise prepend backend URL
  return buildBackendUrl(path);
};

// Get thumbnail URL from asset data (prefers thumb size)
export const getThumbnailUrl = (asset: any): string => {
  if (!asset) return '';
  
  // Priority: thumb_url (from backend) > thumb from sizes object > thumb from sizes string > url
  if (asset.thumb_url) {
    return getAssetUrl(asset.thumb_url);
  }
  if (asset.thumbnail_url) {
    return getAssetUrl(asset.thumbnail_url);
  }
  // Check if sizes.thumb is an object with url property
  if (asset.sizes?.thumb?.url) {
    return getAssetUrl(asset.sizes.thumb.url);
  }
  // Check if sizes.thumb is a string (filename) - need to construct path
  if (asset.sizes?.thumb && typeof asset.sizes.thumb === 'string') {
    // Extract directory from asset.url
    const urlParts = asset.url?.split('/') || [];
    const directory = urlParts.slice(0, -1).join('/');
    return getAssetUrl(`${directory}/${asset.sizes.thumb}`);
  }
  if (asset.thumbnail_sizes?.thumb?.url) {
    return getAssetUrl(asset.thumbnail_sizes.thumb.url);
  }
  // Fallback to original URL
  if (asset.url) {
    return getAssetUrl(asset.url);
  }
  return '';
};

