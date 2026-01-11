// Main application entry point
import { ProjectGallery } from './components/ProjectGallery.js';
import { ThemeManager } from './components/ThemeManager.js';
import { BlogSystem } from './components/BlogSystem.js';
import { ContactForm } from './components/ContactForm.js';
import { NavigationManager } from './components/NavigationManager.js';
import { SkillsTimeline } from './components/SkillsTimeline.js';
import { AnimationEngine } from './components/AnimationEngine.js';
import { LazyImageLoader } from './components/LazyImageLoader.js';

class PortfolioApp {
  constructor() {
    this.themeManager = null;
    this.projectGallery = null;
    this.blogSystem = null;
    this.contactForm = null;
    this.navigationManager = null;
    this.skillsTimeline = null;
    this.animationEngine = null;
    this.lazyImageLoader = null;
    this.components = new Map(); // Track all components for theme updates
    this.data = {
      projects: null,
      articles: null,
      timeline: null
    };
  }

  async init() {
    try {
      // Initialize theme manager first
      this.themeManager = new ThemeManager();
      this.components.set('themeManager', this.themeManager);
      
      // Initialize lazy image loader early
      this.lazyImageLoader = new LazyImageLoader({
        rootMargin: '100px 0px',
        threshold: 0.1
      });
      this.components.set('lazyImageLoader', this.lazyImageLoader);
      
      // Load data
      await this.loadData();
      
      // Initialize components when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
      } else {
        this.initializeComponents();
      }
      
      // Setup cross-component interactions
      this.setupComponentInteractions();
      
    } catch (error) {
      console.error('Failed to initialize portfolio app:', error);
    }
    
    // Remove preload class to enable transitions
    document.body.classList.remove('preload');
  }

  async loadData() {
    try {
      // Load projects data
      const projectsResponse = await fetch('./data/projects.json');
      this.data.projects = await projectsResponse.json();
      
      // Load articles data
      const articlesResponse = await fetch('./data/articles.json');
      this.data.articles = await articlesResponse.json();
      
      // Load timeline data
      const timelineResponse = await fetch('./data/timeline.json');
      this.data.timeline = await timelineResponse.json();
      
    } catch (error) {
      console.error('Failed to load data:', error);
      // Provide fallback empty data
      this.data.projects = { projects: [], categories: [] };
      this.data.articles = { articles: [], categories: [] };
      this.data.timeline = { experiences: [], skills: [] };
    }
  }

  initializeComponents() {
    // Initialize animation engine first
    this.animationEngine = new AnimationEngine();
    this.animationEngine.init();
    this.components.set('animationEngine', this.animationEngine);
    
    // Initialize navigation manager
    const navElement = document.querySelector('nav');
    if (navElement) {
      this.navigationManager = new NavigationManager(navElement);
      this.components.set('navigationManager', this.navigationManager);
    }
    
    // Initialize project gallery
    const projectsContainer = document.getElementById('projects');
    if (projectsContainer && this.data.projects) {
      this.projectGallery = new ProjectGallery(projectsContainer, this.data.projects);
      this.components.set('projectGallery', this.projectGallery);
      // Re-observe any new images added by the project gallery
      setTimeout(() => {
        this.lazyImageLoader.observeImages();
        this.addAnimationsToNewElements(projectsContainer);
      }, 100);
    }
    
    // Initialize blog system
    const blogContainer = document.getElementById('blog');
    if (blogContainer && this.data.articles) {
      this.blogSystem = new BlogSystem(blogContainer, this.data.articles);
      this.components.set('blogSystem', this.blogSystem);
      // Re-observe any new images added by the blog system
      setTimeout(() => {
        this.lazyImageLoader.observeImages();
        this.addAnimationsToNewElements(blogContainer);
      }, 100);
    }
    
    // Initialize contact form
    const contactFormElement = document.getElementById('contact-form');
    if (contactFormElement) {
      this.contactForm = new ContactForm(contactFormElement);
      this.components.set('contactForm', this.contactForm);
    }
    
    // Initialize skills timeline
    const skillsTimelineContainer = document.querySelector('.skills-timeline');
    if (skillsTimelineContainer && this.data.timeline) {
      this.skillsTimeline = new SkillsTimeline(skillsTimelineContainer, this.data.timeline);
      this.components.set('skillsTimeline', this.skillsTimeline);
      // Re-observe any new images added by the skills timeline
      setTimeout(() => {
        this.lazyImageLoader.observeImages();
        this.addAnimationsToNewElements(skillsTimelineContainer);
      }, 100);
    }
    
    // Connect navigation to all sections
    this.connectNavigationToSections();
    
    // Apply current theme to all components
    this.applyThemeToAllComponents();
  }

  // Method to add new lazy images dynamically
  addLazyImage(img) {
    if (this.lazyImageLoader) {
      this.lazyImageLoader.addImage(img);
    }
  }

  // Method to add multiple lazy images
  addLazyImages(images) {
    if (this.lazyImageLoader) {
      this.lazyImageLoader.addImages(images);
    }
  }

  // Setup cross-component interactions
  setupComponentInteractions() {
    // Listen for theme changes and update all components
    window.addEventListener('themeChanged', (event) => {
      this.handleThemeChange(event.detail);
    });

    // Listen for navigation events
    window.addEventListener('navigationChanged', (event) => {
      this.handleNavigationChange(event.detail);
    });

    // Setup component communication
    this.setupComponentCommunication();
  }

  // Handle theme changes across all components
  handleThemeChange(themeData) {
    const { theme, previousTheme } = themeData;
    
    // Update all components that need theme-specific behavior
    this.components.forEach((component, name) => {
      if (component && typeof component.onThemeChange === 'function') {
        component.onThemeChange(theme, previousTheme);
      }
    });

    // Update any dynamic elements that might need theme updates
    this.updateDynamicElementsTheme(theme);
  }

  // Handle navigation changes
  handleNavigationChange(navigationData) {
    // Update components that need to respond to navigation changes
    this.components.forEach((component, name) => {
      if (component && typeof component.onNavigationChange === 'function') {
        component.onNavigationChange(navigationData);
      }
    });
  }

  // Setup communication between components
  setupComponentCommunication() {
    // Allow components to communicate with each other through the app instance
    this.components.forEach((component, name) => {
      if (component && typeof component.setApp === 'function') {
        component.setApp(this);
      }
    });
  }

  // Connect navigation to all sections
  connectNavigationToSections() {
    if (!this.navigationManager) return;

    // Ensure all sections are properly connected
    const sections = ['home', 'about', 'projects', 'blog', 'skills', 'contact'];
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section && !section.dataset.navigationConnected) {
        section.dataset.navigationConnected = 'true';
      }
    });

    // Update navigation active states when components are loaded
    setTimeout(() => {
      if (this.navigationManager.updateActiveSection) {
        this.navigationManager.updateActiveSection('home');
      }
    }, 500);
  }

  // Apply current theme to all components
  applyThemeToAllComponents() {
    if (!this.themeManager) return;

    const currentTheme = this.themeManager.getCurrentTheme();
    
    // Trigger theme change event to ensure all components are updated
    this.handleThemeChange({
      theme: currentTheme,
      previousTheme: null
    });
  }

  // Add animations to newly created elements
  addAnimationsToNewElements(container) {
    if (!this.animationEngine) return;

    // Find new elements that need animations
    const newAnimatableElements = container.querySelectorAll('.fade-in:not([data-animation-added])');
    newAnimatableElements.forEach(element => {
      this.animationEngine.addScrollAnimation(element);
      element.dataset.animationAdded = 'true';
    });

    // Find new interactive elements that need hover effects
    const newInteractiveElements = container.querySelectorAll('button, .project-card, .article-card, .skill-item:not([data-hover-initialized])');
    newInteractiveElements.forEach(element => {
      this.animationEngine.addHoverEffect(element);
    });
  }

  // Update theme for dynamically created elements
  updateDynamicElementsTheme(theme) {
    // Update any elements that might have been created dynamically
    const dynamicElements = document.querySelectorAll('[data-dynamic-theme]');
    dynamicElements.forEach(element => {
      element.setAttribute('data-theme', theme);
    });
  }

  // Public method to get a component by name
  getComponent(name) {
    return this.components.get(name);
  }

  // Public method to check if all components are initialized
  areAllComponentsInitialized() {
    const expectedComponents = ['themeManager', 'animationEngine', 'lazyImageLoader'];
    return expectedComponents.every(name => this.components.has(name));
  }

  // Public method to reinitialize components (useful for testing)
  reinitializeComponents() {
    // Clean up existing components
    this.components.forEach((component, name) => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();

    // Reinitialize
    this.initializeComponents();
  }
}

// Initialize the application
const app = new PortfolioApp();
app.init();

// Make app globally available for debugging and testing
window.portfolioApp = app;