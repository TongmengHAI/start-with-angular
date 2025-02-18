import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { SharedModule } from '../shared/shared.module'; // I

@Component({
  selector: 'app-product',
  imports: [SharedModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  products: any[] = [];
  loading = true;
  error = '';

  constructor(private productServiceApi: ProductService) {}

  async ngOnInit() {
    try {
      this.products = await this.productServiceApi.getProducts();
    } catch (err) {
      this.error = 'Failed to load products!';
    } finally {
      this.loading = false;
    }
  }

  async removeProduct(productId: number) {
    try {
      await this.productServiceApi.deleteProduct(productId);
      this.products = this.products.filter((item) => item.id !== productId); // Update UI
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }
}
