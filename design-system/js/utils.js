/**
 * Core UI Design System — Utilities & Helpers
 * Pure JavaScript utility functions for formatting, DOM manipulation, state persistence, and JSON rendering.
 */

(function () {
    /**
     * Safely escapes HTML special characters to prevent XSS.
     * @param {any} val - Input value.
     * @returns {string} Escaped HTML string.
     */
    function escapeHtml(val) {
        if (val === undefined || val === null) return '';
        return String(val).replace(/[&<>"'`]/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;'
        })[c]);
    }

    /**
     * Formats a numeric value with fixed decimals and an optional suffix.
     * @param {number|string|null} val - Input numeric value.
     * @param {number} [decimals=1] - Decimal precision.
     * @param {string} [suffix=''] - Suffix string (e.g. ' %', ' ms').
     * @returns {string} Formatted string or '--' if invalid.
     */
    function formatValue(val, decimals = 1, suffix = '') {
        if (val === null || val === undefined || val === '' || isNaN(Number(val))) return '--';
        return Number(val).toFixed(decimals) + suffix;
    }

    /**
     * Parses ISO string or timestamp number into a valid Date object.
     * @param {number|string} val - Timestamp or ISO date string.
     * @returns {Date|null} Date object or null if invalid.
     */
    function parseISOorNumberToDate(val) {
        if (!val && val !== 0) return null;
        if (typeof val === 'number') {
            if (val > 1e12) return new Date(val);
            if (val > 1e9) return new Date(val * 1000);
            return null;
        }
        if (typeof val === 'string') {
            const s = val.trim();
            const d = new Date(s);
            if (!isNaN(d.getTime())) return d;
            const num = Number(s);
            if (!isNaN(num)) return parseISOorNumberToDate(num);
        }
        return null;
    }

    /**
     * Formats date-time values into standard presentation formats.
     * @param {Date|number|string} val - Input date.
     * @param {'datetime'|'date'|'time'|'relative'} [type='datetime'] - Target format type.
     * @returns {string} Formatted date-time string.
     */
    function formatDateTime(val, type = 'datetime') {
        const d = parseISOorNumberToDate(val);
        if (!d) return '—';

        if (type === 'date') {
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        }
        if (type === 'time') {
            return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (type === 'relative') {
            const diffMs = Date.now() - d.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            if (diffSec < 60) return 'Just now';
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return `${diffMin}m ago`;
            const diffHour = Math.floor(diffMin / 60);
            if (diffHour < 24) return `${diffHour}h ago`;
            const diffDay = Math.floor(diffHour / 24);
            return `${diffDay}d ago`;
        }

        return `${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }

    /**
     * Persists page or component state object into Session/LocalStorage.
     * @param {string} storageKey - Storage identifier.
     * @param {Object} state - Serializable state object.
     */
    function persistPageState(storageKey, state) {
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn('[Utils] Could not persist state:', e);
        }
    }

    /**
     * Retrieves saved state object from Session/LocalStorage.
     * @param {string} storageKey - Storage identifier.
     * @returns {Object|null} Saved state or null.
     */
    function retrievePageState(storageKey) {
        if (!storageKey) return null;
        try {
            return JSON.parse(localStorage.getItem(storageKey) || 'null');
        } catch (e) {
            console.warn('[Utils] Could not retrieve state:', e);
            return null;
        }
    }

    /**
     * Attaches 1-based serial numbers (`sr_no`) to array objects.
     * @param {Array<Object>} dataList - Data list.
     * @returns {Array<Object>} Data list with sr_no attached.
     */
    function mapSerialNumbers(dataList) {
        if (!Array.isArray(dataList)) return [];
        return dataList.map((item, idx) => Object.assign({}, item, { sr_no: idx + 1 }));
    }

    /**
     * Debounces a function call.
     * @param {Function} fn - Target function.
     * @param {number} delay - Delay in ms.
     * @returns {Function} Debounced function.
     */
    function debounce(fn, delay = 250) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Throttles a function call.
     * @param {Function} fn - Target function.
     * @param {number} limit - Limit window in ms.
     * @returns {Function} Throttled function.
     */
    function throttle(fn, limit = 250) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Copies text to navigator clipboard with fallback.
     * @param {string} text - Text to copy.
     * @returns {Promise<boolean>} True if success.
     */
    async function copyToClipboard(text) {
        if (!text) return false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Interactive JSON syntax highlighter and tree generator.
     */
    function renderInteractiveJSON(container, jsonText, onItemClick) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) return;

        if (!jsonText || !jsonText.trim()) {
            const ph = el.getAttribute('placeholder') || 'Click to view JSON...';
            el.innerHTML = `<span class="code-terminal-placeholder">${escapeHtml(ph)}</span>`;
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            el.textContent = jsonText;
            return;
        }

        el.innerHTML = buildInteractiveJSONHTML(parsed);

        if (typeof onItemClick === 'function' && !el._jsonClickBound) {
            el._jsonClickBound = true;
            el.addEventListener('click', function (e) {
                const clickable = e.target.closest('.json-clickable-block');
                if (!clickable) return;
                const type = clickable.dataset.jsonType;
                const idx = parseInt(clickable.dataset.jsonIdx, 10);
                if (!isNaN(idx)) {
                    onItemClick(type, idx, clickable);
                }
            });
        }
    }

    function buildInteractiveJSONHTML(data) {
        function formatVal(val, indentLevel, parentKey) {
            const indent = '  '.repeat(indentLevel);

            if (val === null) return '<span class="json-null">null</span>';
            if (typeof val === 'boolean') return `<span class="json-boolean">${val}</span>`;
            if (typeof val === 'number') return `<span class="json-number">${val}</span>`;
            if (typeof val === 'string') return `<span class="json-string">${JSON.stringify(val)}</span>`;

            if (Array.isArray(val)) {
                if (val.length === 0) return '[]';
                const items = val.map((item, idx) => {
                    const itemIndent = '  '.repeat(indentLevel + 1);
                    const formatted = formatVal(item, indentLevel + 1, parentKey);
                    const comma = idx < val.length - 1 ? ',' : '';
                    const itemType = (parentKey || 'item').toLowerCase().replace(/s$/, '');
                    return `<span class="json-clickable-block" data-json-type="${escapeHtml(itemType)}" data-json-idx="${idx}" title="Click to select ${escapeHtml(itemType)} ${idx + 1}">${itemIndent}${formatted}${comma}</span>`;
                }).join('\n');
                return `[\n${items}\n${indent}]`;
            }

            if (typeof val === 'object') {
                const keys = Object.keys(val);
                if (keys.length === 0) return '{}';

                const props = keys.map((k, idx) => {
                    const propIndent = '  '.repeat(indentLevel + 1);
                    const formattedProp = formatVal(val[k], indentLevel + 1, k);
                    const comma = idx < keys.length - 1 ? ',' : '';
                    return `${propIndent}<span class="json-key">"${escapeHtml(k)}"</span>: ${formattedProp}${comma}`;
                }).join('\n');

                return `{\n${props}\n${indent}}`;
            }

            return escapeHtml(String(val));
        }

        return formatVal(data, 0, null);
    }

    // Export functions onto window object
    if (typeof window !== 'undefined') {
        window.Utils = window.Utils || {};
        window.Utils.escapeHtml = escapeHtml;
        window.Utils.formatValue = formatValue;
        window.Utils.parseISOorNumberToDate = parseISOorNumberToDate;
        window.Utils.formatDateTime = formatDateTime;
        window.Utils.persistPageState = persistPageState;
        window.Utils.retrievePageState = retrievePageState;
        window.Utils.mapSerialNumbers = mapSerialNumbers;
        window.Utils.debounce = debounce;
        window.Utils.throttle = throttle;
        window.Utils.copyToClipboard = copyToClipboard;
        window.Utils.renderInteractiveJSON = renderInteractiveJSON;

        // Legacy global bindings
        window.escapeHtml = escapeHtml;
        window.formatValue = formatValue;
        window.formatDateTime = formatDateTime;
        window.persistPageState = persistPageState;
        window.retrievePageState = retrievePageState;
    }
})();