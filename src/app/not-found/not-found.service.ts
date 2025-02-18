import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class NotFoundService {
  private apiUrl ="http://127.0.0.1:8081";

  constructor() {}

  async getMessage(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(this.apiUrl + '/api/notFound');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}
