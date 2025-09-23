const analytics = (() => {
  const queue = [];
  const subscribers = new Set();

  const publish = (event) => {
    queue.push(event);
    subscribers.forEach((cb) => cb(event));
    console.debug('[analytics]', event);
  };

  const track = (name, payload = {}) => {
    publish({
      name,
      payload,
      timestamp: new Date().toISOString(),
    });
  };

  const subscribe = (callback) => {
    subscribers.add(callback);
    queue.forEach(callback);
    return () => subscribers.delete(callback);
  };

  return { track, subscribe };
})();

const PAGE = document.body?.dataset.page || '';
const API_BASE = (document.body?.dataset.apiBase || '').trim();
const THANK_YOU_PATH = (document.body?.dataset.thankYou || '').trim();
const LANDING_PATH = (document.body?.dataset.landing || '').trim();
const WAITLIST_STORAGE_KEY = 'codex-waitlist-emails';
const WAITLIST_META_KEY = 'codex-waitlist-meta';

const resolveEndpoint = (path) => {
  if (!path) return '';
  if (/^https?:/i.test(path)) {
    return path;
  }
  if (!API_BASE) {
    return path;
  }
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${finalPath}`;
};

const loadStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse stored data', key, error);
    return fallback;
  }
};

const saveStoredJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to persist data', key, error);
  }
};

const modalController = (() => {
  const modal = document.querySelector('#evidenceModal');
  if (!modal) {
    return { open: () => {}, close: () => {} };
  }

  const open = () => {
    modal.showModal();
    analytics.track('modal_opened', { id: 'evidence' });
  };

  const close = () => {
    modal.close();
    analytics.track('modal_closed', { id: 'evidence' });
  };

  modal.addEventListener('close', () => {
    analytics.track('modal_closed', { id: 'evidence', reason: 'user' });
  });

  return { open, close };
})();

const initWaitlistForm = () => {
  const form = document.querySelector('#waitlistForm');
  const message = document.querySelector('#formMessage');

  if (!form || !message) {
    return;
  }

  const loadEmails = () => new Set(loadStoredJson(WAITLIST_STORAGE_KEY, []));

  const saveEmail = (email) => {
    const emails = loadEmails();
    emails.add(email);
    saveStoredJson(WAITLIST_STORAGE_KEY, Array.from(emails));
  };

  const setMessage = (text, tone = 'neutral') => {
    message.textContent = text;
    message.dataset.tone = tone;
    const colors = {
      neutral: 'var(--muted)',
      success: 'var(--success)',
      error: 'var(--danger)',
    };
    message.style.color = colors[tone] || colors.neutral;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setMessage('Please provide a valid email.', 'error');
      analytics.track('waitlist_invalid');
      return;
    }

    const formData = new FormData(form);
    const email = formData.get('email');
    const role = formData.get('role') || 'unspecified';

    if (loadEmails().has(email)) {
      setMessage('You are already on the list. Check your inbox for updates.', 'success');
      analytics.track('waitlist_duplicate', { email });
      return;
    }

    setMessage('Submitting…');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }
    analytics.track('waitlist_submit', { email, role });

    try {
      const response = await fetch(resolveEndpoint('/api/join-waitlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok && response.status !== 409) {
        const errorText = await response.text();
        throw new Error(errorText || `Unexpected response (${response.status})`);
      }

      const payload = await response.json().catch(() => ({}));
      const userId = payload.userId || payload.id || null;

      saveEmail(email);
      if (userId) {
        saveStoredJson(WAITLIST_META_KEY, {
          userId,
          email,
          role,
          storedAt: new Date().toISOString(),
        });
      }

      analytics.track('waitlist_success', { email, role, status: response.status });

      if (THANK_YOU_PATH && userId) {
        const thankYouUrl = new URL(THANK_YOU_PATH, window.location.href);
        thankYouUrl.searchParams.set('userId', userId);
        window.location.assign(thankYouUrl.toString());
        return;
      }

      setMessage('Success! Check your inbox for the latest runbook. We will email the survey shortly.', 'success');
      form.reset();
    } catch (error) {
      console.error('Waitlist submission failed', error);
      setMessage('Something went wrong. Please retry or email codex@langgraph.dev.', 'error');
      analytics.track('waitlist_error', { email, role, message: error.message });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
};

const attachGlobalTracking = () => {
  document.querySelectorAll('[data-track]').forEach((element) => {
    const name = element.dataset.track;
    element.addEventListener('click', () => {
      analytics.track('interaction', {
        target: name,
        text: element.textContent.trim().slice(0, 64),
      });
    });
  });
};

const observeSections = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        analytics.track('section_view', {
          section: entry.target.dataset.section,
          threshold: entry.intersectionRatio.toFixed(2),
        });
      }
    });
  }, { threshold: [0.25, 0.5, 0.75] });

  document.querySelectorAll('[data-section]').forEach((section) => observer.observe(section));
};

const accordionAnalytics = () => {
  const container = document.querySelector('[data-accordion]');
  if (!container) return;

  container.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      analytics.track('faq_toggle', {
        id: details.dataset.track,
        open: details.open,
      });
    });
  });
};

const modalTriggers = () => {
  document.querySelectorAll('[data-open-modal="evidence"]').forEach((button) => {
    button.addEventListener('click', () => modalController.open());
  });
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const initSurvey = () => {
  const container = document.querySelector('[data-survey-state]');
  if (!container) {
    return;
  }

  const views = Array.from(container.querySelectorAll('[data-view]'));
  const showView = (view) => {
    views.forEach((element) => {
      element.hidden = element.dataset.view !== view;
    });
  };

  const form = container.querySelector('#surveyForm');
  const message = container.querySelector('[data-survey-message]');
  const successList = container.querySelector('[data-success-list]');

  const setFormMessage = (text = '', tone = 'neutral') => {
    if (!message) return;
    message.textContent = text;
    message.dataset.tone = tone;
  };

  showView('loading');

  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');

  const loadWaitlistMeta = () => loadStoredJson(WAITLIST_META_KEY, null);

  const verifyUser = async () => {
    if (!userId) {
      throw new Error('missing_user');
    }
    analytics.track('survey_verify_start', { userId });

    await delay(350);

    const meta = loadWaitlistMeta();
    if (meta && meta.userId === userId) {
      return meta;
    }

    if (API_BASE) {
      try {
        const response = await fetch(resolveEndpoint(`/api/waitlist/${encodeURIComponent(userId)}`), { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`verify_failed_${response.status}`);
        }
      } catch (error) {
        console.warn('Waitlist verification via API failed', error);
      }
    }

    return { userId };
  };

  const activateForm = (meta) => {
    if (!form) {
      return;
    }

    showView('form');

    const groups = Array.from(form.querySelectorAll('[data-survey-group]'));
    const progressEl = form.querySelector('[data-survey-progress]');
    const progressCurrent = form.querySelector('[data-survey-current]');
    const progressTotal = form.querySelector('[data-survey-total]');
    const prevButton = form.querySelector('[data-nav="prev"]');
    const nextButton = form.querySelector('[data-nav="next"]');
    const submitButton = form.querySelector('[data-role="submit"]');
    const featureInputs = Array.from(form.querySelectorAll('input[name="features"]'));

    const total = groups.length || 1;
    if (progressEl) {
      progressEl.max = total;
      progressEl.value = 1;
    }
    if (progressTotal) {
      progressTotal.textContent = String(total);
    }

    let currentIndex = 0;

    const updateStep = () => {
      groups.forEach((group, index) => {
        const hidden = index !== currentIndex;
        group.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        group.tabIndex = hidden ? -1 : 0;
      });

      if (progressCurrent) {
        progressCurrent.textContent = String(currentIndex + 1);
      }
      if (progressEl) {
        progressEl.value = currentIndex + 1;
      }

      if (prevButton) {
        const disabled = currentIndex === 0;
        prevButton.disabled = disabled;
        prevButton.setAttribute('aria-disabled', String(disabled));
        prevButton.style.visibility = disabled ? 'hidden' : 'visible';
      }

      if (nextButton) {
        nextButton.hidden = currentIndex >= total - 1;
        nextButton.disabled = currentIndex >= total - 1;
      }

      if (submitButton) {
        submitButton.hidden = currentIndex < total - 1;
        submitButton.disabled = currentIndex < total - 1;
      }
    };

    updateStep();

    const goToStep = (delta) => {
      const nextIndex = currentIndex + delta;
      if (nextIndex < 0 || nextIndex >= total) {
        return;
      }
      currentIndex = nextIndex;
      updateStep();
      analytics.track('survey_step_change', {
        userId,
        step: currentIndex + 1,
        total,
      });
    };

    prevButton?.addEventListener('click', () => goToStep(-1));
    nextButton?.addEventListener('click', () => goToStep(1));

    const featureLabels = featureInputs.reduce((acc, input) => {
      const label = input.closest('.option')?.querySelector('.option__label');
      if (label) {
        acc[input.value] = label.textContent.trim();
      }
      return acc;
    }, {});

    featureInputs.forEach((input) => {
      input.addEventListener('change', () => {
        analytics.track('feature_select', {
          userId,
          feature: input.dataset.featureKey || input.value,
          group: input.dataset.featureGroup || null,
          selected: input.checked,
        });
      });
    });

    analytics.track('survey_start', {
      userId,
      groups: total,
      localMeta: Boolean(meta?.email),
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setFormMessage('');

      const selectedFeatures = featureInputs
        .filter((input) => input.checked)
        .map((input) => input.value);
      const notes = (form.elements.notes?.value || '').trim();
      const betaOptIn = Boolean(form.elements.betaOptIn?.checked);

      if (!selectedFeatures.length && !notes) {
        setFormMessage('Select at least one capability or share a note so we can act.', 'error');
        analytics.track('survey_error', { userId, stage: 'validation', reason: 'empty' });
        return;
      }

      submitButton?.setAttribute('disabled', 'true');
      nextButton?.setAttribute('disabled', 'true');
      prevButton?.setAttribute('disabled', 'true');
      setFormMessage('Submitting preferences…');

      analytics.track('survey_submit', {
        userId,
        featuresCount: selectedFeatures.length,
        betaOptIn,
      });

      try {
        const response = await fetch(resolveEndpoint('/api/submit-survey'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            selectedFeatures,
            notes: notes || undefined,
            betaOptIn,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Unexpected response (${response.status})`);
        }

        const readableFeatures = selectedFeatures.length
          ? selectedFeatures.map((key) => featureLabels[key] || key)
          : ['Discovery note received'];

        if (successList) {
          successList.innerHTML = '';
          readableFeatures.forEach((text) => {
            const item = document.createElement('li');
            item.textContent = text;
            successList.appendChild(item);
          });

          if (notes) {
            const noteItem = document.createElement('li');
            noteItem.textContent = `Research note: ${notes}`;
            successList.appendChild(noteItem);
          }

          if (betaOptIn) {
            const betaItem = document.createElement('li');
            betaItem.textContent = 'You volunteered for weekly beta reviews.';
            successList.appendChild(betaItem);
          }
        }

        saveStoredJson(WAITLIST_META_KEY, {
          ...(loadWaitlistMeta() || {}),
          userId,
          lastSurveyAt: new Date().toISOString(),
          selectedFeatures,
          betaOptIn,
          notes,
        });

        showView('success');
      } catch (error) {
        console.error('Survey submission failed', error);
        setFormMessage('Something went wrong submitting preferences. Try again in a moment.', 'error');
        analytics.track('survey_error', {
          userId,
          stage: 'submission',
          message: error.message,
        });
      } finally {
        submitButton?.removeAttribute('disabled');
        nextButton?.removeAttribute('disabled');
        prevButton?.removeAttribute('disabled');
      }
    });
  };

  verifyUser()
    .then((meta) => {
      activateForm(meta);
    })
    .catch((error) => {
      console.error('Survey verification failed', error);
      showView('error');
      analytics.track('survey_error', {
        userId: userId || null,
        stage: 'verification',
        message: error.message,
      });
    });
};

const init = () => {
  attachGlobalTracking();

  if (PAGE === 'codex-landing') {
    initWaitlistForm();
    observeSections();
    accordionAnalytics();
    modalTriggers();
  }

  if (PAGE === 'codex-thank-you') {
    observeSections();
    initSurvey();
    if (LANDING_PATH) {
      document.querySelectorAll('[data-track="survey-error-return"], [data-track="survey-success-return"]').forEach((link) => {
        link.addEventListener('click', (event) => {
          if (LANDING_PATH) {
            event.preventDefault();
            window.location.assign(new URL(LANDING_PATH, window.location.href).toString());
          }
        });
      });
    }
  }

  analytics.subscribe(() => {});
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
