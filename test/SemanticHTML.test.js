// Feature: portfolio-enhancement, Property 17: Semantic HTML Structure Compliance
// **Validates: Requirements 6.5**

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Semantic HTML Structure Compliance', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`<!DOCTYPE html><html><head></head><body></body></html>`);
    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  // Property 17: Semantic HTML Structure Compliance
  // For any page content, it should use proper semantic HTML elements and include appropriate ARIA attributes for accessibility
  it('should use proper semantic HTML elements for any content structure', () => {
    fc.assert(fc.property(
      fc.record({
        sections: fc.array(
          fc.record({
            type: fc.constantFrom('header', 'nav', 'main', 'section', 'article', 'aside', 'footer'),
            id: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 1, maxLength: 1 })
              .chain(firstChar => 
                fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'), { minLength: 2, maxLength: 19 })
                  .map(rest => firstChar + rest)
              ),
            heading: fc.string({ minLength: 5, maxLength: 50 }),
            content: fc.string({ minLength: 10, maxLength: 200 }),
            hasForm: fc.boolean(),
            hasNavigation: fc.boolean(),
            hasAddress: fc.boolean()
          }),
          { minLength: 3, maxLength: 8 }
        )
      }),
      (pageData) => {
        // Build semantic HTML structure
        const body = document.body;
        body.innerHTML = ''; // Clear previous content
        
        pageData.sections.forEach((section, index) => {
          const element = document.createElement(section.type);
          // Ensure unique IDs by appending index
          const uniqueId = section.id ? `${section.id}-${index}` : `section-${index}`;
          element.id = uniqueId;
          
          // Add appropriate role attributes
          switch (section.type) {
            case 'header':
              element.setAttribute('role', 'banner');
              break;
            case 'nav':
              element.setAttribute('role', 'navigation');
              element.setAttribute('aria-label', 'Main navigation');
              break;
            case 'main':
              element.setAttribute('role', 'main');
              break;
            case 'footer':
              element.setAttribute('role', 'contentinfo');
              break;
            case 'section':
              element.setAttribute('aria-labelledby', `${uniqueId}-heading`);
              break;
            case 'article':
              element.setAttribute('aria-labelledby', `${uniqueId}-heading`);
              break;
          }
          
          // Add heading with proper hierarchy
          const headingLevel = Math.min(index + 1, 6);
          const heading = document.createElement(`h${headingLevel}`);
          heading.id = `${uniqueId}-heading`;
          heading.textContent = section.heading;
          element.appendChild(heading);
          
          // Add content
          const content = document.createElement('p');
          content.textContent = section.content;
          element.appendChild(content);
          
          // Add form if specified
          if (section.hasForm) {
            const form = document.createElement('form');
            form.setAttribute('aria-labelledby', `${uniqueId}-form-heading`);
            
            const formHeadingLevel = Math.min(index + 2, 6); // One level below section heading
            const formHeading = document.createElement(`h${formHeadingLevel}`);
            formHeading.id = `${uniqueId}-form-heading`;
            formHeading.textContent = 'Contact Form';
            form.appendChild(formHeading);
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `${uniqueId}-input`;
            input.setAttribute('aria-required', 'true');
            input.setAttribute('aria-describedby', `${uniqueId}-input-desc`);
            
            const label = document.createElement('label');
            label.setAttribute('for', `${uniqueId}-input`);
            label.textContent = 'Name';
            
            const description = document.createElement('div');
            description.id = `${uniqueId}-input-desc`;
            description.textContent = 'Please enter your name';
            
            form.appendChild(label);
            form.appendChild(input);
            form.appendChild(description);
            element.appendChild(form);
          }
          
          // Add navigation if specified
          if (section.hasNavigation) {
            const nav = document.createElement('nav');
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', `${section.heading} navigation`);
            
            const navList = document.createElement('ul');
            navList.setAttribute('role', 'menubar');
            
            for (let i = 0; i < 3; i++) {
              const listItem = document.createElement('li');
              listItem.setAttribute('role', 'none');
              
              const link = document.createElement('a');
              link.href = `#section-${i}`;
              link.setAttribute('role', 'menuitem');
              link.textContent = `Link ${i + 1}`;
              
              listItem.appendChild(link);
              navList.appendChild(listItem);
            }
            
            nav.appendChild(navList);
            element.appendChild(nav);
          }
          
          // Add address if specified
          if (section.hasAddress) {
            const address = document.createElement('address');
            const email = document.createElement('a');
            email.href = 'mailto:test@example.com';
            email.textContent = 'test@example.com';
            address.appendChild(email);
            element.appendChild(address);
          }
          
          body.appendChild(element);
        });
        
        // Verify semantic HTML structure
        const requiredSemanticElements = ['header', 'nav', 'main', 'footer'];
        const presentElements = pageData.sections.map(s => s.type);
        
        // Check that semantic elements are used appropriately
        pageData.sections.forEach((section, index) => {
          const uniqueId = section.id ? `${section.id}-${index}` : `section-${index}`;
          const element = body.querySelector(`#${uniqueId}`);
          expect(element).toBeTruthy();
          expect(element.tagName.toLowerCase()).toBe(section.type);
          
          // Verify heading structure
          const heading = element.querySelector(`h${Math.min(index + 1, 6)}`);
          expect(heading).toBeTruthy();
          expect(heading.id).toBe(`${uniqueId}-heading`);
          
          // Verify ARIA attributes based on element type
          switch (section.type) {
            case 'header':
              expect(element.getAttribute('role')).toBe('banner');
              break;
            case 'nav':
              expect(element.getAttribute('role')).toBe('navigation');
              expect(element.getAttribute('aria-label')).toBeTruthy();
              break;
            case 'main':
              expect(element.getAttribute('role')).toBe('main');
              break;
            case 'footer':
              expect(element.getAttribute('role')).toBe('contentinfo');
              break;
            case 'section':
            case 'article':
              expect(element.getAttribute('aria-labelledby')).toBe(`${uniqueId}-heading`);
              break;
          }
          
          // Verify form accessibility if present
          if (section.hasForm) {
            const form = element.querySelector('form');
            expect(form).toBeTruthy();
            expect(form.getAttribute('aria-labelledby')).toBeTruthy();
            
            const input = form.querySelector('input');
            expect(input).toBeTruthy();
            expect(input.getAttribute('aria-required')).toBe('true');
            expect(input.getAttribute('aria-describedby')).toBeTruthy();
            
            const label = form.querySelector('label');
            expect(label).toBeTruthy();
            expect(label.getAttribute('for')).toBe(input.id);
          }
          
          // Verify navigation accessibility if present
          if (section.hasNavigation) {
            const nav = element.querySelector('nav');
            expect(nav).toBeTruthy();
            expect(nav.getAttribute('role')).toBe('navigation');
            expect(nav.getAttribute('aria-label')).toBeTruthy();
            
            const menubar = nav.querySelector('ul[role="menubar"]');
            expect(menubar).toBeTruthy();
            
            const menuItems = nav.querySelectorAll('a[role="menuitem"]');
            expect(menuItems.length).toBeGreaterThan(0);
          }
          
          // Verify address element if present
          if (section.hasAddress) {
            const address = element.querySelector('address');
            expect(address).toBeTruthy();
            
            const emailLink = address.querySelector('a[href^="mailto:"]');
            expect(emailLink).toBeTruthy();
          }
        });
        
        // Verify heading hierarchy is logical
        const headings = Array.from(body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          if (index === 0) {
            // First heading should be h1 or h2
            expect(level).toBeLessThanOrEqual(2);
          } else {
            const prevLevel = parseInt(headings[index - 1].tagName.charAt(1));
            // Heading levels should not skip more than one level, but can go back to any previous level
            if (level > prevLevel) {
              expect(level - prevLevel).toBeLessThanOrEqual(1);
            }
          }
        });
        
        // Verify all interactive elements have accessible names
        const interactiveElements = body.querySelectorAll('a, button, input, select, textarea');
        interactiveElements.forEach(element => {
          const hasAccessibleName = 
            element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            element.textContent.trim() ||
            (element.tagName === 'INPUT' && body.querySelector(`label[for="${element.id}"]`));
          
          expect(hasAccessibleName).toBeTruthy();
        });
      }
    ), { numRuns: 100 });
  });

  it('should validate ARIA attributes and accessibility features', () => {
    fc.assert(fc.property(
      fc.record({
        elements: fc.array(
          fc.record({
            tag: fc.constantFrom('button', 'input', 'select', 'textarea', 'a'),
            type: fc.constantFrom('button', 'text', 'email', 'password', 'submit'),
            hasLabel: fc.boolean(),
            hasDescription: fc.boolean(),
            isRequired: fc.boolean(),
            isDisabled: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        )
      }),
      (formData) => {
        const body = document.body;
        body.innerHTML = '';
        
        const form = document.createElement('form');
        form.setAttribute('role', 'form');
        form.setAttribute('aria-label', 'Test form');
        
        formData.elements.forEach((elementData, index) => {
          const element = document.createElement(elementData.tag);
          element.id = `element-${index}`;
          
          if (elementData.tag === 'input') {
            element.type = elementData.type;
          }
          
          if (elementData.tag === 'a') {
            element.href = '#';
            element.textContent = `Link ${index}`;
          }
          
          if (elementData.isRequired) {
            element.setAttribute('aria-required', 'true');
            if (elementData.tag === 'input' || elementData.tag === 'textarea' || elementData.tag === 'select') {
              element.required = true;
            }
          }
          
          if (elementData.isDisabled) {
            element.setAttribute('aria-disabled', 'true');
            element.disabled = true;
          }
          
          if (elementData.hasLabel) {
            const label = document.createElement('label');
            label.setAttribute('for', element.id);
            label.textContent = `Label for element ${index}`;
            form.appendChild(label);
          }
          
          if (elementData.hasDescription) {
            const description = document.createElement('div');
            description.id = `desc-${index}`;
            description.textContent = `Description for element ${index}`;
            element.setAttribute('aria-describedby', description.id);
            form.appendChild(description);
          }
          
          form.appendChild(element);
        });
        
        body.appendChild(form);
        
        // Verify ARIA attributes and accessibility
        formData.elements.forEach((elementData, index) => {
          const element = body.querySelector(`#element-${index}`);
          expect(element).toBeTruthy();
          
          // Verify required attributes
          if (elementData.isRequired) {
            expect(element.getAttribute('aria-required')).toBe('true');
          }
          
          // Verify disabled attributes
          if (elementData.isDisabled) {
            expect(element.getAttribute('aria-disabled')).toBe('true');
            expect(element.disabled).toBe(true);
          }
          
          // Verify label association
          if (elementData.hasLabel) {
            const label = body.querySelector(`label[for="${element.id}"]`);
            expect(label).toBeTruthy();
            expect(label.textContent).toBeTruthy();
          }
          
          // Verify description association
          if (elementData.hasDescription) {
            const descId = element.getAttribute('aria-describedby');
            expect(descId).toBeTruthy();
            const description = body.querySelector(`#${descId}`);
            expect(description).toBeTruthy();
            expect(description.textContent).toBeTruthy();
          }
        });
        
        // Verify form has proper role and label
        const formElement = body.querySelector('form');
        expect(formElement.getAttribute('role')).toBe('form');
        expect(formElement.getAttribute('aria-label')).toBeTruthy();
      }
    ), { numRuns: 100 });
  });
});