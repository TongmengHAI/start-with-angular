import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, LayoutComponent, LoginComponent], // Import RouterModule
  templateUrl: './app.component.html', // Load layout
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public isLoggedIn = false;

  constructor(private authService: AuthService) {

  }

  ngOnInit(): void {

    this.isLoggedIn = false;

    if (this.authService.isAuthenticated()) {
      this.isLoggedIn = true;
    }
  }
}
