import { Component } from '@angular/core';
import { NotFoundService } from './not-found.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [TitleCasePipe],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  msg: any[] = [];
  loading = true;
  error = '';

  constructor(private notFoundService: NotFoundService) {}

  async ngOnInit() {
    try {
      this.msg = await this.notFoundService.getMessage();
    } catch (err) {
      this.error = 'Failed to load!';
    } finally {
      this.loading = false;
    }
  }

}
