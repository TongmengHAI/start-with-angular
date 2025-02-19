import { Component } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { User } from '../user/user.model';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-dashboard',
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  user: User | null = null;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe((user) => (this.user = user));
  }

  loginAsAdmin() {
    const admin: User = {
      id: 1,
      username: 'admin',
      roles: ['admin'],
      permissions: ['edit-posts', 'delete-posts'],
    };
    this.authService.login(admin);
  }

  loginAsUser() {
    const user: User = {
      id: 2,
      username: 'user',
      roles: ['user'],
      permissions: ['edit-posts'],
    };
    this.authService.login(user);
  }

  logout() {
    this.authService.logout();
  }
}
