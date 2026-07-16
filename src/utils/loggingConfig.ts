/**
 * Global logging configuration
 * Controls whether logging is enabled throughout the application
 *
 * Usage:
 * - Study mode: setLoggingEnabled(true)
 * - Standalone mode: setLoggingEnabled(false)
 */

let loggingEnabled = false;

/**
 * Set the global logging state
 * Should be called once at application startup
 */
export function setLoggingEnabled(enabled: boolean): void {
  loggingEnabled = enabled;
  console.log(`🔧 Logging ${enabled ? 'ENABLED' : 'DISABLED'} (${enabled ? 'Study Mode' : 'Standalone Mode'})`);
}

/**
 * Check if logging is currently enabled
 */
export function isLoggingEnabled(): boolean {
  return loggingEnabled;
}
