import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContactForm } from '../js/components/ContactForm.js';
import fc from 'fast-check';

describe('ContactForm', () => {
  let contactForm;
  let formElement;

  beforeEach(() => {
    // Create a mock form element
    document.body.innerHTML = `
      <form id="contact-form">
        <div class="form-group">
          <input type="text" name="name" placeholder="Your Name" required>
        </div>
        <div class="form-group">
          <input type="email" name="email" placeholder="Your Email" required>
        </div>
        <div class="form-group">
          <input type="text" name="subject" placeholder="Subject" required>
        </div>
        <div class="form-group">
          <textarea name="message" placeholder="Your Message" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Send Message</button>
      </form>
    `;
    
    formElement = document.getElementById('contact-form');
    contactForm = new ContactForm(formElement);
  });

  // Feature: portfolio-enhancement, Property 6: Contact Form Validation Completeness
  describe('Property 6: Contact Form Validation Completeness', () => {
    it('should validate all required fields and display specific error messages for any invalid input', () => {
      fc.assert(fc.property(
        fc.record({
          name: fc.oneof(
            fc.constant(''), // empty
            fc.string({ minLength: 1, maxLength: 1 }), // too short
            fc.string().filter(s => /[^a-zA-Z\s]/.test(s)), // invalid characters
            fc.string({ minLength: 2 }).filter(s => /^[a-zA-Z\s]+$/.test(s)) // valid
          ),
          email: fc.oneof(
            fc.constant(''), // empty
            fc.string().filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)), // invalid format
            fc.emailAddress() // valid
          ),
          subject: fc.oneof(
            fc.constant(''), // empty
            fc.string({ minLength: 1, maxLength: 4 }), // too short
            fc.string({ minLength: 101 }), // too long
            fc.string({ minLength: 5, maxLength: 100 }) // valid
          ),
          message: fc.oneof(
            fc.constant(''), // empty
            fc.string({ minLength: 1, maxLength: 9 }), // too short
            fc.string({ minLength: 1001 }), // too long
            fc.string({ minLength: 10, maxLength: 1000 }) // valid
          )
        }),
        (formData) => {
          // Set form field values
          contactForm.fields.name.value = formData.name;
          contactForm.fields.email.value = formData.email;
          contactForm.fields.subject.value = formData.subject;
          contactForm.fields.message.value = formData.message;

          // Validate all fields
          const isValid = contactForm.validateAllFields();

          // Check if validation result matches expected validity
          const expectedValid = 
            formData.name.length >= 2 && /^[a-zA-Z\s]+$/.test(formData.name) &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
            formData.subject.length >= 5 && formData.subject.length <= 100 &&
            formData.message.length >= 10 && formData.message.length <= 1000;

          expect(isValid).toBe(expectedValid);

          // If invalid, check that error messages are displayed
          if (!expectedValid) {
            const errorElements = document.querySelectorAll('.field-error');
            const hasVisibleErrors = Array.from(errorElements).some(el => 
              el.style.display === 'block' && el.style.opacity === '1'
            );
            expect(hasVisibleErrors).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Feature: portfolio-enhancement, Property 7: Contact Form Success State Consistency
  describe('Property 7: Contact Form Success State Consistency', () => {
    it('should display confirmation message and clear form for any valid form submission', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          name: fc.constantFrom('John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Wilson', 'Carol Brown'),
          email: fc.emailAddress(),
          subject: fc.constantFrom('Hello there', 'Test subject', 'Important message', 'Quick question', 'Follow up'),
          message: fc.constantFrom(
            'This is a test message with enough characters to pass validation.',
            'Hello, I would like to get in touch with you about your services.',
            'Thank you for your time and consideration. Looking forward to hearing from you.',
            'I have a question about your portfolio and would appreciate your response.',
            'This is another valid message that meets all the requirements for testing.'
          )
        }),
        async (validFormData) => {
          // Set valid form field values
          contactForm.fields.name.value = validFormData.name;
          contactForm.fields.email.value = validFormData.email;
          contactForm.fields.subject.value = validFormData.subject;
          contactForm.fields.message.value = validFormData.message;

          // Submit the form
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          const submitResult = contactForm.handleSubmit(submitEvent);

          // Should return true for valid submission
          expect(submitResult).toBe(true);

          // Wait for async submission to complete
          await new Promise(resolve => setTimeout(resolve, 1100));

          // Check that success message is displayed
          const successElement = document.getElementById('form-success');
          expect(successElement).toBeTruthy();
          expect(successElement.style.display).toBe('block');
          expect(successElement.style.opacity).toBe('1');
          expect(successElement.textContent).toBe('Thank you for your message! I will get back to you soon.');

          // Check that form fields are cleared
          expect(contactForm.fields.name.value).toBe('');
          expect(contactForm.fields.email.value).toBe('');
          expect(contactForm.fields.subject.value).toBe('');
          expect(contactForm.fields.message.value).toBe('');
        }
      ), { numRuns: 10 }); // Reduced runs for async test performance
    }, 30000); // 30 second timeout for async property test
  });

  // Feature: portfolio-enhancement, Property 8: Real-time Form Validation Responsiveness
  describe('Property 8: Real-time Form Validation Responsiveness', () => {
    it('should provide immediate validation feedback for any user input in form fields', () => {
      fc.assert(fc.property(
        fc.record({
          fieldName: fc.constantFrom('name', 'email', 'subject', 'message'),
          inputValue: fc.string()
        }),
        (testData) => {
          const field = contactForm.fields[testData.fieldName];
          if (!field) return true; // Skip if field doesn't exist
          
          // Set the field value
          field.value = testData.inputValue;
          
          // Trigger input event (simulating real-time typing)
          const inputEvent = new Event('input', { bubbles: true });
          field.dispatchEvent(inputEvent);
          
          // Check that validation was performed
          const errorElement = document.getElementById(`${testData.fieldName}-error`);
          expect(errorElement).toBeTruthy();
          
          // The error element should either be visible (for invalid input) or hidden (for valid input)
          const isVisible = errorElement.style.display === 'block' && errorElement.style.opacity === '1';
          const isHidden = errorElement.style.display === 'none' || errorElement.style.opacity === '0';
          
          expect(isVisible || isHidden).toBe(true);
          
          // If field has a border color change, it should be either success (green) or error (red)
          if (field.style.borderColor) {
            const hasValidationColor = 
              field.style.borderColor.includes('34, 197, 94') || // success green
              field.style.borderColor.includes('239, 68, 68');   // error red
            expect(hasValidationColor).toBe(true);
          }
        }
      ), { numRuns: 100 });
    });
  });

  // Unit tests for specific scenarios
  describe('Unit Tests', () => {
    it('should show specific error message for empty name field', () => {
      contactForm.fields.name.value = '';
      const isValid = contactForm.validateField('name');
      
      expect(isValid).toBe(false);
      const errorElement = document.getElementById('name-error');
      expect(errorElement.textContent).toBe('Name is required');
      expect(errorElement.style.display).toBe('block');
    });

    it('should show specific error message for invalid email format', () => {
      contactForm.fields.email.value = 'invalid-email';
      const isValid = contactForm.validateField('email');
      
      expect(isValid).toBe(false);
      const errorElement = document.getElementById('email-error');
      expect(errorElement.textContent).toBe('Please enter a valid email address');
      expect(errorElement.style.display).toBe('block');
    });

    it('should show specific error message for short subject', () => {
      contactForm.fields.subject.value = 'Hi';
      const isValid = contactForm.validateField('subject');
      
      expect(isValid).toBe(false);
      const errorElement = document.getElementById('subject-error');
      expect(errorElement.textContent).toBe('Subject must be between 5 and 100 characters');
      expect(errorElement.style.display).toBe('block');
    });

    it('should show specific error message for short message', () => {
      contactForm.fields.message.value = 'Short';
      const isValid = contactForm.validateField('message');
      
      expect(isValid).toBe(false);
      const errorElement = document.getElementById('message-error');
      expect(errorElement.textContent).toBe('Message must be between 10 and 1000 characters');
      expect(errorElement.style.display).toBe('block');
    });

    it('should handle valid form submission correctly', async () => {
      // Set known valid data
      contactForm.fields.name.value = 'John Doe';
      contactForm.fields.email.value = 'john@example.com';
      contactForm.fields.subject.value = 'Test Subject';
      contactForm.fields.message.value = 'This is a test message with enough characters.';

      // Submit the form
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const submitResult = contactForm.handleSubmit(submitEvent);

      // Should return true for valid submission
      expect(submitResult).toBe(true);

      // Wait for async submission to complete
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Check that success message is displayed
      const successElement = document.getElementById('form-success');
      expect(successElement).toBeTruthy();
      expect(successElement.style.display).toBe('block');
      expect(successElement.style.opacity).toBe('1');
      expect(successElement.textContent).toBe('Thank you for your message! I will get back to you soon.');

      // Check that form fields are cleared
      expect(contactForm.fields.name.value).toBe('');
      expect(contactForm.fields.email.value).toBe('');
      expect(contactForm.fields.subject.value).toBe('');
      expect(contactForm.fields.message.value).toBe('');
    });

    it('should validate successfully with all valid fields', () => {
      contactForm.fields.name.value = 'John Doe';
      contactForm.fields.email.value = 'john@example.com';
      contactForm.fields.subject.value = 'Test Subject';
      contactForm.fields.message.value = 'This is a valid test message with enough characters.';
      
      const isValid = contactForm.validateAllFields();
      expect(isValid).toBe(true);
    });
  });
});