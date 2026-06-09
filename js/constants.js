/**
 * Core UI Design System — Global Constants
 * Holds theme values, CSS classes, query selectors, and thresholds.
 */

(function () {
  const THEME_KEYS = {
    LIGHT: 'light',
    DARK: 'dark',
    STORAGE_KEY: 'theme'
  };

  const CSS_CLASSES = {
    NO_MOTION: 'no-motion',
    IS_OPEN: 'is-open'
  };

  const SELECTORS = {
    DIALOG_SCRIM: '.dialog-scrim',
    OPEN_DIALOGS: '.dialog-scrim.is-open',
    FOCUSABLE_ELEMENTS: 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  };

  const MOTION_LIMITS = {
    MEMORY_THRESHOLD_GB: 2,
    CORES_THRESHOLD: 2
  };

  // Bind to window.CoreUI namespace for global access across scripts
  if (typeof window !== 'undefined') {
    window.CoreUI = window.CoreUI || {};
    window.CoreUI.THEME_KEYS = THEME_KEYS;
    window.CoreUI.CSS_CLASSES = CSS_CLASSES;
    window.CoreUI.SELECTORS = SELECTORS;
    window.CoreUI.MOTION_LIMITS = MOTION_LIMITS;
  }
})();
