'use client';

import { useEffect } from 'react';

/**
 * DOM Patch Script - Injects DOM safety patches before React DOM operations
 * This must be rendered as early as possible to catch React DOM's removeChild calls
 */
export function DOMPatchScript() {
  useEffect(() => {
    // Patch removeChild to handle null parent cases from React DOM
    const originalRemoveChild = Node.prototype.removeChild;
    
    Node.prototype.removeChild = function(child: Node): Node {
      try {
        // Check if parent (this) is valid
        if (!this || !child) {
          return child;
        }
        
        // Check if child has a parent
        if (!child.parentNode) {
          // Child already removed, return silently
          return child;
        }
        
        // Check if child belongs to this parent
        if (child.parentNode !== this) {
          // Child doesn't belong to this parent - React hydration issue
          return child;
        }
        
        // Try modern remove() first if available
        if (typeof (child as any).remove === 'function') {
          try {
            (child as any).remove();
            return child;
          } catch (e) {
            // Fall through to removeChild
          }
        }
        
        // Use original removeChild with error handling
        try {
          return originalRemoveChild.call(this, child);
        } catch (error: any) {
          // Handle removeChild errors gracefully - especially from React DOM
          if (error && (
            error.message?.includes('removeChild') ||
            error.message?.includes('not a child') ||
            error.message?.includes('not found') ||
            error.name === 'NotFoundError' ||
            error.name === 'DOMException'
          )) {
            // Silently handle - element may already be removed by React
            return child;
          }
          // Re-throw other errors
          throw error;
        }
      } catch (error: any) {
        // Ultimate fallback - prevent crash
        return child;
      }
    };
    
    // Also patch remove() method
    if (typeof Element !== 'undefined' && Element.prototype.remove) {
      const originalRemove = Element.prototype.remove;
      Element.prototype.remove = function() {
        try {
          if (!this || !this.parentNode) {
            return;
          }
          return originalRemove.call(this);
        } catch (error: any) {
          // Silently fail if element is already gone
        }
      };
    }
  }, []); // Run once on mount
  
  return null; // This component doesn't render anything
}





