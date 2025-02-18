import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { UserComponent } from './user/user.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
  {
    path: '',
    // component: LayoutComponent, // This is the main layout
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductComponent },
      { path: 'users', component: UserComponent },
      { path: 'test', component: TestComponent },
      { path: '**', component: NotFoundComponent },
    ],
  },
];
