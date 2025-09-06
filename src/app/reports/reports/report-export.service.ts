import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// jsPDF + AutoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ExcelJS
import ExcelJS from 'exceljs';

import {
  BATTAMBANG_BOLD_BASE64,
  BATTAMBANG_BASE64,
  BATTAMBANG_THIN_BASE64,
} from '../../../assets/fonts/fonts';

export type ColumnDef<T = any> = {
  key: keyof T | string;
  header: string;
  width?: number; // for Excel
  align?: 'left' | 'center' | 'right';
};

export type ReportOptions = {
  title: string;
  subtitle?: string;
  filename?: string; // no extension
  logoBase64?: string; // data:image/png;base64,....
  DateAt?: Date; // default now
  pdf?: {
    orientation?: 'p' | 'l';
    unit?: 'mm' | 'pt' | 'cm' | 'in';
    format?: string | number[]; // e.g. 'a4'
    font?: string; // e.g. 'Times' / custom
    headFillColor?: [number, number, number]; // RGB
  };
  excel?: {
    sheetName?: string;
    headerFill?: string; // e.g. 'FFEEF1FF'
    headerFontColor?: string; // e.g. 'FF000000'
    borderColor?: string; // e.g. 'FFBFBFBF'
  };
  signatures?: {
    titles?: [string, string, string]; // default: ["Prepared By","Checked By","Approved By"]
    names?: [string?, string?, string?]; // optional preset names under the lines
    positions?: [string?, string?, string?]; // optional preset positions
    showDate?: boolean; // default: true (adds "Date : ______")
  };
};

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  // =========================================[ API ] =========================================
  async exportPdf<T>(rows: T[], cols: ColumnDef<T>[], opts: ReportOptions) {
    const now = opts.DateAt ?? new Date();
    const filename = (opts.filename ?? this.slugify(opts.title)) + '.pdf';

    const doc = new jsPDF({
      orientation: opts.pdf?.orientation ?? 'p',
      unit: opts.pdf?.unit ?? 'mm',
      format: opts.pdf?.format ?? 'a4',
      compress: true,
    });

    // (Optional) register Khmer font
    try {
      (doc as any).addFileToVFS(
        'Battambang-Bold.ttf',
        BATTAMBANG_BOLD_BASE64.split(',')[1]
      );
      (doc as any).addFileToVFS(
        'Battambang-Regular.ttf',
        BATTAMBANG_BASE64.split(',')[1]
      );
      (doc as any).addFileToVFS(
        'Battambang-Thin.ttf',
        BATTAMBANG_BASE64.split(',')[1]
      );
      (doc as any).addFont('Battambang-Bold.ttf', 'battambang', 'bold');
      (doc as any).addFont('Battambang-Regular.ttf', 'battambang', 'normal');
      (doc as any).addFont('Battambang-Thin.ttf', 'battambang', 'thin');
    } catch {}

    // Header: Logo + Title + Date
    let cursorY = 12;
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    if (opts.logoBase64) {
      // draw logo at left, height ~ 14
      doc.addImage(opts.logoBase64, 'PNG', 10, 5, 28, 28);

      // Title centered
      doc.setFont(opts.pdf?.font ?? 'Times', 'bold');
      doc.setFontSize(24);
      doc.text(opts.title, centerX, 16, { align: 'center' });

      // Date centered below
      doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
      doc.setFontSize(14);
      doc.text(`Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`, centerX, 22, {
        align: 'center',
      });

      if (opts.subtitle) {
        doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
        doc.setFontSize(11);
        doc.text(opts.subtitle, centerX, 28, { align: 'center' });
      }

      cursorY = 34;
    } else {
      // Title centered
      doc.setFont(opts.pdf?.font ?? 'Times', 'bold');
      doc.setFontSize(14);
      doc.text(opts.title, centerX, cursorY, { align: 'center' });
      cursorY += 6;

      // Date centered
      doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
      doc.setFontSize(14);
      doc.text(
        `Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`,
        centerX,
        cursorY,
        {
          align: 'center',
        }
      );

      if (opts.subtitle) {
        cursorY += 6;
        doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
        doc.setFontSize(11);
        doc.text(opts.subtitle, centerX, cursorY, { align: 'center' });
      }

      cursorY += 6;
    }

    // Table data
    type AutoTableRow = (string | number | boolean | null | undefined)[];
    const head: AutoTableRow[] = [cols.map((c) => c.header)];
    const body: AutoTableRow[] = rows.map((r) =>
      cols.map((c) => this.cellValue(r, c.key))
    );

    autoTable(doc, {
      startY: cursorY,
      head,
      body,
      styles: {
        font: opts.pdf?.font ?? 'Times',
        fontSize: 11,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: opts.pdf?.headFillColor ?? [230, 236, 255],
        textColor: 20,
        halign: 'left',
      },
      didParseCell: (data: any) => {
        // per-column alignment
        if (data.section === 'body' || data.section === 'head') {
          const idx = data.column.index;
          const align = cols[idx]?.align ?? 'left';
          data.cell.styles.halign = align;
        }
      },
      margin: { left: 10, right: 10, top: 35 },

      didDrawPage: (data: any) => {
        // ===== HEADER =====
        if (opts.logoBase64) {
          doc.addImage(opts.logoBase64, 'PNG', 10, 5, 28, 28);
        }

        doc.setFont(opts.pdf?.font ?? 'Times', 'bold');
        doc.setFontSize(24);
        doc.text(opts.title, centerX, 16, { align: 'center' });

        doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
        doc.setFontSize(14);
        doc.text(
          `Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`,
          centerX,
          22,
          {
            align: 'center',
          }
        );

        if (opts.subtitle) {
          doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
          doc.setFontSize(11);
          doc.text(opts.subtitle, centerX, 28, { align: 'center' });
        }

        // ===== FOOTER =====
        const pageHeight = doc.internal.pageSize.getHeight();
        const page = (doc as any).getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Page ${page}`, pageWidth - 10, pageHeight - 6, {
          align: 'right',
        });
      },
    });

    // === Signatures (PDF, 3 blocks) ===
    const lt = (doc as any).lastAutoTable;
    let y = (lt?.finalY ?? 0) + 12;

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const marginL = 20;
    const marginR = 20;
    const gap = 20; // space between blocks

    const titles = opts.signatures?.titles ?? [
      'Prepared By',
      'Checked By',
      'Approved By',
    ];
    const presetNames = opts.signatures?.names ?? ['', '', ''];
    const presetPositions = opts.signatures?.positions ?? ['', '', ''];
    const showDate = opts.signatures?.showDate ?? true;

    const usableW = pageW - marginL - marginR;
    const blockW = (usableW - 2 * gap) / 3;
    const blockH = 50; // estimated height needed

    // page break if needed
    if (y + blockH + 10 > pageH) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont(opts.pdf?.font ?? 'Times', 'bold');

    // helper to draw one block at x
    const drawBlock = (x: number, idx: number) => {
      const title = titles[idx];
      const namePreset = presetNames[idx] || '';
      const posPreset = presetPositions[idx] || '';

      // Title (bold + center)
      doc.setFont(opts.pdf?.font ?? 'Times', 'bold');
      doc.text(title, x + blockW / 2, y, { align: 'center' });

      // lines and labels
      // doc.setFont(opts.pdf?.font ?? 'Times', 'normal');
      const row1Y = y + 25;
      const row2Y = y + 30;
      const row3Y = y + 35;

      const label1 = 'Name :';
      const label2 = 'Position :';
      const label3 = 'Date :';

      const pad = 2; // small padding after label before the line
      const tw1 = doc.getTextWidth(label1) + pad;
      const tw2 = doc.getTextWidth(label2) + pad;
      const tw3 = doc.getTextWidth(label3) + pad;

      (doc as any).setLineDash([0.5, 1], 0); // dotted

      // Name
      doc.text(label1, x, row1Y);
      doc.line(x + tw1, row1Y, x + blockW - 2, row1Y);
      if (namePreset) doc.text(namePreset, x + tw1 + 1, row1Y - 0.5);

      // Position
      doc.text(label2, x, row2Y);
      doc.line(x + tw2, row2Y, x + blockW - 2, row2Y);
      if (posPreset) doc.text(posPreset, x + tw2 + 1, row2Y - 0.5);

      // Date
      if (showDate) {
        doc.text(label3, x, row3Y);
        doc.line(x + tw3, row3Y, x + blockW - 2, row3Y);
      }
      (doc as any).setLineDash([], 0); // reset to solid after signatures
    };

    // draw 3 blocks
    const x1 = marginL;
    const x2 = marginL + blockW + gap;
    const x3 = marginL + 2 * (blockW + gap);
    drawBlock(x1, 0);
    drawBlock(x2, 1);
    drawBlock(x3, 2);

    doc.save(filename);
  }

  // =========================================[ Excel ] =========================================
  async exportExcel<T>(rows: T[], cols: ColumnDef<T>[], opts: ReportOptions) {
    const now = opts.DateAt ?? new Date();
    const filename = (opts.filename ?? this.slugify(opts.title)) + '.xlsx';

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(opts.excel?.sheetName ?? 'Report', {
      properties: { defaultRowHeight: 18 },
    });

    // Logo (if provided)
    let titleRowIdx = 1;
    let tableStartRow = 4; // default if logo present
    if (opts.logoBase64) {
      const imgId = workbook.addImage({
        base64: opts.logoBase64,
        extension: 'png',
      });
      // place at A1 with a reasonable size
      sheet.addImage(imgId, {
        tl: { col: 0, row: 0 },
        ext: { width: 90, height: 60 },
      });
    } else {
      tableStartRow = 3;
    }

    // Title + Date
    const titleCellsToMerge = {
      from: 'A' + titleRowIdx,
      to: this.colLetter(cols.length) + titleRowIdx,
    };
    sheet.mergeCells(`${titleCellsToMerge.from}:${titleCellsToMerge.to}`);
    const titleCell = sheet.getCell(titleCellsToMerge.from);
    titleCell.value = opts.title;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const dateRowIdx = titleRowIdx + 1;
    const dateMerge = {
      from: 'A' + dateRowIdx,
      to: this.colLetter(cols.length) + dateRowIdx,
    };
    sheet.mergeCells(`${dateMerge.from}:${dateMerge.to}`);
    const dateCell = sheet.getCell(dateMerge.from);
    // dateCell.value = `Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`;
    dateCell.value = `Date: ${dayjs(now)}`;
    dateCell.font = { size: 10 };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    if (opts.subtitle) {
      const subRowIdx = dateRowIdx + 1;
      const subMerge = {
        from: 'A' + subRowIdx,
        to: this.colLetter(cols.length) + subRowIdx,
      };
      sheet.mergeCells(`${subMerge.from}:${subMerge.to}`);
      const subCell = sheet.getCell(subMerge.from);
      subCell.value = opts.subtitle;
      subCell.font = { size: 10 };
      subCell.alignment = { vertical: 'middle', horizontal: 'center' };
      tableStartRow = Math.max(tableStartRow, subRowIdx + 1);
    }

    // Header row
    const headerRow = sheet.getRow(tableStartRow);
    headerRow.values = cols.map((c) => c.header);
    headerRow.font = {
      bold: true,
      color: { argb: opts.excel?.headerFontColor ?? 'FF000000' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
    headerRow.height = 20;

    // Header style fill + border
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: opts.excel?.headerFill ?? 'FFE6ECFF' },
      };
      cell.border = {
        top: {
          style: 'thin',
          color: { argb: opts.excel?.borderColor ?? 'FFBFBFBF' },
        },
        left: {
          style: 'thin',
          color: { argb: opts.excel?.borderColor ?? 'FFBFBFBF' },
        },
        bottom: {
          style: 'thin',
          color: { argb: opts.excel?.borderColor ?? 'FFBFBFBF' },
        },
        right: {
          style: 'thin',
          color: { argb: opts.excel?.borderColor ?? 'FFBFBFBF' },
        },
      };
    });

    // Data rows
    rows.forEach((r, i) => {
      const row = sheet.getRow(tableStartRow + 1 + i);
      row.values = cols.map((c) => this.cellValue(r, c.key));
      row.alignment = { vertical: 'middle' };
      row.eachCell((cell, colNum) => {
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: opts.excel?.borderColor ?? ' ' },
          },
          left: {
            style: 'thin',
            color: { argb: opts.excel?.borderColor ?? 'FFDFDFDF' },
          },
          bottom: {
            style: 'thin',
            color: { argb: opts.excel?.borderColor ?? 'FFDFDFDF' },
          },
          right: {
            style: 'thin',
            color: { argb: opts.excel?.borderColor ?? 'FFDFDFDF' },
          },
        };
        const align = cols[colNum - 1]?.align ?? 'left';
        cell.alignment = { ...cell.alignment, horizontal: align };
      });
    });

    // Column widths
    cols.forEach((c, idx) => {
      sheet.getColumn(idx + 1).width =
        c.width ?? Math.max(12, (c.header?.length ?? 10) + 2);
    });

    // Freeze header
    sheet.views = [{ state: 'frozen', ySplit: tableStartRow }];
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), filename);
  }

  // =========================================[ CSV ] =========================================
  async exportCsv<T>(rows: T[], cols: ColumnDef<T>[], opts: ReportOptions) {
    const filename = (opts.filename ?? this.slugify(opts.title)) + '.csv';
    // Simple CSV writer (UTF-8 BOM so Excel opens Khmer/Unicode properly)
    const BOM = '\uFEFF';
    const header = cols.map((c) => this.csvEscape(c.header)).join(',');
    const lines = rows.map((r) =>
      cols.map((c) => this.csvEscape(this.cellValue(r, c.key))).join(',')
    );
    const csv = [header, ...lines].join('\r\n');
    saveAs(new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' }), filename);
  }

  // ---------- UTILITIES ----------
  private cellValue(row: any, key: string | number | symbol): string {
    const v = (row as any)?.[key as any];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }

  private csvEscape(v: any): string {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  private slugify(s: string) {
    return (s || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private colLetter(n: number): string {
    // 1 -> A, 2 -> B ... 27 -> AA
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
}
