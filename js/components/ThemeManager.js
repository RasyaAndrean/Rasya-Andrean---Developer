// Theme Manager Component
export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark'; // Default theme
    this.storageKey = 'portfolio-theme';
    this.supportedThemes = ['dark', 'light'];
    this.transitionDuration = 300; // milliseconds
    this.transitionTimeout = null; // Store timeout reference for cleanup
    
    this.init();
  }

  init() {
    this.initializeTheme();
    this.setupThemeToggle();
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(themeName) {
    if (!this.supportedThemes.includes(themeName)) {
      console.warn(`Invalid theme name "${themeName}". Supported themes: ${this.supportedThemes.join(', ')}`);
      return;
    }
    
    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;
    
    // Apply theme with smooth transition
    this.applyThemeWithTransition(themeName);
    
    // Update toggle button appearance
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      this.updateToggleButton(themeToggle);
    }
    
    // Persist theme preference
    this.persistTheme(themeName);
    
    // Dispatch theme change event for other components
    this.dispatchThemeChangeEvent(themeName, previousTheme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  initializeTheme() {
    // Check for saved theme preference first
    const savedTheme = this.getSavedTheme();
    
    // Check for system preference if no saved theme
    let preferredTheme = savedTheme;
    if (!preferredTheme) {
      preferredTheme = this.detectSystemTheme();
    }
    
    // Fallback to dark theme if invalid
    if (!this.supportedThemes.includes(preferredTheme)) {
      preferredTheme = 'dark';
    }
    
    // Set initial theme without transition for first load
    this.currentTheme = preferredTheme;
    this.applyThemeImmediate(preferredTheme);
    this.persistTheme(preferredTheme);
  }

  getSavedTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  }

  persistTheme(themeName) {
    try {
      localStorage.setItem(this.storageKey, themeName);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  detectSystemTheme() {
    // Detect system theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  applyThemeImmediate(themeName) {
    // Apply theme without transition (for initial load)
    if (document && document.documentElement) {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  }

  applyThemeWithTransition(themeName) {
    // Clear any existing transition timeout
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    
    // Add transition class to body for smooth theme switching
    if (document && document.body) {
      document.body.classList.add('theme-transitioning');
    }
    
    // Apply theme
    if (document && document.documentElement) {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    
    // Remove transition class after animation completes
    this.transitionTimeout = setTimeout(() => {
      if (document && document.body) {
        document.body.classList.remove('theme-transitioning');
      }
      this.transitionTimeout = null;
    }, this.transitionDuration);
  }

  dispatchThemeChangeEvent(newTheme, previousTheme) {
    // Dispatch theme change event for other components to listen to
    const event = new CustomEvent('themeChanged', { 
      detail: { 
        theme: newTheme,
        previousTheme: previousTheme,
        timestamp: Date.now()
      } 
    });
    window.dispatchEvent(event);
  }

  setupThemeToggle() {
    // Find existing theme toggle button
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (!themeToggle) {
      console.warn('Theme toggle button not found in DOM');
      return;
    }
    
    // Initialize button state
    this.updateToggleButton(themeToggle);
    
    // Add click event listener
    themeToggle.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleTheme();
      this.updateToggleButton(themeToggle);
    });

    // Listen for system theme changes
    this.setupSystemThemeListener();
  }

  setupSystemThemeListener() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = this.getSavedTheme();
        if (!savedTheme) {
          const systemTheme = e.matches ? 'light' : 'dark';
          this.setTheme(systemTheme);
          
          // Update toggle button if it exists
          const themeToggle = document.querySelector('.theme-toggle');
          if (themeToggle) {
            this.updateToggleButton(themeToggle);
          }
        }
      });
    }
  }

  updateToggleButton(button) {
    if (!button) return;
    
    const isDark = this.currentTheme === 'dark';
    // When theme is dark, show sun icon (to switch to light)
    // When theme is light, show moon icon (to switch to dark)
    const icon = isDark ? '☀️' : '🌙';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    
    button.innerHTML = icon;
    button.title = label;
    button.setAttribute('aria-label', label);
    
    // Add visual feedback for button state
    button.classList.toggle('theme-toggle--dark', isDark);
    button.classList.toggle('theme-toggle--light', !isDark);
  }

  // Public method to check if theme switching is supported
  isThemeSwitchingSupported() {
    return typeof Storage !== 'undefined';
  }

  // Public method to get all supported themes
  getSupportedThemes() {
    return [...this.supportedThemes];
  }

  // Cleanup method for tests
  cleanup() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
  }
}