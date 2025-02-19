// services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(user: User) {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null); // Clear user

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user); // Emit new user
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null); // Clear user
  }

  getUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user ? user.permissions.includes(permission) : false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((perm) => this.hasPermission(perm));
  }
}
