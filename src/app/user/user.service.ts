import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root', // Makes the service available globally
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`; // Use API URL from environment

  constructor() {}

  async getUsers(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(this.apiUrl + '/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<any> {
    try {
      const response = await axios.get<any>(`${this.apiUrl + '/users'}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }
}
