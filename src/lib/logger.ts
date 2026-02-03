/**
 * Production-safe logger that only logs in development
 * In production, errors can be sent to a monitoring service
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    } else {
      // In production: could send to monitoring service like Sentry
      // Example: Sentry.captureException(args[0]);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};

export default logger;
