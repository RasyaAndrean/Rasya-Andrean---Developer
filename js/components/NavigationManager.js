/**
 * NavigationManager - Handles responsive navigation with mobile hamburger menu
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export class NavigationManager {
  constructor(navElement) {
    this.nav = navElement;
    this.navLinks = this.nav.querySelector('.nav-links');
    this.hamburgerBtn = null;
    this.mobileMenuOpen = false;
    this.activeSection = 'home';
    this.sections = [];
    
    this.init();
  }

  init() {
    this.createHamburgerButton();
    this.setupEventListeners();
    this.setupSectionObserver();
    this.collectSections();
  }

  createHamburgerButton() {
    // Create hamburger button for mobile
    this.hamburgerBtn = document.createElement('button');
    this.hamburgerBtn.className = 'hamburger-btn';
    this.hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    this.hamburgerBtn.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;
    
    // Insert hamburger button before nav-links
    this.nav.insertBefore(this.hamburgerBtn, this.navLinks);
  }

  setupEventListeners() {
    // Hamburger button click
    this.hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMobileMenu();
    });

    // Outside click to close menu
    document.addEventListener('click', (e) => {
      if (this.mobileMenuOpen && !this.nav.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Escape key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Nav link clicks
    this.navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        this.closeMobileMenu();
        this.smoothScrollToSection(e.target.getAttribute('href'));
      }
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }

  collectSections() {
    // Collect all sections for active state tracking
    const navLinksElements = this.navLinks.querySelectorAll('a[href^="#"]');
    this.sections = Array.from(navLinksElements).map(link => {
      const href = link.getAttribute('href');
      const section = document.querySelector(href);
      return {
        id: href.substring(1),
        element: section,
        navLink: link
      };
    }).filter(item => item.element);
  }

  setupSectionObserver() {
    // Intersection Observer for active section highlighting
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px'
    };

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe sections once they're collected
    setTimeout(() => {
      this.sections.forEach(section => {
        if (section.element) {
          this.sectionObserver.observe(section.element);
        }
      });
    }, 100);
  }

  toggleMobileMenu() {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.mobileMenuOpen = true;
    this.navLinks.classList.add('mobile-menu-open');
    this.hamburgerBtn.classList.add('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.navLinks.classList.remove('mobile-menu-open');
    this.hamburgerBtn.classList.remove('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  updateActiveSection(sectionId) {
    if (this.activeSection === sectionId) return;
    
    this.activeSection = sectionId;
    
    // Update active nav link
    this.sections.forEach(section => {
      if (section.navLink) {
        if (section.id === sectionId) {
          section.navLink.classList.add('active');
        } else {
          section.navLink.classList.remove('active');
        }
      }
    });
  }

  smoothScrollToSection(href) {
    if (!href || !href.startsWith('#')) return;
    
    const target = document.querySelector(href);
    if (target) {
      const headerHeight = this.nav.closest('header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
}