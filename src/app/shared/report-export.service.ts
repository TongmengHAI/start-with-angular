import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// jsPDF + AutoTable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ExcelJS
import ExcelJS from 'exceljs';

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
    font?: string; // e.g. 'helvetica' / custom
    headFillColor?: [number, number, number]; // RGB
  };
  excel?: {
    sheetName?: string;
    headerFill?: string; // e.g. 'FFEEF1FF'
    headerFontColor?: string; // e.g. 'FF000000'
    borderColor?: string; // e.g. 'FFBFBFBF'
  };
  signatures?: {
    leftTitle?: string; // default: "Prepared by"
    rightTitle?: string; // default: "Approved by"
    leftName?: string; // optional preset name
    rightName?: string; // optional preset name
    showDate?: boolean; // default: true
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
    // try {
    //   (doc as any).addFileToVFS(KHMER_TTF_NAME, KHMER_TTF_BASE64.split(',')[1]);
    //   (doc as any).addFont(KHMER_TTF_NAME, KHMER_FONT_FAMILY, 'normal');
    //   doc.setFont(KHMER_FONT_FAMILY);
    // } catch {}

    const pageWidth = doc.internal.pageSize.getWidth();

    // Header: Logo + Title + Date
    let cursorY = 12;
    if (opts.logoBase64) {
      // draw logo at left, height ~ 14
      doc.addImage(opts.logoBase64, 'PNG', 10, 10, 18, 18);
      // title to the right
      doc.setFont(opts.pdf?.font ?? 'helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(opts.title, 32, 16);
      doc.setFont(opts.pdf?.font ?? 'helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`, 32, 22);
      if (opts.subtitle) doc.text(opts.subtitle, 32, 28);
      cursorY = 34;
    } else {
      doc.setFont(opts.pdf?.font ?? 'helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(opts.title, 10, cursorY);
      cursorY += 6;
      doc.setFont(opts.pdf?.font ?? 'helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`, 10, cursorY);
      if (opts.subtitle) {
        cursorY += 6;
        doc.text(opts.subtitle, 10, cursorY);
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
        font: opts.pdf?.font ?? 'helvetica',
        fontSize: 9,
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
      margin: { left: 10, right: 10 },
      // Footer with page numbers
      didDrawPage: (data: any) => {
        const page = doc.getNumberOfPages();
        const str = `Page ${page}`;
        doc.setFontSize(9);
        doc.text(str, pageWidth - 10, doc.internal.pageSize.getHeight() - 6, {
          align: 'right',
        });
      },
    });

    // --- Signatures (PDF) ---
    const lt = (doc as any).lastAutoTable; // provided by jspdf-autotable
    const afterTableY = (lt?.finalY ?? 0) + 12;

    const marginL = 10;
    const marginR = 10;
    const gap = 40;
    const pageH = doc.internal.pageSize.getHeight();
    const leftTitle = opts.signatures?.leftTitle ?? 'Prepared by';
    const rightTitle = opts.signatures?.rightTitle ?? 'Approved by';
    const leftName = opts.signatures?.leftName ?? '';
    const rightName = opts.signatures?.rightName ?? '';
    const showDate = opts.signatures?.showDate ?? true;

    // compute blocks
    const pageW = doc.internal.pageSize.getWidth();
    const usableW = pageW - marginL - marginR;
    const blockW = (usableW - gap) / 2;
    const blockH = 10; // height area to ensure line + labels fit
    let y = afterTableY;

    // page break if too close to bottom
    if (y + blockH + 10 > pageH) {
      doc.addPage();
      y = 20;
    }

    // left block
    const leftX = marginL;
    doc.setFontSize(10);
    doc.setFont(opts.pdf?.font ?? 'helvetica', 'normal');
    doc.text(leftTitle, leftX, y);
    doc.line(leftX, y + 13, leftX + blockW, y + 13); // signature line
    if (leftName) doc.text(leftName, leftX, y + 10);
    if (showDate) doc.text('Date: __________________', leftX, y + 25);

    // right block
    const rightX = marginL + blockW + gap;
    doc.text(rightTitle, rightX, y);
    doc.line(rightX, y + 13, rightX + blockW, y + 13); // signature line
    if (rightName) doc.text(rightName, rightX, y + 10);
    if (showDate) doc.text('Date: __________________', rightX, y + 25);

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
    dateCell.value = `Date: ${dayjs(now).format('YYYY-MM-DD HH:mm')}`;
    dateCell.font = { size: 10 };
    dateCell.alignment = { vertical: 'middle', horizontal: 'right' };

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
      subCell.alignment = { vertical: 'middle', horizontal: 'right' };
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

    // --- Signatures (Excel) ---
    const leftTitle = opts.signatures?.leftTitle ?? 'Prepared by';
    const rightTitle = opts.signatures?.rightTitle ?? 'Approved by';
    const leftName = opts.signatures?.leftName ?? '';
    const rightName = opts.signatures?.rightName ?? '';
    const showDate = opts.signatures?.showDate ?? true;

    // figure out last data row
    const dataStart = tableStartRow + 1; // first row after header
    const dataEndRow = dataStart + rows.length - 1;
    let sigRow = (rows.length ? dataEndRow : tableStartRow) + 2; // one blank row

    // split columns into two halves
    const totalCols = cols.length;
    const mid = Math.floor(totalCols / 2) || 1;

    // Ranges: A..mid  |  (mid+1)..totalCols
    const leftFrom = 'A' + sigRow;
    const leftTo = this.colLetter(mid) + sigRow;
    const leftLineRow = sigRow + 2;

    const rightFrom = this.colLetter(mid + 1) + sigRow;
    const rightTo = this.colLetter(totalCols) + sigRow;
    const rightLineRow = sigRow + 2;

    // Titles row
    sheet.mergeCells(`${leftFrom}:${leftTo}`);
    sheet.mergeCells(`${rightFrom}:${rightTo}`);
    sheet.getCell(leftFrom).value = leftTitle;
    sheet.getCell(rightFrom).value = rightTitle;

    sheet.getCell(leftFrom).alignment = {
      vertical: 'middle',
      horizontal: 'left',
    };
    sheet.getCell(rightFrom).alignment = {
      vertical: 'middle',
      horizontal: 'left',
    };
    sheet.getCell(leftFrom).font = { bold: true };
    sheet.getCell(rightFrom).font = { bold: true };

    // blank spacer row (sigRow+1)
    sigRow += 1;

    // "signature line" row (bottom border on merged ranges)
    const leftLineFrom = 'A' + (sigRow + 1);
    const leftLineTo = this.colLetter(mid) + (sigRow + 1);
    const rightLineFrom = this.colLetter(mid + 1) + (sigRow + 1);
    const rightLineTo = this.colLetter(totalCols) + (sigRow + 1);

    sheet.mergeCells(`${leftLineFrom}:${leftLineTo}`);
    sheet.mergeCells(`${rightLineFrom}:${rightLineTo}`);

    const lineColor = opts.excel?.borderColor ?? 'FFBFBFBF';
    sheet.getCell(leftLineFrom).border = {
      bottom: { style: 'thin', color: { argb: lineColor } },
    };
    sheet.getCell(rightLineFrom).border = {
      bottom: { style: 'thin', color: { argb: lineColor } },
    };

    // optional names directly under the line
    if (leftName) {
      const c = sheet.getCell('A' + (sigRow + 2));
      sheet.mergeCells(`A${sigRow + 2}:${this.colLetter(mid)}${sigRow + 2}`);
      c.value = leftName;
      c.alignment = { vertical: 'middle', horizontal: 'left' };
    }
    if (rightName) {
      const c = sheet.getCell(this.colLetter(mid + 1) + (sigRow + 2));
      sheet.mergeCells(
        `${this.colLetter(mid + 1)}${sigRow + 2}:${this.colLetter(totalCols)}${
          sigRow + 2
        }`
      );
      c.value = rightName;
      c.alignment = { vertical: 'middle', horizontal: 'left' };
    }

    // dates
    if (showDate) {
      const dateText = 'Date: __________________';
      const leftDateCell = sheet.getCell('A' + (sigRow + 3));
      sheet.mergeCells(`A${sigRow + 3}:${this.colLetter(mid)}${sigRow + 3}`);
      leftDateCell.value = dateText;
      leftDateCell.alignment = { vertical: 'middle', horizontal: 'left' };

      const rightDateCell = sheet.getCell(
        this.colLetter(mid + 1) + (sigRow + 3)
      );
      sheet.mergeCells(
        `${this.colLetter(mid + 1)}${sigRow + 3}:${this.colLetter(totalCols)}${
          sigRow + 3
        }`
      );
      rightDateCell.value = dateText;
      rightDateCell.alignment = { vertical: 'middle', horizontal: 'left' };
    }

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
