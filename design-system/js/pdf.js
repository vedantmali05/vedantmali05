(function () {
    /* ==========================================================================
       1. UTILITY FUNCTIONS & MEASUREMENTS
       ========================================================================== */

    // Convert pixels/standard units to points (pt)
    const pt = (v) => v * 0.75;

    // Safely handle null, undefined, or empty values with a fallback dash
    function safeValue(val) {
        return (val === null || val === undefined || String(val).trim() === "") ? "—" : val;
    }

    // Format boolean or string active/deactive status labels
    function formatStatus(status) {
        if (status == null) return "—";
        return status === "active" ? "Active" : "Deactive";
    }

    /* ==========================================================================
       2. MAIN REPORT HEADER DRAWER
       ========================================================================== */
    async function drawReportHeader(pdf, meta, orientation, options = {}) {
        const isLandscape = orientation === 'landscape';
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 2a. Configuration & Styling Defaults
        const keys = window.STORAGE_KEYS || {};
        
        const {
            title = localStorage.getItem(keys.COMPANY_NAME) || "Coexio",
            address = localStorage.getItem(keys.COMPANY_ADDRESS) || "",
            subtitle = "LOAD TEST REPORT",
            logoPath = localStorage.getItem(keys.COMPANY_LOGO) || "",
            logoWidth = pt(54),
            logoHeight = pt(54)
        } = options;

        // 2c. Determine Layout Dimensions & Margins
        const contentWidth = isLandscape ? pt(1060) : pt(740);
        const xStart = (pageWidth - contentWidth) / 2;

        // 2b-2d. Load & Draw Company Logo Image if present
        if (logoPath) {
            const logo = new Image();
            logo.src = logoPath;

            await new Promise(resolve => {
                logo.onload = resolve;
                logo.onerror = resolve; // fallback
            });

            let imgWidth = logoWidth;
            let imgHeight = logoHeight;
            try {
                const imgProps = pdf.getImageProperties(logo);
                const ratio = imgProps.width / imgProps.height;
                imgHeight = imgWidth / ratio;
            } catch (e) { }

            try {
                const logoX = xStart + contentWidth - pt(12) - imgWidth;
                pdf.addImage(logo, 'PNG', logoX, pt(45), imgWidth, imgHeight);
            } catch (e) { }
        }

        // 2e. Draw Main Header Labels (Title, Address, Subtitle)
        // 2e1. Company Name
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42); // Slate-900
        pdf.text(title, pageWidth / 2, pt(58), { align: "center" });

        // 2e2. Example: Ram Mandir Industrial.....
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139); // Slate-500
        pdf.text(address, pageWidth / 2, pt(73), { align: "center" });

        // 2e3. Example: Load Test Report
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42); // Slate-900
        pdf.text(subtitle, pageWidth / 2, pt(91), { align: "center" });

        const boxStartY = pt(112);

        // 2f. Organize Metadata Section Datasets
        const testDetails = [
            ["Test Id", safeValue(meta.id)],
            ["Gateway Id", safeValue(meta.gateway_id)],
            ["Cycle Name", safeValue(meta.cycle_name)],
            ["Status", formatStatus(meta.status)],
            ["Remark", safeValue(meta.remark)]
        ];

        const dgDetails = [
            ["Dg Rating", safeValue(meta.dg_rating)],
            ["Eng Model", safeValue(meta.engine_model)],
            ["Alt Model", safeValue(meta.alternator_model)],
            ["Eng Sr No", safeValue(meta.engine_srno)],
            ["Alt Sr No", safeValue(meta.alternator_srno)]
        ];

        const custOperator = [
            ["Customer", safeValue(meta.cust)],
            ["Ope Name", safeValue(meta.op_nm)],
            ["Ope Mobile", safeValue(meta.op_mob)]
        ];

        const timelineDuration = [
            ["Created At", formatDateTime(meta.created_at, 'toLocaleString')],
            ["Started At", meta.started_at ? formatDateTime(meta.started_at, 'toLocaleString') : "Not started"],
            ["Last Updated", formatDateTime(meta.last_updated, 'toLocaleString')],
            ["Duration", meta.duration != null ? `${meta.duration} sec` : "—"]
        ];

        // 2g. Sub-helper: Draw Vertical Section Grid Box
        function drawSectionBox(title, rows, x, y, width, boxOptions = {}) {
            const {
                dryRun = false,
                targetHeight = null
            } = boxOptions;

            const topPadding = 8;
            const bottomPadding = 8;
            const keyWidth = 62;
            const valueWidth = width - keyWidth - 14;
            const lineSpacing = 11;

            const rowHeights = [];
            const splitValues = [];
            let contentHeight = 0;

            rows.forEach(row => {
                const val = String(row[1] ?? "—");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(9);
                const splitVal = pdf.splitTextToSize(val, valueWidth);
                splitValues.push(splitVal);

                const valHeight = (splitVal.length - 1) * lineSpacing + 8;
                const rowH = Math.max(19, valHeight + 8);
                rowHeights.push(rowH);
                contentHeight += rowH;
            });

            const neededHeight = topPadding + contentHeight + bottomPadding;
            const totalHeight = targetHeight ? Math.max(neededHeight, targetHeight) : neededHeight;

            if (dryRun) {
                return totalHeight;
            }

            // Draw Section Outer Border
            pdf.setDrawColor(203, 213, 225);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(x, y, width, totalHeight, 5, 5, 'S');

            // Draw Section Title Legend
            pdf.setFont("helvetica");
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0); // Black
            const titleWidth = pdf.getTextWidth(title);

            pdf.setFillColor(255, 255, 255);
            pdf.rect(x + 5, y - 5, titleWidth + 6, 10, "F");

            pdf.setTextColor(0, 0, 0); // Black
            pdf.text(title, x + 8, y + 2);

            let currentY = y + topPadding;

            // Draw Rows inside the Section Box
            rows.forEach((row, idx) => {
                const key = row[0];
                const splitVal = splitValues[idx];
                const rowH = rowHeights[idx];

                const textBlockHeight = (splitVal.length - 1) * lineSpacing + 8;
                const verticalPadding = (rowH - textBlockHeight) / 2;
                const textY = currentY + verticalPadding + 7;

                // Key (black text)
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(0, 0, 0); // Black
                pdf.text(key, x + 9, textY);

                // Value (dark slate text)
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(9);
                pdf.setTextColor(15, 23, 42);
                splitVal.forEach((line, lineIdx) => {
                    pdf.text(line, x + keyWidth + 9, textY + (lineIdx * lineSpacing));
                });

                currentY += rowH;

                // Row Separator Line
                if (idx < rows.length - 1) {
                    pdf.setDrawColor(203, 213, 225); // Same as border
                    pdf.setLineWidth(0.5);          // Same as border
                    pdf.line(x, currentY, x + width, currentY);
                }
            });

            return totalHeight;
        }

        // 2h. Sub-helper: Draw Horizontal Section Box (for timeline/durations)
        function drawHorizontalSectionBox(title, rows, x, y, width) {
            const topPadding = 14;
            const contentHeight = 36;
            const totalHeight = topPadding + contentHeight;

            // Draw Section Outer Border
            pdf.setDrawColor(203, 213, 225);
            pdf.setLineWidth(0.5);
            pdf.roundedRect(x, y, width, totalHeight, 5, 5, 'S');

            // Draw Section Title Legend
            pdf.setFont("helvetica");
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0); // Black
            const titleWidth = pdf.getTextWidth(title);

            pdf.setFillColor(255, 255, 255);
            pdf.rect(x + 5, y - 5, titleWidth + 6, 10, "F");

            pdf.setTextColor(0, 0, 0); // Black
            pdf.text(title, x + 8, y + 2);

            const colWidth = width / rows.length;

            // Draw Columns inside the Horizontal Box
            rows.forEach((row, idx) => {
                const key = row[0];
                const val = String(row[1] ?? "—");
                const colX = x + (idx * colWidth);

                // Column Key (black text)
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(0, 0, 0); // Black
                pdf.text(key, colX + 9, y + topPadding + 6);

                // Column Value (dark slate text)
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(9);
                pdf.setTextColor(15, 23, 42);
                const splitVal = pdf.splitTextToSize(val, colWidth - 18);
                splitVal.forEach((line, lineIdx) => {
                    pdf.text(line, colX + 9, y + topPadding + 19 + (lineIdx * 11));
                });

                // Vertical Separator Line between Columns
                if (idx < rows.length - 1) {
                    pdf.setDrawColor(203, 213, 225); // Same as border
                    pdf.setLineWidth(0.5);          // Same as border
                    pdf.line(colX + colWidth, y, colX + colWidth, y + totalHeight); // 100% height!
                }
            });

            return totalHeight;
        }

        // 2i. Arrange and Position Boxes into Rows & Columns
        const innerContentWidth = contentWidth - pt(24);
        const innerXStart = xStart + pt(12);
        const colWidth = (innerContentWidth - pt(24)) / 3;

        // Compute matching height for Row 1
        const h1 = drawSectionBox("Test Details", testDetails, 0, 0, colWidth, { dryRun: true });
        const h2 = drawSectionBox("DG & Engine Details", dgDetails, 0, 0, colWidth, { dryRun: true });
        const h3 = drawSectionBox("Customer & Operator", custOperator, 0, 0, colWidth, { dryRun: true });

        const maxRow1Height = Math.max(h1, h2, h3);

        // Draw Row 1 Boxes
        drawSectionBox("Test Details", testDetails, innerXStart, boxStartY, colWidth, { targetHeight: maxRow1Height });
        drawSectionBox("DG & Engine Details", dgDetails, innerXStart + colWidth + pt(12), boxStartY, colWidth, { targetHeight: maxRow1Height });
        drawSectionBox("Customer & Operator", custOperator, innerXStart + 2 * colWidth + pt(24), boxStartY, colWidth, { targetHeight: maxRow1Height });

        // Draw Row 2 Box (Horizontal Timeline)
        const timelineY = boxStartY + maxRow1Height + pt(20);
        const h4 = drawHorizontalSectionBox("Timeline & Duration", timelineDuration, innerXStart, timelineY, innerContentWidth);

        const boxHeight = (timelineY + h4) - boxStartY;

        // 2j. Draw Main Outer Header Container Border
        const outerX = xStart;
        const outerY = pt(40);
        const outerW = contentWidth;
        const outerH = (boxStartY + boxHeight + pt(10)) - outerY;

        pdf.setDrawColor(203, 213, 225); // Slate-300
        pdf.setLineWidth(0.5);
        pdf.roundedRect(outerX, outerY, outerW, outerH, pt(8), pt(8), 'S');

        // Reset settings
        pdf.setTextColor(0, 0, 0);
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(1.0);

        return outerY + outerH;
    }

    /* ==========================================================================
       3. REPORT NOTE / WARNING BOX DRAWER
       ========================================================================== */
    function drawNoteBox(pdf, text, x, y, width, options = {}) {
        const {
            paddingX = 12,
            paddingY = 9,
            fontSize = 9,
            lineSpacing = 12,
            state = "warn"
        } = options;

        const paddingLeftRight = paddingX;
        const paddingTopBottom = paddingY;

        const states = {
            err: [239, 68, 68],       // Red
            error: [239, 68, 68],     // Red
            warn: [245, 158, 11],      // Amber
            warning: [245, 158, 11],   // Amber
            success: [16, 185, 129],   // Green
            info: [59, 130, 246]       // Blue
        };

        const stateKey = state.toLowerCase();
        const color = states[stateKey] || states.warn;

        // Wrap note text inside the box width
        const textWidth = width - (paddingLeftRight * 2);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(fontSize);
        const splitText = pdf.splitTextToSize(text, textWidth);

        const textHeight = splitText.length * lineSpacing;
        const boxHeight = textHeight + (paddingTopBottom * 2);

        // Fill background (White only)
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(x, y, width, boxHeight, 5, 5, 'F');

        // Draw outer border (State color)
        pdf.setDrawColor(color[0], color[1], color[2]);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x, y, width, boxHeight, 5, 5, 'S');

        // Draw text (State color)
        pdf.setTextColor(color[0], color[1], color[2]);

        splitText.forEach((line, index) => {
            const lineY = y + paddingTopBottom + fontSize + (index * lineSpacing);
            if (index === 0) {
                const match = line.match(/^(Note:|NOTE:)\s*/i);
                if (match) {
                    const prefix = match[0];
                    const restOfLine = line.substring(prefix.length);

                    // Draw bold prefix (State color)
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor(color[0], color[1], color[2]);
                    pdf.text(prefix, x + paddingLeftRight, lineY);

                    // Draw normal rest of line (Slate-900 / Black)
                    const prefixWidth = pdf.getTextWidth(prefix);
                    pdf.setFont("helvetica", "normal");
                    pdf.setTextColor(15, 23, 42);
                    pdf.text(restOfLine, x + paddingLeftRight + prefixWidth, lineY);
                    return;
                }
            }
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(15, 23, 42); // Slate-900 / Black
            pdf.text(line, x + paddingLeftRight, lineY);
        });

        // Reset settings
        pdf.setTextColor(0, 0, 0);
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(1.0);

        return boxHeight;
    }

    // 3. PAGE FOOTER DRAWER
    function drawPdfFooter(
        pdf,
        pageWidth,
        pageHeight,
        pageNo,
        totalPages,
        margin
    ) {
        pdf.setDrawColor(226, 232, 240); // Slate-200 line
        pdf.setLineWidth(0.8);

        pdf.line(
            margin,
            pageHeight - 25,
            pageWidth - margin,
            pageHeight - 25
        );

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0); // Black

        const keys = window.STORAGE_KEYS || {};
        const compName = localStorage.getItem(keys.COMPANY_NAME) || "Coexio";
        pdf.text(
            `Generated by ${compName}`,
            margin,
            pageHeight - 13
        );

        pdf.text(
            `Page ${pageNo} of ${totalPages}`,
            pageWidth - margin,
            pageHeight - 13,
            { align: "right" }
        );
    }

    /* ==========================================================================
       4. GLOBAL EXPORTS REGISTER
       ========================================================================== */
    if (typeof window !== 'undefined') {
        window.PDF = {
            pt,
            safeValue,
            formatStatus,
            drawReportHeader,
            drawNoteBox,
            drawPdfFooter
        };
    }

    // Automatically add/remove pdf-printing class to body during native print
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('pdf-printing');
    });
    window.addEventListener('afterprint', () => {
        document.body.classList.remove('pdf-printing');
    });
})();
