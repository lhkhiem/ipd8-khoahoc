/**
 * DOM Safe Patch - Prevents removeChild errors
 * This file must be imported early, before React DOM is loaded
 * This patches Node.prototype.removeChild to catch React DOM internal errors
 */

// Execute immediately when module loads
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  if (typeof Node === 'undefined') return;
  
  // Store original method
  const originalRemoveChild = Node.prototype.removeChild;
  
  // Patch removeChild to handle null parent cases (especially from React DOM)
  Node.prototype.removeChild = function(this: Node, child: Node): Node {
    try {
      // Check if parent (this) is valid
      if (!this) {
        return child;
      }
      
      // Check if child is valid
      if (!child) {
        return child;
      }
      
      // Check if child has a parent - if not, it's already removed
      if (!child.parentNode) {
        return child;
      }
      
      // Check if child belongs to this parent
      if (child.parentNode !== this) {
        // Child doesn't belong to this parent - React hydration/unmount issue
        return child;
      }
      
      // Try modern remove() first if available (safer)
      if (typeof (child as any).remove === 'function') {
        try {
          (child as any).remove();
          return child;
        } catch (e) {
          // Fall through to removeChild
        }
      }
      
      // Use original removeChild with comprehensive error handling
      try {
        return originalRemoveChild.call(this, child);
      } catch (error: any) {
        // Handle all removeChild-related errors gracefully
        // This catches React DOM's internal removeChild calls
        if (error && (
          (error.message && (
            error.message.includes('removeChild') ||
            error.message.includes('not a child') ||
            error.message.includes('not found') ||
            error.message.includes('NotFoundError')
          )) ||
          error.name === 'NotFoundError' ||
          error.name === 'DOMException' ||
          error.code === 8 // DOMException.NOT_FOUND_ERR
        )) {
          // Silently handle - element may already be removed by React
          return child;
        }
        // Re-throw other unexpected errors
        throw error;
      }
    } catch (error: any) {
      // Ultimate fallback - prevent any crash
      return child;
    }
  };
  
  // Also patch remove() method for consistency
  if (typeof Element !== 'undefined' && Element.prototype && Element.prototype.remove) {
    const originalRemove = Element.prototype.remove;
    Element.prototype.remove = function(this: Element) {
      try {
        if (!this || !this.parentNode) {
          // Already removed or no parent
          return;
        }
        return originalRemove.call(this);
      } catch (error: any) {
        // Silently fail if element is already gone
      }
    };
  }
})();

