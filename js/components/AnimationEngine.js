/**
 * AnimationEngine - Manages scroll-triggered animations, hover effects, parallax scrolling, and micro-interactions
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export class AnimationEngine {
  constructor() {
    this.scrollObserver = null;
    this.parallaxElements = [];
    this.animatedElements = new Set();
    this.isInitialized = false;
    
    // Bind methods to preserve context
    this.handleScroll = this.handleScroll.bind(this);
    this.handleIntersection = this.handleIntersection.bind(this);
  }

  /**
   * Initialize the animation engine
   */
  init() {
    if (this.isInitialized) return;
    
    this.initializeScrollAnimations();
    this.initializeMicroInteractions();
    this.initializeParallaxScrolling();
    this.isInitialized = true;
  }

  /**
   * Initialize scroll-triggered fade-in animations
   * Requirement 7.2: Scroll animation trigger accuracy
   */
  initializeScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.scrollObserver = new IntersectionObserver(this.handleIntersection, observerOptions);

    // Find all elements that should animate on scroll
    const animatableElements = document.querySelectorAll('.fade-in, [data-animate="fade-in"]');
    animatableElements.forEach(element => {
      // Ensure element starts invisible
      if (!element.classList.contains('visible')) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }
      this.scrollObserver.observe(element);
    });
  }

  /**
   * Handle intersection observer callback for scroll animations
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
        this.animateElement(entry.target);
        this.animatedElements.add(entry.target);
      }
    });
  }

  /**
   * Animate an element into view
   */
  animateElement(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    element.classList.add('visible');
  }

  /**
   * Initialize hover effects for interactive elements
   * Requirement 7.1: Interactive element hover responsiveness
   */
  initializeMicroInteractions() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, .cta-button, .submit-btn, [data-interactive="true"]');
    buttons.forEach(button => {
      this.addHoverEffects(button);
      this.addClickFeedback(button);
    });

    // Add hover effects to cards and interactive elements
    const cards = document.querySelectorAll('.skill-item, .project-card, .article-card, [data-hover="true"]');
    cards.forEach(card => {
      this.addHoverEffects(card);
    });

    // Add hover effects to navigation links
    const navLinks = document.querySelectorAll('.nav-links a, [data-nav-link="true"]');
    navLinks.forEach(link => {
      this.addHoverEffects(link);
    });
  }

  /**
   * Add hover effects to an element
   */
  addHoverEffects(element) {
    if (element.dataset.hoverInitialized) return;
    
    element.addEventListener('mouseenter', () => {
      element.style.transition = 'all 0.3s ease';
      
      // Different hover effects based on element type
      if (element.matches('button, .cta-button, .submit-btn')) {
        element.style.transform = 'translateY(-2px)';
        element.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.1)';
      } else if (element.matches('.skill-item, .project-card, .article-card')) {
        element.style.transform = 'translateY(-3px)';
        element.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
      } else if (element.matches('.nav-links a')) {
        element.style.color = '#ffffff';
        element.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.3)';
      }
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.textShadow = '';
      
      // Reset color for nav links
      if (element.matches('.nav-links a')) {
        element.style.color = '';
      }
    });

    element.dataset.hoverInitialized = 'true';
  }

  /**
   * Add immediate click feedback to interactive elements
   * Requirement 7.4: Interaction feedback immediacy
   */
  addClickFeedback(element) {
    if (element.dataset.clickInitialized) return;
    
    element.addEventListener('mousedown', () => {
      element.style.transform = 'scale(0.98)';
    });

    element.addEventListener('mouseup', () => {
      element.style.transform = '';
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
    });

    element.dataset.clickInitialized = 'true';
  }

  /**
   * Initialize parallax scrolling for hero section
   * Requirement 7.3: Parallax effect implementation
   */
  initializeParallaxScrolling() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    // Create parallax background element if it doesn't exist
    let parallaxBg = heroSection.querySelector('.parallax-bg');
    if (!parallaxBg) {
      parallaxBg = document.createElement('div');
      parallaxBg.className = 'parallax-bg';
      parallaxBg.style.cssText = `
        position: absolute;
        top: -20%;
        left: 0;
        width: 100%;
        height: 120%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%);
        z-index: -1;
        will-change: transform;
      `;
      heroSection.style.position = 'relative';
      heroSection.style.overflow = 'hidden';
      heroSection.appendChild(parallaxBg);
    }

    this.parallaxElements.push({
      element: parallaxBg,
      speed: 0.5
    });

    // Add scroll listener for parallax effect
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  /**
   * Handle scroll events for parallax effect
   */
  handleScroll() {
    const scrollY = window.pageYOffset;
    
    this.parallaxElements.forEach(({ element, speed }) => {
      const yPos = -(scrollY * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }

  /**
   * Add animation to new elements dynamically
   */
  addScrollAnimation(element) {
    if (!this.scrollObserver) return;
    
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    this.scrollObserver.observe(element);
  }

  /**
   * Add hover effects to new elements dynamically
   */
  addHoverEffect(element) {
    this.addHoverEffects(element);
    if (element.matches('button, .cta-button, .submit-btn')) {
      this.addClickFeedback(element);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
    
    window.removeEventListener('scroll', this.handleScroll);
    this.parallaxElements = [];
    this.animatedElements.clear();
    this.isInitialized = false;
  }

  /**
   * Check if an element has hover effects
   */
  hasHoverEffects(element) {
    return element.dataset.hoverInitialized === 'true';
  }

  /**
   * Check if an element has been animated
   */
  isElementAnimated(element) {
    return this.animatedElements.has(element);
  }

  /**
   * Get parallax elements for testing
   */
  getParallaxElements() {
    return this.parallaxElements;
  }
}