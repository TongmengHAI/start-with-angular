import { Component } from '@angular/core';
import { ReportService } from '../../services/report';
import { using } from 'rxjs';

@Component({
  selector: 'app-report',
  template: `<button (click)="downloadReport()">Download Report</button>`,
})
export class ReportComponent {
  constructor(private reportService: ReportService) {}

  downloadReport() {
    this.reportService
      // .generateReport('/samples/Invoice/invoice-main', null)
      .generateReport('rkJTnK2ce', null) // using shortId of Invoice template
      .generateReport('rkJTnK2ce', null) // using shortId of Sales template
      .generateReport('rkJTnK2ce', null) // using shortId of template
      .subscribe((res: Blob) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
