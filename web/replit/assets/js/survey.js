// Survey-specific functionality
class SurveyManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.userId = null;
    this.selectedFeatures = new Set();
    this.formData = {};
    
    this.init();
  }

  init() {
    this.userId = this.getUserIdFromUrl();
    this.setupElements();
    this.verifyUser();
  }

  getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
  }

  setupElements() {
    this.container = document.getElementById('surveyContainer');
    this.loadingState = document.getElementById('loadingState');
    this.errorState = document.getElementById('errorState');
    this.formState = document.getElementById('formState');
    this.successState = document.getElementById('successState');
    
    this.form = document.getElementById('surveyForm');
    this.progressFill = document.getElementById('progressFill');
    this.currentStepEl = document.getElementById('currentStep');
    this.totalStepsEl = document.getElementById('totalSteps');
    
    this.prevButton = document.getElementById('prevButton');
    this.nextButton = document.getElementById('nextButton');
    this.submitButton = document.getElementById('submitButton');
    this.messageEl = document.getElementById('formMessage');

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.previousStep());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextStep());
    }

    // Feature selection tracking
    document.addEventListener('change', (e) => {
      if (e.target.name === 'features') {
        this.handleFeatureSelection(e.target);
      }
    });
  }

  async verifyUser() {
    if (!this.userId) {
      this.showError('No user ID found. Please use the link from your confirmation email.');
      return;
    }

    try {
      // First check UUID format
      if (!this.isValidUUID(this.userId)) {
        throw new Error('Invalid user ID format');
      }

      // Verify user exists in backend waitlist
      const response = await fetch(this.getApiUrl(`/api/verify-user/${encodeURIComponent(this.userId)}`), { 
        method: 'HEAD' 
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found in waitlist');
        } else {
          throw new Error(`Verification failed: ${response.status}`);
        }
      }

      this.showForm();
      analytics.track('survey_verification_success', { userId: this.userId });
      
    } catch (error) {
      console.error('User verification failed:', error);
      let errorMessage = 'Unable to verify your waitlist status. Please try again with the link from your confirmation email.';
      
      if (error.message.includes('not found')) {
        errorMessage = 'You are not in our waitlist. Please join the waitlist first and use the link from your confirmation email.';
      }
      
      this.showError(errorMessage);
      analytics.track('survey_verification_failed', { 
        userId: this.userId,
        error: error.message 
      });
    }
  }

  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  showState(stateName) {
    const states = ['loading', 'error', 'form', 'success'];
    states.forEach(state => {
      const element = document.getElementById(`${state}State`);
      if (element) {
        element.hidden = state !== stateName;
      }
    });
  }

  showError(message) {
    this.showState('error');
    const errorMsg = this.errorState.querySelector('p');
    if (errorMsg && message) {
      errorMsg.textContent = message;
    }
  }

  showForm() {
    this.showState('form');
    this.updateProgress();
    this.updateStepVisibility();
    this.updateNavigation();
    
    if (this.totalStepsEl) {
      this.totalStepsEl.textContent = this.totalSteps;
    }

    analytics.track('survey_started', { 
      userId: this.userId,
      totalSteps: this.totalSteps 
    });
  }

  updateProgress() {
    const progressPercent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    if (this.progressFill) {
      this.progressFill.style.width = `${progressPercent}%`;
    }
    if (this.currentStepEl) {
      this.currentStepEl.textContent = this.currentStep;
    }
  }

  updateStepVisibility() {
    const groups = document.querySelectorAll('.survey-group');
    groups.forEach((group, index) => {
      const stepNumber = parseInt(group.dataset.step);
      group.hidden = stepNumber !== this.currentStep;
    });
  }

  updateNavigation() {
    if (this.prevButton) {
      this.prevButton.hidden = this.currentStep === 1;
    }

    if (this.nextButton) {
      this.nextButton.hidden = this.currentStep === this.totalSteps;
    }

    if (this.submitButton) {
      this.submitButton.hidden = this.currentStep !== this.totalSteps;
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateProgress();
      this.updateStepVisibility();
      this.updateNavigation();
      
      analytics.track('survey_step_next', {
        userId: this.userId,
        fromStep: this.currentStep - 1,
        toStep: this.currentStep,
        selectedFeatures: Array.from(this.selectedFeatures)
      });

      // Scroll to top of form
      this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgress();
      this.updateStepVisibility();
      this.updateNavigation();
      
      analytics.track('survey_step_prev', {
        userId: this.userId,
        fromStep: this.currentStep + 1,
        toStep: this.currentStep
      });

      // Scroll to top of form
      this.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleFeatureSelection(checkbox) {
    const featureValue = checkbox.value;
    const featureGroup = checkbox.dataset.featureGroup || 'unknown';
    const isSelected = checkbox.checked;

    if (isSelected) {
      this.selectedFeatures.add(featureValue);
    } else {
      this.selectedFeatures.delete(featureValue);
    }

    analytics.track('survey_feature_selected', {
      userId: this.userId,
      feature: featureValue,
      group: featureGroup,
      selected: isSelected,
      step: this.currentStep,
      totalSelected: this.selectedFeatures.size
    });

    // Visual feedback
    const card = checkbox.closest('.option-card');
    if (card) {
      card.classList.toggle('selected', isSelected);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const selectedFeatures = Array.from(this.selectedFeatures);
    const notes = formData.get('notes')?.trim();
    const betaOptIn = formData.has('betaOptIn');

    // Validation
    if (selectedFeatures.length === 0 && !notes) {
      this.showMessage('Please select at least one capability or share a note so we can act.', 'error');
      analytics.track('survey_validation_failed', {
        userId: this.userId,
        reason: 'no_selection_or_notes'
      });
      return;
    }

    this.setSubmittingState(true);

    analytics.track('survey_submit_start', {
      userId: this.userId,
      selectedFeatures,
      notesLength: notes?.length || 0,
      betaOptIn,
      totalFeatures: selectedFeatures.length
    });

    try {
      const response = await fetch(this.getApiUrl('/api/submit-survey'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          selectedFeatures,
          notes: notes || undefined,
          betaOptIn
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await response.json();

      analytics.track('survey_submit_success', {
        userId: this.userId,
        selectedFeatures,
        betaOptIn,
        totalFeatures: selectedFeatures.length
      });

      this.showSuccess(selectedFeatures, notes, betaOptIn);
    } catch (error) {
      console.error('Survey submission error:', error);
      this.showMessage('Something went wrong submitting preferences. Try again in a moment.', 'error');
      
      analytics.track('survey_submit_error', {
        userId: this.userId,
        error: error.message,
        selectedFeatures,
        totalFeatures: selectedFeatures.length
      });
    } finally {
      this.setSubmittingState(false);
    }
  }

  showSuccess(selectedFeatures, notes, betaOptIn) {
    this.showState('success');
    this.populateSuccessContent(selectedFeatures, notes, betaOptIn);
  }

  populateSuccessContent(selectedFeatures, notes, betaOptIn) {
    const featuresList = document.getElementById('selectedFeaturesList');
    if (featuresList) {
      featuresList.innerHTML = '';

      // Add selected features
      const featureLabels = this.getFeatureLabels();
      selectedFeatures.forEach(featureKey => {
        const label = featureLabels[featureKey] || featureKey;
        const li = document.createElement('li');
        li.textContent = label;
        featuresList.appendChild(li);
      });

      // Add notes if provided
      if (notes) {
        const notesLi = document.createElement('li');
        notesLi.textContent = `Custom workflow: ${notes}`;
        featuresList.appendChild(notesLi);
      }

      // Add beta opt-in if selected
      if (betaOptIn) {
        const betaLi = document.createElement('li');
        betaLi.textContent = 'Signed up for beta testing';
        featuresList.appendChild(betaLi);
      }
    }
  }

  getFeatureLabels() {
    const labels = {};
    document.querySelectorAll('input[name="features"]').forEach(input => {
      const card = input.closest('.option-card');
      const title = card?.querySelector('.option-title');
      if (title) {
        labels[input.value] = title.textContent;
      }
    });
    return labels;
  }

  showMessage(text, type) {
    if (this.messageEl) {
      this.messageEl.textContent = text;
      this.messageEl.setAttribute('data-type', type);
    }
  }

  setSubmittingState(submitting) {
    if (this.submitButton) {
      this.submitButton.disabled = submitting;
      this.submitButton.toggleAttribute('data-loading', submitting);
    }
    if (this.nextButton) {
      this.nextButton.disabled = submitting;
    }
    if (this.prevButton) {
      this.prevButton.disabled = submitting;
    }
  }

  getApiUrl(endpoint) {
    const base = analytics.apiBase || window.location.origin;
    return base.replace(/\/$/, '') + endpoint;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Additional CSS for survey-specific styling
const surveyStyles = `
/* Thank You Page Styles */
.thank-you-hero {
  padding: var(--space-16) 0 var(--space-24);
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.thank-you-content {
  max-width: 50rem;
  margin: 0 auto;
  text-align: center;
}

.thank-you-header {
  margin-bottom: var(--space-12);
}

.thank-you-header h1 {
  margin-bottom: var(--space-4);
  background: linear-gradient(135deg, var(--color-text), var(--color-accent-strong));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.thank-you-subhead {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.thank-you-note {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
}

.survey-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  margin-bottom: var(--space-8);
}

/* Survey States */
.survey-state {
  text-align: center;
}

.survey-state[data-state="loading"] {
  padding: var(--space-12);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--space-4);
}

.error-icon,
.success-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.survey-state[data-state="error"] h3 {
  color: var(--color-error);
  margin-bottom: var(--space-4);
}

.survey-state[data-state="success"] h3 {
  color: var(--color-success);
  margin-bottom: var(--space-6);
}

/* Survey Form */
.survey-form {
  text-align: left;
}

.survey-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin-right: var(--space-4);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-strong));
  transition: width var(--transition-slow);
  width: 0%;
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.survey-groups {
  margin-bottom: var(--space-8);
}

.survey-group {
  animation: fadeIn var(--transition-slow);
}

.group-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.group-header h3 {
  color: var(--color-accent-strong);
  margin-bottom: var(--space-2);
}

.group-header p {
  color: var(--color-text-muted);
  margin: 0;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.option-card {
  display: block;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.option-card:hover {
  border-color: var(--color-accent);
  background: rgba(127, 91, 255, 0.05);
}

.option-card.selected,
.option-card:has(input:checked) {
  border-color: var(--color-accent);
  background: rgba(127, 91, 255, 0.1);
}

.option-card input[type="checkbox"] {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--color-accent);
}

.option-content {
  padding-right: var(--space-8);
}

.option-title {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.option-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.additional-inputs {
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
}

.form-textarea {
  width: 100%;
  min-height: 6rem;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-base);
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(127, 91, 255, 0.1);
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  cursor: pointer;
  margin-top: var(--space-6);
}

.checkbox-option input[type="checkbox"] {
  margin-top: 0.2rem;
  accent-color: var(--color-accent);
}

.checkbox-label {
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.5;
}

.survey-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.nav-button {
  padding: var(--space-3) var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
}

.nav-button--primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.nav-button--primary:hover:not(:disabled) {
  background: var(--color-accent-strong);
  border-color: var(--color-accent-strong);
}

.nav-button--secondary:hover:not(:disabled) {
  border-color: var(--color-accent);
  background: rgba(127, 91, 255, 0.1);
}

.nav-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Success State */
.success-content {
  text-align: left;
  margin-bottom: var(--space-8);
}

.selected-features,
.next-steps {
  margin: var(--space-6) 0;
  padding: var(--space-6);
  background: rgba(127, 91, 255, 0.05);
  border: 1px solid rgba(127, 91, 255, 0.1);
  border-radius: var(--radius-md);
}

.selected-features h4,
.next-steps h4 {
  color: var(--color-accent-strong);
  margin-bottom: var(--space-4);
}

.selected-features ul,
.next-steps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.selected-features li,
.next-steps li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.selected-features li::before,
.next-steps li::before {
  content: '→';
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.success-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.privacy-notice {
  margin-top: var(--space-8);
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
}

.privacy-notice p {
  margin: var(--space-2) 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .thank-you-content {
    padding: 0 var(--space-4);
  }
  
  .survey-container {
    padding: var(--space-6);
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .survey-navigation {
    flex-direction: column;
  }
  
  .nav-button {
    width: 100%;
    justify-content: center;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .success-actions .cta-button {
    width: 100%;
    text-align: center;
  }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = surveyStyles;
document.head.appendChild(styleSheet);

// Initialize survey manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'replit-thank-you') {
    window.surveyManager = new SurveyManager();
  }
});

export default SurveyManager;