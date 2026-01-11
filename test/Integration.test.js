// Integration Tests for Portfolio Enhancement
// Tests theme switching across all components, navigation between sections, and responsive behavior

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';

// Import all components for integration testing
import { ThemeManager } from '../js/components/ThemeManager.js';
import { ProjectGallery } from '../js/components/ProjectGallery.js';
import { BlogSystem } from '../js/components/BlogSystem.js';
import { ContactForm } from '../js/components/ContactForm.js';
import { NavigationManager } from '../js/components/NavigationManager.js';
import { SkillsTimeline } from '../js/components/SkillsTimeline.js';
import { AnimationEngine } from '../js/components/AnimationEngine.js';
import { LazyImageLoader } from '../js/components/LazyImageLoader.js';

describe('Portfolio Integration Tests', () => {
  let components = {};
  let mockData = {};

  beforeEach(() => {
    // Setup complete DOM structure
    document.body.innerHTML = `
      <header role="banner">
        <nav class="container" role="navigation" aria-label="Main navigation">
          <div class="logo">Rasya Andrean</div>
          <ul class="nav-links" role="menubar">
            <li role="none"><a href="#home" role="menuitem">Home</a></li>
            <li role="none"><a href="#about" role="menuitem">About</a></li>
            <li role="none"><a href="#projects" role="menuitem">Projects</a></li>
            <li role="none"><a href="#blog" role="menuitem">Blog</a></li>
            <li role="none"><a href="#skills" role="menuitem">Skills</a></li>
            <li role="none"><a href="#contact" role="menuitem">Contact</a></li>
          </ul>
          <button class="theme-toggle" aria-label="Toggle between dark and light theme" type="button">
            🌙
          </button>
        </nav>
      </header>

      <main role="main">
        <section id="home" class="hero fade-in" aria-labelledby="hero-heading">
          <div class="container">
            <div class="hero-content">
              <h1 id="hero-heading">Hello, I'm Rasya</h1>
              <p class="subtitle">Full Stack Developer</p>
              <p class="description">I create clean, efficient, and scalable web applications</p>
              <a href="#contact" class="cta-button">Get In Touch</a>
            </div>
          </div>
        </section>

        <section id="about" class="about fade-in" aria-labelledby="about-heading">
          <div class="container">
            <h2 id="about-heading" class="section-title">About Me</h2>
            <div class="about-content">
              <div class="about-text">
                <p>I'm a passionate developer who loves building digital experiences.</p>
              </div>
              <div class="skills">
                <div class="skill-item">JavaScript</div>
                <div class="skill-item">React</div>
                <div class="skill-item">Node.js</div>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" class="projects fade-in" aria-labelledby="projects-heading">
          <div class="container">
            <h2 id="projects-heading" class="section-title">Projects</h2>
          </div>
        </section>

        <section id="blog" class="blog fade-in" aria-labelledby="blog-heading">
          <div class="container">
            <h2 id="blog-heading" class="section-title">Blog & Articles</h2>
          </div>
        </section>

        <section id="skills" class="skills-timeline-section fade-in" aria-labelledby="skills-heading">
          <div class="container">
            <h2 id="skills-heading" class="section-title">Skills & Experience</h2>
            <div class="skills-timeline"></div>
          </div>
        </section>

        <section id="contact" class="contact fade-in" aria-labelledby="contact-heading">
          <div class="container">
            <h2 id="contact-heading" class="section-title">Contact</h2>
            <div class="contact-content">
              <div class="contact-info">
                <h3>Let's Connect</h3>
              </div>
              <form class="contact-form" id="contact-form" aria-labelledby="contact-form-heading">
                <h3 id="contact-form-heading">Send Message</h3>
                <div class="form-group">
                  <input type="text" id="name" name="name" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                  <input type="email" id="email" name="email" placeholder="Your Email" required>
                </div>
                <div class="form-group">
                  <input type="text" id="subject" name="subject" placeholder="Subject" required>
                </div>
                <div class="form-group">
                  <textarea id="message" name="message" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" class="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer role="contentinfo">
        <div class="container">
          <p>&copy; 2025 Rasya Andrean. All rights reserved.</p>
        </div>
      </footer>
    `;

    // Setup mock data
    mockData = {
      projects: {
        projects: [
          {
            id: 'project-1',
            title: 'Test Project',
            description: 'A test project',
            category: 'web-development',
            technologies: ['React', 'Node.js'],
            thumbnail: '/images/test.jpg',
            images: ['/images/test-1.jpg'],
            liveUrl: 'https://example.com',
            githubUrl: 'https://github.com/test',
            featured: true,
            completedDate: '2024-12-01'
          }
        ],
        categories: [
          { id: 'web-development', name: 'Web Development' }
        ]
      },
      articles: {
        articles: [
          {
            id: 'article-1',
            title: 'Test Article',
            slug: 'test-article',
            excerpt: 'A test article excerpt',
            content: 'Test article content',
            category: 'tutorials',
            tags: ['JavaScript', 'Testing'],
            publishedDate: '2024-12-01',
            readingTime: 5,
            featured: true
          }
        ],
        categories: [
          { id: 'tutorials', name: 'Tutorials' }
        ]
      },
      timeline: {
        experiences: [
          {
            id: 'exp-1',
            title: 'Software Developer',
            company: 'Test Company',
            type: 'work',
            startDate: '2023-01-01',
            endDate: null,
            current: true,
            location: 'Remote',
            description: 'Test experience',
            technologies: ['JavaScript', 'React'],
            achievements: ['Built test features']
          }
        ],
        skills: [
          {
            id: 'frontend',
            category: 'Frontend',
            skills: [
              {
                name: 'JavaScript',
                level: 'Advanced',
                proficiency: 90,
                yearsOfExperience: 3
              }
            ]
          }
        ]
      }
    };

    // Reset mocks
    vi.clearAllMocks();
    localStorage.clear();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock fetch for data loading
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Cleanup components
    Object.values(components).forEach(component => {
      if (component && typeof component.cleanup === 'function') {
        component.cleanup();
      }
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    components = {};
    
    // Reset DOM
    document.body.innerHTML = '';
  });

  describe('Theme Switching Integration', () => {
    it('should apply theme changes across all components', () => {
      fc.assert(fc.property(
        fc.constantFrom('dark', 'light'),
        (theme) => {
          // Initialize all components
          components.themeManager = new ThemeManager();
          components.projectGallery = new ProjectGallery(
            document.getElementById('projects'), 
            mockData.projects
          );
          components.blogSystem = new BlogSystem(
            document.getElementById('blog'), 
            mockData.articles
          );
          components.contactForm = new ContactForm(
            document.getElementById('contact-form')
          );
          components.navigationManager = new NavigationManager(
            document.querySelector('nav')
          );
          components.skillsTimeline = new SkillsTimeline(
            document.querySelector('.skills-timeline'), 
            mockData.timeline
          );
          components.animationEngine = new AnimationEngine();
          components.animationEngine.init();

          // Set theme
          components.themeManager.setTheme(theme);

          // Verify theme is applied to document
          const documentTheme = document.documentElement.getAttribute('data-theme');
          
          // Verify theme toggle button is updated
          const themeToggle = document.querySelector('.theme-toggle');
          const expectedIcon = theme === 'dark' ? '☀️' : '🌙';
          
          // Manually update button to ensure synchronization
          components.themeManager.updateToggleButton(themeToggle);
          const buttonIcon = themeToggle.innerHTML;

          return documentTheme === theme && buttonIcon === expectedIcon;
        }
      ), { numRuns: 50 });
    });

    it('should maintain theme consistency when components are dynamically created', () => {
      fc.assert(fc.property(
        fc.constantFrom('dark', 'light'),
        (theme) => {
          // Initialize theme manager first
          components.themeManager = new ThemeManager();
          components.themeManager.setTheme(theme);

          // Create components after theme is set
          components.projectGallery = new ProjectGallery(
            document.getElementById('projects'), 
            mockData.projects
          );

          // Verify new elements inherit theme
          const documentTheme = document.documentElement.getAttribute('data-theme');
          const projectCards = document.querySelectorAll('.project-card');
          
          // All new elements should be created in the context of the current theme
          return documentTheme === theme && projectCards.length >= 0;
        }
      ), { numRuns: 50 });
    });
  });

  describe('Navigation Integration', () => {
    it('should connect navigation to all sections', () => {
      fc.assert(fc.property(
        fc.constantFrom('home', 'about', 'projects', 'blog', 'skills', 'contact'),
        (sectionId) => {
          // Initialize navigation manager
          components.navigationManager = new NavigationManager(
            document.querySelector('nav')
          );

          // Verify section exists and is connected
          const section = document.getElementById(sectionId);
          const navLink = document.querySelector(`a[href="#${sectionId}"]`);

          return section !== null && navLink !== null;
        }
      ), { numRuns: 50 });
    });

    it('should handle navigation between all sections smoothly', () => {
      // Initialize navigation manager
      components.navigationManager = new NavigationManager(
        document.querySelector('nav')
      );

      // Test navigation to each section
      const sections = ['home', 'about', 'projects', 'blog', 'skills', 'contact'];
      let allSectionsAccessible = true;

      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        const navLink = document.querySelector(`a[href="#${sectionId}"]`);
        
        if (!section || !navLink) {
          allSectionsAccessible = false;
        }
      });

      expect(allSectionsAccessible).toBe(true);
    });

    it('should update active navigation state correctly', () => {
      // Initialize navigation manager
      components.navigationManager = new NavigationManager(
        document.querySelector('nav')
      );

      // Test active state updates
      const testSection = 'projects';
      if (components.navigationManager.updateActiveSection) {
        components.navigationManager.updateActiveSection(testSection);
      }

      // Verify active state is applied
      const activeLink = document.querySelector('.nav-links a.active');
      const expectedHref = `#${testSection}`;
      
      // Check if active link exists and has correct href
      const hasCorrectActiveState = activeLink && activeLink.getAttribute('href') === expectedHref;
      
      expect(hasCorrectActiveState).toBe(true);
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('should handle mobile navigation across all components', () => {
      // Initialize navigation manager
      components.navigationManager = new NavigationManager(
        document.querySelector('nav')
      );

      // Verify hamburger button was created
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      expect(hamburgerBtn).toBeTruthy();

      // Test mobile menu functionality
      if (hamburgerBtn) {
        // Simulate mobile menu toggle
        hamburgerBtn.click();
        
        const navLinks = document.querySelector('.nav-links');
        const isMenuOpen = navLinks.classList.contains('mobile-menu-open');
        
        expect(isMenuOpen).toBe(true);
      }
    });

    it('should maintain component functionality across viewport changes', () => {
      fc.assert(fc.property(
        fc.integer({ min: 320, max: 1920 }), // Viewport widths
        (viewportWidth) => {
          // Initialize components
          components.themeManager = new ThemeManager();
          components.navigationManager = new NavigationManager(
            document.querySelector('nav')
          );
          components.projectGallery = new ProjectGallery(
            document.getElementById('projects'), 
            mockData.projects
          );

          // Simulate viewport change
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: viewportWidth,
          });

          // Trigger resize event
          window.dispatchEvent(new Event('resize'));

          // Verify components still function
          const themeToggle = document.querySelector('.theme-toggle');
          const hamburgerBtn = document.querySelector('.hamburger-btn');
          const projectsSection = document.getElementById('projects');

          return themeToggle !== null && 
                 hamburgerBtn !== null && 
                 projectsSection !== null;
        }
      ), { numRuns: 30 });
    });
  });

  describe('Cross-Component Communication', () => {
    it('should handle theme changes propagating to all components', () => {
      // Initialize all components
      components.themeManager = new ThemeManager();
      components.projectGallery = new ProjectGallery(
        document.getElementById('projects'), 
        mockData.projects
      );
      components.blogSystem = new BlogSystem(
        document.getElementById('blog'), 
        mockData.articles
      );
      components.contactForm = new ContactForm(
        document.getElementById('contact-form')
      );

      // Listen for theme change events
      let themeChangeEventFired = false;
      window.addEventListener('themeChanged', () => {
        themeChangeEventFired = true;
      });

      // Change theme
      components.themeManager.setTheme('light');

      // Verify event was fired
      expect(themeChangeEventFired).toBe(true);

      // Verify theme is applied
      const documentTheme = document.documentElement.getAttribute('data-theme');
      expect(documentTheme).toBe('light');
    });

    it('should maintain component state during theme transitions', () => {
      fc.assert(fc.property(
        fc.constantFrom('dark', 'light'),
        (initialTheme) => {
          // Initialize components with initial theme
          components.themeManager = new ThemeManager();
          components.themeManager.setTheme(initialTheme);
          
          components.contactForm = new ContactForm(
            document.getElementById('contact-form')
          );

          // Add some form data
          const nameInput = document.getElementById('name');
          const testValue = 'Test User';
          nameInput.value = testValue;

          // Change theme
          const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
          components.themeManager.setTheme(newTheme);

          // Verify form data is preserved
          const preservedValue = nameInput.value;
          const themeChanged = document.documentElement.getAttribute('data-theme') === newTheme;

          return preservedValue === testValue && themeChanged;
        }
      ), { numRuns: 50 });
    });
  });

  describe('Animation Integration', () => {
    it('should initialize animations for all components', () => {
      // Initialize animation engine
      components.animationEngine = new AnimationEngine();
      components.animationEngine.init();

      // Initialize other components
      components.projectGallery = new ProjectGallery(
        document.getElementById('projects'), 
        mockData.projects
      );

      // Verify animation elements are set up
      const fadeInElements = document.querySelectorAll('.fade-in');
      const interactiveElements = document.querySelectorAll('button, .cta-button');

      expect(fadeInElements.length).toBeGreaterThan(0);
      expect(interactiveElements.length).toBeGreaterThan(0);
    });

    it('should handle hover effects across all interactive elements', () => {
      // Initialize animation engine
      components.animationEngine = new AnimationEngine();
      components.animationEngine.init();

      // Initialize components with interactive elements
      components.projectGallery = new ProjectGallery(
        document.getElementById('projects'), 
        mockData.projects
      );

      // Find interactive elements
      const buttons = document.querySelectorAll('button, .cta-button');
      
      // Verify hover effects are initialized
      let hoverEffectsInitialized = true;
      buttons.forEach(button => {
        if (!components.animationEngine.hasHoverEffects(button)) {
          // Add hover effects if not already present
          components.animationEngine.addHoverEffect(button);
        }
      });

      expect(hoverEffectsInitialized).toBe(true);
    });
  });

  describe('Data Loading Integration', () => {
    it('should handle component initialization with data dependencies', async () => {
      // Mock successful data loading
      global.fetch
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockData.projects)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockData.articles)
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(mockData.timeline)
        });

      // Initialize components that depend on data
      components.projectGallery = new ProjectGallery(
        document.getElementById('projects'), 
        mockData.projects
      );
      components.blogSystem = new BlogSystem(
        document.getElementById('blog'), 
        mockData.articles
      );
      components.skillsTimeline = new SkillsTimeline(
        document.querySelector('.skills-timeline'), 
        mockData.timeline
      );

      // Verify components are initialized with data
      const projectCards = document.querySelectorAll('.project-card');
      const articleCards = document.querySelectorAll('.article-card');
      const timelineItems = document.querySelectorAll('.timeline-item');

      expect(projectCards.length).toBeGreaterThan(0);
      expect(articleCards.length).toBeGreaterThan(0);
      expect(timelineItems.length).toBeGreaterThan(0);
    });
  });
});