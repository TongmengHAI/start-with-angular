import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { SnackbarTriggerComponent } from '../shared/components/snackbar/snackbar.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-layout23',
  imports: [RouterModule, RouterOutlet, SharedModule, SnackbarTriggerComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  currentRoute: string = '';

  constructor(
    private router: Router,
    public snackbar: SnackbarTriggerComponent
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url; // Get current URL
    });
  }

}
