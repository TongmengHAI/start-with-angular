import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private baseUrl = 'http://localhost:8081/api/location';

  constructor(private http: HttpClient) {}

  searchLocation(query: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search`, { params: { query } });
  }

  getProvinces(): Observable<any> {
    return this.http.get(`${this.baseUrl}/provinces`);
  }
}
