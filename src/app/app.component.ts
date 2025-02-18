import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { VisiterDashboardComponent } from './visiter-dashboard/visiter-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LayoutComponent, VisiterDashboardComponent], // Import RouterModule
  templateUrl: './app.component.html', // Load layout
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // userPermission = 'admin';
  userPermission = 'user';


}

