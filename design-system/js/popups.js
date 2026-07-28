/**
 * js-popups.js
 * Centralized manager for floating overlays (Dialogs, Toasts, Popovers).
 * Standardized global window integration.
 */

(function () {
  const CSS_CLASSES = {
    IS_OPEN: 'is-open',
    ACTIVE: 'active'
  };

  const SELECTORS = {
    DIALOG_SCRIM: '.dialog-scrim',
    OPEN_DIALOGS: '.dialog-scrim.is-open',
    FOCUSABLE_ELEMENTS: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  };

  const DEFAULT_ICONS = {
    info: 'icon-info',
    success: 'icon-check',
    error: 'icon-circlex',
    warn: 'icon-trianglealert'
  };

  // ── Dialog Management ──────────────────────────────────────────

  function openDialog(scrimId, onClose) {
    const scrim = typeof scrimId === 'string' ? document.getElementById(scrimId) : scrimId;
    if (!scrim) return;

    if (typeof onClose === 'function') {
      scrim._onCloseCallback = onClose;
    }
    
    if (scrim.classList.contains('modal')) {
      if (scrim.classList.contains('show')) return;
      scrim.classList.add('show');
    } else {
      if (scrim.classList.contains(CSS_CLASSES.IS_OPEN)) return;
      scrim.classList.add(CSS_CLASSES.IS_OPEN);
    }
    
    if (window.state) {
      window.state.openDialogCount++;
      if (window.state.openDialogCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    setTimeout(() => {
      const target = scrim.querySelector('[autofocus]') || 
                     scrim.querySelector('input:not([type="hidden"]), select, textarea');
      if (target) {
        target.focus();
      }
    }, 80);
  }

  function closeDialog(scrimId) {
    const scrim = typeof scrimId === 'string'
      ? document.getElementById(scrimId)
      : scrimId;
    if (!scrim) return;
    
    let wasOpen = false;
    if (scrim.classList.contains('modal')) {
      if (scrim.classList.contains('show')) {
        wasOpen = true;
        scrim.classList.remove('show');
      }
    } else {
      if (scrim.classList.contains(CSS_CLASSES.IS_OPEN)) {
        wasOpen = true;
        scrim.classList.remove(CSS_CLASSES.IS_OPEN);
      }
    }

    if (window.state) {
      window.state.openDialogCount = Math.max(0, window.state.openDialogCount - 1);
      if (window.state.openDialogCount === 0) {
        document.body.style.overflow = '';
      }
    }

    if (wasOpen && typeof scrim._onCloseCallback === 'function') {
      const callback = scrim._onCloseCallback;
      delete scrim._onCloseCallback;
      callback();
    }
  }

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

  // ── Toast Management ───────────────────────────────────────────

  function showToast(optionsOrMessage, type = 'info') {
    let opts = {};
    if (typeof optionsOrMessage === 'string') {
      let cleanType = type;
      if (type === 'warning') cleanType = 'warn';
      opts = { message: optionsOrMessage, type: cleanType };
    } else {
      opts = optionsOrMessage || {};
      if (opts.type === 'warning') opts.type = 'warn';
    }

    const {
      message = '',
      type: toastType = 'info',
      duration = 4000,
      customIconClass = null,
      actions = []
    } = opts;

    let wrapper = document.querySelector('.toast-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'toast-wrapper';
      document.body.appendChild(wrapper);
    } else {
      const existingToasts = wrapper.querySelectorAll('.toast');
      existingToasts.forEach(existing => {
        const msgEl = existing.querySelector('.toast-message');
        if (msgEl && msgEl.textContent.trim() === message.trim()) {
          if (existing.dataset.timerId) {
            clearTimeout(parseInt(existing.dataset.timerId, 10));
          }
          existing.remove();
        }
      });
    }

    const toast = document.createElement('div');
    toast.className = `toast ${toastType}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const iconClass = customIconClass || DEFAULT_ICONS[toastType] || DEFAULT_ICONS.info;

    let html = `
      <div class="toast-icon">
        <span class="icon-lucide ${iconClass}"></span>
      </div>
      <div class="toast-body">
        <div class="toast-message">${message}</div>
    `;

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

    if (actions && actions.length > 0) {
      const actionBtns = toast.querySelectorAll('.toast-actions .btn');
      actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-action-idx'), 10);
          const action = actions[idx];
          if (action && action.onClick) {
            action.onClick(toast, e);
          }
          closeToast(toast);
        });
      });
    }

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      closeToast(toast);
    });

    wrapper.appendChild(toast);

    if (duration !== Infinity && duration > 0) {
      const timerId = setTimeout(() => {
        closeToast(toast);
      }, duration);
      toast.dataset.timerId = timerId;
    }

    return toast;
  }

  function closeToast(toast) {
    if (!toast) return;

    if (toast.dataset.timerId) {
      clearTimeout(parseInt(toast.dataset.timerId, 10));
    }

    toast.classList.add('toast-fade-out');

    toast.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
        toast.removeEventListener('transitionend', handler);
        toast.remove();

        const wrapper = document.querySelector('.toast-wrapper');
        if (wrapper && wrapper.children.length === 0) {
          wrapper.remove();
        }
      }
    });

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

  // ── Dropdown and Popover Management ────────────────────────────

  function initDropdownsAndPopovers() {
    document.addEventListener("click", (e) => {
      const dropdownTrigger = e.target.closest(".dropdown-trigger");
      const activeDropdown = dropdownTrigger ? dropdownTrigger.closest(".dropdown") : null;

      const popoverTrigger = e.target.closest(".popover-trigger[data-trigger='click']");
      const activePopover = popoverTrigger ? popoverTrigger.closest(".popover") : null;

      if (activeDropdown && dropdownTrigger) {
        e.preventDefault();
        const menu = activeDropdown.querySelector(".dropdown-menu");
        if (menu) {
          const isActive = menu.classList.contains("active");
          document.querySelectorAll(".dropdown-menu.active").forEach((openMenu) => {
            if (openMenu !== menu) openMenu.classList.remove("active");
          });
          if (isActive) {
            menu.classList.remove("active");
          } else {
            menu.classList.add("active");
          }
        }
      } else {
        const dropdownItem = e.target.closest(".btn.menu");
        if (!e.target.closest(".dropdown-menu") || dropdownItem) {
          document.querySelectorAll(".dropdown-menu.active").forEach((menu) => {
            menu.classList.remove("active");
          });
        }
      }

      if (activePopover && popoverTrigger) {
        e.preventDefault();
        const card = activePopover.querySelector(".popover-card");
        if (card) {
          const isActive = card.classList.contains("active");
          document.querySelectorAll(".popover-card.active").forEach((openCard) => {
            if (openCard !== card) openCard.classList.remove("active");
          });
          if (isActive) {
            card.classList.remove("active");
          } else {
            card.classList.add("active");
          }
        }
      } else {
        if (!e.target.closest(".popover-card")) {
          document.querySelectorAll(".popover-card.active").forEach((card) => {
            card.classList.remove("active");
          });
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".dropdown-menu.active").forEach((menu) => {
          menu.classList.remove("active");
        });
        document.querySelectorAll(".popover-card.active").forEach((card) => {
          card.classList.remove("active");
        });
      }
    });
  }

  // Initialize on script load
  document.addEventListener('DOMContentLoaded', () => {
    initDialogs();
    initDropdownsAndPopovers();
  });

  // Bind to window for global access
  if (typeof window !== 'undefined') {
    window.openDialog = openDialog;
    window.closeDialog = closeDialog;
    window.initDialogs = initDialogs;
    window.showToast = showToast;
    window.closeToast = closeToast;
    window.initDropdownsAndPopovers = initDropdownsAndPopovers;
  }
})();
