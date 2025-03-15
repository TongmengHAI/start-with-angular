import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { SnackbarTriggerComponent } from '../shared/components/snackbar/snackbar.component';
import { SharedModule } from '../shared/shared.module';
import { SkeletonComponent } from '../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-layout23',
  imports: [RouterModule, RouterOutlet, SharedModule, SkeletonComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  currentRoute: string = '';

  constructor(
    private router: Router // public snackbar: SnackbarTriggerComponent
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url; // Get current URL
    });
  }
  public loading = true;

  private time = 2;

  ngOnInit() {
    setTimeout(() => {
      this.loading = !this.loading;
    }, 1000 * this.time);
  }
}
