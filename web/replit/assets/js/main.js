// Analytics System
class Analytics {
  constructor() {
    this.queue = [];
    this.subscribers = new Set();
    this.apiBase = this.getApiBase();
  }

  track(eventName, payload = {}) {
    const event = {
      name: eventName,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
        page: document.body?.dataset.page || 'unknown',
        userAgent: navigator.userAgent,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    };

    this.queue.push(event);
    this.subscribers.forEach(callback => callback(event));
    console.debug('[Analytics]', event);

    // Send to backend in production
    if (this.apiBase && eventName !== 'page_view') {
      this.sendEvent(event).catch(err => console.warn('Analytics send failed:', err));
    }
  }

  async sendEvent(event) {
    try {
      await fetch(`${this.apiBase}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics event failed:', error);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    this.queue.forEach(callback);
    return () => this.subscribers.delete(callback);
  }

  getApiBase() {
    const meta = document.querySelector('meta[name="api-base"]');
    return meta ? meta.content : '';
  }
}

// Form Handler Class
class FormHandler {
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.options = {
      apiEndpoint: '/api/join-waitlist',
      successRedirect: 'thank-you.html',
      ...options
    };
    
    this.messageElement = this.form.querySelector('[role="status"]') || 
                         this.form.querySelector('.form-message');
    this.submitButton = this.form.querySelector('[type="submit"]');
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(input) {
    const errorElement = document.getElementById(input.name + 'Error') ||
                        input.parentNode.querySelector('.form-error');
    
    if (!input.checkValidity()) {
      const message = this.getValidationMessage(input);
      this.showFieldError(input, errorElement, message);
      return false;
    } else {
      this.clearFieldError(input, errorElement);
      return true;
    }
  }

  getValidationMessage(input) {
    if (input.type === 'email' && input.validity.typeMismatch) {
      return 'Please enter a valid email address';
    }
    if (input.validity.valueMissing) {
      return `${input.labels[0]?.textContent || input.name} is required`;
    }
    return input.validationMessage;
  }

  showFieldError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true');
    if (errorElement) {
      errorElement.textContent = message;
      input.setAttribute('aria-describedby', errorElement.id);
    }
  }

  clearFieldError(input, errorElement) {
    input.removeAttribute('aria-invalid');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  async handleSubmit(event) {
    event.preventDefault();

    // Validate all fields
    const inputs = this.form.querySelectorAll('input[required]');
    let isValid = true;
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      analytics.track('waitlist_validation_failed', { form: this.form.id });
      return;
    }

    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());

    this.setLoadingState(true);
    analytics.track('waitlist_submit_start', { form: this.form.id, email: data.email });

    try {
      const response = await fetch(this.getApiUrl(this.options.apiEndpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      analytics.track('waitlist_submit_success', { 
        form: this.form.id, 
        email: data.email,
        userId: result.userId 
      });

      this.handleSuccess(result);
    } catch (error) {
      console.error('Form submission error:', error);
      analytics.track('waitlist_submit_error', { 
        form: this.form.id, 
        error: error.message 
      });
      this.handleError(error);
    } finally {
      this.setLoadingState(false);
    }
  }

  handleSuccess(result) {
    if (this.options.successRedirect && result.userId) {
      const url = new URL(this.options.successRedirect, window.location.href);
      url.searchParams.set('userId', result.userId);
      window.location.href = url.toString();
    } else {
      this.showMessage('Success! Check your inbox for updates.', 'success');
      this.form.reset();
    }
  }

  handleError(error) {
    let message = 'Something went wrong. Please try again.';
    
    if (error.message.includes('409')) {
      message = 'You are already on the list. Check your inbox for updates.';
    } else if (error.message.includes('400')) {
      message = 'Please check your information and try again.';
    }
    
    this.showMessage(message, 'error');
  }

  showMessage(text, type) {
    if (this.messageElement) {
      this.messageElement.textContent = text;
      this.messageElement.setAttribute('data-type', type);
    }
  }

  setLoadingState(loading) {
    if (this.submitButton) {
      this.submitButton.disabled = loading;
      this.submitButton.toggleAttribute('data-loading', loading);
    }
  }

  getApiUrl(endpoint) {
    const base = analytics.apiBase || window.location.origin;
    return base.replace(/\/$/, '') + endpoint;
  }
}

// Modal Handler Class
class ModalHandler {
  constructor() {
    this.activeModal = null;
    this.init();
  }

  init() {
    // Setup modal triggers
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal]');
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.dataset.modal + 'Modal';
        this.openModal(modalId);
      }

      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        this.closeModal();
      }

      const modalClose = e.target.closest('.modal-close');
      if (modalClose) {
        e.preventDefault();
        this.closeModal();
      }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'DIALOG' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.showModal();
      this.activeModal = modal;
      analytics.track('modal_opened', { modalId });
    }
  }

  closeModal() {
    if (this.activeModal) {
      const modalId = this.activeModal.id;
      this.activeModal.close();
      this.activeModal = null;
      analytics.track('modal_closed', { modalId });
    }
  }
}

// Intersection Observer for section tracking
class SectionObserver {
  constructor() {
    this.observedSections = new Set();
    this.heroDepthTracked = false;
    this.init();
  }

  init() {
    const sections = document.querySelectorAll('[data-section], section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.observedSections.has(entry.target.id)) {
          this.observedSections.add(entry.target.id);
          analytics.track('section_viewed', {
            sectionId: entry.target.id,
            sectionName: entry.target.dataset.section || entry.target.id,
            intersectionRatio: entry.intersectionRatio.toFixed(2)
          });
        }

        if (
          entry.target.id === 'hero' &&
          entry.intersectionRatio >= 0.5 &&
          !this.heroDepthTracked
        ) {
          this.heroDepthTracked = true;
          analytics.track('hero_scroll_50', {
            sectionId: entry.target.id,
            intersectionRatio: entry.intersectionRatio.toFixed(2)
          });
        }
      });
    }, {
      threshold: [0.1, 0.25, 0.5],
      rootMargin: '-10% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }
}

// Click tracking for elements with data-track
class ClickTracker {
  constructor() {
    this.init();
  }

  init() {
    const EVENT_NAME_MAP = {
      'hero-primary': 'cta_click_primary',
      'waitlist-submit': 'cta_click_primary',
      'hero-secondary': 'cta_click_secondary',
      'faq-privacy': 'faq_click',
      'footer-privacy': 'privacy_link_click',
      'privacy-doc': 'privacy_link_click'
    };

    document.addEventListener('click', (e) => {
      const tracked = e.target.closest('[data-track]');
      if (tracked) {
        const trackingId = tracked.dataset.track;
        const elementType = tracked.tagName.toLowerCase();
        const text = tracked.textContent?.trim().substring(0, 50);

        const eventName = EVENT_NAME_MAP[trackingId] || 'ui_click';
        const payload = {
          trackingId,
          elementType,
          text,
          href: tracked.href || null
        };

        if (trackingId === 'hero-primary') {
          payload.placement = 'hero';
        }

        if (trackingId === 'waitlist-submit') {
          payload.placement = 'waitlist_form';
        }

        analytics.track(eventName, payload);
      }
    });
  }
}

// Smooth scrolling for anchor links
class SmoothScroller {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link && link.href.includes('#')) {
        const hash = link.getAttribute('href');
        const target = document.querySelector(hash);
        
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          history.pushState(null, '', hash);
          
          analytics.track('anchor_navigation', {
            from: window.location.pathname,
            to: hash,
            targetId: target.id
          });
        }
      }
    });
  }
}

// FAQ interactions
class FAQHandler {
  constructor() {
    this.init();
  }

  init() {
    const faqContainer = document.querySelector('[data-accordion]');
    if (!faqContainer) return;

    faqContainer.addEventListener('toggle', (e) => {
      if (e.target.tagName === 'DETAILS') {
        const questionId = e.target.dataset.track || 'unknown';
        const question = e.target.querySelector('summary')?.textContent?.trim();
        const eventName = e.target.open ? 'faq_expand' : 'faq_collapse';
        analytics.track(eventName, {
          questionId,
          question,
          opened: e.target.open
        });
      }
    }, true);
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    // Track page load performance
    window.addEventListener('load', () => {
      // Wait a bit for all resources to load
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        analytics.track('page_performance', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          largestContentfulPaint: this.getLargestContentfulPaint()
        });
      }, 1000);
    });
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fp = paintEntries.find(entry => entry.name === 'first-paint');
    return fp ? fp.startTime : null;
  }

  getLargestContentfulPaint() {
    return new Promise(resolve => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1];
          resolve(lcp.startTime);
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 10000);
    });
  }
}

// Initialize everything when DOM is ready
class App {
  constructor() {
    this.components = {};
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initComponents());
    } else {
      this.initComponents();
    }
  }

  initComponents() {
    // Initialize analytics first
    window.analytics = new Analytics();
    
    // Track page view
    analytics.track('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });

    // Initialize Mermaid
    this.initializeMermaid();

    // Initialize all components
    this.components.modalHandler = new ModalHandler();
    this.components.sectionObserver = new SectionObserver();
    this.components.clickTracker = new ClickTracker();
    this.components.smoothScroller = new SmoothScroller();
    this.components.faqHandler = new FAQHandler();
    this.components.performanceMonitor = new PerformanceMonitor();

    // Initialize forms
    const waitlistForm = document.getElementById('waitlistForm');
    if (waitlistForm) {
      this.components.waitlistForm = new FormHandler(waitlistForm, {
        apiEndpoint: '/api/join-waitlist',
        successRedirect: 'thank-you.html'
      });
    }

    // Survey form is handled by specialized SurveyManager in survey.js
    // No need for generic FormHandler on survey form

    console.log('🚀 Replit LangGraph Dev Navigator initialized');
  }

  // Initialize Mermaid diagrams with proper loading
  async initializeMermaid() {
    try {
      // Wait for mermaid to be available
      await this.waitForGlobal('mermaid', 3000);
      
      if (window.mermaid) {
        window.mermaid.initialize({ 
          startOnLoad: true, 
          theme: 'neutral',
          securityLevel: 'loose' // Allow HTML in diagrams
        });
        console.log('Mermaid initialized successfully');
      } else {
        console.warn('Mermaid library not available');
      }
    } catch (error) {
      console.warn('Failed to initialize Mermaid:', error);
    }
  }

  // Wait for a global variable to become available
  waitForGlobal(globalName, timeout = 3000) {
    return new Promise((resolve, reject) => {
      if (window[globalName]) {
        resolve(window[globalName]);
        return;
      }

      const checkInterval = 100;
      let elapsed = 0;
      
      const interval = setInterval(() => {
        if (window[globalName]) {
          clearInterval(interval);
          resolve(window[globalName]);
        } else if (elapsed >= timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for ${globalName}`));
        }
        elapsed += checkInterval;
      }, checkInterval);
    });
  }

  initSurveyLogic() {
    // Survey-specific initialization will go here
    // This will be expanded when we create the thank-you page
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (userId) {
      analytics.track('survey_page_loaded', { userId });
    }
  }
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  if (window.analytics) {
    analytics.track('javascript_error', {
      message: e.error?.message || 'Unknown error',
      filename: e.filename,
      line: e.lineno,
      column: e.colno
    });
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  if (window.analytics) {
    analytics.track('promise_rejection', {
      reason: e.reason?.message || String(e.reason)
    });
  }
});

// Start the app
const app = new App();

// Export for global access if needed
window.app = app;

export default app;
