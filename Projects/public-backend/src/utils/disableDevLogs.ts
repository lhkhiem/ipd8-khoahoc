/**
 * Disable console.log in production environment
 * Must be imported first before any other imports
 */

if (process.env.NODE_ENV === 'production') {
  // Override console.log, console.info, console.debug to no-op in production
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  // Keep console.error and console.warn for error tracking
}



















