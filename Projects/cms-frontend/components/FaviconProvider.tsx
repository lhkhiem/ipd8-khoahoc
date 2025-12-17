'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getNormalizedApiBaseUrl, getAssetUrl } from '@/lib/api';

// Safe DOM element removal helper - prevents removeChild errors
function safeRemoveElement(element: Node | null | undefined): boolean {
  if (!element) return false;
  
  try {
    // Check if element is still valid
    if (typeof element.nodeType === 'undefined') return false;
    
    // Try modern remove() method first (safest)
    if (typeof (element as any).remove === 'function') {
      try {
        (element as any).remove();
        return true;
      } catch (e) {
        // If remove() fails, continue to removeChild
      }
    }
    
    // Fallback to removeChild with extensive validation
    const parent = element.parentNode;
    if (!parent) return false;
    
    // Verify parent is valid
    if (typeof parent.nodeType === 'undefined' || 
        parent.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    
    // Verify removeChild method exists
    if (typeof parent.removeChild !== 'function') {
      return false;
    }
    
    // Check if element is still connected to parent
    const isConnected = element.isConnected || parent.contains(element);
    if (!isConnected) return false;
    
    // Double-check parent relationship hasn't changed
    if (element.parentNode !== parent) return false;
    
    // Finally, attempt removal
    try {
      parent.removeChild(element);
      return true;
    } catch (e) {
      // Element may have been removed by another process
      return false;
    }
  } catch (e) {
    // Any unexpected error - fail silently
    return false;
  }
}

export function FaviconProvider() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    let currentFaviconUrl: string | null = null; // Track current favicon to avoid unnecessary updates
    
    const updateFavicon = (url: string) => {
      // Check if component is still mounted before DOM manipulation
      if (!isMounted) {
        return;
      }
      
      if (!url) {
        return;
      }
      
      // Skip if favicon URL hasn't changed
      if (currentFaviconUrl === url) {
        return;
      }
      
      // Update tracked URL
      currentFaviconUrl = url;
      
      // Ensure document.head exists and DOM is ready
      if (typeof document === 'undefined' || !document.head || !document.body) {
        console.warn('[FaviconProvider] Document head/body not available');
        return;
      }
      
      try {

      // Determine MIME type from URL
      const getMimeType = (url: string): string => {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.endsWith('.svg')) return 'image/svg+xml';
        if (lowerUrl.endsWith('.png')) return 'image/png';
        if (lowerUrl.endsWith('.ico')) return 'image/x-icon';
        return 'image/x-icon'; // default
      };

      // Remove existing favicon links (all variations)
      // Safely remove links and check if they're still in the DOM
      try {
        // Check document.head is still available
        if (!document.head || !isMounted) return;
        
        const existingLinks = document.querySelectorAll('link[rel*="icon"], link[rel*="shortcut"]');
        // Convert NodeList to Array for safer iteration
        const linksArray = Array.from(existingLinks);
        
        linksArray.forEach(link => {
          try {
            // Double-check mounted state before DOM manipulation
            if (!isMounted || !document.head) return;
            
            // Use safe removal helper
            safeRemoveElement(link);
          } catch (e) {
            // Silently ignore errors for individual links
            console.warn('[FaviconProvider] Error removing individual link:', e);
          }
        });
      } catch (e) {
        console.warn('[FaviconProvider] Error querying/removing favicon links:', e);
      }

      // Check mounted state again before creating new elements
      if (!isMounted || !document.head) return;
      
      const mimeType = getMimeType(url);

      // Create new favicon link (primary)
      try {
        if (!isMounted || !document.head) return;
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = mimeType;
        link.href = url;
        if (document.head && isMounted) {
          document.head.appendChild(link);
        }
      } catch (e) {
        console.warn('[FaviconProvider] Error adding primary favicon:', e);
      }

      // Check mounted state before adding more elements
      if (!isMounted || !document.head) return;

      // Also add shortcut icon for better browser compatibility
      try {
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.href = url;
        if (document.head && isMounted) {
          document.head.appendChild(shortcutLink);
        }
      } catch (e) {
        console.warn('[FaviconProvider] Error adding shortcut icon:', e);
      }

      // Check mounted state before adding more elements
      if (!isMounted || !document.head) return;

      // Also add apple-touch-icon for better mobile support
      try {
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = url;
        if (document.head && isMounted) {
          document.head.appendChild(appleLink);
        }
      } catch (e) {
        console.warn('[FaviconProvider] Error adding apple-touch-icon:', e);
      }

      // Force browser to reload favicon by updating document title briefly (some browsers cache aggressively)
      const originalTitle = document.title;
      document.title = originalTitle;
      } catch (error) {
        console.error('[FaviconProvider] Error updating favicon:', error);
      }
    };

    const loadFavicon = async () => {
      try {
        // Check if component is still mounted
        if (!isMounted) {
          console.log('[FaviconProvider] Component unmounted, skipping favicon load');
          return;
        }
        
        // Wait for document to be ready
        if (typeof document === 'undefined') {
          console.log('[FaviconProvider] Document not available yet');
          return;
        }

        // Try to get from localStorage first for faster loading
        const cached = localStorage.getItem('cms_appearance');
        if (cached && isMounted) {
          try {
            const appearance = JSON.parse(cached);
            if (appearance.favicon_url && isMounted) {
              updateFavicon(appearance.favicon_url);
            }
          } catch (e) {
            console.error('[FaviconProvider] Error parsing cached appearance:', e);
          }
        }

      } catch (error) {
        console.error('[FaviconProvider] Error loading favicon:', error);
      }
    };

    // Wait a bit for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadFavicon);
    } else {
      // DOM is already ready
      loadFavicon();
    }

    // Listen for appearance updates from storage events (cross-window)
    const handleStorageChange = (e: StorageEvent) => {
      if (!isMounted) return; // Don't handle if unmounted
      
      // Only handle storage events from OTHER windows/tabs (not same window)
      if (e.key === 'cms_appearance' && e.newValue) {
        try {
          const appearance = JSON.parse(e.newValue);
          // Only update if favicon actually changed
          if (appearance.favicon_url && isMounted && appearance.favicon_url !== currentFaviconUrl) {
            updateFavicon(appearance.favicon_url);
          } else if (!appearance.favicon_url && currentFaviconUrl) {
            // Remove favicon if cleared - safely
            if (!isMounted) return;
            try {
              if (typeof document !== 'undefined' && document.head) {
                const existingLinks = document.querySelectorAll('link[rel*="icon"], link[rel*="shortcut"]');
                const linksArray = Array.from(existingLinks);
                linksArray.forEach(link => {
                  try {
                    if (!isMounted || !document.head) return;
                    safeRemoveElement(link);
                  } catch (e) {
                    console.warn('[FaviconProvider] Error removing link in storage handler:', e);
                  }
                });
                currentFaviconUrl = null; // Reset tracked URL
              }
            } catch (e) {
              console.error('[FaviconProvider] Error removing favicon links:', e);
            }
          }
        } catch (e) {
          console.error('[FaviconProvider] Error parsing storage event:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (for same-window updates from settings page)
    const handleCustomUpdate = () => {
      if (!isMounted) return; // Don't handle if unmounted
      
      try {
        const cached = localStorage.getItem('cms_appearance');
        if (cached && isMounted) {
          const appearance = JSON.parse(cached);
          // Only update if favicon actually changed
          if (appearance.favicon_url && isMounted && appearance.favicon_url !== currentFaviconUrl) {
            updateFavicon(appearance.favicon_url);
          } else if (!appearance.favicon_url && currentFaviconUrl) {
            // Remove favicon if cleared - safely
            if (!isMounted) return;
            try {
              if (typeof document !== 'undefined' && document.head) {
                const existingLinks = document.querySelectorAll('link[rel*="icon"], link[rel*="shortcut"]');
                const linksArray = Array.from(existingLinks);
                linksArray.forEach(link => {
                  try {
                    if (!isMounted || !document.head) return;
                    safeRemoveElement(link);
                  } catch (e) {
                    console.warn('[FaviconProvider] Error removing link in custom update:', e);
                  }
                });
              }
            } catch (e) {
              console.error('[FaviconProvider] Error removing favicon links in custom update:', e);
            }
          }
        }
      } catch (e) {
        console.error('[FaviconProvider] Error in custom update:', e);
      }
    };

    // Create a custom event listener for same-window updates
    const handleAppearanceUpdate = () => {
      if (isMounted) {
        handleCustomUpdate();
      }
    };
    
    window.addEventListener('appearanceUpdated', handleAppearanceUpdate);
    
    // Poll localStorage only occasionally for updates (fallback)
    // Only poll if we don't have a current favicon yet (initial load)
    // Once loaded, rely on events only to avoid unnecessary checks
    const pollInterval = setInterval(() => {
      if (isMounted && !currentFaviconUrl) {
        // Only poll if we haven't loaded a favicon yet
        handleCustomUpdate();
      }
    }, 10000); // Check every 10 seconds, but only if no favicon loaded yet

    return () => {
      // Mark component as unmounted FIRST - this is critical
      isMounted = false;
      
      // Cleanup: remove all event listeners and intervals
      try {
        // Clear interval first to stop any pending operations
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        
        // Remove event listeners
        if (typeof document !== 'undefined') {
          try {
            document.removeEventListener('DOMContentLoaded', loadFavicon);
          } catch (e) {
            // Ignore - may already be removed
          }
        }
        
        if (typeof window !== 'undefined') {
          try {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('appearanceUpdated', handleAppearanceUpdate);
          } catch (e) {
            // Ignore - may already be removed
          }
        }
      } catch (e) {
        console.warn('[FaviconProvider] Error during cleanup:', e);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchAppearance = async () => {
      const apiBase = getNormalizedApiBaseUrl();
      try {
        const res = await axios.get<any>(buildApiUrl('/api/settings/appearance'), {
          withCredentials: true,
          timeout: 5000,
        });

        if (cancelled) return;

        const appearance = res.data?.value || {};
        
        // Use getAssetUrl helper to properly construct URLs
        if (appearance.favicon_url && typeof appearance.favicon_url === 'string') {
          // Only convert if it's a relative URL
          if (!appearance.favicon_url.startsWith('http://') &&
              !appearance.favicon_url.startsWith('https://')) {
            appearance.favicon_url = getAssetUrl(appearance.favicon_url);
          }
        }
        if (appearance.logo_url && typeof appearance.logo_url === 'string') {
          // Only convert if it's a relative URL
          if (!appearance.logo_url.startsWith('http://') &&
              !appearance.logo_url.startsWith('https://')) {
            appearance.logo_url = getAssetUrl(appearance.logo_url);
          }
        }
        try {
          localStorage.setItem('cms_appearance', JSON.stringify(appearance));
        } catch {}

        window.dispatchEvent(new CustomEvent('appearanceUpdated'));
      } catch (error: any) {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          return;
        }
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('[FaviconProvider] Backend not available when fetching appearance');
        } else {
          console.error('[FaviconProvider] Unable to fetch appearance settings:', error);
        }
      }
    };

    fetchAppearance();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return null; // This component doesn't render anything
}

