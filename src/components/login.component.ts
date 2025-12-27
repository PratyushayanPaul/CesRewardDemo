import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-100">
      <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-800">CES Portal</h1>
          <p class="text-slate-500 mt-2">Reward Redemption System</p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700">Username</label>
            <input 
              type="text" 
              [(ngModel)]="username" 
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              (keyup.enter)="onLogin()"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          @if (error()) {
            <div class="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200">
              {{ error() }}
            </div>
          }

          <button 
            (click)="onLogin()" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition">
            Sign In
          </button>
          
          <div class="text-xs text-center text-gray-400 mt-4">
            Default Creds: <strong>admin/admin</strong> or <strong>user/user</strong>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  
  dataService = inject(DataService);
  router = inject(Router);

  onLogin() {
    if (this.dataService.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Invalid credentials.');
    }
  }
}