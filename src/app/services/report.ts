import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:5488/api/report'; // jsreport URL

  constructor(private http: HttpClient) {}

  generateReport(templateName: string, data: any) {
    return this.http.post(
      this.apiUrl,
      // { template: { name: templateName }, data },
      { template: { shortid: templateName }, data },
      { responseType: 'blob' } // PDF or other binary
    );
  }
}
