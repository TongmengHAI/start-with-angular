import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotFoundService {
  private apiUrl = 'http://127.0.0.1:8081';

  constructor(private http: HttpClient) {}
 
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
