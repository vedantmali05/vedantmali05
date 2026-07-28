/**
 * js-table.js
 * Custom dynamic tables, sorting, and selection state manager.
 * Standardized global window integration.
 */

// default client-side DOM table rows sorter
function defaultDomSort(tableEl, key, order) {
  const tbody = tableEl.querySelector('tbody');
  if (!tbody) return;

  const spacer = tbody.querySelector('.table-bottom-spacer-row');
  const empty = tbody.querySelector('.empty-state-row');

  const rows = Array.from(tbody.querySelectorAll('tr:not(.table-bottom-spacer-row):not(.empty-state-row)'));
  if (rows.length === 0) return;

  rows.forEach((row, idx) => {
    if (row.dataset.originalIndex === undefined) {
      row.dataset.originalIndex = idx;
    }
  });

  if (!order) {
    rows.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
  } else {
    const headers = Array.from(tableEl.querySelectorAll('thead th'));
    const colIdx = headers.findIndex(th => th.getAttribute('data-sort-key') === key);
    if (colIdx === -1) return;

    rows.sort((rowA, rowB) => {
      const cellA = rowA.cells[colIdx];
      const cellB = rowB.cells[colIdx];
      let valA = cellA ? cellA.textContent.trim() : '';
      let valB = cellB ? cellB.textContent.trim() : '';

      const numA = Number(valA.replace(/[^0-9.-]/g, ''));
      const numB = Number(valB.replace(/[^0-9.-]/g, ''));

      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        return order === 'asc' ? numA - numB : numB - numA;
      }

      valA = valA.toLowerCase();
      valB = valB.toLowerCase();

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  rows.forEach(row => tbody.appendChild(row));
  if (empty) tbody.appendChild(empty);
  if (spacer) tbody.appendChild(spacer);
}

// reusable table initialization function
function initTable(tableEl, options = {}) {
  if (!tableEl) return;

  const tbody = tableEl.querySelector('tbody');
  const selectAll = tableEl.querySelector('#select-all-checkbox');

  // handle select all checkbox
  if (selectAll) {
    selectAll.addEventListener('change', () => {
      const isChecked = selectAll.checked;
      const checkboxes = tbody.querySelectorAll('.row-checkbox:not(:disabled)');
      checkboxes.forEach(cb => {
        cb.checked = isChecked;
        const row = cb.closest('tr');
        if (row && !row.classList.contains('table-bottom-spacer-row') && !row.classList.contains('empty-state-row')) {
          if (isChecked) {
            row.classList.add('selected');
          } else {
            row.classList.remove('selected');
          }
        }
      });
      // trigger change event for selection if callback provided
      if (options.onSelectionChange) {
        options.onSelectionChange(getSelectedRows(tableEl));
      }
    });
  }

  // handle individual row clicks and checkboxes
  tbody.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-checkbox')) {
      const cb = e.target;
      const row = cb.closest('tr');
      if (row) {
        // Sync checkbox states in the same row (desktop/mobile layout)
        const rowCbs = row.querySelectorAll('.row-checkbox');
        rowCbs.forEach(otherCb => {
          if (otherCb !== cb) {
            otherCb.checked = cb.checked;
          }
        });

        if (cb.checked) {
          row.classList.add('selected');
        } else {
          row.classList.remove('selected');
        }

        // update select all state
        if (selectAll) {
          const totalCbs = tbody.querySelectorAll('.row-checkbox:not(:disabled)').length;
          const checkedCbs = tbody.querySelectorAll('.row-checkbox:checked').length;
          selectAll.checked = totalCbs > 0 && totalCbs === checkedCbs;
          selectAll.indeterminate = checkedCbs > 0 && checkedCbs < totalCbs;
        }

        if (options.onSelectionChange) {
          options.onSelectionChange(getSelectedRows(tableEl));
        }
      }
    }
  });

  // handle row clicking for actions or navigation
  tbody.addEventListener('click', (e) => {
    // ignore click if it originates from an interactive element (except the view details button)
    const interactiveSelector = 'input, button:not(.table-view-btn), a:not(.table-view-btn), label, select, textarea, .sort-btn';
    if (e.target.closest(interactiveSelector)) {
      return;
    }

    const row = e.target.closest('tr');
    if (!row || row.classList.contains('table-bottom-spacer-row') || row.classList.contains('empty-state-row')) {
      return;
    }

    // Do not navigate or trigger actions when in delete mode
    if (tableEl.classList.contains('delete-mode-active')) {
      const cb = row.querySelector('.row-checkbox');
      if (cb && !cb.disabled) {
        cb.checked = !cb.checked;
        const event = new Event('change', { bubbles: true });
        cb.dispatchEvent(event);
      }
      return;
    }

    // handle navigation or action
    const href = row.getAttribute('data-row-href');
    const action = row.getAttribute('data-row-action');

    if (href) {
      window.location.href = href;
    } else if (action && options.onRowClick) {
      options.onRowClick(row, action);
    } else {
      // default behavior: dispatch generic row-click event
      const event = new CustomEvent('row-click', {
        detail: { row: row, id: row.dataset.id }
      });
      tableEl.dispatchEvent(event);
    }
  });

  // handle sorting header clicks
  const headers = tableEl.querySelectorAll('thead th.sortable');
  headers.forEach(th => {
    th.addEventListener('click', (e) => {
      // ignore click if it originated directly from a checkbox
      if (e.target.closest('.form-check-input')) return;

      const key = th.getAttribute('data-sort-key');
      let order = 'asc';

      // read current sort state from th class or dataset
      const currentOrder = th.getAttribute('data-sort-order');
      if (currentOrder === 'asc') {
        order = 'desc';
      } else if (currentOrder === 'desc') {
        order = ''; // reset to none
      }

      // reset other sort headers
      headers.forEach(otherTh => {
        if (otherTh !== th) {
          otherTh.removeAttribute('data-sort-order');
          const btn = otherTh.querySelector('.sort-btn');
          if (btn) {
            btn.classList.remove('active');
            const icon = btn.querySelector('.icon-lucide');
            if (icon) {
              icon.className = 'icon-lucide icon-arrow-up-down';
            }
          }
        }
      });

      // update current header state
      const btn = th.querySelector('.sort-btn');
      if (order) {
        th.setAttribute('data-sort-order', order);
        if (btn) {
          btn.classList.add('active');
          const icon = btn.querySelector('.icon-lucide');
          if (icon) {
            const suffix = order === 'asc' ? 'up' : 'down';
            icon.className = `icon-lucide icon-arrow-${suffix}`;
          }
        }
      } else {
        th.removeAttribute('data-sort-order');
        if (btn) {
          btn.classList.remove('active');
          const icon = btn.querySelector('.icon-lucide');
          if (icon) {
            icon.className = 'icon-lucide icon-arrow-up-down';
          }
        }
      }

      if (options.onSort) {
        options.onSort(key, order);
      } else {
        defaultDomSort(tableEl, key, order);
        const event = new CustomEvent('table-sort', {
          detail: { key: key, order: order }
        });
        tableEl.dispatchEvent(event);
      }
    });
  });

  // set initial count badge
  const initialRows = tbody.querySelectorAll('tr:not(.table-bottom-spacer-row):not(.empty-state-row)').length;
  const countBadge = document.getElementById('cycles-count-badge');
  if (countBadge) {
    countBadge.textContent = `${initialRows} Cycles`;
  }

  // search/filter helper method attached to the element
  tableEl.filter_rows = (query) => {
    const rows = tbody.querySelectorAll('tr:not(.table-bottom-spacer-row):not(.empty-state-row)');
    let matches = 0;
    const cleanQuery = query.toLowerCase().trim();

    rows.forEach(row => {
      let text = row.textContent.toLowerCase();
      // also search in data-search attribute if present
      const searchData = row.getAttribute('data-search');
      if (searchData) {
        text += ' ' + searchData.toLowerCase();
      }

      if (text.includes(cleanQuery)) {
        row.style.display = '';
        matches++;
      } else {
        row.style.display = 'none';
      }
    });

    // handle empty state
    let emptyRow = tbody.querySelector('.empty-state-row');
    if (matches === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-state-row';

        // count total columns in head
        const colCount = tableEl.querySelectorAll('thead th').length || 8;

        renderEmptyState(emptyRow, colCount, options.searchEmptyState, {
          icon: 'icon-search',
          title: 'No matching results',
          description: 'Adjust your keywords or filter parameters and try again.'
        });

        // insert before bottom spacer row
        const spacer = tbody.querySelector('.table-bottom-spacer-row');
        if (spacer) {
          tbody.insertBefore(emptyRow, spacer);
        } else {
          tbody.appendChild(emptyRow);
        }
      } else {
        emptyRow.style.display = '';
      }
    } else {
      if (emptyRow) {
        emptyRow.style.display = 'none';
      }
    }

    // update count badge if count element is passed or exists
    const countBadgeEl = document.getElementById('cycles-count-badge');
    if (countBadgeEl) {
      countBadgeEl.textContent = `${matches} Cycles`;
    }

    return matches;
  };
}

// helper to get selected row objects
function getSelectedRows(tableEl) {
  const selected = [];
  const rows = tableEl.querySelectorAll('tbody tr.selected');
  rows.forEach(row => {
    if (!row.classList.contains('table-bottom-spacer-row') && !row.classList.contains('empty-state-row')) {
      selected.push(row);
    }
  });
  return selected;
}

// dynamic schema-driven table generator
function createDataTable(tableEl, options = {}) {
  const table = typeof tableEl === 'string' ? document.querySelector(tableEl) : tableEl;
  if (!table) return null;

  const data = options.data || [];
  const columns = options.columns || [];

  // Clear existing content
  table.innerHTML = '';

  // 1. Build table header (thead)
  const thead = document.createElement('thead');
  const headerTr = document.createElement('tr');

  columns.forEach(col => {
    const th = document.createElement('th');

    // apply special styles or dimensions based on column type
    if (col.type === 'checkbox') {
      th.className = 'col-checkbox';
      th.innerHTML = `
        <label class="table-checkbox-label">
          <input type="checkbox" id="select-all-checkbox" class="form-check-input">
        </label>
      `;
    } else if (col.type === 'view') {
      th.className = 'col-view';
      th.textContent = col.label || 'View';
    } else {
      if (col.className) {
        th.className = col.className;
      }
      if (col.type === 'number') {
        th.classList.add('col-number');
      }

      const thContent = document.createElement('div');
      thContent.className = 'th-content';

      const labelSpan = document.createElement('span');
      labelSpan.textContent = col.label || '';
      thContent.appendChild(labelSpan);

      if (col.sortable) {
        th.classList.add('sortable');
        th.setAttribute('data-sort-key', col.key);

        const sortBtn = document.createElement('button');
        sortBtn.className = 'sort-btn';
        sortBtn.setAttribute('aria-label', `Sort by ${col.label || col.key}`);
        sortBtn.innerHTML = `<i class="icon-lucide icon-arrow-up-down"></i>`;
        thContent.appendChild(sortBtn);
      }

      th.appendChild(thContent);
    }
    headerTr.appendChild(th);
  });
  thead.appendChild(headerTr);
  table.appendChild(thead);

  // 2. Build table body (tbody)
  const tbody = document.createElement('tbody');
  tbody.id = 'data-table-body';

  data.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr._item_data = item; // Attach raw item data

    // Construct search string from all values in the item object to enable searching on all keys
    const searchValues = [];
    for (const key in item) {
      if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
        searchValues.push(String(item[key]));
      }
    }
    tr.setAttribute('data-search', searchValues.join(' '));

    // handle navigation or action triggering attributes
    const hrefKey = options.rowHrefKey || 'href';
    const actionKey = options.rowActionKey || 'action';

    if (item[hrefKey]) {
      tr.setAttribute('data-row-href', item[hrefKey]);
    }
    if (item[actionKey]) {
      tr.setAttribute('data-row-action', item[actionKey]);
    }

    columns.forEach(col => {
      const td = document.createElement('td');

      if (col.type === 'checkbox') {
        td.className = 'col-checkbox';
        const isDisabled = (options.disableCheckboxFn && options.disableCheckboxFn(item)) ? 'disabled' : '';
        td.innerHTML = `
          <label class="table-checkbox-label">
            <input type="checkbox" class="form-check-input row-checkbox" ${isDisabled}>
          </label>
        `;
      } else if (col.type === 'view') {
        td.className = 'col-view';
        td.innerHTML = `
          <button class="btn icon ghost table-view-btn" aria-label="View details">
            <i class="icon-lucide icon-arrow-right"></i>
          </button>
        `;
      } else {
        if (col.className) {
          td.className = col.className;
        }
        if (col.type === 'number') {
          td.classList.add('col-number');
        }

        const value = item[col.key] !== undefined ? item[col.key] : '';

        // delegate to custom renderer if specified
        if (col.render && typeof col.render === 'function') {
          const rendered = col.render(value, item);
          if (rendered instanceof HTMLElement) {
            td.appendChild(rendered);
          } else {
            td.innerHTML = rendered;
          }
        } else if (col.type === 'badge') {
          const map = col.badgeTypeMap || {};
          const badgeClass = map[value] || 'primary';
          td.innerHTML = `
            <span class="badge emphasized ${badgeClass} sz-small">
              <span class="dot ${badgeClass}"></span>
              ${value}
            </span>
          `;
        } else if (col.type === 'code') {
          td.classList.add('font-code');
          td.textContent = value;
        } else {
          td.textContent = value;
        }
      }
      tr.appendChild(td);
    });

    // Mobile card layout custom rendering hook
    if (options.cardRenderFn) {
      const mobileTd = document.createElement('td');
      mobileTd.className = 'card-mobile-td';
      mobileTd.colSpan = columns.length;
      mobileTd.innerHTML = options.cardRenderFn(item, options);
      tr.appendChild(mobileTd);
    }

    tbody.appendChild(tr);
  });

  // empty state when no data at all
  if (data.length === 0) {
    const colCount = columns.length || 8;
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-state-row';
    renderEmptyState(emptyRow, colCount, options.emptyState, {
      icon: 'icon-database',
      title: 'No data found',
      description: 'There is nothing to display here yet.'
    });
    tbody.appendChild(emptyRow);
  }

  // bottom spacer row for scrolling
  const spacer = document.createElement('tr');
  spacer.className = 'table-bottom-spacer-row';
  spacer.innerHTML = `<td colspan="${columns.length}"></td>`;
  tbody.appendChild(spacer);

  table.appendChild(tbody);

  // 3. Initialize event handlers and custom events
  initTable(table, options);

  // 4. Bind search field if passed
  if (options.searchInput) {
    const searchEl = typeof options.searchInput === 'string'
      ? document.querySelector(options.searchInput)
      : options.searchInput;
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        table.filter_rows(e.target.value);
      });
      if (searchEl.value) {
        table.filter_rows(searchEl.value);
      }
    }
  }

  // Back to Top FAB implementation
  let fabContainer = document.querySelector(".fab-container");
  if (!fabContainer) {
    fabContainer = document.createElement("div");
    fabContainer.className = "fab-container";
    document.body.appendChild(fabContainer);
  }

  let fab = document.getElementById('table-back-to-top');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'table-back-to-top';
    fab.className = 'btn primary fab back-to-top-btn';
    fab.setAttribute('aria-label', 'Back to top');
    fab.innerHTML = '<i class="icon-lucide icon-arrow-up"></i>';
    fabContainer.appendChild(fab);

    // Smooth scroll back to top when clicked
    fab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const scrollContainers = document.querySelectorAll('.data-table-scroll-container');
      scrollContainers.forEach(container => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  // Monitor scrolling on window (mobile) and table containers (desktop)
  const handleScroll = () => {
    const tableScrollContainer = table.closest('.data-table-scroll-container');
    const scrollContainerPos = tableScrollContainer ? tableScrollContainer.scrollTop : 0;
    const windowScrollPos = window.scrollY || document.documentElement.scrollTop;

    if (scrollContainerPos > 300 || windowScrollPos > 300) {
      fab.classList.add('visible');
    } else {
      fab.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  const tableContainer = table.closest('.data-table-scroll-container');
  if (tableContainer) {
    tableContainer.addEventListener('scroll', handleScroll, { passive: true });
  }

  return table;
}

function renderDialogRow(item, keyOrRenderer) {
  if (typeof keyOrRenderer === 'function') {
    return keyOrRenderer(item);
  }
  return item[keyOrRenderer] || item.name || item.id || '';
}

function renderBulkDeleteSummary(containerId, selectedRows, keyOrRenderer) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;
  container.innerHTML = '';
  
  selectedRows.forEach(row => {
    const item = row._item_data || {};
    const li = document.createElement('li');
    const content = renderDialogRow(item, keyOrRenderer);
    if (content instanceof HTMLElement) {
      li.appendChild(content);
    } else {
      li.innerHTML = content;
    }
    container.appendChild(li);
  });
}

function exitTableDeleteMode(tableSelectorOrEl, actionBarInstance, config = {}) {
  const table = typeof tableSelectorOrEl === 'string' ? document.querySelector(tableSelectorOrEl) : tableSelectorOrEl;
  if (table) {
    table.classList.remove('delete-mode-active');
    
    const selectAllId = config.selectAllId || 'select-all-checkbox';
    const selectAll = table.querySelector(`#${selectAllId}`);
    if (selectAll) {
      selectAll.checked = false;
      selectAll.removeAttribute('disabled');
    }
    
    const checkboxes = table.querySelectorAll(config.checkboxSelector || '.row-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = false;
      const row = cb.closest('tr');
      if (row) row.classList.remove('selected');
    });
  }
  
  if (actionBarInstance && actionBarInstance.hide) {
    actionBarInstance.hide();
  }
  
  const deleteBtnSelector = config.deleteButtonSelector || '#bulkDeleteButton';
  const deleteBtn = document.querySelector(deleteBtnSelector);
  if (deleteBtn) {
    deleteBtn.innerHTML = `<span class="icon-lucide icon-trash-2"></span>Delete`;
  }
}

function updateTableActionBar(tableSelectorOrEl, selectedRows, actionBarInstance, labelSingular = 'item', labelPlural = 'items') {
  const table = typeof tableSelectorOrEl === 'string' ? document.querySelector(tableSelectorOrEl) : tableSelectorOrEl;
  const isDeleteMode = table && table.classList.contains('delete-mode-active');
  if (!isDeleteMode) return;

  if (selectedRows.length > 0) {
    if (actionBarInstance) {
      const countLabel = selectedRows.length === 1 ? labelSingular : labelPlural;
      actionBarInstance.updateCount(`${selectedRows.length} ${countLabel} selected`);
      actionBarInstance.show();
    }
  } else {
    if (actionBarInstance) {
      actionBarInstance.hide();
    }
  }
}

// Bind to window namespace
window.defaultDomSort = defaultDomSort;
window.initTable = initTable;
window.getSelectedRows = getSelectedRows;
window.createDataTable = createDataTable;
window.renderDialogRow = renderDialogRow;
window.renderBulkDeleteSummary = renderBulkDeleteSummary;
window.exitTableDeleteMode = exitTableDeleteMode;
window.updateTableActionBar = updateTableActionBar;
