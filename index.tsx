import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './src/app.component';
import { LoginComponent } from './src/components/login.component';
import { DashboardComponent } from './src/components/dashboard.component';
import { CustomerListComponent } from './src/components/customer-list.component';
import { CustomerDetailComponent } from './src/components/customer-detail.component';
import { RewardsComponent } from './src/components/rewards.component';
import { CartComponent } from './src/components/cart.component';
import { AdminUsersComponent } from './src/components/admin-users.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'rewards', component: RewardsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'admin', component: AdminUsersComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient()
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.