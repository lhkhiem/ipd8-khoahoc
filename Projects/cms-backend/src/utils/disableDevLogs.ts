/**
 * Disable console.log, console.debug, console.info in production
 * This should be imported at the very beginning of the app (in index.ts)
 */

if (process.env.NODE_ENV === 'production') {
  // Override console.log, console.debug, console.info to be no-ops
  const noop = () => {};
  
  // Keep console.error and console.warn for production logging
  // Only disable log, debug, info
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  
  // Optional: You can also reduce verbosity of console.warn if needed
  // But it's generally good to keep warnings in production
}

