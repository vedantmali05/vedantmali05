// Rudra Components Sync Logic
document.addEventListener("DOMContentLoaded", () => {
  const gatewaySelect = document.getElementById("gatewaySelect") || document.getElementById("gateway-select");
  const slaveInput = document.getElementById("slaveInput") || document.getElementById("slave-input") || document.getElementById("slaveSelect");

  const gatewayDisplayVal = document.getElementById("gatewayDisplayVal") || document.getElementById("gateway-display-val");
  const slaveDisplayVal = document.getElementById("slaveDisplayVal") || document.getElementById("slave-display-val");

  function syncGatewayDisplay() {
    if (!gatewaySelect || !gatewayDisplayVal) return;
    const selectedOpt = gatewaySelect.options[gatewaySelect.selectedIndex];
    gatewayDisplayVal.textContent = selectedOpt ? selectedOpt.textContent : "No gateway selected";
  }

  function syncSlaveDisplay() {
    if (!slaveInput || !slaveDisplayVal) return;
    const selectedOpt = slaveInput.options[slaveInput.selectedIndex];
    slaveDisplayVal.textContent = selectedOpt ? selectedOpt.textContent : "No slave selected";
  }

  if (gatewaySelect) {
    gatewaySelect.addEventListener("change", syncGatewayDisplay);

    // Sync initially and on dynamic populate
    const observer = new MutationObserver(syncGatewayDisplay);
    observer.observe(gatewaySelect, { childList: true, characterData: true, subtree: true });

    // Also trigger whenever the select value changes programmatically
    const origValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (origValueDescriptor) {
      Object.defineProperty(gatewaySelect, 'value', {
        get: origValueDescriptor.get,
        set: function (val) {
          origValueDescriptor.set.call(this, val);
          syncGatewayDisplay();
        }
      });
    }
    syncGatewayDisplay();
  }

  if (slaveInput) {
    slaveInput.addEventListener("change", syncSlaveDisplay);

    const observer = new MutationObserver(syncSlaveDisplay);
    observer.observe(slaveInput, { childList: true, characterData: true, subtree: true });

    const origValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (origValueDescriptor) {
      Object.defineProperty(slaveInput, 'value', {
        get: origValueDescriptor.get,
        set: function (val) {
          origValueDescriptor.set.call(this, val);
          syncSlaveDisplay();
        }
      });
    }
    syncSlaveDisplay();
  }

  const testSelect = document.getElementById("testSelect") || document.getElementById("test-select");
  const testDisplayVal = document.getElementById("testDisplayVal") || document.getElementById("test-display-val");

  function syncTestDisplay() {
    if (!testSelect || !testDisplayVal) return;
    const selectedOpt = testSelect.options[testSelect.selectedIndex];
    testDisplayVal.textContent = selectedOpt && selectedOpt.value ? selectedOpt.textContent : "No test selected";
  }

  if (testSelect) {
    testSelect.addEventListener("change", syncTestDisplay);

    const observer = new MutationObserver(syncTestDisplay);
    observer.observe(testSelect, { childList: true, characterData: true, subtree: true });

    const origValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    if (origValueDescriptor) {
      Object.defineProperty(testSelect, 'value', {
        get: origValueDescriptor.get,
        set: function (val) {
          origValueDescriptor.set.call(this, val);
          syncTestDisplay();
        }
      });
    }
    syncTestDisplay();
  }
});

function setSlaveSelectorVisibility(visible) {
  const divider = document.getElementById("slaveRowDivider");
  const wrapper = document.getElementById("slaveRowWrapper");
  if (divider) divider.style.display = visible ? "block" : "none";
  if (wrapper) wrapper.style.display = visible ? "flex" : "none";
}

/**
 * Shows an empty-state card in a popover container.
 * @param {string} containerId - The ID of the popover container element.
 * @param {Object} options - Configuration options.
 * @param {string} options.title - Popover title.
 * @param {string} options.description - Popover description.
 * @param {string} options.icon - Popover icon HTML string.
 * @param {string} options.buttonText - Text for the primary action button.
 * @param {string} options.buttonHref - Href URL for the action button.
 * @param {string} [options.width='320px'] - Popover card width.
 * @param {string} [options.align='align-bottom-center'] - Popover card alignment class.
 */
function showEmptyStatePopover(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing popover cards
  clearPopover(containerId);

  const popoverCard = document.createElement('div');
  popoverCard.className = `popover-card ${options.align || 'align-bottom-center'}`;
  popoverCard.style.width = options.width || '320px';
  popoverCard.style.padding = 'var(--space-md)';
  popoverCard.style.pointerEvents = 'auto'; // allow interaction

  const title = options.title || 'No Items';
  const description = options.description || 'No items available.';
  const icon = options.icon || '';
  const buttonText = options.buttonText || '';
  const buttonHref = options.buttonHref || '#';

  let buttonHtml = '';
  if (buttonText) {
    buttonHtml = `
      <a href="${buttonHref}" class="btn primary sz-small" style="text-decoration: none; display: inline-flex; align-items: center; gap: var(--space-xs); width: 100%; justify-content: center;">
        <i class="icon-lucide icon-plus"></i>
        <span>${buttonText}</span>
      </a>`;
  }

  const emptyStateHtml = renderEmptyStateHTML({
    icon: icon,
    title: title,
    description: description,
    type: 'sz-small',
    buttons: buttonHtml
  });

  popoverCard.innerHTML = `<div class="popover-body" style="padding: 0;">${emptyStateHtml}</div>`;
  container.appendChild(popoverCard);
}

/**
 * Removes any active popover card from the specified container.
 * @param {string} containerId - The ID of the popover container element.
 */
function clearPopover(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const existingCard = container.querySelector('.popover-card');
  if (existingCard) {
    existingCard.remove();
  }
}

// default client-side DOM table rows sorter has been moved to js-table.js

/**
 * Renders an HTML string for standard empty states.
 * @param {Object} params - Configuration for the empty state.
 * @param {string} params.title - The primary title (required).
 * @param {string} params.description - The descriptive text (required).
 * @param {string} [params.icon] - HTML string for the icon.
 * @param {string} [params.subtitle] - Optional subtitle text.
 * @param {string} [params.buttons] - HTML string for actionable buttons.
 * @param {string} [params.type] - Size/layout modifier.
 * @returns {string} The constructed HTML.
 */
function renderEmptyStateHTML({ title, description, icon = '', subtitle = '', buttons = '', type = '' }) {
  const classes = ['empty-state'];
  if (type) {
    classes.push(type);
  }
  let html = '<div class="' + classes.join(' ') + '">';
  if (icon) {
    html += '<div class="empty-state-icon">' + icon + '</div>';
  }
  html += '<p class="empty-state-title">' + title + '</p>';
  if (subtitle) {
    html += '<p class="empty-state-subtitle">' + subtitle + '</p>';
  }
  html += '<p class="empty-state-description">' + description + '</p>';
  if (buttons) {
    html += '<div class="empty-state-actions">' + buttons + '</div>';
  }
  html += '</div>';
  return html;
}

/**
 * Renders an HTML string for a status-card component.
 * @param {Object} opts
 * @param {string} [opts.title]       - Bold title text inside the card body.
 * @param {string} [opts.description] - Muted description text inside the card body.
 * @param {string} [opts.icon]        - Icon HTML string.
 * @param {string} [opts.variant]     - Variant modifiers: 'outlined', 'emphasized', 'error', 'warning', 'info', 'success'.
 * @param {string} [opts.size]        - Size modifier: 'xsmall', 'small', 'large'.
 * @param {string} [opts.extraClasses]- Additional CSS classes to append.
 * @returns {string} The constructed HTML string.
 */
function renderStatusCardHTML({ title = '', description = '', icon = '', variant = '', size = '', extraClasses = '' } = {}) {
  const classes = ['status-card'];
  if (variant) classes.push(variant);
  if (size) classes.push(size);
  if (extraClasses) classes.push(extraClasses);

  let html = '<div class="' + classes.join(' ') + '">';
  if (icon) html += icon;
  if (title || description) {
    html += '<div class="status-card-body">';
    if (title) html += '<span class="status-card-title">' + title + '</span>';
    if (description) html += '<span class="status-card-description">' + description + '</span>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}


// ==========================================================================
// Action Bar Component
// ==========================================================================

function createActionBar(options = {}) {
  const barId = options.id || 'core-action-bar';
  let barEl = document.getElementById(barId);

  if (!barEl) {
    barEl = document.createElement('div');
    barEl.id = barId;
    barEl.className = 'action-bar';
    document.body.appendChild(barEl);
  }

  function setItems(items) {
    barEl.innerHTML = '';

    items.forEach((item) => {
      if (item === '|' || item === 'separator') {
        const sep = document.createElement('div');
        sep.className = 'action-bar-separator';
        barEl.appendChild(sep);
        return;
      }

      const itemWrapper = document.createElement('div');
      itemWrapper.className = 'action-bar-item';

      if (item instanceof HTMLElement) {
        itemWrapper.appendChild(item);
      } else if (typeof item === 'string') {
        itemWrapper.innerHTML = item;
      } else if (item && typeof item === 'object') {
        if (item.type === 'text') {
          const textSpan = document.createElement('span');
          textSpan.textContent = item.text || '';
          if (item.className) textSpan.className = item.className;
          itemWrapper.appendChild(textSpan);
        } else if (item.type === 'button') {
          const btn = document.createElement('button');
          btn.className = item.className || 'btn primary sz-small';
          btn.textContent = item.text || '';
          if (item.onclick) {
            btn.addEventListener('click', item.onclick);
          }
          itemWrapper.appendChild(btn);
        }
      }
      barEl.appendChild(itemWrapper);
    });
  }

  function show() {
    barEl.classList.add('visible');
  }

  function hide() {
    barEl.classList.remove('visible');
  }

  function destroy() {
    if (barEl && barEl.parentNode) {
      barEl.parentNode.removeChild(barEl);
    }
  }

  if (options.items) {
    setItems(options.items);
  }

  if (options.visible) {
    show();
  } else {
    hide();
  }

  return {
    element: barEl,
    setItems,
    show,
    hide,
    destroy
  };
};

/**
 * Creates the Report Metadata Header component dynamically.
 * @param {string|HTMLElement} container - The container selector or element.
 * @param {string} title - The report title (e.g., 'Load Test Report' or 'Trend Report').
 */
function reportMetadataHeader(container, title, footerHtml) {
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if (!el) return;

  const keys = window.STORAGE_KEYS || {};
  const compName = localStorage.getItem(keys.COMPANY_NAME) || 'Coexio';
  const compAddress = localStorage.getItem(keys.COMPANY_ADDRESS) || '';
  const compLogo = localStorage.getItem(keys.COMPANY_LOGO) || '';

  el.innerHTML = `
    <section class="report-metadata-header">
      <div>
        <p class="h4">${escapeHtml(compName)}</p>
        ${compAddress ? `<p class="small muted">${escapeHtml(compAddress)}</p>` : ''}
        <p>${title}</p>
      </div>
      ${compLogo ? `<img src="${escapeHtml(compLogo)}" class="report-logo" alt="Company Logo" onerror="this.style.display='none'">` : ''}
    </section>

    <div class="report-grid-layout">
      <!-- Test Details -->
      <section class="report-section">
        <h2 class="h4 muted">Test Details</h2>
        <dl class="details-list">
          <div class="details-row">
            <dt>Test Id</dt>
            <dd id="infoTestId">—</dd>
          </div>
          <div class="details-row">
            <dt>Gateway Id</dt>
            <dd id="infoGatewayId">—</dd>
          </div>
          <div class="details-row">
            <dt>Cycle Name</dt>
            <dd id="infoCycleName">—</dd>
          </div>
          <div class="details-row">
            <dt>Status</dt>
            <dd id="infoStatusContainer">—</dd>
          </div>
          <div class="details-row">
            <dt>Remark</dt>
            <dd id="infoRemark">—</dd>
          </div>
        </dl>
      </section>

      <!-- DG & Engine Details -->
      <section class="report-section">
        <h2 class="h4 muted">DG & Engine Details</h2>
        <dl class="details-list">
          <div class="details-row">
            <dt>Dg Rating</dt>
            <dd id="infoDgRating">—</dd>
          </div>
          <div class="details-row">
            <dt>Eng Model</dt>
            <dd id="infoEngineModel">—</dd>
          </div>
          <div class="details-row">
            <dt>Alt Model</dt>
            <dd id="infoAltModel">—</dd>
          </div>
          <div class="details-row">
            <dt>Eng Sr No</dt>
            <dd id="infoEngineSr">—</dd>
          </div>
          <div class="details-row">
            <dt>Alt Sr No</dt>
            <dd id="infoAltSr">—</dd>
          </div>
        </dl>
      </section>

      <!-- Customer & Operator -->
      <section class="report-section">
        <h2 class="h4 muted">Customer & Operator</h2>
        <dl class="details-list">
          <div class="details-row">
            <dt>Customer</dt>
            <dd id="infoCustomer">—</dd>
          </div>
          <div class="details-row">
            <dt>Ope Name</dt>
            <dd id="infoOperator">—</dd>
          </div>
          <div class="details-row">
            <dt>Ope Mobile</dt>
            <dd id="infoMobile">—</dd>
          </div>
        </dl>
      </section>

      <!-- Timeline & Duration -->
      <section class="report-section full-width">
        <h2 class="h4 muted">Timeline & Duration</h2>
        <dl class="details-row">
          <div>
            <dt>Created At</dt>
            <dd id="infoCreatedAt">—</dd>
          </div>
          <span class="separator"></span>
          <div>
            <dt>Started At</dt>
            <dd id="infoStartedAt">—</dd>
          </div>
          <span class="separator"></span>
          <div>
            <dt>Last Updated</dt>
            <dd id="infoLastUpdatedTime">—</dd>
          </div>
          <span class="separator"></span>
          <div>
            <dt>Duration</dt>
            <dd id="infoDuration">—</dd>
          </div>
        </dl>
      </section>
    </div>

    ${footerHtml ? `<div class="report-actions-footer">${footerHtml}</div>` : ''}
  `;
};

/**
 * Report Metadata Editor Dialog component.
 */
reportMetadataEditorDialog = {
  init(container, options = {}) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    const dialogId = options.dialogId || 'editDetailsDialog';
    const formId = options.formId || 'editDetailsForm';
    const saveBtnId = options.saveBtnId || 'saveDetailsBtn';

    el.innerHTML = `
      <div class="dialog-scrim" id="${dialogId}" data-modal="true" role="dialog" aria-modal="true" aria-labelledby="${dialogId}-title">
        <div class="dialog-box" data-size="lg">
          <div class="dialog-header">
            <div class="dialog-title-group">
              <h3 class="dialog-title" id="${dialogId}-title">Edit DG/Customer details</h3>
              <p class="dialog-subtitle" id="${dialogId}-subtitle">Update parameters for this test cycle</p>
            </div>
            <button class="btn icon ghost" onclick="closeDialog('${dialogId}')" aria-label="Close">
              <span class="icon-lucide icon-x"></span>
            </button>
          </div>
          <div class="dialog-content dialog-content-scrollable">
            <form id="${formId}" class="form-flex-col" onsubmit="event.preventDefault();">
              <!-- Test Details -->
              <div>
                <h4 class="form-section-title">Test Details</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label" for="input-cycleName">
                      Cycle Name
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Identifies this specific test execution cycle.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-cycleName" class="input-field" name="cycleName" placeholder="Enter cycle name">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-description">
                      Description
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Brief summary or objectives of the test.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-description" class="input-field" name="description" placeholder="Enter description">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-remark">
                      Remark
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Any observations, notes, or comments.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-remark" class="input-field" name="remark" placeholder="Enter remark">
                    </div>
                  </div>
                  <div class="form-group grid-col-full">
                    <label class="form-label">
                      Status
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Toggles the visibility and operational state of the cycle.</div>
                      </div>
                    </label>
                    <div class="choice-card-row">
                      <label class="choice-card">
                        <input type="radio" name="status" class="form-check-input choice-card-input" value="Active">
                        <div class="choice-card-content">
                          <span class="choice-card-title">Active</span>
                        </div>
                      </label>
                      <label class="choice-card">
                        <input type="radio" name="status" class="form-check-input choice-card-input" value="Deactive">
                        <div class="choice-card-content">
                          <span class="choice-card-title">Deactive</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Configuration Details -->
              ${options.showConfigFields ? `
              <div>
                <h4 class="form-section-title">Configuration Details</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label" for="input-configFile">
                      Configuration File *
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Enter configuration file name.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-configFile" class="input-field" name="configFile" value="confiqw.json" placeholder="e.g. confiqw_v1.json" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-slaveId">
                      Select Slave ID *
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Enter Modbus slave device identifier.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="number" id="input-slaveId" class="input-field" name="slaveId" placeholder="Enter Slave ID" min="1" step="1">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-mapping">
                      Trends Config File
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Enter trends configuration mapping file name.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-mapping" class="input-field" name="mapping" placeholder="e.g. report-schneider-mapping.json">
                    </div>
                  </div>
                </div>
              </div>
              ` : ''}

              <!-- Customer & Operator -->
              <div>
                <h4 class="form-section-title">Customer & Operator</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label" for="input-customer">
                      Customer
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Client or organization requesting the test.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-customer" class="input-field" name="customer" placeholder="Enter customer name">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-operatorName">
                      Operator Name
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Full name of the technician running the test.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-operatorName" class="input-field" name="operatorName" placeholder="Enter operator name">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-operatorMobile">
                      Operator Mobile
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Technician contact number for coordination.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-operatorMobile" class="input-field" name="operatorMobile" placeholder="Enter operator mobile">
                    </div>
                  </div>
                </div>
              </div>

              <!-- DG & Engine Details -->
              <div>
                <h4 class="form-section-title">DG & Engine Details</h4>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label" for="input-dgRating">
                      DG Rating
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Generator rating capacity (kVA).</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-dgRating" class="input-field" name="dgRating" placeholder="Enter DG rating">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-engineModel">
                      Engine Model
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Model/specification series of the generator engine.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-engineModel" class="input-field" name="engineModel" placeholder="Enter engine model">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-alternatorModel">
                      Alternator Model
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Model/specification series of the alternator.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-alternatorModel" class="input-field" name="alternatorModel" placeholder="Enter alternator model">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-engineSrNo">
                      Engine SR No
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Unique factory serial number of the engine.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-engineSrNo" class="input-field" name="engineSrNo" placeholder="Enter engine SR number">
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="input-alternatorSrNo">
                      Alternator SR No
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Unique factory serial number of the alternator.</div>
                      </div>
                    </label>
                    <div class="input-container">
                      <input type="text" id="input-alternatorSrNo" class="input-field" name="alternatorSrNo" placeholder="Enter alternator SR number">
                    </div>
                  </div>
                  <div class="form-group grid-col-full">
                    <label class="form-label">
                      Start/Stop
                      <div class="popover trigger-hover">
                        <span class="icon-lucide icon-info"></span>
                        <div class="popover-card align-top-center">Triggers the start/stop cycle sequence.</div>
                      </div>
                    </label>
                    <div class="choice-card-row">
                      <label class="choice-card">
                        <input type="radio" name="startStop" class="form-check-input choice-card-input" value="Start">
                        <div class="choice-card-content">
                          <span class="choice-card-title">Start</span>
                        </div>
                      </label>
                      <label class="choice-card">
                        <input type="radio" name="startStop" class="form-check-input choice-card-input" value="Stop">
                        <div class="choice-card-content">
                          <span class="choice-card-title">Stop</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="dialog-footer">
            <div class="dialog-footer-left">
              <button type="button" class="btn ghost danger" onclick="closeDialog('${dialogId}')">Cancel</button>
            </div>
            <div class="dialog-footer-right">
              <button type="button" class="btn primary" id="${saveBtnId}">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind event listeners
    const form = document.getElementById(formId);
    const saveBtn = document.getElementById(saveBtnId);

    if (saveBtn) {
      saveBtn.onclick = async () => {
        if (typeof options.onSave === 'function') {
          await options.onSave(form);
        }
      };
    }
  },

  populate(formId, meta = {}) {
    const form = typeof formId === 'string' ? document.getElementById(formId) : formId;
    if (!form) return;

    form.cycleName.value = meta.cycle_name ?? '';
    form.description.value = meta.description ?? '';
    form.customer.value = meta.cust ?? meta.customer ?? '';
    form.operatorName.value = meta.op_nm ?? meta.operator_name ?? '';
    form.operatorMobile.value = meta.op_mob ?? meta.mobile ?? '';
    form.remark.value = meta.remark ?? '';
    form.dgRating.value = meta.dg_rating ?? meta.rating ?? '';
    form.engineModel.value = meta.engine_model ?? '';
    form.alternatorModel.value = meta.alternator_model ?? meta.alt_model ?? '';
    form.engineSrNo.value = meta.engine_srno ?? meta.engine_sr_no ?? '';
    form.alternatorSrNo.value = meta.alternator_srno ?? meta.alt_sr_no ?? '';

    if (form.configFile) {
      form.configFile.value = meta.config_file ?? 'confiqw.json';
    }
    if (form.slaveId) {
      form.slaveId.value = (meta.slave_id !== undefined && meta.slave_id !== null) ? meta.slave_id : '';
    }
    if (form.mapping) {
      form.mapping.value = meta.mapping ?? 'report-schneider-mapping.json';
    }

    const statusVal = meta.status ? (meta.status.charAt(0).toUpperCase() + meta.status.slice(1).toLowerCase()) : 'Deactive';
    const statusRadio = form.querySelector(`input[name="status"][value="${statusVal}"]`);
    if (statusRadio) {
      statusRadio.checked = true;
    }

    const startStopVal = meta.start_stop ? (meta.start_stop.charAt(0).toUpperCase() + meta.start_stop.slice(1).toLowerCase()) : 'Start';
    const startStopRadio = form.querySelector(`input[name="startStop"][value="${startStopVal}"]`);
    if (startStopRadio) {
      startStopRadio.checked = true;
    }
  },

  async save(formId, testCycleId, token, options = {}) {
    const form = typeof formId === 'string' ? document.getElementById(formId) : formId;
    if (!form) return false;

    const payload = {
      cycle_name: form.cycleName.value,
      description: form.description.value,
      cust: form.customer.value,
      op_nm: form.operatorName.value,
      op_mob: form.operatorMobile.value,
      remark: form.remark.value,
      status: form.status.value.toLowerCase(),
      dg_rating: form.dgRating.value || '',
      engine_model: form.engineModel.value,
      alternator_model: form.alternatorModel.value,
      engine_srno: form.engineSrNo.value,
      alternator_srno: form.alternatorSrNo.value,
      start_stop: form.startStop.value.toLowerCase(),
      ...(form.configFile ? { config_file: form.configFile.value } : {}),
      ...(form.slaveId ? { slave_id: form.slaveId.value ? Number(form.slaveId.value) : null } : {}),
      ...(form.mapping ? { mapping: form.mapping.value } : {})
    };

    if (!payload.op_mob) {
      Component.showToast("Operator mobile number is required.", "warning");
      return false;
    }
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(payload.op_mob)) {
      Component.showToast("Enter a valid 10-digit mobile number.", "warning");
      return false;
    }

    if (typeof options.onBeforeSubmit === 'function') {
      const allowed = await options.onBeforeSubmit(payload);
      if (!allowed) return false;
    }

    const saveBtn = options.saveBtn || document.getElementById(options.saveBtnId || 'saveDetailsBtn');
    if (saveBtn) {
      setButtonLoading(saveBtn, true);
    }

    try {
      if (!window.TestCyclesAPI) throw new Error("TestCyclesAPI is not defined");
      const body = await window.TestCyclesAPI.updateTestCycle(testCycleId, payload);

      if (typeof options.onSuccess === 'function') {
        await options.onSuccess(body, payload);
      }
      return true;
    } catch (err) {
      console.error(err);
      Component.showToast('Failed to save details: ' + (err?.message || 'Unknown error'), 'error');
      if (typeof options.onError === 'function') {
        options.onError(err);
      }
      return false;
    } finally {
      if (saveBtn) {
        setButtonLoading(saveBtn, false);
      }
    }
  }
};

/**
 * Renders a unified HTML card for a test cycle.
 * @param {Object} options Configuration options
 * @param {Object} options.tc The test cycle data object
 * @param {boolean} [options.showCheckbox=false] Whether to show selection checkbox
 * @param {boolean} [options.showSrNo=false] Whether to show serial number
 * @param {number|string} [options.srNo] Serial number value
 * @param {boolean} [options.showDescription=false] Whether to show description
 * @param {boolean} [options.showDuration=false] Whether to show duration
 * @param {boolean} [options.showLastUpdated=false] Whether to show last updated time
 * @param {boolean} [options.isCheckboxDisabled=false] Whether the checkbox is disabled
 * @param {string} [options.formattedDuration] Pre-formatted duration HTML
 * @returns {string} HTML string for the card
 */
function renderTestCycleCardHTML(options) {
  const {
    tc,
    showCheckbox = false,
    showSrNo = false,
    srNo = '',
    showDescription = false,
    showDuration = false,
    showLastUpdated = false,
    isCheckboxDisabled = false,
    formattedDuration = ''
  } = options;

  const status = (tc.status || '').toLowerCase();
  const statusLabel = status === 'active' ? 'Active' : 'Deactive';
  const badgeClass = status === 'active' ? 'success' : 'warning';
  const dotClass = status === 'active' ? 'success' : 'warning';

  // Row 1
  let row1LeftHTML = '';
  if (showCheckbox) {
    row1LeftHTML += `
      <div class="checkbox-wrap">
        <label class="table-checkbox-label">
          <input type="checkbox" class="form-check-input row-checkbox" ${isCheckboxDisabled ? 'disabled' : ''}>
        </label>
      </div>
    `;
  }
  if (showSrNo) {
    row1LeftHTML += `<div class="card-srno font-code"><span>#${srNo || tc.sr_no || ''}</span></div>`;
  }

  row1LeftHTML += `
    <div class="title-desc-group">
      <div class="card-name" title="${tc.cycle_name || 'Unnamed Test Cycle'}">${tc.cycle_name || 'Unnamed Test Cycle'}</div>
      ${showDescription ? `<div class="card-desc">${tc.description || 'No description provided.'}</div>` : ''}
    </div>
  `;

  const row1HTML = `
    <div class="card-row-top">
      <div class="row-top-left">
        ${row1LeftHTML}
      </div>
      <div class="row-top-right">
        <span class="badge emphasized ${badgeClass} sz-small">
          <span class="dot ${dotClass}"></span>
          ${statusLabel}
        </span>
      </div>
    </div>
  `;

  // Row 2: Key value row
  // Items: Test ID, Duration, Created At, Last Updated
  let keyValuesHTML = '';

  // Test ID (both)
  keyValuesHTML += `
    <div class="meta-item">
      <span class="label">Test ID</span>
      <span class="value font-code">${tc.id || '—'}</span>
    </div>
  `;

  // Duration (only on overview.html)
  if (showDuration) {
    keyValuesHTML += `
      <div class="meta-item">
        <span class="label">Duration</span>
        <span class="value">${formattedDuration || tc.duration || '—'}</span>
      </div>
    `;
  }

  // Created At (both)
  let createdAtFormatted = tc.created_at || '—';
  if (createdAtFormatted && createdAtFormatted !== '—' && !showCheckbox) {
    // If not on test-cycles.html (i.e. overview.html), format it
    createdAtFormatted = formatDateTime(tc.created_at, 'toLocaleString');
  }
  keyValuesHTML += `
    <div class="meta-item">
      <span class="label">Created At</span>
      <span class="value">${createdAtFormatted}</span>
    </div>
  `;

  // Last Updated (only on test-cycles.html)
  if (showLastUpdated) {
    keyValuesHTML += `
      <div class="meta-item">
        <span class="label">Last Updated</span>
        <span class="value">${tc.last_updated || '—'}</span>
      </div>
    `;
  }

  const row2HTML = `
    <div class="card-row-mid">
      ${keyValuesHTML}
    </div>
  `;

  // Row 3
  const row3HTML = `
    <div class="card-row-footer">
      <div class="card-arrow">
        <i class="icon-lucide icon-arrowright"></i>
      </div>
    </div>
  `;

  return `
    <div class="data-card">
      ${row1HTML}
      ${row2HTML}
      ${row3HTML}
    </div>
  `;
};;

/**
 * Renders HTML for the standardized page header.
 * @param {string} title - The page title.
 * @param {string} [rightSideHtml=''] - HTML content for the right-side controls beside the refresh button.
 * @param {string} [subtitle=''] - Optional subtitle under the title.
 * @param {string} [titleId=''] - Optional ID for the title H1 element.
 * @param {string} [refreshBtnId='refresh-btn'] - Optional ID for the refresh button (default: 'refresh-btn').
 * @param {boolean} [showRefreshBtn=false] - Optional flag to show or hide the refresh button (default: false).
 * @returns {string} The header element HTML.
 */
function renderPageHeaderHTML(title, rightSideHtml = '', subtitle = '', titleId = '', refreshBtnId = 'refresh-btn', showRefreshBtn = false, icon = "") {
  const idAttr = titleId ? ` id="${titleId}"` : '';
  const subtitleHtml = `<div id="pageSubtitle" class="page-subtitle" style="display: none;"></div>`;
  const hasRightSide = typeof rightSideHtml === 'string' ? rightSideHtml.trim() : rightSideHtml;
  const actionsHtml = hasRightSide ? `
        <div class="page-header-actions">
          ${rightSideHtml}
        </div>
  ` : '';
  const refreshBtnStyle = showRefreshBtn ? '' : ' style="display: none;"';
  const iconHtml = icon ? `<i class="icon-lucide ${icon}"></i>` : '';

  return `
    <section class="page-header">
      <div>
        <div class="page-header-title-container">
          ${iconHtml}
          <h1 class="h2"${idAttr}>${title}</h1>
          ${subtitleHtml}
        </div>
        ${actionsHtml}
        <button class="btn icon ghost btn-refresh-header"${refreshBtnStyle} id="${refreshBtnId}" title="Reload data" aria-label="Reload data">
          <i class="icon-lucide icon-refresh-cw"></i>
        </button>
      </div>
    </section>
  `;
};

/**
 * Renders the standardized page header into the page-header-container DOM element.
 * @param {Object} options - Configuration options for the header.
 * @param {string} options.title - The page title.
 * @param {string} [options.rightSideHtml=''] - HTML content for the right-side controls beside the refresh button.
 * @param {string} [options.subtitle=''] - Optional subtitle under the title.
 * @param {string} [options.titleId=''] - Optional ID for the title H1 element.
 * @param {string} [options.refreshBtnId='refresh-btn'] - Optional ID for the refresh button.
 * @param {boolean} [options.showRefreshBtn=false] - Optional flag to show or hide the refresh button (default: false).
 * @param {string} [options.containerId='page-header-container'] - Optional ID of the container element.
 */
function renderPageHeader(options = {}) {
  const containerId = options.containerId || 'page-header-container';
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Could not find a parent element to render the page header.`);
    return;
  };

  const refreshBtnId = options.refreshBtnId || 'refresh-btn';
  const showRefreshBtn = options.showRefreshBtn || false;

  console.log(options)
  container.innerHTML = renderPageHeaderHTML(
    options.title || '',
    options.rightSideHtml || '',
    options.subtitle || '',
    options.titleId || '',
    refreshBtnId,
    showRefreshBtn,
    options.icon || ""
  );


  const refreshBtn = document.getElementById(refreshBtnId);
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      location.reload();
    });
  }

  // Notify parent shell on scroll
  if (window.parent && window.parent !== window) {
    const notifyParentScroll = () => {
      try {
        const headerEl = container.querySelector('.page-header') || container;
        const r = headerEl.getBoundingClientRect();

        const winScrollY = window.scrollY || window.pageYOffset || 0;
        const docScrollTop = document.documentElement ? document.documentElement.scrollTop : 0;
        const bodyScrollTop = document.body ? document.body.scrollTop : 0;

        let maxChildScroll = Math.max(winScrollY, docScrollTop, bodyScrollTop);
        const scrollables = document.querySelectorAll('.config-col, .hierarchy-col, .page-content, .main-content, .app-split-container, .table-container, div, section, main, article');
        for (let i = 0; i < scrollables.length; i++) {
          if (scrollables[i].scrollTop > maxChildScroll) {
            maxChildScroll = scrollables[i].scrollTop;
          }
        }

        const isScrolledOut = (r.bottom <= 25) || (r.top < -5) || (maxChildScroll > 20);

        if (typeof window.parent.onChildPageScroll === 'function') {
          window.parent.onChildPageScroll({
            isScrolledOut: isScrolledOut,
            titleText: options.title || '',
            iconClass: options.icon ? (options.icon.includes('icon-lucide') ? options.icon : `icon-lucide ${options.icon}`) : ''
          });
        }
      } catch (e) {}
    };

    window.addEventListener('scroll', notifyParentScroll, { passive: true, capture: true });
    document.addEventListener('scroll', notifyParentScroll, { passive: true, capture: true });

    setTimeout(() => {
      const els = document.querySelectorAll('div, section, main, article, body');
      els.forEach(el => el.addEventListener('scroll', notifyParentScroll, { passive: true, capture: true }));
    }, 100);

    notifyParentScroll();
    setTimeout(notifyParentScroll, 150);
    setTimeout(notifyParentScroll, 400);
  }
};

/**
 * Renders HTML for a standardized, pill-shaped search input component.
 * @param {Object} options
 * @param {string} [options.id='search-input-standard'] - The input element ID.
 * @param {string} [options.placeholder='Search...'] - Input placeholder text.
 * @param {string} [options.value=''] - Initial input value.
 * @param {boolean} [options.showSubmit=true] - Whether to show the submit button.
 * @returns {string} The constructed HTML.
 */
function renderSearchBarHTML(options = {}) {
  const id = options.id || 'search-input-standard';
  const placeholder = options.placeholder || 'Search...';
  const value = options.value || '';
  const showSubmit = options.showSubmit !== false;

  return `
    <div class="data-controls-search">
      <div class="form-group">
        <div class="input-container pill-search-container">
          <span class="input-addon start">
            <span class="icon-lucide icon-search"></span>
          </span>
          <input type="text" id="${id}" class="input-field" placeholder="${placeholder}" value="${value}" autocomplete="off">
          ${showSubmit ? `
          <button class="input-addon end" aria-label="Submit search">
            <span class="icon-lucide icon-corner-down-left"></span>
          </button>` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Mounts the search bar component to a DOM element.
 * @param {Object} options
 */
function renderSearchBar(options = {}) {
  const containerId = options.containerId || 'search-container';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = renderSearchBarHTML(options);
}

// ── Dialog & Overlay Component Logic ───────────────────────────
(function () {
  const { CSS_CLASSES, SELECTORS } = window;

  const DEFAULT_ICONS = {
    info: 'icon-info',
    success: 'icon-check',
    error: 'icon-circlex',
    warn: 'icon-trianglealert'
  };

  /**
   * Opens a native modal or non-modal dialog window by its element ID.
   * @param {string} scrimId - The HTML ID of the dialog's backdrop/scrim container.
   */
  function openDialog(scrimId, onClose) {
    const scrim = typeof scrimId === 'string' ? document.getElementById(scrimId) : scrimId;
    if (!scrim || scrim.classList.contains(CSS_CLASSES.IS_OPEN)) return;

    if (typeof onClose === 'function') {
      scrim._onCloseCallback = onClose;
    }

    scrim.classList.add(CSS_CLASSES.IS_OPEN);

    if (window.state) {
      window.state.openDialogCount++;
      if (window.state.openDialogCount === 1) {
        document.body.style.overflow = 'hidden';
      }
    }

    // Focus explicit autofocus target or first text input/form control (never auto-focus buttons)
    setTimeout(() => {
      const target = scrim.querySelector('[autofocus]') ||
        scrim.querySelector('input:not([type="hidden"]), select, textarea');
      if (target) {
        target.focus();
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

    if (window.state) {
      window.state.openDialogCount = Math.max(0, window.state.openDialogCount - 1);
      if (window.state.openDialogCount === 0) {
        document.body.style.overflow = '';
      }
    }

    if (typeof scrim._onCloseCallback === 'function') {
      const callback = scrim._onCloseCallback;
      delete scrim._onCloseCallback;
      callback();
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

  /**
   * Triggers and displays a toast notification overlay with optional actions.
   * Handles both object configuration and string/type invocation patterns.
   * @param {Object|string} optionsOrMessage - Configuration options or the message string.
   * @param {string} [type='info'] - The toast variant when first argument is a string.
   * @returns {HTMLElement} The created toast DOM element.
   */
  function showToast(optionsOrMessage, type = 'info') {
    let opts = {};
    if (typeof optionsOrMessage === 'string') {
      opts = { message: optionsOrMessage, type: type };
    } else {
      opts = optionsOrMessage || {};
    }

    const {
      message = '',
      type: toastType = 'info',
      duration = 4000,
      customIconClass = null,
      actions = []
    } = opts;

    // 1. Get or create the wrapper container
    let wrapper = document.querySelector('.toast-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'toast-wrapper';
      document.body.appendChild(wrapper);
    } else {
      // Find and remove matching or previous toast of the same message to avoid stacking
      const existingToasts = wrapper.querySelectorAll('.toast');
      existingToasts.forEach(existing => {
        const msgEl = existing.querySelector('.toast-message');
        if (msgEl && msgEl.textContent.trim() === message.trim()) {
          // Instantly close/delete to make way for the new one immediately
          if (existing.dataset.timerId) {
            clearTimeout(parseInt(existing.dataset.timerId, 10));
          }
          existing.remove();
        }
      });
    }

    // 2. Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${toastType}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    // 3. Determine icon class
    const iconClass = customIconClass || DEFAULT_ICONS[toastType] || DEFAULT_ICONS.info;

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

  /**
   * Initializes click handlers for dropdown menus and popovers,
   * including click-outside detection and Escape key dismissal.
   */
  function initDropdownsAndPopovers() {
    // Handle Click triggers for dropdowns and popovers
    document.addEventListener("click", (e) => {
      const dropdownTrigger = e.target.closest(".dropdown-trigger");
      const activeDropdown = dropdownTrigger ? dropdownTrigger.closest(".dropdown") : null;

      const popoverTrigger = e.target.closest(".popover-trigger[data-trigger='click']");
      const activePopover = popoverTrigger ? popoverTrigger.closest(".popover") : null;

      // Dropdown toggle logic
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

      // Popover toggle logic
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

    // Escape key to close open overlays
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

  // Replaces the entire page body with a full-screen error state
  function showFullPageError(err) {
    let title = "Error";
    let description = "An error occurred while loading the page.";

    const errStr = String(err?.message || err || "");
    const is500 = errStr.includes('500') || errStr.includes('502') || errStr.includes('503') || errStr.includes('504') || errStr.toLowerCase().includes('server error') || errStr.toLowerCase().includes('failed to fetch') || errStr.toLowerCase().includes('empty response') || errStr.toLowerCase().includes('networkerror');

    if (is500) {
      title = "Server Connection Error";
      description = "A connection error occurred. Please verify that the gateway is online and try reloading.";
    } else {
      title = "Access Denied / Loading Error";
      description = "Unable to load the page. Please verify your connection, login status, and try reloading.";
    }

    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: var(--space-xl); width: 100%; box-sizing: border-box;">
        ${renderEmptyStateHTML({
      icon: '<i class="icon-lucide icon-alerttriangle"></i>',
      title: title,
      description: description,
      type: 'error',
      buttons: `
            <button class="btn primary" onclick="window.location.reload()">
              <i class="icon-lucide icon-refreshcw"></i>
              <span>Reload Page</span>
            </button>`
    })}
      </div>
    `;
  }

  // Bind to Component namespace
  window.Component = window.Component || {};
  window.Component.openDialog = openDialog;
  window.Component.closeDialog = closeDialog;
  window.Component.initDialogs = initDialogs;
  window.Component.showToast = showToast;
  window.Component.closeToast = closeToast;
  window.Component.initDropdownsAndPopovers = initDropdownsAndPopovers;
  window.Component.renderEmptyStateHTML = renderEmptyStateHTML;
  window.Component.renderStatusCardHTML = renderStatusCardHTML;
  window.Component.showFullPageError = showFullPageError;

  // Bind globally to fix closeAction references
  window.openDialog = openDialog;
  window.closeDialog = closeDialog;
})();

/**
 * Generates a stable linear-gradient based on a company name.
 * Uses a deterministic hash to map the same string input to the same hue forever.
 * @param {string} name - The company name to generate the gradient for.
 * @returns {string} The CSS linear-gradient value.
 */
function generateDeterministicGradient(name) {
  if (!name) return 'linear-gradient(135deg, var(--clr-primary-blue-500) 0%, var(--clr-primary-blue-800) 100%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = 205 + (Math.abs(hash) % 40); // 205-245 sky to indigo
  const satLight = 68 + (Math.abs(hash >> 4) % 14);
  const satDeep = 76 + (Math.abs(hash >> 6) % 14);
  const litLight = 52 + (Math.abs(hash >> 8) % 10);
  const litDeep = 24 + (Math.abs(hash >> 10) % 10);
  const colorLight = `hsl(${hue}, ${satLight}%, ${litLight}%)`;
  const colorDeep = `hsl(${hue}, ${satDeep}%, ${litDeep}%)`;
  return `linear-gradient(135deg, ${colorLight} 0%, ${colorDeep} 100%)`;
}

/**
 * Renders the HTML string for the deterministic gradient company logo.
 * @param {string} companyName - The name of the company.
 * @returns {string} The HTML string for the logo.
 */
function renderDeterministicLogoHTML(companyName) {
  if (!companyName) return '';
  const initial = companyName.charAt(0).toUpperCase();
  const gradient = generateDeterministicGradient(companyName);
  return `
    <div class="logo" style="background: ${gradient}; box-shadow: 0 2px 8px rgba(0,0,0,0.25);">
      <span style="font-family:'Manrope',system-ui,sans-serif;font-weight:700;font-size:15px;color:#fff;letter-spacing:-0.01em;line-height:1;pointer-events:none;">${initial}</span>
    </div>
  `.trim();
}

/**
 * Renders the HTML string for the company name and username block.
 * @param {string} companyName - The name of the company.
 * @param {string} username - The active user's username.
 * @returns {string} The HTML string for the brand text.
 */
function renderBrandTextHTML(companyName, username) {
  return `
    <div class="brand-text">
      <h2 class="small" id="brandCompanyName">${companyName || ''}</h2>
      <span class="brand-username" id="brandUsername">${username || ''}</span>
    </div>
  `.trim();
}

/**
 * Renders the full brand persona component directly into the designated container.
 * Performs all DOM selection and existence checks internally.
 * @param {string|HTMLElement} containerOrSelector - The container element or CSS selector.
 * @param {string} companyName - The name of the company.
 * @param {string} username - The active user's username.
 */
function renderBrandPersona(containerOrSelector, companyName, username) {
  let el = containerOrSelector;
  if (typeof containerOrSelector === 'string') {
    el = document.querySelector(containerOrSelector) || document.getElementById(containerOrSelector);
  }
  if (!el) return;

  const logoHTML = renderDeterministicLogoHTML(companyName);
  const textHTML = renderBrandTextHTML(companyName, username);
  el.innerHTML = logoHTML + textHTML;
}

/**
 * Renders the HTML string for a unified Selector Card component.
 * Supports rendering a gateway selector and an optional slave selector.
 * @param {Object} opts Configuration options
 * @param {boolean} [opts.showSlave=true] Whether to render the slave selector row
 * @param {string} [opts.gatewayCountId='companyGatewayCount'] ID for gateway count element
 * @param {string} [opts.gatewayDisplayValId='gatewayDisplayVal'] ID for gateway display value element
 * @param {string} [opts.gatewaySelectId='gatewaySelect'] ID for gateway select element
 * @param {string} [opts.slaveCountId='slaveCount'] ID for slave count element
 * @param {string} [opts.slaveDisplayValId='slaveDisplayVal'] ID for slave display value element
 * @param {string} [opts.slaveInputId='slaveInput'] ID for slave select element
 * @returns {string} The constructed HTML string
 */
function renderSelectorCardHTML({
  showSlave = true,
  isCompact = false,
  gatewayCountId = 'companyGatewayCount',
  gatewayDisplayValId = 'gatewayDisplayVal',
  gatewaySelectId = 'gatewaySelect',
  slaveCountId = 'slaveCount',
  slaveDisplayValId = 'slaveDisplayVal',
  slaveInputId = 'slaveInput'
} = {}) {
  let html = `
    <div class="selector-card">
      <!-- Gateway Row Wrapper with Popover Support -->
      <div class="popover trigger-hover" id="gatewayPopover">
        <div class="selector-row${isCompact ? ' compact' : ''}" id="gatewayRowWrapper" style="width: 100%;">
          <div class="selector-icon-circle">
            <i class="icon-lucide icon-network"></i>
          </div>
          <div class="selector-content">
            ${isCompact ? '' : `
            <span class="selector-label">
              Select gateway (<span id="${gatewayCountId}">—</span> total)
            </span>
            `}
            <span class="selector-value" id="${gatewayDisplayValId}">No gateway selected</span>
          </div>
          <div class="selector-arrow">
            <i class="icon-lucide icon-chevrondown"></i>
          </div>
          <select id="${gatewaySelectId}" class="select-overlay" disabled aria-disabled="true"></select>
        </div>
      </div>
  `;

  if (showSlave) {
    html += `
      <!-- Divider -->
      <div class="selector-divider" id="slaveRowDivider"></div>

      <!-- Slave Row Wrapper with Popover Support -->
      <div class="popover trigger-hover" id="slavePopover">
        <div class="selector-row${isCompact ? ' compact' : ''}" id="slaveRowWrapper" style="width: 100%;">
          <div class="selector-icon-circle">
            <i class="icon-lucide icon-linedotrighthorizontal"></i>
          </div>
          <div class="selector-content">
            ${isCompact ? '' : `
            <span class="selector-label">
              Select slave (<span id="${slaveCountId}">—</span> total)
            </span>
            `}
            <span class="selector-value" id="${slaveDisplayValId}">No slave selected</span>
          </div>
          <div class="selector-arrow">
            <i class="icon-lucide icon-chevrondown"></i>
          </div>
          <select id="${slaveInputId}" class="select-overlay"></select>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html.trim();
}

/**
 * Renders the selector card directly into the designated container.
 * @param {string|HTMLElement} containerOrSelector - The container element or CSS selector.
 * @param {Object} options - Configuration options.
 */
function renderSelectorCard(containerOrSelector, options = {}) {
  let el = containerOrSelector;
  if (typeof containerOrSelector === 'string') {
    el = document.querySelector(containerOrSelector) || document.getElementById(containerOrSelector);
  }
  if (!el) return;
  el.innerHTML = renderSelectorCardHTML(options);
}

/**
 * Renders HTML for dynamic form fields from descriptors.
 * @param {Array<Object>} fields - Descriptor objects specifying type, label, id, value, etc.
 * @returns {string} The HTML string for the form fields.
 */
function renderFormFieldsHTML(fields = []) {
  return fields.map(field => {
    const idAttr = field.id ? ` id="${field.id}"` : '';
    const val = field.value !== undefined && field.value !== null ? field.value : '';
    const readonlyAttr = field.readonly ? ' readonly' : '';
    const styleAttr = field.style ? ` style="${field.style}"` : '';
    const placeholderAttr = field.placeholder ? ` placeholder="${field.placeholder}"` : '';

    let inputHtml = '';
    if (field.type === 'select') {
      const optionsHtml = (field.options || []).map(opt => {
        const selected = opt.value == val ? ' selected' : '';
        return `<option value="${opt.value}"${selected}>${opt.label}</option>`;
      }).join('');
      inputHtml = `
        <select${idAttr}${styleAttr}${readonlyAttr}>
          ${optionsHtml}
        </select>
      `;
    } else if (field.type === 'textarea') {
      inputHtml = `
        <textarea${idAttr}${placeholderAttr}${styleAttr}${readonlyAttr}>${val}</textarea>
      `;
    } else {
      inputHtml = `
        <input type="${field.type || 'text'}"${idAttr}${placeholderAttr} value="${val}"${styleAttr}${readonlyAttr}>
      `;
    }

    return `
      <label>${field.label}</label>
      ${inputHtml}
    `;
  }).join('');
}

/**
 * Renders a complete dialog box structure.
 * @param {Object} options Configuration options
 */
function renderDialogBoxHTML({
  title = '',
  subtitle = '',
  contentHtml = '',
  footerLeftHtml = '',
  footerRightHtml = '',
  closeAction = "closeDialog(this.closest('.dialog-scrim'))",
  size = 'md',
  titleClass = ''
} = {}) {
  const sizeAttr = size ? ` data-size="${size}"` : '';
  const titleElClass = titleClass ? ` ${titleClass}` : '';
  const subtitleHtml = subtitle ? `<p class="dialog-subtitle">${subtitle}</p>` : '';

  return `
    <div class="dialog-box"${sizeAttr}>
      <div class="dialog-header">
        <div class="dialog-title-group">
          <h3 class="dialog-title${titleElClass}">${title}</h3>
          ${subtitleHtml}
        </div>
        <button class="btn icon ghost" onclick="${closeAction}" aria-label="Close">
          <span class="icon-lucide icon-x"></span>
        </button>
      </div>
      <div class="dialog-content">
        ${contentHtml}
      </div>
      <div class="dialog-footer">
        <div class="dialog-footer-left">
          ${footerLeftHtml}
        </div>
        <div class="dialog-footer-right">
          ${footerRightHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * DRY Helper: Renders a modern file upload dropzone dialog box HTML.
 */
function renderFileUploadDialogHTML({
  title = "Import Configuration",
  subtitle = "Upload your config JSON file",
  accept = ".json",
  inputId = "jsonFileInput",
  confirmText = "Import",
  dialogId = "importModal",
  onConfirmHandler = ""
} = {}) {
  const contentHtml = `
    <div class="file-dropzone-area" id="${inputId}_dropzone">
      <input type="file" id="${inputId}" class="file-dropzone-input" accept="${accept}">
      <div class="file-dropzone-icon">
        <span class="icon-lucide icon-upload-cloud"></span>
      </div>
      <div class="file-dropzone-title">
        Drag & drop your file here or <span class="browse-link">Browse</span>
      </div>
      <div class="file-dropzone-sub">
        Supports ${accept.toUpperCase()} files
      </div>
    </div>
    <div id="${inputId}_selected" style="display:none;" class="file-selected-card mt-md">
      <div class="file-selected-left">
        <span class="icon-lucide icon-file-json file-selected-icon"></span>
        <div class="file-selected-info">
          <span class="file-selected-name" id="${inputId}_filename">filename.json</span>
          <span class="file-selected-size" id="${inputId}_filesize">0 KB</span>
        </div>
      </div>
      <button type="button" class="btn icon ghost btn-sm" id="${inputId}_clear" title="Remove file">
        <span class="icon-lucide icon-x"></span>
      </button>
    </div>
  `;

  const footerRightHtml = `
    <button class="btn outlined btn-cancel" onclick="Component.closeDialog('${dialogId}')">Cancel</button>
    <button class="btn primary btn-confirm-import" ${onConfirmHandler ? `onclick="${onConfirmHandler}"` : ''}>${confirmText}</button>
  `;

  return renderDialogBoxHTML({
    title,
    subtitle,
    contentHtml,
    footerRightHtml,
    size: 'sm'
  });
}

/**
 * DRY Helper: Renders a modern file export / download dialog box HTML.
 */
function renderFileExportDialogHTML({
  title = "Export Configuration",
  subtitle = "Choose a file name for export",
  defaultFileName = "config",
  inputId = "saveFileName",
  confirmText = "Export",
  dialogId = "exportModal",
  onConfirmHandler = ""
} = {}) {
  const contentHtml = `
    <div class="form-group">
      <label class="form-label" for="${inputId}">File Name</label>
      <div class="export-input-wrap">
        <input type="text" id="${inputId}" class="input-field" value="${escapeHtml(defaultFileName)}" placeholder="Enter filename">
        <span class="export-input-badge">.json</span>
      </div>
    </div>
  `;

  const footerRightHtml = `
    <button class="btn outlined btn-cancel" onclick="Component.closeDialog('${dialogId}')">Cancel</button>
    <button class="btn primary btn-confirm-export" ${onConfirmHandler ? `onclick="${onConfirmHandler}"` : ''}>${confirmText}</button>
  `;

  return renderDialogBoxHTML({
    title,
    subtitle,
    contentHtml,
    footerRightHtml,
    size: 'sm'
  });
}

/**
 * Attaches drag-and-drop file dropzone interactive handlers.
 */
function setupDropzone(inputId) {
  const dropzone = document.getElementById(inputId + '_dropzone');
  const input = document.getElementById(inputId);
  const selectedCard = document.getElementById(inputId + '_selected');
  const fileNameEl = document.getElementById(inputId + '_filename');
  const fileSizeEl = document.getElementById(inputId + '_filesize');
  const clearBtn = document.getElementById(inputId + '_clear');

  if (!input || !dropzone) return;

  const updateFileDisplay = (file) => {
    if (file) {
      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileSizeEl) fileSizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
      if (selectedCard) selectedCard.style.display = 'flex';
      dropzone.style.display = 'none';
    } else {
      if (selectedCard) selectedCard.style.display = 'none';
      dropzone.style.display = 'flex';
      input.value = '';
    }
  };

  input.addEventListener('change', () => {
    updateFileDisplay(input.files[0]);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      input.files = files;
      updateFileDisplay(files[0]);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateFileDisplay(null);
    });
  }
}

/**
 * Shows a confirm dialog modal programmatically using coexio styles.
 * @param {Object} options
 */
function showConfirmDialog({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm = () => { },
  onCancel = () => { }
} = {}) {
  let scrim = document.getElementById('programmaticConfirmModal');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.className = 'dialog-scrim';
    scrim.id = 'programmaticConfirmModal';
    scrim.setAttribute('data-modal', 'true');
    scrim.setAttribute('role', 'dialog');
    scrim.setAttribute('aria-modal', 'true');
    document.body.appendChild(scrim);
  }

  const footerLeft = `<button type="button" class="btn ghost cancel-btn">${cancelText}</button>`;
  const footerRight = `<button type="button" class="btn primary ${variant} confirm-btn">${confirmText}</button>`;
  const titleClass = variant === 'danger' ? 'text-danger' : '';

  scrim.innerHTML = renderDialogBoxHTML({
    title,
    subtitle: '',
    contentHtml: `<p class="dialog-confirm-question" style="margin-bottom: var(--space-md);">${message}</p>`,
    footerLeftHtml: footerLeft,
    footerRightHtml: footerRight,
    closeAction: "closeDialog('programmaticConfirmModal')",
    size: 'sm',
    titleClass
  });

  const cancelBtn = scrim.querySelector('.cancel-btn');
  const confirmBtn = scrim.querySelector('.confirm-btn');

  const handleCancel = () => {
    onCancel();
    Component.closeDialog(scrim);
  };

  const handleConfirm = () => {
    onConfirm();
    Component.closeDialog(scrim);
  };

  cancelBtn.addEventListener('click', handleCancel, { once: true });
  confirmBtn.addEventListener('click', handleConfirm, { once: true });

  const closeBtn = scrim.querySelector('.dialog-header .btn.icon');
  if (closeBtn) {
    closeBtn.removeAttribute('onclick');
    closeBtn.addEventListener('click', handleCancel, { once: true });
  }

  Component.openDialog(scrim);
}

// ==========================================================================
// Table Bulk Delete Controller
// ==========================================================================

class TableDeleteController {
  constructor(options = {}) {
    this.tableId = options.tableId; // e.g., '#users-table'
    this.deleteBtnId = options.deleteBtnId || 'controls-delete-btn';
    this.deleteBtnTextId = options.deleteBtnTextId || 'controls-delete-btn-text';
    this.actionBarId = options.actionBarId; // e.g., 'users-action-bar'

    // Callbacks/Getters
    this.getItemsCount = options.getItemsCount; // () => number
    this.getConfirmSummaryHtml = options.getConfirmSummaryHtml; // (selected) => string
    this.confirmModalId = options.confirmModalId; // e.g., 'deleteUsersConfirmModal'
    this.confirmBtnId = options.confirmBtnId || 'confirmBulkDeleteBtn';
    this.confirmSummaryId = options.confirmSummaryId; // e.g., 'delete-users-list-summary'
    this.onDelete = options.onDelete; // async (selected) => void
    this.beforeToggle = options.beforeToggle; // () => boolean (optional)

    this.deleteModeActive = false;
    this.selectedItems = [];
    this.actionBar = null;

    this.init();
  }

  init() {
    const deleteBtn = document.getElementById(this.deleteBtnId);
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.toggleDeleteMode());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.deleteModeActive) {
        this.exitDeleteMode();
      }
    });
  }

  toggleDeleteMode() {
    if (!this.deleteModeActive && typeof this.beforeToggle === 'function') {
      if (this.beforeToggle() === false) {
        return;
      }
    }
    if (this.getItemsCount() === 0) {
      Component.showToast({ message: 'No items to delete.', type: 'warn' });
      return;
    }
    if (!this.deleteModeActive) {
      this.enterDeleteMode();
    } else {
      this.exitDeleteMode();
    }
  }

  enterDeleteMode() {
    const tbl = document.querySelector(this.tableId);
    if (tbl) tbl.classList.add('delete-mode-active');

    const btnText = document.getElementById(this.deleteBtnTextId);
    if (btnText) btnText.textContent = 'Cancel';

    const btnIcon = document.querySelector(`#${this.deleteBtnId} i`);
    if (btnIcon) btnIcon.className = 'icon-lucide icon-x';

    this.deleteModeActive = true;
    this.updateActionBar();
  }

  exitDeleteMode() {
    const tbl = document.querySelector(this.tableId);
    if (tbl) tbl.classList.remove('delete-mode-active');

    const btnText = document.getElementById(this.deleteBtnTextId);
    if (btnText) btnText.textContent = 'Delete';

    const btnIcon = document.querySelector(`#${this.deleteBtnId} i`);
    if (btnIcon) btnIcon.className = 'icon-lucide icon-trash-2';

    this.deleteModeActive = false;
    this.selectedItems = [];

    document.querySelectorAll(`${this.tableId} .row-checkbox, ${this.tableId} #select-all-checkbox, #select-all-checkbox`).forEach(cb => {
      cb.checked = false;
      const row = cb.closest('tr');
      if (row) row.classList.remove('selected');
    });

    if (this.actionBar) this.actionBar.hide();
  }

  updateActionBar() {
    if (!this.actionBar) {
      this.actionBar = createActionBar({ id: this.actionBarId });
    }

    if (this.selectedItems.length > 0 || this.deleteModeActive) {
      const textCell = document.createElement('div');
      textCell.className = 'action-bar-text-cell';
      textCell.innerHTML = `<span style="font-weight:var(--fw-bold);color:var(--clr-text-primary);margin-right:4px;">${this.selectedItems.length} of ${this.getItemsCount()}</span> <span style="color:var(--clr-text-secondary);">selected</span>`;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn text danger';
      deleteBtn.innerHTML = `<span class="icon-lucide icon-trash-2" style="font-size:16px;"></span> Confirm Delete`;
      deleteBtn.disabled = this.selectedItems.length === 0;
      deleteBtn.addEventListener('click', () => this.handleBulkDeleteClick());

      const closeBtn = document.createElement('button');
      closeBtn.className = 'action-bar-close-btn';
      closeBtn.innerHTML = `<span class="icon-lucide icon-x" style="font-size:16px;"></span>`;
      closeBtn.addEventListener('click', () => this.exitDeleteMode());

      this.actionBar.setItems([textCell, deleteBtn, closeBtn]);
      this.actionBar.show();
    } else {
      this.actionBar.hide();
    }
  }

  setSelectedItems(selected) {
    this.selectedItems = selected;
    this.updateActionBar();
  }

  handleBulkDeleteClick() {
    const summaryEl = document.getElementById(this.confirmSummaryId);
    if (summaryEl && typeof this.getConfirmSummaryHtml === 'function') {
      summaryEl.innerHTML = this.getConfirmSummaryHtml(this.selectedItems);
    }

    const confirmBtn = document.getElementById(this.confirmBtnId);
    if (confirmBtn) {
      const newBtn = confirmBtn.cloneNode(true);
      confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
      newBtn.addEventListener('click', async () => {
        setButtonLoading(newBtn, true);
        try {
          await this.onDelete(this.selectedItems);
          Component.closeDialog(this.confirmModalId);
          this.exitDeleteMode();
        } catch (e) {
          Component.showToast({ message: 'Delete failed: ' + e.message, type: 'error' });
        } finally {
          setButtonLoading(newBtn, false);
        }
      });
    }
    Component.openDialog(this.confirmModalId);
  }
}

/**
 * Renders the selector card directly into the designated container and initializes custom dropdowns.
 * @param {string|HTMLElement} containerOrSelector - The container element or CSS selector.
 * @param {Object} options - Configuration options.
 */
function renderSelectorCard(containerOrSelector, options = {}) {
  let el = containerOrSelector;
  if (typeof containerOrSelector === 'string') {
    el = document.querySelector(containerOrSelector) || document.getElementById(containerOrSelector);
  }
  if (!el) return;
  el.innerHTML = renderSelectorCardHTML(options);

  setTimeout(() => {
    const gwSelectId = options.gatewaySelectId || 'gatewaySelect';
    const gwEl = el.querySelector('#' + gwSelectId) || document.getElementById(gwSelectId);
    if (gwEl) attachCustomDropdown(gwEl, { placeholder: 'Search gateways...', searchThreshold: 5 });

    if (options.showSlave !== false) {
      const slaveId = options.slaveInputId || 'slaveInput';
      const slEl = el.querySelector('#' + slaveId) || document.getElementById(slaveId);
      if (slEl) attachCustomDropdown(slEl, { placeholder: 'Search slaves...', searchThreshold: 5 });
    }
  }, 10);
}

/**
 * Attaches a custom searchable dropdown list component to a native select element or trigger container.
 * Renders popover fixed to document.body so trigger UI is 100% unchanged and no parent container clips the dropdown.
 * @param {string|HTMLElement} target - Select element or trigger wrapper.
 * @param {Object} options Configuration options.
 */
function attachCustomDropdown(target, options = {}) {
  const targetEl = typeof target === 'string'
    ? (document.querySelector(target) || document.getElementById(target))
    : target;

  if (!targetEl) return null;

  let selectEl = null;
  let triggerEl = null;

  if (targetEl.tagName === 'SELECT') {
    selectEl = targetEl;
    triggerEl = selectEl.closest('.selector-card') || selectEl.closest('.selector-row') || selectEl;
  } else {
    triggerEl = targetEl;
    selectEl = triggerEl.querySelector('select') || targetEl;
  }

  if (!selectEl) return null;

  const searchEnabled = options.search !== false;
  const searchThreshold = typeof options.searchThreshold === 'number' ? options.searchThreshold : 5;
  const showDoneBtn = options.showDoneBtn !== false;
  const placeholder = options.placeholder || 'Search options...';
  const onSelect = options.onSelect || null;

  if (selectEl._customDropdownInstance) {
    if (options.onSelect) {
      selectEl._customDropdownInstance.setOnSelect(options.onSelect);
    }
    selectEl._customDropdownInstance.refresh();
    return selectEl._customDropdownInstance;
  }

  // Clean up any orphaned popovers from removed DOM elements
  document.querySelectorAll('.custom-dropdown-popover').forEach(pop => {
    if (pop._ownerSelect && !document.body.contains(pop._ownerSelect)) {
      pop.remove();
    }
  });

  // Create fixed popover element attached to document.body (never clipped by overflow:hidden)
  const popoverEl = document.createElement('div');
  popoverEl.className = 'custom-dropdown-popover';
  popoverEl._ownerSelect = selectEl;
  document.body.appendChild(popoverEl);

  let isOpened = false;

  const getOptionsData = () => {
    return Array.from(selectEl.options).map((opt, idx) => {
      const rawText = opt.text.trim();
      let label = rawText;
      let subText = opt.getAttribute('data-sub') || opt.getAttribute('data-subtitle');

      const match = rawText.match(/^(.*?)\s*\((?:ID:\s*)?([^)]+)\)$/i);
      if (match) {
        label = match[1].trim();
        if (!subText) {
          subText = `ID: ${match[2].trim()}`;
        }
      } else if (!subText && opt.value) {
        subText = `ID: ${opt.value}`;
      }

      return {
        value: opt.value,
        rawLabel: rawText,
        label: label,
        subText: subText || '',
        disabled: opt.disabled,
        selected: opt.selected || (idx === selectEl.selectedIndex),
        element: opt
      };
    });
  };

  const renderPopoverContent = () => {
    const data = getOptionsData();
    const shouldShowSearch = searchEnabled && (searchThreshold === 0 || data.length > searchThreshold);

    let html = '';

    if (shouldShowSearch) {
      html += `
        <div class="custom-dropdown-header">
          <div class="custom-dropdown-search-wrap">
            <span class="icon-lucide icon-search"></span>
            <input type="text" class="custom-dropdown-search-input" placeholder="${escapeHtml(placeholder)}">
            <button type="button" class="custom-dropdown-clear-btn" style="display:none;" title="Clear search">
              <span class="icon-lucide icon-x"></span>
            </button>
          </div>
        </div>
      `;
    }

    html += `
      <div class="custom-dropdown-body">
        <div class="custom-dropdown-list" role="radiogroup">
    `;

    data.forEach((item, index) => {
      const isSelected = item.selected;
      const isPlaceholder = item.value === '';
      html += `
        <label class="custom-dropdown-item-card${isSelected ? ' selected' : ''}${item.disabled ? ' disabled' : ''}${isPlaceholder ? ' is-placeholder' : ''}" data-value="${escapeHtml(item.value)}" data-index="${index}">
          <div class="custom-dropdown-radio-wrap">
            <span class="custom-dropdown-radio-dot"></span>
          </div>
          <div class="custom-dropdown-item-content">
            <span class="custom-dropdown-item-title">${escapeHtml(item.label)}</span>
            ${item.subText ? `<span class="custom-dropdown-item-sub">${escapeHtml(item.subText)}</span>` : ''}
          </div>
        </label>
      `;
    });

    html += `
        </div>
        <div class="custom-dropdown-empty" style="display:none;">
          <span class="icon-lucide icon-search-x" style="font-size: 22px;"></span>
          <span>No matching items found</span>
        </div>
      </div>
    `;

    if (showDoneBtn) {
      html += `
        <div class="custom-dropdown-footer">
          <span class="custom-dropdown-footer-left">${data.length} option${data.length === 1 ? '' : 's'}</span>
          <button type="button" class="btn primary btn-sm custom-dropdown-done-btn">Done</button>
        </div>
      `;
    }

    popoverEl.innerHTML = html;

    const selectedOpt = data.find(d => d.selected) || data[0];
    const displayValEl = triggerEl.querySelector('.selector-value') || triggerEl.querySelector('.custom-dropdown-display-val');
    if (displayValEl && selectedOpt) {
      displayValEl.textContent = selectedOpt.label;
    }

    bindPopoverEvents();
  };

  const bindPopoverEvents = () => {
    const searchInput = popoverEl.querySelector('.custom-dropdown-search-input');
    const clearBtn = popoverEl.querySelector('.custom-dropdown-clear-btn');
    const itemCards = popoverEl.querySelectorAll('.custom-dropdown-item-card');
    const emptyState = popoverEl.querySelector('.custom-dropdown-empty');
    const doneBtn = popoverEl.querySelector('.custom-dropdown-done-btn');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

        let visibleCount = 0;
        itemCards.forEach(card => {
          const titleText = card.querySelector('.custom-dropdown-item-title').textContent.toLowerCase();
          const subText = card.querySelector('.custom-dropdown-item-sub') ? card.querySelector('.custom-dropdown-item-sub').textContent.toLowerCase() : '';
          const match = !query || titleText.includes(query) || subText.includes(query);
          card.style.display = match ? 'flex' : 'none';
          if (match) visibleCount++;
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }

    itemCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const index = parseInt(card.getAttribute('data-index'), 10);
        selectEl.selectedIndex = index;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));

        itemCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        const data = getOptionsData();
        const selectedOpt = data[index];
        const displayValEl = triggerEl.querySelector('.selector-value') || triggerEl.querySelector('.custom-dropdown-display-val');
        if (displayValEl && selectedOpt) {
          displayValEl.textContent = selectedOpt.label;
        }

        if (activeOnSelect) {
          activeOnSelect(selectedOpt ? selectedOpt.value : selectEl.value, selectEl.options[index]);
        }

        closePopover();
      });
    });

    if (doneBtn) {
      doneBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closePopover();
      });
    }
  };

  const updatePosition = () => {
    const rect = triggerEl.getBoundingClientRect();
    const popoverWidth = Math.max(rect.width, 280);
    const spaceBelow = window.innerHeight - rect.bottom;
    const alignRight = selectEl.getAttribute('data-align') === 'right';

    popoverEl.style.width = popoverWidth + 'px';
    
    if (alignRight) {
      popoverEl.style.left = Math.max(10, Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 10)) + 'px';
    } else {
      popoverEl.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - popoverWidth - 10)) + 'px';
    }

    if (spaceBelow < 260 && rect.top > 260) {
      popoverEl.style.top = 'auto';
      popoverEl.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
    } else {
      popoverEl.style.top = (rect.bottom + 4) + 'px';
      popoverEl.style.bottom = 'auto';
    }
  };

  const handleScrollOrResize = () => {
    if (isOpened) {
      requestAnimationFrame(updatePosition);
    }
  };

  let kbFocusIndex = -1;
  const handleKeydown = (e) => {
    if (!isOpened) return;

    const visibleItems = Array.from(popoverEl.querySelectorAll('.custom-dropdown-item-card:not([style*="display: none"])'));
    if (!visibleItems.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      kbFocusIndex = (kbFocusIndex + 1) % visibleItems.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      kbFocusIndex = (kbFocusIndex - 1 + visibleItems.length) % visibleItems.length;
    } else if (e.key === 'Enter') {
      if (document.activeElement && document.activeElement.classList.contains('custom-dropdown-search-input')) {
        // If typing in search, let Enter trigger if there's a focused item
        if (kbFocusIndex === -1) return; 
      }
      e.preventDefault();
      if (kbFocusIndex >= 0 && visibleItems[kbFocusIndex]) {
        visibleItems[kbFocusIndex].click();
      }
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePopover();
      return;
    } else {
      return;
    }

    popoverEl.querySelectorAll('.custom-dropdown-item-card').forEach(el => el.classList.remove('kb-focus'));
    if (kbFocusIndex >= 0 && visibleItems[kbFocusIndex]) {
      const activeItem = visibleItems[kbFocusIndex];
      activeItem.classList.add('kb-focus');
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  };

  const openPopover = () => {
    if (isOpened) return;

    // Hard DOM cleanup: ensure no other custom popovers have 'is-open' in the document
    document.querySelectorAll('.custom-dropdown-popover').forEach(el => {
      if (el !== popoverEl) {
        el.classList.remove('is-open');
      }
    });

    // Close all other instances via event
    document.dispatchEvent(new CustomEvent('close-all-custom-dropdowns', { detail: { source: popoverEl } }));

    renderPopoverContent();
    updatePosition();
    popoverEl.classList.add('is-open');

    isOpened = true;
    kbFocusIndex = -1;
    popoverEl.querySelectorAll('.custom-dropdown-item-card').forEach(el => el.classList.remove('kb-focus'));
    
    document.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('keydown', handleKeydown, true);

    setTimeout(() => {
      const searchInput = popoverEl.querySelector('.custom-dropdown-search-input');
      if (searchInput) searchInput.focus();
    }, 50);
  };

  const closePopover = () => {
    popoverEl.classList.remove('is-open');
    if (!isOpened) return;
    isOpened = false;
    kbFocusIndex = -1;
    document.removeEventListener('scroll', handleScrollOrResize, true);
    window.removeEventListener('resize', handleScrollOrResize);
    document.removeEventListener('keydown', handleKeydown, true);
  };

  document.addEventListener('close-all-custom-dropdowns', (e) => {
    if (!e.detail || e.detail.source !== popoverEl) {
      popoverEl.classList.remove('is-open');
      if (isOpened) {
        closePopover();
      }
    }
  });

  let lastToggleTime = 0;

  const togglePopover = (e) => {
    if (e) {
      e.preventDefault();
    }
    const now = Date.now();
    if (now - lastToggleTime < 250) return;
    lastToggleTime = now;

    if (isOpened) {
      closePopover();
    } else {
      openPopover();
    }
  };

  triggerEl.addEventListener('click', togglePopover);

  if (selectEl && selectEl !== triggerEl) {
    selectEl.addEventListener('mousedown', togglePopover);
    selectEl.addEventListener('click', togglePopover);
  }

  const onDocClick = (e) => {
    if (Date.now() - lastToggleTime < 100) return;
    if (!triggerEl.contains(e.target) && !popoverEl.contains(e.target)) {
      closePopover();
    }
  };
  document.addEventListener('click', onDocClick);

  const onScrollOrResize = () => {
    if (isOpened) updatePosition();
  };
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

  const observer = new MutationObserver(() => {
    renderPopoverContent();
  });
  observer.observe(selectEl, { childList: true, subtree: true, attributes: true });

  let activeOnSelect = onSelect;

  const instance = {
    refresh: renderPopoverContent,
    open: openPopover,
    close: closePopover,
    setOnSelect: (fn) => { activeOnSelect = fn; },
    destroy: () => {
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      observer.disconnect();
      if (popoverEl.parentNode) popoverEl.parentNode.removeChild(popoverEl);
      delete selectEl._customDropdownInstance;
    }
  };

  selectEl._customDropdownInstance = instance;
  return instance;
}

/**
 * Automatically initializes attachCustomDropdown on select elements across the document.
 * @param {HTMLElement|Document} [root=document] Root element to search select elements in.
 */
function autoAttachSelects(root = document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;
  const selects = root.querySelectorAll('select');
  selects.forEach(selectEl => {
    if (selectEl.dataset && selectEl.dataset.customDropdown === 'false') return;
    attachCustomDropdown(selectEl);
  });
}

if (typeof window !== 'undefined') {
  window.Component = window.Component || {};
  window.Component.setSlaveSelectorVisibility = setSlaveSelectorVisibility;
  window.Component.showEmptyStatePopover = showEmptyStatePopover;
  window.Component.clearPopover = clearPopover;
  window.Component.createActionBar = createActionBar;
  window.Component.reportMetadataHeader = reportMetadataHeader;
  window.Component.renderTestCycleCardHTML = renderTestCycleCardHTML;
  window.Component.renderPageHeaderHTML = renderPageHeaderHTML;
  window.Component.renderPageHeader = renderPageHeader;
  window.Component.generateDeterministicGradient = generateDeterministicGradient;
  window.Component.renderDeterministicLogoHTML = renderDeterministicLogoHTML;
  window.Component.renderBrandTextHTML = renderBrandTextHTML;
  window.Component.renderBrandPersona = renderBrandPersona;
  window.Component.renderSelectorCardHTML = renderSelectorCardHTML;
  window.Component.renderSelectorCard = renderSelectorCard;
  window.Component.renderFormFieldsHTML = renderFormFieldsHTML;
  window.Component.renderDialogBoxHTML = renderDialogBoxHTML;
  window.Component.renderFileUploadDialogHTML = renderFileUploadDialogHTML;
  window.Component.renderFileExportDialogHTML = renderFileExportDialogHTML;
  window.Component.setupDropzone = setupDropzone;
  window.Component.showConfirmDialog = showConfirmDialog;
  window.Component.TableDeleteController = TableDeleteController;
  window.Component.renderSearchBarHTML = renderSearchBarHTML;
  window.Component.renderSearchBar = renderSearchBar;
  window.Component.attachCustomDropdown = attachCustomDropdown;
  window.Component.autoAttachSelects = autoAttachSelects;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(autoAttachSelects, 150));
  } else {
    setTimeout(autoAttachSelects, 150);
  }
}