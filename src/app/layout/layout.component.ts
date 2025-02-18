import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-layout23',
  imports: [RouterModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url; // Get current URL
    });
  }
}
