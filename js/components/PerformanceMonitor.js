// Performance Monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Measure page load time
    window.addEventListener('load', () => {
      this.measurePageLoadTime();
    });

    // Measure resource loading
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.measureResourceTimings();
        }, 0);
      });
    }

    // Monitor API calls (will be used when implementing API calls)
    this.monitorApiCalls();
  }

  measurePageLoadTime() {
    if ('performance' in window) {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      this.metrics.pageLoadTime = pageLoadTime;
      
      // Log to console for now, in production you'd send to analytics
      console.log(`Page load time: ${pageLoadTime}ms`);
      
      // Check if page load time is acceptable (> 3 seconds is slow)
      if (pageLoadTime > 3000) {
        console.warn('Slow page load detected:', pageLoadTime);
        this.reportPerformanceIssue('slow_page_load', pageLoadTime);
      }
    }
  }

  measureResourceTimings() {
    if ('getEntriesByType' in performance) {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach(resource => {
        const transferSize = resource.transferSize || 0;
        const duration = resource.duration;
        
        // Report large resources (> 500KB) or slow loading resources (> 1 second)
        if (transferSize > 500 * 1024) {
          console.log(`Large resource: ${resource.name}, Size: ${Math.round(transferSize / 1024)}KB`);
          this.reportPerformanceIssue('large_resource', {
            url: resource.name,
            size: Math.round(transferSize / 1024) + 'KB'
          });
        }
        
        if (duration > 1000) {
          console.log(`Slow resource: ${resource.name}, Duration: ${Math.round(duration)}ms`);
          this.reportPerformanceIssue('slow_resource', {
            url: resource.name,
            duration: Math.round(duration) + 'ms'
          });
        }
      });
    }
  }

  monitorApiCalls() {
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const startTime = Date.now();
      const url = args[0];

      return originalFetch.apply(this, args)
        .then(response => {
          const duration = Date.now() - startTime;
          
          // Log slow API calls (> 1 second)
          if (duration > 1000) {
            console.warn(`Slow API call: ${url}, Duration: ${duration}ms`);
            this.reportPerformanceIssue('slow_api_call', {
              url: url,
              duration: duration + 'ms'
            });
          }
          
          return response;
        })
        .catch(error => {
          console.error('API call failed:', url, error);
          this.reportError('api_error', {
            url: url,
            error: error.message
          });
          throw error;
        });
    };
  }

  reportPerformanceIssue(type, details) {
    // In a real app, this would send data to your analytics service
    console.log('Performance issue reported:', { type, details, timestamp: new Date() });
  }

  reportError(type, details) {
    // In a real app, this would send error data to your error tracking service
    console.error('Error reported:', { type, details, timestamp: new Date() });
  }

  // Get performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  // Send performance data to endpoint (when backend is available)
  sendPerformanceData() {
    const data = this.getMetrics();
    
    // Would send to analytics endpoint in real implementation
    // fetch('/api/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
  }
}

// Initialize performance monitoring
const perfMonitor = new PerformanceMonitor();

// Export for use in other modules
window.PerformanceMonitor = PerformanceMonitor;
window.perfMonitor = perfMonitor;