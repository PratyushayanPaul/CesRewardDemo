import { Component, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div class="text-sm text-gray-500">System Status: <span class="text-green-600 font-semibold">Active</span></div>
      </div>

      @if (currentUser()?.role !== 'ADMIN') {
        <div class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Access Denied. You need Administrator privileges to view this area.
        </div>
      } @else {
        
        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button (click)="activeTab.set('users')" [class]="getTabClass('users')">
              CES Agents
            </button>
            <button (click)="activeTab.set('inventory')" [class]="getTabClass('inventory')">
              Reward Inventory
            </button>
            <button (click)="activeTab.set('orders')" [class]="getTabClass('orders')">
              Order History
            </button>
          </nav>
        </div>

        <!-- USERS TAB -->
        @if (activeTab() === 'users') {
          <div class="space-y-6 animate-fade-in">
            <div class="bg-white shadow sm:rounded-lg p-6 border border-gray-100">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Agent</h3>
              <div class="flex flex-col sm:flex-row gap-4 items-end">
                <div class="flex-1 w-full">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Username</label>
                  <input [(ngModel)]="newUser" type="text" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" placeholder="jdoe">
                </div>
                <div class="flex-1 w-full">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Password</label>
                  <input [(ngModel)]="newPassword" type="text" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border" placeholder="secret">
                </div>
                <div class="flex-1 w-full">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                  <select [(ngModel)]="newRole" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border bg-white">
                    <option value="USER">Standard User</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <button (click)="addUser()" class="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition-colors font-medium">Add User</button>
              </div>
            </div>

            <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              <ul class="divide-y divide-gray-200">
                @for (user of users(); track user.id) {
                  <li class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div class="flex items-center">
                      <div class="bg-indigo-100 rounded-full p-2 mr-4 text-indigo-600">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ user.username }}</p>
                        <p class="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1">{{ user.role }}</p>
                      </div>
                    </div>
                    <div>
                      @if (user.id !== currentUser()?.id) {
                        <button (click)="deleteUser(user.id)" class="text-red-600 hover:text-red-900 text-sm font-medium hover:underline">Revoke Access</button>
                      } @else {
                        <span class="text-gray-400 text-sm italic">Current Session</span>
                      }
                    </div>
                  </li>
                }
              </ul>
            </div>
          </div>
        }

        <!-- INVENTORY TAB -->
        @if (activeTab() === 'inventory') {
          <div class="space-y-6 animate-fade-in">
            <div class="bg-white shadow sm:rounded-lg p-6 border border-gray-100">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add Reward Item</h3>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="md:col-span-1">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Item Name</label>
                  <input [(ngModel)]="newItemName" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm focus:ring-green-500 focus:border-green-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <input [(ngModel)]="newItemCategory" placeholder="e.g. Travel" type="text" class="block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm focus:ring-green-500 focus:border-green-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Points Cost</label>
                  <input [(ngModel)]="newItemCost" type="number" class="block w-full rounded-md border border-gray-300 px-3 py-2 sm:text-sm focus:ring-green-500 focus:border-green-500">
                </div>
                <button (click)="addReward()" class="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition-colors font-medium h-[38px]">
                  + Add Item
                </button>
              </div>
            </div>

            <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (item of rewards(); track item.id) {
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ item.category }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.cost | number }} pts</td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button (click)="deleteReward(item.id)" class="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="px-6 py-10 text-center text-gray-500 italic">No rewards defined. Add one above.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ORDERS TAB -->
        @if (activeTab() === 'orders') {
          <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200 animate-fade-in">
             @if (orders().length === 0) {
                <div class="p-12 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                  <p class="mt-1 text-sm text-gray-500">Redemption orders will appear here once customers checkout.</p>
                </div>
             } @else {
               <table class="min-w-full divide-y divide-gray-200">
                 <thead class="bg-gray-50">
                   <tr>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                     <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                     <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                   </tr>
                 </thead>
                 <tbody class="bg-white divide-y divide-gray-200">
                   @for (order of orders(); track order.id) {
                     <tr class="hover:bg-gray-50 transition-colors">
                       <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">#{{ order.id }}</td>
                       <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.date | date:'MMM d, h:mm a' }}</td>
                       <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.customerName }}</td>
                       <td class="px-6 py-4 text-sm text-gray-500">
                          @if (order.items) {
                             <div class="flex flex-col gap-1">
                               @for (i of order.items; track i.item.id) {
                                 <span class="inline-flex items-center text-xs">
                                   <span class="font-bold mr-1">{{ i.quantity }}x</span> {{ i.item.name }}
                                 </span>
                               }
                             </div>
                          } @else {
                             <span class="text-xs text-gray-400 italic">{{ order.itemsSummary }}</span>
                          }
                       </td>
                       <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{{ order.totalCost | number }}</td>
                     </tr>
                   }
                 </tbody>
               </table>
             }
          </div>
        }
      }
    </div>
  `
})
export class AdminUsersComponent {
  dataService = inject(DataService);
  currentUser = this.dataService.currentUser;
  
  users = this.dataService.getCESUsers();
  rewards = this.dataService.getRewards();
  orders = this.dataService.getOrders();

  activeTab = signal<'users' | 'inventory' | 'orders'>('users');

  newUser = '';
  newPassword = '';
  newRole: 'ADMIN' | 'USER' = 'USER';
  newItemName = '';
  newItemCategory = '';
  newItemCost = 0;

  getTabClass(tabName: string): string {
    const baseClass = "whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200";
    return this.activeTab() === tabName
      ? `${baseClass} border-blue-500 text-blue-600`
      : `${baseClass} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  addUser() {
    if (this.newUser && this.newPassword) {
      this.dataService.addCESUser(this.newUser, this.newRole, this.newPassword);
      this.newUser = '';
      this.newPassword = '';
    }
  }

  deleteUser(id: string) {
    if(confirm('Delete this user?')) {
      try {
        this.dataService.deleteCESUser(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  }

  addReward() {
    if (this.newItemName && this.newItemCategory && this.newItemCost > 0) {
      this.dataService.addReward({
        name: this.newItemName,
        category: this.newItemCategory,
        cost: this.newItemCost
      });
      this.newItemName = '';
      this.newItemCategory = '';
      this.newItemCost = 0;
    }
  }

  deleteReward(id: string) {
    if (confirm('Delete this reward item?')) {
      this.dataService.deleteReward(id);
    }
  }
}