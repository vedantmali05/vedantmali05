/**
 * js-states.js
 * Form, button, input and empty state visual managers.
 * Standardized global window integration.
 */

// Consolidated helper to manage button loading states
function setButtonLoading(button, isLoading, hideContents = false, disableButton = true) {
  const btnEl = typeof button === 'string' ? document.querySelector(button) : button;
  if (!btnEl) return;

  if (isLoading) {
    if (!btnEl.dataset.originalHtml) {
      btnEl.dataset.originalHtml = btnEl.innerHTML;
    }

    if (hideContents) {
      btnEl.classList.add("loading");
      btnEl.innerHTML = '<span class="btn-spinner-inline"></span>';
    } else {
      if (!btnEl.querySelector(".btn-spinner-inline")) {
        const spinner = document.createElement("span");
        spinner.className = "btn-spinner-inline";
        btnEl.appendChild(spinner);
      }
    }

    if (disableButton) {
      btnEl.setAttribute("disabled", "true");
    }
  } else {
    btnEl.classList.remove("loading");
    if (btnEl.dataset.originalHtml) {
      btnEl.innerHTML = btnEl.dataset.originalHtml;
      // Also clear the cached original HTML so it doesn't get stale if HTML changes
      delete btnEl.dataset.originalHtml;
    } else {
      const spinner = btnEl.querySelector(".btn-spinner-inline");
      if (spinner) {
        spinner.remove();
      }
    }
    btnEl.removeAttribute("disabled");
  }
}

// Sets or resets the status state (error, warning, success) of a form field.
function setFieldState(inputEl, state = "", message = "") {
  if (!inputEl) return;
  const formGroup = inputEl.closest(".form-group");
  if (formGroup) {
    formGroup.classList.remove("error", "warning", "success");

    // Remove any existing status card inside this form group
    const existingCard = formGroup.querySelector(".status-card");
    if (existingCard) {
      existingCard.remove();
    }

    if (state) {
      formGroup.classList.add(state);

      // If message is specified, render a default status card below the input container
      if (message) {
        const card = createStatusCard({
          type: state,
          variant: '', // default state: transparent background, no outline
          size: 'small',
          description: message
        });

        const inputContainer = formGroup.querySelector(".input-container");
        if (inputContainer) {
          inputContainer.parentNode.insertBefore(card, inputContainer.nextSibling);
        } else {
          formGroup.appendChild(card);
        }
      }
    }
  }
}

// Creates a Status Card component dynamically.
function createStatusCard(options = {}) {
  const type = options.type || 'info';
  const variant = options.variant || '';
  const size = options.size || 'medium';
  const title = options.title || '';
  const description = options.description || '';
  const icon = options.icon || '';
  const id = options.id || '';
  const className = options.className || '';

  const card = document.createElement('div');
  if (id) card.id = id;

  const classes = ['status-card', type];
  if (variant) classes.push(variant);
  if (size) {
    classes.push(size);
    classes.push(`sz-${size}`);
  }
  if (className) classes.push(className);
  card.className = classes.join(' ');

  let iconName = icon;
  if (!iconName) {
    if (type === 'success') iconName = 'check';
    else if (type === 'error') iconName = 'circle-x';
    else if (type === 'warning') iconName = 'alert-triangle';
    else iconName = 'info';
  }

  const iconEl = document.createElement('span');
  iconEl.className = `icon-lucide icon-${iconName}`;
  card.appendChild(iconEl);

  if (title || description) {
    const bodyEl = document.createElement('div');
    bodyEl.className = 'status-card-body';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'status-card-title';
      titleEl.textContent = title;
      bodyEl.appendChild(titleEl);
    }

    if (description) {
      const descEl = document.createElement('div');
      descEl.className = 'status-card-description';
      descEl.textContent = description;
      bodyEl.appendChild(descEl);
    }

    card.appendChild(bodyEl);
  }

  return card;
}

// Renders a status card into a container element, handling visibility and DOM manipulation.
function renderStatusCard(containerSelector, message, optionsOrType = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;

  if (!container) return;

  container.innerHTML = "";
  if (!message) {
    container.style.display = "none";
    return;
  }

  let options = {};
  if (typeof optionsOrType === 'string') {
    options = { type: optionsOrType };
  } else {
    options = optionsOrType || {};
  }

  const type = options.type || 'error';
  const variant = options.variant || 'emphasized';
  const size = options.size || 'small';
  const title = options.title || '';
  const icon = options.icon || '';
  const id = options.id || '';
  const className = options.className || '';

  const card = createStatusCard({
    type,
    variant,
    size,
    title,
    description: message,
    icon,
    id,
    className
  });

  container.appendChild(card);
  container.style.display = "block";
}

// Helper to render customizable empty state content inside a tr
function renderEmptyState(trEl, colCount, esOption, defaultValues) {
  trEl.innerHTML = '';
  const td = document.createElement('td');
  td.colSpan = colCount;

  if (typeof esOption === 'function') {
    const res = esOption();
    if (res instanceof HTMLElement) {
      td.appendChild(res);
    } else {
      td.innerHTML = res;
    }
  } else if (typeof esOption === 'string') {
    td.innerHTML = esOption;
  } else {
    const es = esOption || {};
    const iconName = es.icon || defaultValues.icon;
    const title = es.title || defaultValues.title;
    const desc = es.description || defaultValues.description;

    const iconHtml = iconName ? `<i class="icon-lucide ${iconName}"></i>` : '';

    td.innerHTML = Component.renderEmptyStateHTML({
      title: title,
      description: desc,
      icon: iconHtml,
      type: 'sz-small'
    });
  }
  trEl.appendChild(td);
}

/**
 * Shows the global full-screen loader overlay.
 * Creates the element dynamically if it doesn't already exist.
 * @param {string} [message="Loading..."] - Optional loading message.
 */
function showGlobalLoader(message = "Loading...") {
  let loader = document.getElementById("global-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "global-loader";
    loader.className = "loader-overlay";
    loader.innerHTML = `
      <div class="spinner sz-xlarge" style="color: var(--clr-input-border-focus); margin-bottom: var(--space-md);"></div>
      <p class="loader-text small muted" style="letter-spacing: 0.05em; font-weight: var(--fw-semibold); text-transform: uppercase; margin: 0;"></p>
    `;
    document.body.appendChild(loader);
  }
  loader.querySelector(".loader-text").textContent = message;
  // Force repaint to allow transition to trigger
  loader.offsetHeight;
  loader.classList.add("active");
}

/**
 * Hides the global full-screen loader overlay.
 */
function hideGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("active");
    // Wait for the fade-out transition to complete, then completely remove from DOM to stop spinner animation and free memory
    setTimeout(() => {
      if (!loader.classList.contains("active") && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 250);
  }
}

/**
 * Unified toggle helper for global screen loader overlay.
 * @param {boolean} isLoading - Whether to show or hide the global loader.
 * @param {string} [message] - Optional message to display.
 */
function setGlobalLoading(isLoading, message) {
  if (isLoading) {
    showGlobalLoader(message);
  } else {
    hideGlobalLoader();
  }
}

/**
 * Polling Manager / Background Task Runner
 * Centralizes setInterval/clearInterval logic, supporting automatic page visibility pauses.
 */
const PollingManager = {
  _activePolls: new Map(),

  /**
   * Registers and starts a background polling task.
   * Automatically pauses when the document is hidden and resumes when visible.
   * @param {string} id - Unique identifier for the polling task.
   * @param {function} taskFn - The function to execute.
   * @param {number} intervalMs - Polling interval in milliseconds.
   * @param {boolean} [immediate=true] - Run taskFn immediately on start.
   */
  start(id, taskFn, intervalMs, immediate = true) {
    if (this._activePolls.has(id)) {
      this.stop(id);
    }

    const pollState = {
      taskFn,
      intervalMs,
      intervalId: null,
      isPaused: false
    };

    const startTimer = () => {
      if (pollState.intervalId) return;
      pollState.intervalId = setInterval(() => {
        if (!document.hidden && !pollState.isPaused) {
          taskFn();
        }
      }, intervalMs);
    };

    const stopTimer = () => {
      if (pollState.intervalId) {
        clearInterval(pollState.intervalId);
        pollState.intervalId = null;
      }
    };

    pollState.start = startTimer;
    pollState.stop = stopTimer;

    this._activePolls.set(id, pollState);

    if (immediate) {
      taskFn();
    }

    if (!document.hidden) {
      startTimer();
    }
  },

  /**
   * Stops and removes a background polling task.
   * @param {string} id - The task identifier.
   */
  stop(id) {
    const poll = this._activePolls.get(id);
    if (poll) {
      poll.stop();
      this._activePolls.delete(id);
    }
  },

  /**
   * Temporarily pauses a background polling task.
   * @param {string} id - The task identifier.
   */
  pause(id) {
    const poll = this._activePolls.get(id);
    if (poll) {
      poll.isPaused = true;
    }
  },

  /**
   * Resumes a paused background polling task.
   * @param {string} id - The task identifier.
   */
  resume(id) {
    const poll = this._activePolls.get(id);
    if (poll) {
      poll.isPaused = false;
      if (!poll.intervalId && !document.hidden) {
        poll.start();
      }
    }
  },

  /**
   * Checks if a polling task with the given ID is currently active.
   * @param {string} id
   * @returns {boolean}
   */
  isActive(id) {
    return this._activePolls.has(id);
  }
};

// Global Visibility Change Listener to automatically pause/resume all registered timers
document.addEventListener('visibilitychange', () => {
  const isHidden = document.hidden;
  PollingManager._activePolls.forEach((poll) => {
    if (isHidden) {
      poll.stop();
    } else if (!poll.isPaused) {
      poll.start();
    }
  });
});

// Bind to window namespace
window.setButtonLoading = setButtonLoading;
window.setFieldState = setFieldState;
window.createStatusCard = createStatusCard;
window.renderStatusCard = renderStatusCard;
window.renderEmptyState = renderEmptyState;
window.showGlobalLoader = showGlobalLoader;
window.hideGlobalLoader = hideGlobalLoader;
window.setGlobalLoading = setGlobalLoading;
window.PollingManager = PollingManager;
