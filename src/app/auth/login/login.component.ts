import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { LoginService } from './login.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../user/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public logInForm: FormGroup;
  public username: string = '';
  public password: string = '';
  public errorMessage: string = '';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private router: Router
  ) {
    this.logInForm = this._formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      roles: [['admin', 'editor']],
      permissions: [['edit-posts', 'delete-posts']],
      // permissions: [['edit-posts', 'delete-posts','dashboard']],
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  ngOnInit(): void {}

  showPassword = false;
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
    logout() {
      localStorage.removeItem('user');
      this.currentUserSubject.next(null); // Clear user
    }

  // async onSubmit() {
  //   try {
  //     const response = await this._loginService.login(
  //       this.username,
  //       this.password
  //     );
  //     console.log('Login successful:', response);
  //     this._router.navigate(['/dashboard']).then(() => {
  //       window.location.reload();
  //     });
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //     this.errorMessage = 'Invalid username or password';
  //   }
  // }

  onSubmit(): void {
    this.username = this.logInForm.get('username')?.value || '';
    this.password = this.logInForm.get('password')?.value || '';
    this._loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        // console.log('Login successful:', response);

        localStorage.removeItem('user');
        this.currentUserSubject.next(null); // Clear user

        localStorage.setItem('user', JSON.stringify(this.logInForm.value));
        this.currentUserSubject.next(this.logInForm.value); // Emit new us

        this._router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid username or password';
      },
    });
  }
}
