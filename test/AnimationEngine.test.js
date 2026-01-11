import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnimationEngine } from '../js/components/AnimationEngine.js';
import fc from 'fast-check';

describe('AnimationEngine', () => {
  let animationEngine;
  let mockElement;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Create animation engine instance
    animationEngine = new AnimationEngine();
    
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.className = 'test-element';
    document.body.appendChild(mockElement);
    
    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    }));
    
    // Reset window.pageYOffset
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      writable: true
    });
  });

  afterEach(() => {
    // Clean up animation engine
    if (animationEngine) {
      animationEngine.destroy();
    }
  });

  describe('Property 18: Interactive Element Hover Responsiveness', () => {
    // Feature: portfolio-enhancement, Property 18: Interactive Element Hover Responsiveness
    // **Validates: Requirements 7.1**
    
    it('should provide hover effects for any interactive element type', () => {
      fc.assert(fc.property(
        fc.constantFrom('button', '.cta-button', '.submit-btn', '.skill-item', '.project-card', '.article-card', '.nav-links a'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, testId) => {
          // Create element based on type
          let element;
          if (elementType.startsWith('.')) {
            element = document.createElement('div');
            element.className = elementType.substring(1);
          } else {
            element = document.createElement(elementType);
          }
          
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Initialize hover effects
          animationEngine.addHoverEffect(element);
          
          // Verify hover effects are initialized
          expect(animationEngine.hasHoverEffects(element)).toBe(true);
          expect(element.dataset.hoverInitialized).toBe('true');
          
          // Simulate mouseenter event
          const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
          element.dispatchEvent(mouseEnterEvent);
          
          // Verify hover styles are applied
          expect(element.style.transition).toContain('0.3s ease');
          
          // Different elements should have different hover effects
          if (element.matches('button, .cta-button, .submit-btn')) {
            expect(element.style.transform).toContain('translateY(-2px)');
            expect(element.style.boxShadow).toContain('rgba(255, 255, 255, 0.1)');
          } else if (element.matches('.skill-item, .project-card, .article-card')) {
            expect(element.style.transform).toContain('translateY(-3px)');
            expect(element.style.boxShadow).toContain('rgba(0, 0, 0, 0.3)');
          } else if (element.matches('.nav-links a')) {
            expect(element.style.color).toBe('#ffffff');
            expect(element.style.textShadow).toContain('rgba(255, 255, 255, 0.3)');
          }
          
          // Simulate mouseleave event
          const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
          element.dispatchEvent(mouseLeaveEvent);
          
          // Verify hover styles are reset
          expect(element.style.transform).toBe('');
          expect(element.style.boxShadow).toBe('');
          expect(element.style.textShadow).toBe('');
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });

    it('should provide immediate click feedback for buttons', () => {
      fc.assert(fc.property(
        fc.constantFrom('button', 'div'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, testId) => {
          // Create button element
          const element = document.createElement(elementType);
          if (elementType === 'div') {
            element.className = 'cta-button';
          }
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Initialize hover effects (which includes click feedback for buttons)
          animationEngine.addHoverEffect(element);
          
          // Verify click feedback is initialized for buttons
          if (element.matches('button, .cta-button, .submit-btn')) {
            expect(element.dataset.clickInitialized).toBe('true');
            
            // Simulate mousedown event
            const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
            element.dispatchEvent(mouseDownEvent);
            
            // Verify click feedback is applied
            expect(element.style.transform).toContain('scale(0.98)');
            
            // Simulate mouseup event
            const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
            element.dispatchEvent(mouseUpEvent);
            
            // Verify click feedback is reset
            expect(element.style.transform).toBe('');
          }
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });

    it('should not duplicate hover effects on already initialized elements', () => {
      fc.assert(fc.property(
        fc.constantFrom('button', '.skill-item', '.nav-links a'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, testId) => {
          // Create element
          let element;
          if (elementType.startsWith('.')) {
            element = document.createElement('div');
            element.className = elementType.substring(1);
          } else {
            element = document.createElement(elementType);
          }
          
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Initialize hover effects twice
          animationEngine.addHoverEffect(element);
          animationEngine.addHoverEffect(element);
          
          // Should still only be initialized once
          expect(animationEngine.hasHoverEffects(element)).toBe(true);
          expect(element.dataset.hoverInitialized).toBe('true');
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 19: Scroll Animation Trigger Accuracy', () => {
    // Feature: portfolio-enhancement, Property 19: Scroll Animation Trigger Accuracy
    // **Validates: Requirements 7.2**
    
    it('should trigger animations when any element enters viewport', () => {
      fc.assert(fc.property(
        fc.constantFrom('div', 'section', 'article', 'p', 'h1', 'h2'),
        fc.constantFrom('fade-in'),  // Only use 'fade-in' class, not 'visible'
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, className, testId) => {
          // Create element with animation class
          const element = document.createElement(elementType);
          element.className = className;
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Mock IntersectionObserver to simulate viewport entry
          let observerCallback;
          global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
            observerCallback = callback;
            return {
              observe: vi.fn(),
              disconnect: vi.fn(),
              unobserve: vi.fn()
            };
          });
          
          // Initialize scroll animations
          animationEngine.initializeScrollAnimations();
          
          // Verify element starts invisible
          expect(element.style.opacity).toBe('0');
          expect(element.style.transform).toContain('translateY(20px)');
          expect(element.style.transition).toContain('opacity 0.6s ease, transform 0.6s ease');
          
          // Simulate element entering viewport
          const mockEntry = {
            target: element,
            isIntersecting: true
          };
          
          if (observerCallback) {
            observerCallback([mockEntry]);
          }
          
          // Verify animation is triggered
          expect(element.style.opacity).toBe('1');
          expect(element.style.transform).toContain('translateY(0)');
          expect(element.classList.contains('visible')).toBe(true);
          expect(animationEngine.isElementAnimated(element)).toBe(true);
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });

    it('should not re-animate already animated elements', () => {
      fc.assert(fc.property(
        fc.constantFrom('div', 'section', 'p'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, testId) => {
          // Create element
          const element = document.createElement(elementType);
          element.className = 'fade-in';
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Mock IntersectionObserver
          let observerCallback;
          global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
            observerCallback = callback;
            return {
              observe: vi.fn(),
              disconnect: vi.fn(),
              unobserve: vi.fn()
            };
          });
          
          // Initialize scroll animations
          animationEngine.initializeScrollAnimations();
          
          // Simulate element entering viewport first time
          const mockEntry = {
            target: element,
            isIntersecting: true
          };
          
          if (observerCallback) {
            observerCallback([mockEntry]);
          }
          
          // Verify element is animated
          expect(animationEngine.isElementAnimated(element)).toBe(true);
          
          // Reset styles to test re-animation prevention
          element.style.opacity = '0.5';
          element.style.transform = 'translateY(10px)';
          
          // Simulate element entering viewport again
          if (observerCallback) {
            observerCallback([mockEntry]);
          }
          
          // Element should not be re-animated (styles should remain as set)
          expect(element.style.opacity).toBe('0.5');
          expect(element.style.transform).toContain('translateY(10px)');
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });

    it('should handle dynamic element addition for scroll animations', () => {
      fc.assert(fc.property(
        fc.constantFrom('div', 'article', 'section'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (elementType, testId) => {
          // Initialize animation engine first
          animationEngine.init();
          
          // Create element dynamically
          const element = document.createElement(elementType);
          element.setAttribute('data-test-id', testId);
          document.body.appendChild(element);
          
          // Add scroll animation to new element
          animationEngine.addScrollAnimation(element);
          
          // Verify element is prepared for animation
          expect(element.style.opacity).toBe('0');
          expect(element.style.transform).toContain('translateY(20px)');
          expect(element.style.transition).toContain('opacity 0.6s ease, transform 0.6s ease');
          
          // Clean up
          element.remove();
        }
      ), { numRuns: 100 });
    });
  });

  describe('Basic functionality tests', () => {
    it('should initialize without errors', () => {
      expect(() => {
        animationEngine.init();
      }).not.toThrow();
      
      expect(animationEngine.isInitialized).toBe(true);
    });

    it('should not initialize twice', () => {
      animationEngine.init();
      const firstInitState = animationEngine.isInitialized;
      
      animationEngine.init();
      
      expect(firstInitState).toBe(true);
      expect(animationEngine.isInitialized).toBe(true);
    });

    it('should clean up resources when destroyed', () => {
      animationEngine.init();
      animationEngine.destroy();
      
      expect(animationEngine.isInitialized).toBe(false);
      expect(animationEngine.scrollObserver).toBe(null);
      expect(animationEngine.parallaxElements).toEqual([]);
      expect(animationEngine.animatedElements.size).toBe(0);
    });
  });

  describe('Property 20: Parallax Effect Implementation', () => {
    // Feature: portfolio-enhancement, Property 20: Parallax Effect Implementation
    // **Validates: Requirements 7.3**
    
    it('should create parallax background and move at different rate than scroll', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(1.0) }),
        (scrollY, speed) => {
          // Clean up any existing hero sections first
          document.querySelectorAll('.hero').forEach(el => el.remove());
          
          // Create hero section and ensure it's properly added to DOM
          const heroSection = document.createElement('section');
          heroSection.className = 'hero';
          document.body.appendChild(heroSection);
          
          // Mock window.pageYOffset
          Object.defineProperty(window, 'pageYOffset', {
            value: scrollY,
            writable: true
          });
          
          // Initialize parallax scrolling
          animationEngine.initializeParallaxScrolling();
          
          // Verify parallax background was created
          const parallaxBg = heroSection.querySelector('.parallax-bg');
          expect(parallaxBg).toBeTruthy();
          expect(parallaxBg.style.position).toBe('absolute');
          expect(parallaxBg.style.top).toBe('-20%');
          expect(parallaxBg.style.width).toBe('100%');
          expect(parallaxBg.style.height).toBe('120%');
          
          // Verify hero section has proper styling
          expect(heroSection.style.position).toBe('relative');
          expect(heroSection.style.overflow).toBe('hidden');
          
          // Verify parallax element is tracked (should be the last one added)
          const parallaxElements = animationEngine.getParallaxElements();
          expect(parallaxElements.length).toBeGreaterThan(0);
          
          // Find the parallax element that matches our created background
          const matchingElement = parallaxElements.find(pe => pe.element === parallaxBg);
          expect(matchingElement).toBeTruthy();
          expect(matchingElement.speed).toBe(0.5);
          
          // Simulate scroll event
          animationEngine.handleScroll();
          
          // Verify parallax movement (background moves at different rate)
          const expectedTransform = -(scrollY * 0.5);
          expect(parallaxBg.style.transform).toBe(`translateY(${expectedTransform}px)`);
          
          // Clean up
          heroSection.remove();
        }
      ), { numRuns: 100 });
    });

    it('should handle multiple parallax elements with different speeds', () => {
      fc.assert(fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.array(fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) }), { minLength: 1, maxLength: 5 }),
        (scrollY, speeds) => {
          // Create hero section
          const heroSection = document.createElement('section');
          heroSection.className = 'hero';
          document.body.appendChild(heroSection);
          
          // Mock window.pageYOffset
          Object.defineProperty(window, 'pageYOffset', {
            value: scrollY,
            writable: true
          });
          
          // Initialize parallax scrolling
          animationEngine.initializeParallaxScrolling();
          
          // Add additional parallax elements with different speeds
          speeds.forEach((speed, index) => {
            const element = document.createElement('div');
            element.className = `parallax-element-${index}`;
            heroSection.appendChild(element);
            
            animationEngine.parallaxElements.push({
              element: element,
              speed: speed
            });
          });
          
          // Simulate scroll event
          animationEngine.handleScroll();
          
          // Verify each element moves at its specified speed
          const parallaxElements = animationEngine.getParallaxElements();
          parallaxElements.forEach(({ element, speed }) => {
            const expectedTransform = -(scrollY * speed);
            expect(element.style.transform).toBe(`translateY(${expectedTransform}px)`);
          });
          
          // Clean up
          heroSection.remove();
        }
      ), { numRuns: 100 });
    });

    it('should not create duplicate parallax backgrounds', () => {
      fc.assert(fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        (testId) => {
          // Create hero section with existing parallax background
          const heroSection = document.createElement('section');
          heroSection.className = 'hero';
          heroSection.setAttribute('data-test-id', testId);
          
          const existingBg = document.createElement('div');
          existingBg.className = 'parallax-bg';
          heroSection.appendChild(existingBg);
          
          document.body.appendChild(heroSection);
          
          // Initialize parallax scrolling
          animationEngine.initializeParallaxScrolling();
          
          // Verify only one parallax background exists
          const parallaxBgs = heroSection.querySelectorAll('.parallax-bg');
          expect(parallaxBgs.length).toBe(1);
          expect(parallaxBgs[0]).toBe(existingBg);
          
          // Clean up
          heroSection.remove();
        }
      ), { numRuns: 100 });
    });
  });
});

describe('Property 21: Interaction Feedback Immediacy', () => {
  // Feature: portfolio-enhancement, Property 21: Interaction Feedback Immediacy
  // **Validates: Requirements 7.4**
  
  let animationEngine;
  
  beforeEach(() => {
    document.body.innerHTML = '';
    animationEngine = new AnimationEngine();
  });
  
  it('should provide immediate visual feedback for any button interaction', () => {
    fc.assert(fc.property(
      fc.constantFrom('button', 'div', 'a'),
      fc.constantFrom('cta-button', 'submit-btn', 'action-button'),
      fc.string({ minLength: 1, maxLength: 20 }),
      (elementType, className, testId) => {
        // Create interactive element
        const element = document.createElement(elementType);
        element.className = className;
        element.setAttribute('data-test-id', testId);
        document.body.appendChild(element);
        
        // Initialize interaction feedback
        animationEngine.addClickFeedback(element);
        
        // Verify click feedback is initialized
        expect(element.dataset.clickInitialized).toBe('true');
        
        // Simulate mousedown event (immediate feedback)
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        element.dispatchEvent(mouseDownEvent);
        
        // Verify immediate visual feedback is applied
        expect(element.style.transform).toContain('scale(0.98)');
        
        // Simulate mouseup event
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        element.dispatchEvent(mouseUpEvent);
        
        // Verify feedback is reset
        expect(element.style.transform).toBe('');
        
        // Test mouseleave also resets feedback
        element.style.transform = 'scale(0.98)';
        const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
        element.dispatchEvent(mouseLeaveEvent);
        
        expect(element.style.transform).toBe('');
        
        // Clean up
        element.remove();
      }
    ), { numRuns: 100 });
  });

  it('should not duplicate click feedback initialization', () => {
    fc.assert(fc.property(
      fc.constantFrom('button', 'div'),
      fc.string({ minLength: 1, maxLength: 20 }),
      (elementType, testId) => {
        // Create element
        const element = document.createElement(elementType);
        element.className = 'cta-button';
        element.setAttribute('data-test-id', testId);
        document.body.appendChild(element);
        
        // Initialize click feedback multiple times
        animationEngine.addClickFeedback(element);
        animationEngine.addClickFeedback(element);
        animationEngine.addClickFeedback(element);
        
        // Should still only be initialized once
        expect(element.dataset.clickInitialized).toBe('true');
        
        // Clean up
        element.remove();
      }
    ), { numRuns: 100 });
  });

  it('should provide feedback for any link interaction', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      (linkText, testId) => {
        // Create link element
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = linkText;
        link.setAttribute('data-test-id', testId);
        document.body.appendChild(link);
        
        // Initialize interaction feedback
        animationEngine.addClickFeedback(link);
        
        // Verify click feedback is initialized
        expect(link.dataset.clickInitialized).toBe('true');
        
        // Simulate interaction
        const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
        link.dispatchEvent(mouseDownEvent);
        
        // Verify immediate feedback
        expect(link.style.transform).toContain('scale(0.98)');
        
        // Clean up
        link.remove();
      }
    ), { numRuns: 100 });
  });
});