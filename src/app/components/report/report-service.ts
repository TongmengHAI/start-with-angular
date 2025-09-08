import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

// pdf-init.ts (call from AppModule or a root service constructor)
import { getPdfMake } from '../../shared/pdf/pdf-init';

// ---- Minimal types so pdfmake exporter compiles ----
export type ColumnDef<T = any> = {
  key: keyof T | string;
  header: string;
  width?: number; // used for pdf column widths
  align?: 'left' | 'center' | 'right' | string;
};

export type ReportOptions = {
  title: string;
  subtitle?: string;
  filename?: string;
  logoBase64?: string;
  DateAt?: Date;
  pdf?: {
    orientation?: 'p' | 'l';
    format?: string | number[]; // 'A4', etc.
    headFillColor?: [number, number, number];
    font?: string; // optional alt font family
  };
  signatures3?: {
    titles?: [string, string, string];
  };
  logoWidth?: number;
  logoHeight?: number;
};

type Row = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class ReportService {
  private cellValue(row: any, key: string | number | symbol): string {
    const v = (row as any)?.[key as any];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
  private slugify(s: string) {
    return (s || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // -------- PDF (pdfmake) ----------
  async exportPdfWithPdfmake<T>(
    rows: T[],
    cols: ColumnDef<T>[],
    opts: ReportOptions
  ) {
    const pdfMake: any = getPdfMake(); // always get the canonical instance

    const now = opts.DateAt ?? new Date();
    const dateStr = `Date: ${dayjs(now).format('DD-MM-YYYY HH:mm')}`;
    const filename = (opts.filename ?? this.slugify(opts.title)) + '.pdf';

    // Table data
    const body = [
      cols.map((c) => ({
        text: c.header,
        bold: true,
        alignment: 'center',
      })) as any,
      ...rows.map((r) =>
        cols.map((c) => {
          let v = this.cellValue(r, c.key);

          // Amount: $ right-aligned number, tight padding
          if (c.key === 'amount') {
            const formatted = Number(v).toLocaleString('en-US', {
              minimumFractionDigits: 6,
            });
            return {
              // columns render inline without table borders/padding
              columns: [
                {
                  text: '$',
                  width: 12,
                  alignment: 'left',
                  margin: [0, 0, 2, 0],
                },
                { text: formatted, width: '*', alignment: 'right' },
              ],
              // kill any extra paddings from the parent table cell
              margin: [0, 0, 0, 0],
            };
          }

          // Date formatting
          if (c.key === 'date') {
            v = dayjs(v).format('DD-MM-YYYY HH:mm');
          }

          return { text: v, alignment: c.align ?? 'left' };
        })
      ),
    ];

    // Column widths: use provided width (rough mm->pt), else auto '*'
    const widths = cols.map((c) => {
      if (c.width === ('*' as any)) return '*'; // explicitly stretch
      if (typeof c.width === 'number') return c.width * 2.835; // mm → pt (optional)
      return 'auto'; // natural content width
    });
    // ensure at least one '*' so table fills the line
    if (!widths.includes('*')) widths[widths.length - 1] = '*';

    // Colors
    const headFill = opts.pdf?.headFillColor ?? [230, 236, 255];

    // Helper: a dotted underline row (label + line)
    // signature block using dashed lines
    const signBlock = (title: string) => ({
      stack: [
        { text: title, bold: true, alignment: 'center', margin: [0, 8, 0, 50] },

        // Name
        {
          columns: [
            {
              text: 'Name :',
              width: 'auto',
              margin: [
                (opts.pdf?.orientation ?? 'p') === 'l' ? 50 : 20,
                2,
                2,
                0,
              ],
            },
            {
              width: '*',
              columns: [
                { text: '', width: 'auto', margin: [0, 2, 2, 0] },
                {
                  width: '*',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 109,
                      y2: 0,
                      lineWidth: 0.8,
                      dash: { length: 2, space: 2 },
                      align: 'right',
                    },
                  ],
                  margin: [0, 13, 0, 0], // pushes line down a bit
                },
              ],
              columnGap: 1,
            },
          ],
        },

        // Position
        {
          columns: [
            {
              text: 'Position :',
              width: 'auto',
              margin: [
                (opts.pdf?.orientation ?? 'p') === 'l' ? 50 : 20,
                2,
                2,
                0,
              ],
            },
            {
              width: '*',
              columns: [
                { text: '', width: 'auto', margin: [0, 2, 2, 0] },
                {
                  width: '*',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 100,
                      y2: 0,
                      lineWidth: 0.8,
                      dash: { length: 2, space: 2 },
                    },
                  ],
                  margin: [0, 13, 0, 0],
                },
              ],
              columnGap: 1,
            },
          ],
        },

        // Date
        {
          columns: [
            {
              text: 'Date :',
              width: 'auto',
              margin: [
                (opts.pdf?.orientation ?? 'p') === 'l' ? 50 : 20,
                2,
                2,
                0,
              ],
            },
            {
              width: '*',
              columns: [
                { text: '', width: 'auto', margin: [0, 2, 2, 0] },
                {
                  width: '*',
                  canvas: [
                    {
                      type: 'line',
                      x1: 0,
                      y1: 0,
                      x2: 120,
                      y2: 0,
                      lineWidth: 0.8,
                      dash: { length: 2, space: 2 },
                    },
                  ],
                  margin: [0, 13, 0, 0],
                },
              ],
              columnGap: 1,
            },
          ],
        },
      ],
    });

    const titles = opts.signatures3?.titles ?? [
      'Prepared By',
      'Checked By',
      'Approved By',
    ];

    const docDefinition: any = {
      pageSize: opts.pdf?.format ?? 'A4',
      pageOrientation:
        (opts.pdf?.orientation ?? 'p') === 'l' ? 'landscape' : 'portrait',
      pageMargins: [20, 120, 20, 50], // leave room for header/footer
      defaultStyle: { font: opts.pdf?.font ?? 'Battambang', fontSize: 9 },

      // ===== Repeating header on every page =====
      header: () => ({
        margin: [20, 30, 30, 10],
        columns: [
          // Logo left
          opts.logoBase64
            ? {
                image: opts.logoBase64,
                width: opts.logoWidth ?? 60,
                height: opts.logoHeight ?? 60,
                margin: [0, 0, 10, 0],
              }
            : { text: '', width: opts.logoWidth ?? 50 },

          // Centered title/date/subtitle
          {
            width: '*',
            stack: [
              {
                text: opts.title,
                bold: true,
                alignment: 'center',
                fontSize: 18,
                margin: [0, 0, 0, 2],
              },
              {
                text: dateStr,
                alignment: 'center',
                fontSize: 11,
                margin: [0, 0, 0, 1],
              },
              opts.subtitle
                ? {
                    text: String(opts.subtitle),
                    alignment: 'center',
                    fontSize: 10,
                  }
                : { text: '' },
            ],
          },

          // Symmetric spacer (same width as logo)
          { text: '', width: opts.logoWidth ?? 50 },
        ],
      }),

      // ===== Repeating footer =====
      footer: (currentPage: number, pageCount: number) => ({
        margin: [20, 0, 20, 10],
        columns: [
          {
            width: '*',
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'center',
            fontSize: 9,
          },
        ],
      }),

      content: [
        {
          table: {
            headerRows: 1,
            widths, // your calculated widths for the data table
            body,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? headFill : rowIndex % 2 ? '#f5f5f5' : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
          },
          margin: [0, 10, 0, 0],
        },

        // Signatures row: equal-width blocks, lines auto-fit
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                signBlock(titles[0]),
                signBlock(titles[1]),
                signBlock(titles[2]),
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 15, 0, 0],
        },
      ],

      styles: {
        // if you ever want Latin-only: { font: 'TimesNewRoman' }
      },
    };

    // Generate + download
    pdfMake.createPdf(docDefinition).download(filename);
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
