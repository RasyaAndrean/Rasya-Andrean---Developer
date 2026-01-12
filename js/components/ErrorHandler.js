// Error Handler and Logger
class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Limit stored errors
    
    this.init();
  }

  init() {
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandledrejection',
        message: event.reason?.message || event.reason || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date(),
        url: window.location.href
      });
    });

    // Capture uncaught exceptions
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date(),
        url: window.location.href
      });
    });

    // Capture console errors programmatically
    this.overrideConsole();
  }

  handleError(errorObj) {
    // Add error to collection
    this.errors.push(errorObj);

    // Limit array size
    if (this.errors.length > this.maxErrors) {
      this.errors.shift(); // Remove oldest error
    }

    // Log to console
    console.error('Application Error:', errorObj);

    // In a real app, send to error tracking service
    this.sendError(errorObj);

    // Emit custom event for other parts of app to listen to
    const errorEvent = new CustomEvent('appError', {
      detail: errorObj
    });
    window.dispatchEvent(errorEvent);
  }

  sendError(errorObj) {
    // In a real implementation, this would send to an error tracking service
    // For now, just log it
    
    // Example payload structure for sending to error service
    const errorPayload = {
      error: {
        type: errorObj.type,
        message: errorObj.message,
        stack: errorObj.stack,
        url: errorObj.url,
        userAgent: navigator.userAgent,
        timestamp: errorObj.timestamp.toISOString()
      },
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        online: navigator.onLine
      }
    };

    // Would send to error tracking endpoint in real implementation
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorPayload)
    // });
  }

  overrideConsole() {
    // Keep reference to original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Override console.error to also capture errors
    console.error = (...args) => {
      // Call original method
      originalError.apply(console, args);
      
      // Capture as error if it's an Error object
      if (args[0] instanceof Error) {
        this.handleError({
          type: 'console_error',
          message: args[0].message,
          stack: args[0].stack,
          args: args.slice(1),
          timestamp: new Date(),
          url: window.location.href
        });
      }
    };

    // Override console.warn for warnings
    console.warn = (...args) => {
      originalWarn.apply(console, args);
      
      // Could store warnings too if needed
      if (args[0] instanceof Error) {
        const warningObj = {
          type: 'console_warning',
          message: args[0].message,
          stack: args[0].stack,
          args: args.slice(1),
          timestamp: new Date(),
          url: window.location.href
        };
        
        console.info('Warning captured:', warningObj);
      }
    };

    // Override console.log for important logs
    console.log = (...args) => {
      originalLog.apply(console, args);
      
      // Store important logs if they match certain criteria
      const firstArg = args[0];
      if (typeof firstArg === 'string' && 
          (firstArg.includes('PERFORMANCE') || firstArg.includes('MONITOR'))) {
        // Store performance-related logs
        const logObj = {
          type: 'console_log',
          message: args.join(' '),
          args: args,
          timestamp: new Date(),
          url: window.location.href
        };
        
        console.info('Important log captured:', logObj);
      }
    };
  }

  getErrors() {
    return [...this.errors]; // Return copy
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorTypes: {},
      lastUpdated: new Date()
    };

    this.errors.forEach(error => {
      summary.errorTypes[error.type] = (summary.errorTypes[error.type] || 0) + 1;
    });

    return summary;
  }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Export for use in other modules
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;

// Also export as utility
window.AppLogger = {
  error: (...args) => errorHandler.handleError({
    type: 'app_error',
    message: args.join(' '),
    timestamp: new Date(),
    url: window.location.href
  }),
  warn: (...args) => console.warn(...args),
  log: (...args) => console.log(...args)
};

export { ErrorHandler, errorHandler };