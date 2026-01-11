// Feature: portfolio-enhancement, Property 15: Image Lazy Loading Efficiency
// **Validates: Requirements 6.2**

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { LazyImageLoader } from '../js/components/LazyImageLoader.js';

describe('Image Lazy Loading Efficiency', () => {
  let dom;
  let document;
  let window;
  let mockIntersectionObserver;
  let observerCallback;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`, {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;
    global.Image = window.Image;
    global.btoa = (str) => Buffer.from(str).toString('base64');

    // Mock IntersectionObserver with shared methods
    const mockObserve = vi.fn();
    const mockUnobserve = vi.fn();
    const mockDisconnect = vi.fn();
    
    const IntersectionObserverMock = vi.fn().mockImplementation((callback, options) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      };
    });
    
    // Set IntersectionObserver on both global and window
    global.IntersectionObserver = IntersectionObserverMock;
    window.IntersectionObserver = IntersectionObserverMock;
    
    // Store references to the mock methods for assertions
    mockIntersectionObserver = {
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect
    };
  });

  // Property 15: Image Lazy Loading Efficiency
  // For any images on the page, they should only load when they are about to enter the viewport
  it('should only load images when they enter the viewport', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          dataSrc: fc.webUrl(),
          alt: fc.string({ minLength: 1, maxLength: 50 }),
          width: fc.integer({ min: 50, max: 1000 }),
          height: fc.integer({ min: 50, max: 1000 }),
          isIntersecting: fc.boolean()
        }),
        { minLength: 1, maxLength: 10 }
      ),
      (imageData) => {
        const body = document.body;
        body.innerHTML = '';
        
        // Initialize lazy loader first
        const lazyLoader = new LazyImageLoader();
        
        // Reset mock call counts after initialization but keep the constructor count
        mockIntersectionObserver.observe.mockClear();
        mockIntersectionObserver.unobserve.mockClear();
        mockIntersectionObserver.disconnect.mockClear();
        
        // Create lazy images and add them to the loader
        const images = imageData.map((data, index) => {
          const img = document.createElement('img');
          img.id = `img-${index}`;
          img.setAttribute('data-src', data.dataSrc);
          img.alt = data.alt;
          img.width = data.width;
          img.height = data.height;
          body.appendChild(img);
          
          // Add image to the lazy loader (this will trigger observation)
          lazyLoader.addImage(img);
          
          return { element: img, data };
        });
        
        // Verify that images are being observed (observe should be called for each image)
        expect(mockIntersectionObserver.observe).toHaveBeenCalledTimes(images.length);
        
        // Verify all images are being observed
        images.forEach(({ element }) => {
          expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(element);
          
          // Verify placeholder is applied
          expect(element.classList.contains('lazy-placeholder')).toBe(true);
          
          // Verify original src is not set (should be placeholder)
          expect(element.src).not.toBe(element.getAttribute('data-src'));
          expect(element.src).toMatch(/^data:image\/svg\+xml;base64,/);
        });
        
        // Simulate intersection events
        const intersectionEntries = images.map(({ element, data }) => ({
          target: element,
          isIntersecting: data.isIntersecting
        }));
        
        // Trigger intersection callback
        observerCallback(intersectionEntries);
        
        // Verify only intersecting images are processed for loading
        images.forEach(({ element, data }) => {
          if (data.isIntersecting) {
            // Should be unobserved after intersection
            expect(mockIntersectionObserver.unobserve).toHaveBeenCalledWith(element);
          } else {
            // Should still be observed if not intersecting
            expect(mockIntersectionObserver.unobserve).not.toHaveBeenCalledWith(element);
          }
        });
        
        // Verify efficiency: non-intersecting images should not load
        const nonIntersectingImages = images.filter(({ data }) => !data.isIntersecting);
        nonIntersectingImages.forEach(({ element }) => {
          // Should still have data-src attribute (not loaded)
          expect(element.getAttribute('data-src')).toBeTruthy();
          // Should still have placeholder class
          expect(element.classList.contains('lazy-placeholder')).toBe(true);
        });
        
        lazyLoader.destroy();
      }
    ), { numRuns: 100 });
  });

  it('should handle progressive loading with placeholders', () => {
    fc.assert(fc.property(
      fc.record({
        images: fc.array(
          fc.record({
            dataSrc: fc.webUrl(),
            dataSrcset: fc.oneof(
              fc.constant(null),
              fc.string({ minLength: 10, maxLength: 100 })
            ),
            width: fc.integer({ min: 100, max: 800 }),
            height: fc.integer({ min: 100, max: 600 }),
            shouldLoadSuccessfully: fc.boolean()
          }),
          { minLength: 1, maxLength: 5 }
        )
      }),
      (testData) => {
        const body = document.body;
        body.innerHTML = '';
        
        // Create images with lazy loading attributes
        const imageElements = testData.images.map((imgData, index) => {
          const img = document.createElement('img');
          img.id = `test-img-${index}`;
          img.setAttribute('data-src', imgData.dataSrc);
          
          if (imgData.dataSrcset) {
            img.setAttribute('data-srcset', imgData.dataSrcset);
          }
          
          img.width = imgData.width;
          img.height = imgData.height;
          img.alt = `Test image ${index}`;
          
          body.appendChild(img);
          return { element: img, data: imgData };
        });
        
        const lazyLoader = new LazyImageLoader({
          placeholderClass: 'test-placeholder',
          loadedClass: 'test-loaded',
          errorClass: 'test-error'
        });
        
        // Manually add images to the loader since they were created after initialization
        imageElements.forEach(({ element }) => {
          lazyLoader.addImage(element);
        });
        
        // Verify placeholder generation
        imageElements.forEach(({ element, data }) => {
          // Should have placeholder class
          expect(element.classList.contains('test-placeholder')).toBe(true);
          
          // Should have generated placeholder src
          expect(element.src).toMatch(/^data:image\/svg\+xml;base64,/);
          
          // Should contain loading text in placeholder
          const decodedSvg = atob(element.src.split(',')[1]);
          expect(decodedSvg).toMatch(/Loading\.\.\./);
          expect(decodedSvg).toMatch(new RegExp(`width="${data.width}"`));
          expect(decodedSvg).toMatch(new RegExp(`height="${data.height}"`));
        });
        
        lazyLoader.destroy();
      }
    ), { numRuns: 100 });
  });

  it('should provide fallback behavior when IntersectionObserver is not supported', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          dataSrc: fc.webUrl(),
          alt: fc.string({ minLength: 1, maxLength: 30 })
        }),
        { minLength: 1, maxLength: 5 }
      ),
      (imageData) => {
        // Remove IntersectionObserver support
        delete global.IntersectionObserver;
        delete window.IntersectionObserver;
        
        const body = document.body;
        body.innerHTML = '';
        
        // Create lazy images
        imageData.forEach((data, index) => {
          const img = document.createElement('img');
          img.id = `fallback-img-${index}`;
          img.setAttribute('data-src', data.dataSrc);
          img.alt = data.alt;
          body.appendChild(img);
        });
        
        // Mock Image constructor for fallback test
        const mockImages = [];
        global.Image = vi.fn().mockImplementation(() => {
          const mockImg = {
            onload: null,
            onerror: null,
            src: '',
            srcset: ''
          };
          mockImages.push(mockImg);
          return mockImg;
        });
        
        // Initialize lazy loader (should use fallback)
        const lazyLoader = new LazyImageLoader();
        
        // Verify fallback behavior - all images should be processed immediately
        const lazyImages = body.querySelectorAll('img[data-src]');
        expect(lazyImages.length).toBe(imageData.length);
        
        // Simulate successful loading for all images
        mockImages.forEach(mockImg => {
          if (mockImg.onload) {
            setTimeout(() => mockImg.onload(), 0);
          }
        });
        
        // In fallback mode, all images should be processed
        expect(global.Image).toHaveBeenCalledTimes(imageData.length);
        
        lazyLoader.destroy();
        
        // Restore IntersectionObserver for other tests
        const IntersectionObserverMock = vi.fn().mockImplementation((callback) => ({
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn()
        }));
        global.IntersectionObserver = IntersectionObserverMock;
        window.IntersectionObserver = IntersectionObserverMock;
      }
    ), { numRuns: 100 });
  });
});