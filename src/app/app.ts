import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReportComponent } from './components/report/report';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReportComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-jsreport');
}
