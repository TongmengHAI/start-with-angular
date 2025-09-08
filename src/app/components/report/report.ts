import { Component } from '@angular/core';
import { ReportService } from './report-service';
type Row = { id: number; name: string; amount: number; date: string };

@Component({
  selector: 'app-report',
  template: `
    <div class="btns">
      <button (click)="pdf()">Download PDF</button>
      <button (click)="xlsx()">Download Excel</button>
      <button (click)="csv()">Download CSV</button>
    </div>
  `,
  styles: [
    `
      .btns {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ReportComponent {
  constructor(private reportService: ReportService) {}

  // sample data
  rows = [
    { col1: 'Value 1', col2: 'Value 2', col3: 'Value 3' },
    { col1: 'Value 4', col2: 'Value 5', col3: 'Value 6' },
    { col1: 'Value 7', col2: 'Value 8', col3: 'Value 9' },
    { col1: 'Value 10', col2: 'Value 11', col3: 'Value 12' },
  ];
  // Column definitions
  pdfCols = [
    { key: 'id', header: 'លេខរៀង', undefined, align: 'center' },
    { key: 'name', header: 'ឈ្មោះ', width: 100, align: 'left' },
    {
      key: 'amount',
      header: 'ចំនួនទឹកប្រាក់',
      width: undefined,
      align: 'right',
    },
    { key: 'date', header: 'កាលបរិច្ឆេទ', undefined, align: 'center' },
  ];

  // Sample row data

  pdfRows: Row[] = Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const kh = 'សុវណ្ណ';
    const name = `${kh} User ${id}`;
    const amount = Math.round(Math.random() * 5000 * 100) / 100; // 0–5000, 2 decimals
    const date = new Date(2025, 0, 1 + i).toISOString().slice(0, 10); // 100 sequential days from Jan 1, 2025
    return { id, name, amount, date };
  });

  logoBase64 =
    'data:image/jpeg;base64,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'; // put your base64 logo here
  // '';

  async pdf() {
    await this.reportService.exportPdfWithPdfmake(this.pdfRows, this.pdfCols, {
      title: 'Sales Report',
      subtitle: 'Branch: Phnom Penh',
      logoBase64: this.logoBase64,
      logoHeight: 80,
      logoWidth: 80,
      pdf: { orientation: 'l', format: 'A4' }, // p for portrait, and l for landscape
      signatures3: {
        titles: ['Prepared By', 'Checked By', 'Approved By'],
      },
    });
  }
  xlsx() {
    this.reportService.downloadExcelLightLayout(
      'Title',
      new Date().toLocaleDateString(),
      this.rows,
      ['col1', 'col2', 'col3']
    );
  }
  csv() {
    this.reportService.downloadCsvLightLayout(
      'Title',
      new Date().toLocaleDateString(),
      this.rows,
      ['col1', 'col2', 'col3']
    );
  }
}
