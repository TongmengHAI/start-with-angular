import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { User } from '../user/user.model';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-dashboard',
  imports: [SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(private _authService: AuthService) {
    this._authService.currentUser$.subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
    console.log('Dashboard loaded');
  }
  loginAsAdmin() {
    const admin: User = {
      id: 1,
      username: 'admin',
      roles: ['admin'],
      permissions: ['edit-posts', 'delete-posts'],
    };
    this._authService.login(admin);
  }

  loginAsUser() {
    const user: User = {
      id: 2,
      username: 'user',
      roles: ['user'],
      permissions: ['edit-posts'],
    };
    this._authService.login(user);
  }

  logout() {
    this._authService.logout();
    window.location.reload();
  }
}
