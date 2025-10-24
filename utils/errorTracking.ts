/**
 * Error Tracking Utility
 * 
 * Provides error tracking and logging for production.
 * Can be integrated with Sentry or other error tracking services.
 */

interface ErrorContext {
  [key: string]: any;
}

/**
 * Log an error to the console and error tracking service
 * @param error - The error to log
 * @param context - Additional context about the error
 */
export function logError(error: Error | string, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', errorMessage);
    if (errorStack) {
      console.error('Stack:', errorStack);
    }
    if (context) {
      console.error('Context:', context);
    }
  }

  // In production, send to Sentry if configured
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Check if Sentry is available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context,
      });
    } else {
      // Fallback: log to console in production if Sentry not available
      console.error('[Production Error]:', errorMessage, context);
    }
  }
}

/**
 * Log a warning message
 * @param message - The warning message
 * @param context - Additional context
 */
export function logWarning(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Warning:', message, context);
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if (window.Sentry) {
      window.Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }
}

/**
 * Log an info message (for tracking important events)
 * @param message - The info message
 * @param context - Additional context
 */
export function logInfo(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Info:', message, context);
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if (window.Sentry) {
      window.Sentry.captureMessage(message, {
        level: 'info',
        extra: context,
      });
    }
  }
}

/**
 * Track API performance metrics
 * @param apiName - Name of the API endpoint
 * @param duration - Duration in milliseconds
 * @param success - Whether the API call was successful
 */
export function trackAPIPerformance(
  apiName: string,
  duration: number,
  success: boolean
): void {
  const context = {
    apiName,
    duration,
    success,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`API Performance [${apiName}]:`, `${duration}ms`, success ? '✅' : '❌');
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'api',
        message: `${apiName} - ${duration}ms`,
        level: success ? 'info' : 'error',
        data: context,
      });
    }
  }
}

/**
 * Track cache performance metrics
 * @param operation - Cache operation (hit, miss, set)
 * @param key - Cache key
 */
export function trackCachePerformance(
  operation: 'hit' | 'miss' | 'set',
  key: string
): void {
  const context = {
    operation,
    key,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log(`Cache ${operation.toUpperCase()}:`, key);
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'cache',
        message: `Cache ${operation}: ${key}`,
        level: 'info',
        data: context,
      });
    }
  }
}

/**
 * Initialize error tracking (call this in _app.tsx or layout.tsx)
 */
export function initErrorTracking(): void {
  if (typeof window === 'undefined') return;

  const sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (sentryDSN && process.env.NODE_ENV === 'production') {
    // Sentry will be initialized via @sentry/nextjs if installed
    console.log('Error tracking initialized');
  } else {
    console.log('Error tracking disabled (no Sentry DSN configured)');
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: any, context?: any) => void;
      captureMessage: (message: string, context?: any) => void;
      addBreadcrumb: (breadcrumb: any) => void;
    };
  }
}

