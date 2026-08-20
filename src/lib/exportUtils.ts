import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export tabular data directly to CSV with UTF-8 BOM
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((field) => {
          let val = row[field] ?? '';
          if (typeof val === 'string') {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export tabular data directly to Microsoft Excel XLSX format
 */
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export tabular data to styled PDF with Dikdasmen Header
 */
export function exportToPDF(
  title: string,
  headers: string[],
  dataRows: string[][],
  filename: string
) {
  const doc = new jsPDF('landscape');

  // Header Title
  doc.setFontSize(14);
  doc.setTextColor(20, 83, 45); // Emerald-900
  doc.text('MAJELIS PENDIDIKAN DASAR DAN MENENGAH (DIKDASMEN)', 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Sistem Informasi Manajemen (SIM Dikdasmen) | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(title.toUpperCase(), 14, 32);

  (doc as any).autoTable({
    startY: 36,
    head: [headers],
    body: dataRows,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129], // Emerald-500
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { top: 35 },
  });

  doc.save(`${filename}.pdf`);
}
