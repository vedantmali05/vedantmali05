/**
 * Core UI Design System — Global JavaScript
 * Manages device capabilities, theme states, and dialog configurations.
 */

(function () {
  // Destructure constants from window.CoreUI
  const { THEME_KEYS, CSS_CLASSES, SELECTORS, MOTION_LIMITS } = window.CoreUI || {};

  // Global state container (Session/State values)
  const state = {
    theme: 'light',
    openDialogCount: 0
  };

  /**
   * Detects the browser/hardware motion rendering capability.
   * Adds the 'no-motion' class to the document root element if system is low-end.
   */
  function detectMotionCapability() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < MOTION_LIMITS.MEMORY_THRESHOLD_GB;
    const lowCores = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= MOTION_LIMITS.CORES_THRESHOLD;

    let noGPU = false;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!ctx) noGPU = true;
    } catch (_) {
      noGPU = true;
    }

    if (prefersReduced || lowMemory || lowCores || noGPU) {
      document.documentElement.classList.add(CSS_CLASSES.NO_MOTION);
    }
  }

  /**
   * Retrieves the current saved theme from LocalStorage or system preference fallback.
   * @returns {'light'|'dark'} The active theme key.
   */
  function getSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_KEYS.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === THEME_KEYS.DARK || (!savedTheme && systemPrefersDark)
      ? THEME_KEYS.DARK
      : THEME_KEYS.LIGHT;
  }

  /**
   * Applies a specific theme, saves to localStorage, updates session state, and dispatches a 'themechanged' event.
   * @param {'light'|'dark'} theme - The theme to apply.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEYS.STORAGE_KEY, theme);
    state.theme = theme; // Update active theme in shared session state

    // Dispatch a global event so that project-specific layouts can update their custom theme triggers
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
  }

  /**
   * Toggles the system color theme between light and dark modes.
   * @returns {'light'|'dark'} The newly active theme key.
   */
  function toggleTheme() {
    const activeTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = activeTheme === THEME_KEYS.DARK ? THEME_KEYS.LIGHT : THEME_KEYS.DARK;
    applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Initializes the theme state on load.
   */
  function initTheme() {
    const currentTheme = getSavedTheme();
    applyTheme(currentTheme);
  }

  /**
   * Opens a native modal or non-modal dialog window by its element ID.
   * @param {string} scrimId - The HTML ID of the dialog's backdrop/scrim container.
   */
  function openDialog(scrimId) {
    const scrim = document.getElementById(scrimId);
    if (!scrim || scrim.classList.contains(CSS_CLASSES.IS_OPEN)) return;
    scrim.classList.add(CSS_CLASSES.IS_OPEN);
    state.openDialogCount++; // Update dialog count in shared session state

    if (state.openDialogCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    // Focus first focusable element after transition
    setTimeout(() => {
      const first = scrim.querySelector(SELECTORS.FOCUSABLE_ELEMENTS);
      if (first) {
        first.focus();
      }
    }, 80);
  }

  /**
   * Closes an active dialog window by its element ID or DOM reference.
   * @param {string|HTMLElement} scrimId - The HTML ID of the dialogScrim or the DOM element reference.
   */
  function closeDialog(scrimId) {
    const scrim = typeof scrimId === 'string'
      ? document.getElementById(scrimId)
      : scrimId;
    if (!scrim || !scrim.classList.contains(CSS_CLASSES.IS_OPEN)) return;
    scrim.classList.remove(CSS_CLASSES.IS_OPEN);
    state.openDialogCount = Math.max(0, state.openDialogCount - 1); // Update dialog count in shared session state

    if (state.openDialogCount === 0) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Attaches event listeners for closing dialogs on Escape press and backdrop clicks.
   */
  function initDialogs() {
    // Esc closes any open dialog
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll(SELECTORS.OPEN_DIALOGS).forEach(s => closeDialog(s));
    });

    // Backdrop click and Tab focus traps
    document.querySelectorAll(SELECTORS.DIALOG_SCRIM).forEach(scrim => {
      const isModal = scrim.dataset.modal !== 'false';
      scrim.addEventListener('click', (e) => {
        if (!isModal && e.target === scrim) {
          closeDialog(scrim);
        }
      });

      if (isModal) {
        scrim.addEventListener('keydown', (e) => {
          if (e.key !== 'Tab' || !scrim.classList.contains(CSS_CLASSES.IS_OPEN)) return;
          const focusable = [...scrim.querySelectorAll(SELECTORS.FOCUSABLE_ELEMENTS)];
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });
      }
    });
  }

  // ── Toast Notification Management ───────────────────────────
  const DEFAULT_ICONS = {
    info: 'icon-info',
    success: 'icon-check',
    error: 'icon-circlex',
    warn: 'icon-trianglealert'
  };

  /**
   * Options for configuring an interactive button inside a toast notification.
   * @typedef {Object} ToastAction
   * @property {string} label - The text label for the action button.
   * @property {boolean} [primary=false] - Whether the button should use primary accent styling.
   * @property {function(HTMLElement, Event): void} onClick - Callback executed when the action button is clicked.
   */

  /**
   * Options for configuring and displaying a toast notification.
   * @typedef {Object} ToastOptions
   * @property {string} [message=''] - The text message content to display in the toast.
   * @property {'info'|'success'|'error'|'warn'} [type='info'] - The status variant of the toast.
   * @property {number} [duration=4000] - Duration in milliseconds before auto-dismissing (use Infinity for persistent toasts).
   * @property {string|null} [customIconClass=null] - Optional class name of a custom Lucide icon to display.
   * @property {ToastAction[]} [actions=[]] - Optional list of interactive secondary action buttons.
   */

  /**
   * Triggers and displays a toast notification overlay with optional actions.
   * @param {ToastOptions} [options={}] - Configuration options for the toast.
   * @returns {HTMLElement} The created toast DOM element.
   */
  function showToast({
    message = '',
    type = 'info',
    duration = 4000,
    customIconClass = null,
    actions = []
  } = {}) {
    // 1. Get or create the wrapper container
    let wrapper = document.querySelector('.toast-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'toast-wrapper';
      document.body.appendChild(wrapper);
    }

    // 2. Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    // 3. Determine icon class
    const iconClass = customIconClass || DEFAULT_ICONS[type] || DEFAULT_ICONS.info;

    // 4. Build inner HTML
    let html = `
      <div class="toast-icon">
        <span class="icon-lucide ${iconClass}"></span>
      </div>
      <div class="toast-body">
        <div class="toast-message">${message}</div>
    `;

    // 5. Add action buttons if provided
    if (actions && actions.length > 0) {
      html += `<div class="toast-actions">`;
      actions.forEach((action, idx) => {
        const isPrimary = action.primary ? 'primary' : 'secondary';
        html += `<button class="btn sz-small ${isPrimary}" data-action-idx="${idx}">${action.label}</button>`;
      });
      html += `</div>`;
    }

    html += `
      </div>
      <button class="btn icon ghost sz-small toast-close" aria-label="Close toast">
        <span class="icon-lucide icon-x"></span>
      </button>
    `;

    toast.innerHTML = html;

    // 6. Bind action buttons click handler
    if (actions && actions.length > 0) {
      const actionBtns = toast.querySelectorAll('.toast-actions .btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-action-idx'), 10);
          const action = actions[idx];
          if (action && typeof action.onClick === 'function') {
            action.onClick(toast, e);
          }
          closeToast(toast);
        });
      });
    }

    // 7. Bind close button click handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      closeToast(toast);
    });

    // 8. Append to wrapper container
    wrapper.appendChild(toast);

    // 9. Auto-dismiss timer
    if (duration !== Infinity && duration > 0) {
      const timerId = setTimeout(() => {
        closeToast(toast);
      }, duration);
      toast.dataset.timerId = timerId;
    }

    return toast;
  }

  /**
   * Initiates the close/dismissal transition of a toast notification and clears its active timers.
   * @param {HTMLElement} toast - The toast DOM element reference to close.
   */
  function closeToast(toast) {
    if (!toast) return;

    // Clear auto-dismiss timer if running
    if (toast.dataset.timerId) {
      clearTimeout(parseInt(toast.dataset.timerId, 10));
    }

    // Fade out transition
    toast.classList.add('toast-fade-out');

    // Remove elements on transition end
    toast.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
        toast.removeEventListener('transitionend', handler);
        toast.remove();

        // Remove wrapper container if empty
        const wrapper = document.querySelector('.toast-wrapper');
        if (wrapper && wrapper.children.length === 0) {
          wrapper.remove();
        }
      }
    });

    // Fallback deletion (in case transitions are disabled/halted)
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
        const wrapper = document.querySelector('.toast-wrapper');
        if (wrapper && wrapper.children.length === 0) {
          wrapper.remove();
        }
      }
    }, 350);
  }

  // ── Bind functions & state to window namespace ────────────────
  if (typeof window !== 'undefined') {
    window.CoreUI = window.CoreUI || {};
    window.CoreUI.state = state;
    window.CoreUI.detectMotionCapability = detectMotionCapability;
    window.CoreUI.getSavedTheme = getSavedTheme;
    window.CoreUI.applyTheme = applyTheme;
    window.CoreUI.toggleTheme = toggleTheme;
    window.CoreUI.initTheme = initTheme;
    window.CoreUI.openDialog = openDialog;
    window.CoreUI.closeDialog = closeDialog;
    window.CoreUI.initDialogs = initDialogs;
    window.CoreUI.showToast = showToast;
    window.CoreUI.closeToast = closeToast;

    // Flatten primary functions and state to window for convenient global invocation
    window.openDialog = openDialog;
    window.closeDialog = closeDialog;
    window.toggleTheme = toggleTheme;
    window.applyTheme = applyTheme;
    window.getSavedTheme = getSavedTheme;
    window.showToast = showToast;
    window.closeToast = closeToast;

    // Global Auto-Initialization
    detectMotionCapability();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initDialogs();
      });
    } else {
      initTheme();
      initDialogs();
    }
  }
})();
