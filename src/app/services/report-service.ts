import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// pdfmake (browser build)
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'; // Roboto default (vfs)
import { vfs as khmerVfs } from '../assets/pdf/fonts/vfs_fonts_khmer.js'; // <-- your generated VFS

// ✅ 1) Merge BOTH vfs objects so Roboto + Khmer are available
(pdfMake as any).vfs = { ...(pdfFonts as any).vfs, ...khmerVfs };

// ✅ 2) Register fonts (keep Roboto available too if you want)
(pdfMake as any).fonts = {
  // default roboto mapping (optional, but handy)
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-Italic.ttf',
  },
  // your Khmer family
  NotoSansKhmer: {
    normal: 'NotoSansKhmer-VariableFont_wdth,wght.ttf',
    bold: 'NotoSansKhmer-VariableFont_wdth,wght.ttf',
    italics: 'NotoSansKhmer-VariableFont_wdth,wght.ttf',
    bolditalics: 'NotoSansKhmer-VariableFont_wdth,wght.ttf',
  },
};

type Row = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class ReportService {
  // -------- PDF (pdfmake) ----------
  downloadPdfLightLayout(
    rows: Record<string, any>[],
    {
      title,
      dateText = new Date().toLocaleDateString(),
      columns,
      logoText = 'Logo',
      logoImageDataUrl,
    }: {
      title: string;
      dateText?: string;
      columns?: string[];
      logoText?: string;
      logoImageDataUrl?: string; // data URL if you have a real logo
    }
  ) {
    const cols =
      columns && columns.length ? columns : Object.keys(rows[0] ?? {});
    const body = [
      cols.map((c) => ({ text: this._label(c), style: 'th' })),
      ...rows.map((r) =>
        cols.map((c) => ({ text: this._fmt(r[c]), style: 'td' }))
      ),
    ];

    // header block (logo left, title+date right)
    const headerBlock = {
      columns: [
        {
          width: 72,
          stack: [
            logoImageDataUrl
              ? {
                  image: logoImageDataUrl,
                  width: 60,
                  height: 60,
                  margin: [0, 2, 0, 0],
                }
              : {
                  canvas: [
                    {
                      type: 'ellipse',
                      x: 30,
                      y: 30,
                      r1: 28,
                      r2: 28,
                      lineWidth: 1,
                      lineColor: '#c7c7c7',
                      color: '#ffffff',
                    },
                  ],
                },
            logoImageDataUrl
              ? null
              : {
                  text: logoText,
                  alignment: 'center',
                  margin: [0, -42, 0, 0],
                  fontSize: 10,
                  color: '#666',
                },
          ].filter(Boolean),
        },
        {
          width: '*',
          stack: [
            { text: title, alignment: 'right', style: 'title' },
            { text: dateText, alignment: 'right', style: 'date' },
          ],
        },
      ],
      margin: [0, 0, 0, 16],
    };

    const doc: any = {
      pageSize: 'A4',
      pageMargins: [36, 48, 36, 48],
      // defaultStyle: { font: 'NotoSansKhmer' }, // uncomment if you set Khmer fonts
      content: [
        headerBlock,
        {
          table: { headerRows: 1, widths: Array(cols.length).fill('*'), body },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#f3f6f9' : null,
            hLineColor: () => '#e6e6e6',
            vLineColor: () => '#e6e6e6',
            paddingTop: () => 6,
            paddingBottom: () => 6,
            paddingLeft: () => 8,
            paddingRight: () => 8,
          },
          margin: [0, 8, 0, 0],
        },
      ],
      styles: {
        title: { fontSize: 18, bold: true, color: '#222' },
        date: { fontSize: 10, color: '#777' },
        th: { bold: true, color: '#333' },
        td: { color: '#333' },
      },
      footer: (cur: number, total: number) => ({
        text: `Page ${cur} / ${total}`,
        alignment: 'right',
        margin: [36, 0, 36, 24],
        fontSize: 9,
        color: '#777',
      }),
    };

    pdfMake.createPdf(doc).download(`${this._slug(title)}.pdf`);
  }

  // -------- Excel (xlsx) ----------
  downloadExcelLightLayout(
    title: string,
    dateText: string,
    rows: any[],
    columns?: string[]
  ) {
    const cols =
      columns && columns.length ? columns : Object.keys(rows[0] ?? {});

    const aoa: any[][] = [];

    // Row 1: Logo + Title + Date (simulate by 3 columns)
    aoa.push(['[Logo]', title, dateText]);

    // Row 2: Header
    aoa.push(cols.map((c) => this._label(c)));

    // Data
    for (const r of rows) {
      aoa.push(cols.map((c) => this._fmt(r[c])));
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Column widths
    ws['!cols'] = [
      { wch: 12 }, // Logo
      { wch: Math.max(20, title.length + 2) }, // Title
      { wch: 15 }, // Date
      ...cols.map((c) => ({ wch: Math.max(12, this._label(c).length + 2) })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${this._slug(title)}.xlsx`);
  }

  // -------- CSV (xlsx) ----------
  downloadCsvLightLayout(
    title: string,
    dateText: string,
    rows: any[],
    columns?: string[]
  ) {
    const cols =
      columns && columns.length ? columns : Object.keys(rows[0] ?? {});
    const aoa: any[][] = [];

    // Row 1: Logo + Title + Date
    aoa.push(['[Logo]', title, dateText]);

    // Row 2: Header
    aoa.push(cols.map((c) => this._label(c)));

    // Data
    for (const r of rows) {
      aoa.push(cols.map((c) => this._fmt(r[c])));
    }

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const csvRaw = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' });

    const csvWithBom = '\uFEFF' + csvRaw;
    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this._slug(title)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------- helpers ----------
  private _label(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }
  private _fmt(v: any) {
    if (v == null) return '';
    if (typeof v === 'number')
      return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (v instanceof Date) return v.toLocaleDateString();
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) {
      const d = new Date(v);
      if (!isNaN(+d)) return d.toLocaleDateString();
    }
    return String(v);
  }
  private _slug(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private _autosizeColumns(ws: XLSX.WorkSheet, rows: Row[]) {
    const cols = Object.keys(rows[0] ?? {});
    ws['!cols'] = cols.map((c) => {
      const max = Math.max(
        c.length,
        ...rows.map((r) => (r[c] == null ? 0 : String(r[c]).length))
      );
      return { wch: Math.min(Math.max(10, max + 2), 40) };
    });
  }
}
