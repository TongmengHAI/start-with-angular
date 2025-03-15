import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductComponent } from './product/product.component';
import { UserComponent } from './user/user.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestComponent } from './test/test.component';
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { LoginComponent } from './auth/login/login.component';
import { CountryPickerComponent } from './location/callingCode.component';

export const routes: Routes = [
  {
    path: '',
    // component: LayoutComponent, // This is the main layout
    children: [
      { path: 'login', component: LoginComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { permission: ['dashboard'] },
      },
      {
        path: 'products',
        component: ProductComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'users',
        component: UserComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'test',
        component: CountryPickerComponent,
        // component: TestComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];
