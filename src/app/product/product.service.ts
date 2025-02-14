import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}`; // Product API URL from environment

  constructor() {}

  async getProducts(): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(this.apiUrl + '/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(id: number): Promise<any> {
    try {
      const response = await axios.get<any>(
        `${this.apiUrl + '/products'}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching Products ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl + '/products'}/${productId}`);
      console.log(`Product with ID ${productId} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting user with ID ${productId}:`, error);
      throw error;
    }
  }
}
