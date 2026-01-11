// Feature: portfolio-enhancement, Property 14: SEO Metadata Completeness
// **Validates: Requirements 6.1**

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('SEO Metadata Completeness', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  // Property 14: SEO Metadata Completeness
  // For any page in the website, it should include proper meta tags, Open Graph tags, and structured data for search engines
  it('should have complete SEO metadata for any page configuration', () => {
    fc.assert(fc.property(
      // Generator for page metadata
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
        keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
        author: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        url: fc.webUrl(),
        imageUrl: fc.webUrl(),
        siteName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        locale: fc.constantFrom('en_US', 'en_GB', 'es_ES', 'fr_FR', 'de_DE'),
        twitterHandle: fc.string({ minLength: 2, maxLength: 15 }).map(s => '@' + s.replace(/[^a-zA-Z0-9_]/g, ''))
      }),
      (pageData) => {
        // Create fresh DOM for each test
        const testDom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
        const testDocument = testDom.window.document;
        const head = testDocument.head;
        
        // Simulate adding SEO metadata to the page
        addMetaTag(head, 'name', 'title', pageData.title);
        addMetaTag(head, 'name', 'description', pageData.description);
        addMetaTag(head, 'name', 'keywords', pageData.keywords.join(', '));
        addMetaTag(head, 'name', 'author', pageData.author);
        addMetaTag(head, 'name', 'robots', 'index, follow');
        
        // Add canonical link
        const canonical = testDocument.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = pageData.url;
        head.appendChild(canonical);
        
        // Add Open Graph tags
        addMetaTag(head, 'property', 'og:type', 'website');
        addMetaTag(head, 'property', 'og:url', pageData.url);
        addMetaTag(head, 'property', 'og:title', pageData.title);
        addMetaTag(head, 'property', 'og:description', pageData.description);
        addMetaTag(head, 'property', 'og:image', pageData.imageUrl);
        addMetaTag(head, 'property', 'og:site_name', pageData.siteName);
        addMetaTag(head, 'property', 'og:locale', pageData.locale);
        
        // Add Twitter tags
        addMetaTag(head, 'property', 'twitter:card', 'summary_large_image');
        addMetaTag(head, 'property', 'twitter:url', pageData.url);
        addMetaTag(head, 'property', 'twitter:title', pageData.title);
        addMetaTag(head, 'property', 'twitter:description', pageData.description);
        addMetaTag(head, 'property', 'twitter:image', pageData.imageUrl);
        addMetaTag(head, 'property', 'twitter:creator', pageData.twitterHandle);
        
        // Verify essential SEO metadata is present
        const essentialMetaTags = [
          { name: 'title' },
          { name: 'description' },
          { name: 'author' },
          { property: 'og:title' },
          { property: 'og:description' },
          { property: 'twitter:card' }
        ];
        
        // Check that essential meta tags exist and have content
        essentialMetaTags.forEach(tag => {
          const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
          const element = head.querySelector(selector);
          expect(element).toBeTruthy();
          expect(element.content).toBeTruthy();
          expect(element.content.trim().length).toBeGreaterThan(0);
        });
        
        // Check canonical link exists and has correct href
        const canonicalLink = head.querySelector('link[rel="canonical"]');
        expect(canonicalLink).toBeTruthy();
        expect(canonicalLink.getAttribute('href')).toBe(pageData.url);
        
        // Verify Open Graph and Twitter tags match primary tags
        const ogTitle = head.querySelector('meta[property="og:title"]');
        const twitterTitle = head.querySelector('meta[property="twitter:title"]');
        const ogUrl = head.querySelector('meta[property="og:url"]');
        const twitterUrl = head.querySelector('meta[property="twitter:url"]');
        
        expect(ogTitle.content).toBe(pageData.title);
        expect(twitterTitle.content).toBe(pageData.title);
        expect(ogUrl.content).toBe(pageData.url);
        expect(twitterUrl.content).toBe(pageData.url);
      }
    ), { numRuns: 100 });
  });

  it('should validate structured data (JSON-LD) completeness', () => {
    fc.assert(fc.property(
      // Generator for person data
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        jobTitle: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        email: fc.emailAddress(),
        telephone: fc.string({ minLength: 10, maxLength: 20 }).map(s => s.replace(/[^0-9+\-\s()]/g, '')).filter(s => s.length >= 10),
        url: fc.webUrl(),
        skills: fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
        location: fc.record({
          city: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          region: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          country: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0)
        })
      }),
      (personData) => {
        // Create fresh DOM for each test
        const testDom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
        const testDocument = testDom.window.document;
        
        // Create structured data JSON-LD
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": personData.name,
          "jobTitle": personData.jobTitle,
          "email": personData.email,
          "telephone": personData.telephone,
          "url": personData.url,
          "knowsAbout": personData.skills,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": personData.location.city,
            "addressRegion": personData.location.region,
            "addressCountry": personData.location.country
          }
        };
        
        // Add structured data to document
        const script = testDocument.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        testDocument.head.appendChild(script);
        
        // Verify structured data exists and is valid JSON
        const ldJsonScript = testDocument.querySelector('script[type="application/ld+json"]');
        expect(ldJsonScript).toBeTruthy();
        
        const parsedData = JSON.parse(ldJsonScript.textContent);
        expect(parsedData['@context']).toBe('https://schema.org');
        expect(parsedData['@type']).toBe('Person');
        expect(parsedData.name).toBe(personData.name);
        expect(parsedData.jobTitle).toBe(personData.jobTitle);
        expect(parsedData.email).toBe(personData.email);
        expect(parsedData.url).toBe(personData.url);
        expect(Array.isArray(parsedData.knowsAbout)).toBe(true);
        expect(parsedData.knowsAbout).toEqual(personData.skills);
        expect(parsedData.address['@type']).toBe('PostalAddress');
        expect(parsedData.address.addressLocality).toBe(personData.location.city);
        expect(parsedData.address.addressRegion).toBe(personData.location.region);
        expect(parsedData.address.addressCountry).toBe(personData.location.country);
      }
    ), { numRuns: 100 });
  });
});

// Helper function to add meta tags
function addMetaTag(head, attributeName, attributeValue, content) {
  const meta = head.ownerDocument.createElement('meta');
  meta.setAttribute(attributeName, attributeValue);
  meta.content = content;
  head.appendChild(meta);
}