/**
 * LazyImageLoader - Implements intersection observer for image lazy loading
 * with progressive loading and placeholder support
 */
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      placeholderClass: 'lazy-placeholder',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options
    };
    
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    // Observe existing lazy images
    this.observeImages();
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
    lazyImages.forEach(img => this.observeImage(img));
  }

  observeImage(img) {
    if (this.images.has(img)) return;
    
    this.images.add(img);
    
    // Add placeholder styling
    img.classList.add(this.options.placeholderClass);
    
    // Set up placeholder if not already present
    if (!img.src && !img.getAttribute('src')) {
      img.src = this.generatePlaceholder(img);
    }
    
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
        this.images.delete(img);
      }
    });
  }

  loadImage(img) {
    return new Promise((resolve, reject) => {
      const dataSrc = img.getAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');
      
      if (!dataSrc && !dataSrcset) {
        resolve(img);
        return;
      }

      // Create a new image to preload
      const imageLoader = new Image();
      
      imageLoader.onload = () => {
        // Progressive loading: fade in the image
        this.applyImageData(img, dataSrc, dataSrcset);
        img.classList.remove(this.options.placeholderClass);
        img.classList.add(this.options.loadedClass);
        resolve(img);
      };
      
      imageLoader.onerror = () => {
        img.classList.remove(this.options.placeholderClass);
        img.classList.add(this.options.errorClass);
        this.handleImageError(img);
        reject(new Error(`Failed to load image: ${dataSrc || dataSrcset}`));
      };
      
      // Start loading
      if (dataSrcset) {
        imageLoader.srcset = dataSrcset;
      }
      if (dataSrc) {
        imageLoader.src = dataSrc;
      }
    });
  }

  applyImageData(img, dataSrc, dataSrcset) {
    if (dataSrcset) {
      img.srcset = dataSrcset;
      img.removeAttribute('data-srcset');
    }
    if (dataSrc) {
      img.src = dataSrc;
      img.removeAttribute('data-src');
    }
  }

  generatePlaceholder(img) {
    const width = img.getAttribute('width') || 300;
    const height = img.getAttribute('height') || 200;
    
    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
          Loading...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  handleImageError(img) {
    // Set a fallback error image
    const width = img.getAttribute('width') || 300;
    const height = img.getAttribute('height') || 200;
    
    const errorSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#ffebee"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#c62828" font-family="Arial, sans-serif" font-size="12">
          Failed to load
        </text>
      </svg>
    `;
    
    img.src = `data:image/svg+xml;base64,${btoa(errorSvg)}`;
  }

  loadAllImages() {
    // Fallback method for browsers without Intersection Observer
    const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
    lazyImages.forEach(img => {
      this.loadImage(img).catch(() => {
        // Handle error silently in fallback mode
      });
    });
  }

  // Method to add new images dynamically
  addImage(img) {
    this.observeImage(img);
  }

  // Method to add multiple images
  addImages(images) {
    images.forEach(img => this.addImage(img));
  }

  // Cleanup method
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }

  // Static method to create lazy image HTML
  static createLazyImage(src, options = {}) {
    const {
      alt = '',
      width = null,
      height = null,
      className = '',
      srcset = null,
      sizes = null
    } = options;

    const img = document.createElement('img');
    img.setAttribute('data-src', src);
    img.alt = alt;
    
    if (srcset) {
      img.setAttribute('data-srcset', srcset);
    }
    
    if (sizes) {
      img.sizes = sizes;
    }
    
    if (width) {
      img.width = width;
    }
    
    if (height) {
      img.height = height;
    }
    
    if (className) {
      img.className = className;
    }

    return img;
  }

  // Method to optimize image formats
  static getOptimizedImageUrl(baseUrl, options = {}) {
    const {
      width = null,
      height = null,
      format = 'webp',
      quality = 80,
      fallbackFormat = 'jpg'
    } = options;

    // Check if browser supports WebP
    const supportsWebP = LazyImageLoader.supportsWebP();
    const selectedFormat = supportsWebP ? format : fallbackFormat;
    
    let optimizedUrl = baseUrl;
    
    // Add query parameters for image optimization (if using a service)
    const params = new URLSearchParams();
    
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    params.set('f', selectedFormat);
    params.set('q', quality);
    
    // Only add params if we have optimization parameters
    if (params.toString()) {
      optimizedUrl += (baseUrl.includes('?') ? '&' : '?') + params.toString();
    }
    
    return optimizedUrl;
  }

  // Check WebP support
  static supportsWebP() {
    if (typeof LazyImageLoader._webpSupport !== 'undefined') {
      return LazyImageLoader._webpSupport;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    LazyImageLoader._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return LazyImageLoader._webpSupport;
  }
}