import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:8081/api/login'; // Spring Boot URL

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    // return this.http.post<any>(this.apiUrl, { username, password });

    const body = { username, password: password.toString() };

    console.log(body);
    return this.http.post<any>(this.apiUrl, body, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // async login (username: string, password: string): Promise<any> {
  //   try {
  //     const response = await axios.post<any>(this.apiUrl, { username, password });
  //     console.log(response);
  //     return response;
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //     throw error;
  //   }
  // }


}
