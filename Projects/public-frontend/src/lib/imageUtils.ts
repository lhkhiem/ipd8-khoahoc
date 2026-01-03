/**
 * Image URL utilities
 * Normalize avatar URLs and handle relative/absolute paths
 */

// Get API base URL without /api suffix
const getApiBaseUrl = (): string => {
  // Try NEXT_PUBLIC_API_URL first (may include /api)
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Remove /api suffix if present
    return apiUrl.replace(/\/api\/?$/, '');
  }
  // Try NEXT_PUBLIC_API_BASE_URL (may include /api/public)
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // Remove /api/public or /api suffix if present
    return apiUrl.replace(/\/api(\/public)?\/?$/, '');
  }
  // Default: localhost:3101
  return 'http://localhost:3101';
};

/**
 * Normalize avatar URL
 * Convert absolute localhost URLs to relative URLs for better portability
 * @param url - Avatar URL from backend
 * @returns Normalized URL (relative if possible, absolute if needed)
 */
export const normalizeAvatarUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // If it's already a relative URL, return as is
  if (url.startsWith('/')) {
    return url;
  }

  // If it's an absolute localhost URL, convert to relative
  const localhostPattern = /^https?:\/\/localhost:\d+\/(.+)$/;
  const localhostMatch = url.match(localhostPattern);
  if (localhostMatch) {
    return `/${localhostMatch[1]}`;
  }

  const localhost127Pattern = /^https?:\/\/127\.0\.0\.1:\d+\/(.+)$/;
  const localhost127Match = url.match(localhost127Pattern);
  if (localhost127Match) {
    return `/${localhost127Match[1]}`;
  }

  // If it's a full URL (production), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Default: return as is
  return url;
};

/**
 * Get full avatar URL for API requests
 * @param relativePath - Relative path like /uploads/avatars/filename.jpg
 * @returns Full URL for API
 */
export const getFullAvatarUrl = (relativePath: string | null | undefined): string | null => {
  if (!relativePath) return null;

  // If already absolute, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // If relative, prepend API base URL
  const baseUrl = getApiBaseUrl();
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${normalizedPath}`;
};

