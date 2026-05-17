/**
 * exportUtils.js
 * Client-side PDF and Excel export utilities.
 * Uses jspdf + jspdf-autotable for PDF, xlsx for Excel.
 */

// ─── Sanitize cell values for jsPDF (Helvetica is latin-only) ────────────────
const sanitizeForPDF = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/₹/g, 'Rs.')       // Rupee sign → Rs.
    .replace(/–/g, '-')          // En dash
    .replace(/—/g, '-')          // Em dash
    .replace(/"/g, '"')          // Curly quotes
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/[^\x00-\x7F]/g, '?'); // Any remaining non-ASCII → ?
};

const sanitizeRows = (rows) =>
  rows.map(row => row.map(cell => sanitizeForPDF(cell)));

const sanitizeCols = (cols) =>
  cols.map(col => sanitizeForPDF(col));

// ─── PDF Export ────────────────────────────────────────────────────────────────
export const exportToPDF = async (columns, rows, title = 'Report', filename = 'report') => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const cleanCols = sanitizeCols(columns);
    const cleanRows = sanitizeRows(rows);
    const cleanTitle = sanitizeForPDF(title);
    const generatedAt = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    // ── Header bar ───────────────────────────────────────────
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 297, 20, 'F'); // full-width dark header

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EduZone LMS', 14, 13);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report: ${cleanTitle}`, 80, 13);

    // ── Metadata row ─────────────────────────────────────────
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${generatedAt}   |   Total Records: ${rows.length}`, 14, 27);

    // ── Data table ───────────────────────────────────────────
    autoTable(doc, {
      head: [cleanCols],
      body: cleanRows,
      startY: 32,
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        font: 'helvetica',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: { fillColor: [245, 248, 252] },
      rowStyles: { textColor: [40, 40, 40] },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        // Footer on every page
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}  |  EduZone LMS  |  Confidential`,
          14, doc.internal.pageSize.getHeight() - 8
        );
      }
    });

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed: ' + err.message);
  }
};

// ─── Excel Export ──────────────────────────────────────────────────────────────
export const exportToExcel = async (columns, rows, filename = 'report') => {
  try {
    const XLSX = await import('xlsx');

    const wsData = [columns, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-fit column widths
    const colWidths = columns.map((col, i) => ({
      wch: Math.max(col.length, ...rows.map(r => String(r[i] ?? '').length), 10)
    }));
    ws['!cols'] = colWidths;

    // Style header row (bold) — xlsx-style compatible
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddr]) continue;
      ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: '1E3A5F' } } };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EduZone Report');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Excel export failed:', err);
    alert('Excel export failed: ' + err.message);
  }
};
