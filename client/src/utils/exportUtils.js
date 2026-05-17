/**
 * exportUtils.js
 * Client-side PDF and Excel export utilities.
 * Uses jspdf + jspdf-autotable for PDF, xlsx for Excel.
 */

// ─── PDF Export ────────────────────────────────────────────────────────────────
export const exportToPDF = async (columns, rows, title = 'Report', filename = 'report') => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95); // primary color
    doc.text('EduZone LMS', 14, 16);

    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(title, 14, 24);

    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 30);

    // Table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 35,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF export failed. Please ensure jspdf and jspdf-autotable are installed.');
  }
};

// ─── Excel Export ──────────────────────────────────────────────────────────────
export const exportToExcel = async (columns, rows, filename = 'report') => {
  try {
    const XLSX = await import('xlsx');

    const wsData = [columns, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column width auto-fit
    const colWidths = columns.map((col, i) => ({
      wch: Math.max(col.length, ...rows.map(r => String(r[i] || '').length), 10)
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Excel export failed:', err);
    alert('Excel export failed. Please ensure the xlsx package is installed.');
  }
};
