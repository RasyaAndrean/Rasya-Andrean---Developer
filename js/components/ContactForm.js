/**
 * Enhanced Contact Form Component
 * Provides real-time validation, specific error messages, and success state management
 */
export class ContactForm {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {};
    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        pattern: /^[a-zA-Z\s]+$/,
        message: 'Name must contain only letters and spaces, minimum 2 characters'
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      subject: {
        required: true,
        minLength: 5,
        maxLength: 100,
        message: 'Subject must be between 5 and 100 characters'
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 1000,
        message: 'Message must be between 10 and 1000 characters'
      }
    };
    
    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.setupFields();
    this.setupEventListeners();
    this.createErrorElements();
    this.createSuccessElement();
  }

  setupFields() {
    // Get all form fields
    this.fields = {
      name: this.form.querySelector('input[name="name"]'),
      email: this.form.querySelector('input[name="email"]'),
      subject: this.form.querySelector('input[name="subject"]'),
      message: this.form.querySelector('textarea[name="message"]')
    };
  }

  setupEventListeners() {
    // Real-time validation on input
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field) {
        field.addEventListener('input', () => this.validateField(fieldName));
        field.addEventListener('blur', () => this.validateField(fieldName));
      }
    });

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  createErrorElements() {
    Object.keys(this.fields).forEach(fieldName => {
      const field = this.fields[fieldName];
      if (field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.id = `${fieldName}-error`;
        errorElement.style.cssText = `
          color: #ff6b6b;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          display: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;
        field.parentNode.appendChild(errorElement);
      }
    });
  }

  createSuccessElement() {
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.id = 'form-success';
    successElement.style.cssText = `
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #22c55e;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    this.form.insertBefore(successElement, this.form.firstChild);
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    const rules = this.validationRules[fieldName];
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (!field || !rules || !errorElement) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} is required`;
    }
    // Pattern validation
    else if (value && rules.pattern && !rules.pattern.test(value)) {
      isValid = false;
      errorMessage = rules.message;
    }
    // Length validation
    else if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = rules.message;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errorMessage = rules.message;
      }
    }

    // Update field appearance
    if (isValid) {
      field.style.borderColor = 'rgba(34, 197, 94, 0.3)';
      this.hideError(errorElement);
    } else {
      field.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      this.showError(errorElement, errorMessage);
    }

    return isValid;
  }

  validateAllFields() {
    let allValid = true;
    Object.keys(this.fields).forEach(fieldName => {
      if (!this.validateField(fieldName)) {
        allValid = false;
      }
    });
    return allValid;
  }

  showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    // Force reflow for transition
    errorElement.offsetHeight;
    errorElement.style.opacity = '1';
  }

  hideError(errorElement) {
    errorElement.style.opacity = '0';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 300);
  }

  showSuccess(message) {
    const successElement = document.getElementById('form-success');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
      // Force reflow for transition
      successElement.offsetHeight;
      successElement.style.opacity = '1';
      
      // Hide after 5 seconds
      setTimeout(() => {
        successElement.style.opacity = '0';
        setTimeout(() => {
          successElement.style.display = 'none';
        }, 300);
      }, 5000);
    }
  }

  clearForm() {
    this.form.reset();
    
    // Reset field styles
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.style.borderColor = '';
      }
    });
    
    // Hide all error messages
    Object.keys(this.fields).forEach(fieldName => {
      const errorElement = document.getElementById(`${fieldName}-error`);
      if (errorElement) {
        this.hideError(errorElement);
      }
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    
    // Validate all fields
    if (!this.validateAllFields()) {
      return false;
    }
    
    // Get form data
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Simulate form submission (in real app, this would be an API call)
    this.submitForm(data);
    
    return true;
  }

  async submitForm(data) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      this.showSuccess('Thank you for your message! I will get back to you soon.');
      
      // Clear the form
      this.clearForm();
      
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      // In a real app, show error message to user
      return false;
    }
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Public method to get form data for testing
  getFormData() {
    const formData = new FormData(this.form);
    return {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
  }

  // Public method to check if form is valid for testing
  isFormValid() {
    return this.validateAllFields();
  }
}