(function () {
    function isInvalidWord(word) { return word === null; }
    function toUint16(word) { if (isInvalidWord(word)) return null; return word & 0xFFFF; }
    function toInt16(word) { const u = toUint16(word); if (u === null) return null; return (u & 0x8000) ? u - 0x10000 : u; }

    function buildRegisterMap(resp) {
        const m = new Map();
        [
            ...(resp.holding_ranges || []),
            ...(resp.input_ranges || [])
        ].forEach(r => {
            const start = Number(r.start);
            (r.values || []).forEach((v, i) => m.set(start + i, v));
        });
        return m;
    }

    function resolveEntry(regMap, mapEntry) {
        if (!mapEntry || !mapEntry.source) return { value: null };
        const addr = Number(mapEntry.source.start) + Number(mapEntry.source.offset);
        const raw = regMap.get(addr);
        if (raw === undefined || raw === 65535) return { value: null };
        let val;
        if (mapEntry.valueType === 'int16') {
            val = toInt16(raw);
        } else {
            val = toUint16(raw);
        }
        if (val === null) return { value: null };
        return { value: val * (mapEntry.scale || 1) };
    }

    function resolveField(fieldName) {
        const mapping = typeof ACTIVE_MAPPING !== 'undefined' ? ACTIVE_MAPPING : null;
        if (!mapping) return null;
        return mapping.fields?.[fieldName] || null;
    }

    function decode4QPowerFactor(pf) {
        if (pf === null || pf === undefined || Number.isNaN(pf)) return null;
        if (pf >= 0 && pf <= 1) return pf; // Q1 (Inductive Import)
        if (pf > 1 && pf <= 2) return 2 - pf; // Q2 (Capacitive Export)
        if (pf >= -2 && pf <= -1) return -2 - pf; // Q3 (Inductive Export)
        if (pf > -1 && pf < 0) return pf; // Q4 (Capacitive Import)
        return pf;
    }

    function cleanPowerValue(val) {
        if (val === null || val === undefined) return 0;
        if (val < -100000 || val > 100000) return 0;
        return val;
    }

    function derivePowerValues(amps, ln, pf) {
        if (amps === null || ln === null || pf === null) {
            return { kw: null, kvar: null, kva: null };
        }
        const kva = (amps * ln) / 1000;
        const kw = kva * pf;
        const kvar = Math.sqrt(Math.max(0, (kva * kva) - (kw * kw)));
        return { kw, kvar, kva };
    }

    function formatValue(val, decimals = 1, suffix = '') {
        if (val === null || val === undefined) return '--';
        return Number(val).toFixed(decimals) + suffix;
    }

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
            if (!Number.isNaN(num)) return parseISOorNumberToDate(num);
        }
        return null;
    }

    function extractServerTimestampFallback(resp, jsonBody) {
        if (resp && resp.headers) {
            try {
                const h = resp.headers;
                const xTs = (h.get('x-data-timestamp') || h.get('x-timestamp') || h.get('x-stored-at'));
                if (xTs) {
                    const d = parseISOorNumberToDate(xTs);
                    if (d) return d;
                }
            } catch (e) { }
        }

        if (jsonBody) {
            if (jsonBody.timestamp) {
                const d = parseISOorNumberToDate(jsonBody.timestamp);
                if (d) return d;
            }
            if (jsonBody.created_at) {
                const d = parseISOorNumberToDate(jsonBody.created_at);
                if (d) return d;
            }
        }
        return null;
    }

    function escapeHtml(s) {
        if (s === undefined || s === null) return '';
        return String(s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[c]);
    }




    function savePageState(key = typeof PAGE_STATE_KEY !== 'undefined' ? PAGE_STATE_KEY : '', stateData = null) {
        if (!key) return;
        let state = stateData;
        if (!state) {
            if (typeof window !== 'undefined' && typeof window.getPageState === 'function') {
                state = window.getPageState();
            } else {
                const searchEl = document.getElementById('search-input-standard') || document.getElementById('searchBox');
                state = {
                    search: searchEl ? searchEl.value : ''
                };
                if (typeof deleteModeActive !== 'undefined') {
                    state.deleteMode = deleteModeActive;
                }
                if (typeof selectedUsersForDel !== 'undefined' && Array.isArray(selectedUsersForDel)) {
                    state.selected = selectedUsersForDel.map(r => r._item_data?.id).filter(Boolean);
                }
            }
        }
        localStorage.setItem(key, JSON.stringify(state));
    }


    function restorePageState(key = typeof PAGE_STATE_KEY !== 'undefined' ? PAGE_STATE_KEY : '') {
        if (!key) return null;
        try {
            const saved = JSON.parse(localStorage.getItem(key) || 'null');
            if (!saved) return null;
            if (typeof window !== 'undefined' && typeof window.setPageState === 'function') {
                window.setPageState(saved);
            } else {
                const searchEl = document.getElementById('search-input-standard') || document.getElementById('searchBox');
                if (searchEl && saved.search) {
                    searchEl.value = saved.search;
                    const tbl = document.querySelector('#companies-table');
                    if (tbl && typeof tbl.filter_rows === 'function') {
                        tbl.filter_rows(saved.search);
                    } else if (typeof filterTable === 'function') {
                        filterTable();
                    }
                }
            }
            return saved;
        } catch (e) {
            console.warn('[PageState] Could not restore state:', e);
            return null;
        }
    }

    function persistPageState(storageKey, state) {
        localStorage.setItem(storageKey, JSON.stringify(state));
    }

    function retrievePageState(storageKey) {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || 'null');
        } catch (e) {
            console.warn('[PageState] Could not retrieve state:', e);
            return null;
        }
    }

    function mapSerialNumbers(dataList) {
        if (!Array.isArray(dataList)) return [];
        return dataList.map((item, idx) => {
            return Object.assign({}, item, { sr_no: idx + 1 });
        });
    }

    function decodeInt16(val, signed) {
    if (val == null || val === 65535) return null;
        if (!signed) return val;
        return (val & 0x8000) ? val - 65536 : val;
    }

    function decodeFloat32(r1, r2, endian = "ABCD") {
        if (r1 == null || r2 == null || r1 === 65535 || r2 === 65535) {
            return null;
        }
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        switch (endian) {
            case "ABCD":
                view.setUint16(0, r1);
                view.setUint16(2, r2);
                break;
            case "CDAB":
                view.setUint16(0, r2);
                view.setUint16(2, r1);
                break;
            case "BADC":
                view.setUint16(0, ((r1 & 0xFF) << 8) | (r1 >> 8));
                view.setUint16(2, ((r2 & 0xFF) << 8) | (r2 >> 8));
                break;
            case "DCBA":
                view.setUint16(0, ((r2 & 0xFF) << 8) | (r2 >> 8));
                view.setUint16(2, ((r1 & 0xFF) << 8) | (r1 >> 8));
                break;
            default:
                view.setUint16(0, r1);
                view.setUint16(2, r2);
        }
        return view.getFloat32(0);
    }

    function mapModbusRegisterValue(regMap, col, raw = false) {
        const datatype = col.datatype || (col.signed ? "int16" : "uint16");
        let value = null;
        switch (datatype) {
            case "float32": {
                const r1 = regMap.get(col.register);
                const r2 = regMap.get(col.register + 1);
                value = decodeFloat32(r1, r2, col.endian || "ABCD");
                break;
            }
            case "4Q_FP_PF": {
                const r1 = regMap.get(col.register);
                const r2 = regMap.get(col.register + 1);
                const pfRaw = decodeFloat32(r1, r2, col.endian || "ABCD");
                value = decode4QPowerFactor(pfRaw);
                break;
            }
            case "int16": {
                const rawVal = regMap.get(col.register);
                value = decodeInt16(rawVal, true);
                break;
            }
            case "uint16":
            default: {
                const rawVal = regMap.get(col.register);
                value = decodeInt16(rawVal, false);
                break;
            }
        }
        if (value === null || value === undefined || Number.isNaN(value)) {
            return raw ? null : "—";
        }
        value = value * (col.scale ?? 1);
        if (raw) return value;
        const decimals = col.decimals ?? (col.scale && col.scale < 1 ? Math.abs(Math.log10(col.scale)) : 0);
        return Number(value).toFixed(decimals);
    }

    function saveLastFrame() {
        try {
            if (window.top === window.self) {
                const filename = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
                localStorage.setItem("lastFrame", filename + window.location.search);
            }
        } catch (_) { }
    }

    function formatDateTime(val, type = 'dd/mm/yyyy hh:mm') {
        if (!val && val !== 0) return '—';
        let d = parseISOorNumberToDate(val);
        if (!d) {
            d = new Date(val);
        }
        if (!d || isNaN(d.getTime())) return '—';

        const pad = n => String(n).padStart(2, '0');

        const dd = pad(d.getDate());
        const mm = pad(d.getMonth() + 1);
        const yyyy = d.getFullYear();
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        const ss = pad(d.getSeconds());

        switch (type) {
            case 'dd/mm/yyyy':
                return `${dd}/${mm}/${yyyy}`;
            case 'dd/mm/yyyy hh:mm':
                return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
            case 'dd/mm/yyyy hh:mm:ss':
                return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${ss}`;
            case 'yyyy-mm-dd':
                return `${yyyy}-${mm}-${dd}`;
            case 'yyyy-mm-dd hh:mm':
                return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            case 'yyyy-mm-dd hh:mm:ss':
                return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
            case 'hh:mm':
                return `${hh}:${min}`;
            case 'hh:mm:ss':
                return `${hh}:${min}:${ss}`;
            case 'dd/mm':
                return `${dd}/${mm}`;
            case 'toLocaleDateString':
                return d.toLocaleDateString();
            case 'toLocaleTimeString':
                return d.toLocaleTimeString();
            case 'toLocaleString':
            default:
                return d.toLocaleString();
        }
    }

    if (typeof window !== 'undefined') {
        window.isInvalidWord = isInvalidWord;
        window.toUint16 = toUint16;
        window.toInt16 = toInt16;
        window.buildRegisterMap = buildRegisterMap;
        window.resolveEntry = resolveEntry;
        window.resolveField = resolveField;
        window.decode4QPowerFactor = decode4QPowerFactor;
        window.cleanPowerValue = cleanPowerValue;
        window.derivePowerValues = derivePowerValues;
        window.formatValue = formatValue;
        window.parseISOorNumberToDate = parseISOorNumberToDate;
        window.extractServerTimestampFallback = extractServerTimestampFallback;
        window.escapeHtml = escapeHtml;
        window.savePageState = savePageState;
        window.restorePageState = restorePageState;
        window.persistPageState = persistPageState;
        window.retrievePageState = retrievePageState;
        window.mapSerialNumbers = mapSerialNumbers;
        window.decodeInt16 = decodeInt16;
        window.decodeFloat32 = decodeFloat32;
        window.mapModbusRegisterValue = mapModbusRegisterValue;
        window.saveLastFrame = saveLastFrame;
        window.formatDateTime = formatDateTime;
        window.setupInteractiveJSONOutput = setupInteractiveJSONOutput;
        window.renderInteractiveJSON = renderInteractiveJSON;
    }

    function setupInteractiveJSONOutput(outputEl, onItemClick) {
        if (!outputEl) return;

        outputEl._rawJsonText = outputEl.textContent || outputEl.value || "";

        try {
            Object.defineProperty(outputEl, 'value', {
                get: function () {
                    return this._rawJsonText !== undefined ? this._rawJsonText : (this.textContent || "");
                },
                set: function (val) {
                    this._rawJsonText = val || "";
                    renderInteractiveJSON(this, this._rawJsonText, onItemClick);
                },
                configurable: true
            });
        } catch (e) {
            console.warn('Could not define value property on output element', e);
        }

        outputEl.addEventListener('click', function (e) {
            const clickable = e.target.closest('.json-clickable-block');
            if (!clickable) return;
            const type = clickable.dataset.jsonType;
            const idx = parseInt(clickable.dataset.jsonIdx, 10);
            const slaveIdx = clickable.dataset.slaveIdx !== undefined ? parseInt(clickable.dataset.slaveIdx, 10) : null;
            if (!isNaN(idx) && typeof onItemClick === 'function') {
                onItemClick(type, idx, slaveIdx, clickable);
            }
        });

        if (outputEl._rawJsonText) {
            renderInteractiveJSON(outputEl, outputEl._rawJsonText, onItemClick);
        }
    }

    function renderInteractiveJSON(container, jsonText, onItemClick) {
        if (!jsonText || !jsonText.trim()) {
            const ph = container.getAttribute('placeholder') || 'Click to view JSON...';
            container.innerHTML = `<span class="code-terminal-placeholder">${escapeHtml(ph)}</span>`;
            return;
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (e) {
            container.textContent = jsonText;
            return;
        }

        container.innerHTML = buildInteractiveJSONHTML(parsed);
    }

    function buildInteractiveJSONHTML(data) {
        function formatVal(val, indentLevel, parentKey, itemIdx, currentSlaveIdx = null) {
            const indent = '  '.repeat(indentLevel);

            if (val === null) return '<span class="json-null">null</span>';
            if (typeof val === 'boolean') return `<span class="json-boolean">${val}</span>`;
            if (typeof val === 'number') return `<span class="json-number">${val}</span>`;
            if (typeof val === 'string') return `<span class="json-string">${JSON.stringify(val)}</span>`;

            if (Array.isArray(val)) {
                if (val.length === 0) return '[]';
                const items = val.map((item, idx) => {
                    const itemIndent = '  '.repeat(indentLevel + 1);
                    const formatted = formatVal(item, indentLevel + 1, parentKey, idx, currentSlaveIdx);
                    const comma = idx < val.length - 1 ? ',' : '';
                    const itemType = (parentKey || 'item').toLowerCase().replace(/s$/, '');
                    return `<span class="json-clickable-block" data-json-type="${escapeHtml(itemType)}" data-json-idx="${idx}" title="Click to select ${escapeHtml(itemType)} ${idx + 1}">${itemIndent}${formatted}${comma}</span>`;
                }).join('\n');
                return `[\n${items}\n${indent}]`;
            }

            if (typeof val === 'object') {
                const keys = Object.keys(val);
                if (keys.length === 0) return '{}';

                if (keys.length === 3 && keys.includes('start') && keys.includes('count') && keys.includes('type') && typeof val.start === 'number' && typeof val.count === 'number') {
                    return `{ <span class="json-key">"start"</span>: <span class="json-number">${val.start}</span>, <span class="json-key">"count"</span>: <span class="json-number">${val.count}</span>, <span class="json-key">"type"</span>: <span class="json-string">"${val.type}"</span> }`;
                }

                const parentItemIdx = itemIdx !== null ? itemIdx : currentSlaveIdx;

                const props = keys.map((k, idx) => {
                    const propIndent = '  '.repeat(indentLevel + 1);
                    const formattedProp = formatVal(val[k], indentLevel + 1, k, itemIdx, parentItemIdx);
                    const comma = idx < keys.length - 1 ? ',' : '';
                    return `${propIndent}<span class="json-key">"${escapeHtml(k)}"</span>: ${formattedProp}${comma}`;
                }).join('\n');

                return `{\n${props}\n${indent}}`;
            }

            return escapeHtml(String(val));
        }

        return formatVal(data, 0, null, null, null);
    }
})();