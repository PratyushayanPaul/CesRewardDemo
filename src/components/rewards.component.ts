import { Component, inject, computed, signal, effect } from '@angular/core';
import { DataService, RewardItem } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-rewards',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Context Header -->
      <div class="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
        <div>
          @if (activeCustomer(); as c) {
            <h2 class="text-lg font-semibold text-indigo-900">
              Shopping for: <span class="underline">{{ c.name }}</span>
            </h2>
            <p class="text-sm text-indigo-700">
              Available Balance: <strong>{{ availablePoints() | number }} pts</strong>
            </p>
          } @else {
            <h2 class="text-lg font-semibold text-red-800">No Customer Selected</h2>
            <p class="text-sm text-red-600">Please go to the Customer list and select a customer to start redemption.</p>
          }
        </div>
        @if (activeCustomer()) {
          <a routerLink="/cart" class="relative bg-white p-2 rounded-full shadow hover:bg-gray-50 flex items-center gap-2 px-4 transition-colors">
             <span class="text-xl">🛒</span> 
             <div class="text-left">
               <span class="block text-xs text-gray-500 font-bold">VIEW CART</span>
               <span class="block text-sm font-bold text-gray-900">{{ cartCount() }} Items</span>
             </div>
          </a>
        }
      </div>

      @if (activeCustomer()) {
        <!-- Main Content Grid -->
        <div class="flex flex-col gap-8">
          
          <!-- Catalog -->
          <div class="w-full">
             <div class="flex items-center justify-between mb-4">
               <h3 class="text-xl font-bold text-gray-900">Reward Catalog</h3>
             </div>
             
             <!-- Categories -->
             <div class="flex space-x-2 mb-6 overflow-x-auto pb-2">
                <button 
                  (click)="selectedCategory.set('All')" 
                  [class]="selectedCategory() === 'All' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap">
                  All
                </button>
                @for (cat of categories(); track cat) {
                  <button 
                    (click)="selectedCategory.set(cat)"
                    [class]="selectedCategory() === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 rounded-full text-sm font-medium transition whitespace-nowrap">
                    {{ cat }}
                  </button>
                }
             </div>

             <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               @for (item of filteredItems(); track item.id) {
                 <div class="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                   <div class="h-32 bg-gray-100 flex items-center justify-center text-4xl text-gray-400 relative">
                     🎁
                     <div class="absolute top-2 right-2">
                        <span class="bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-bold px-2 py-1 rounded shadow-sm">{{ item.category }}</span>
                     </div>
                   </div>
                   <div class="p-4 flex-1 flex flex-col">
                     <div class="flex-1">
                       <h4 class="text-lg font-bold text-gray-900 leading-tight">{{ item.name }}</h4>
                       <p class="text-indigo-600 font-bold text-sm mt-2">{{ item.cost | number }} pts</p>
                     </div>
                     <button 
                       (click)="addToCart(item)"
                       [disabled]="item.cost > availablePoints()"
                       class="mt-4 w-full bg-white border border-indigo-600 text-indigo-600 py-2 px-4 rounded font-medium hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 transition-colors">
                       Add to Cart
                     </button>
                   </div>
                 </div>
               }
             </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RewardsComponent {
  dataService = inject(DataService);
  router = inject(Router);

  selectedCategory = signal('All');
  
  // Direct signals
  catalog = this.dataService.getRewards();
  allCustomers = this.dataService.getAllCustomers();
  
  categories = computed(() => [...new Set(this.catalog().map(i => i.category))]);

  activeCustomer = computed(() => {
    const id = this.dataService.activeCustomerId();
    if (!id) return null;
    return this.allCustomers().find(c => c.id === id) || null;
  });

  availablePoints = computed(() => {
    const c = this.activeCustomer();
    return c ? this.dataService.calculatePoints(c) : 0;
  });

  cartItems = computed(() => this.activeCustomer()?.cart || []);
  cartCount = computed(() => this.cartItems().reduce((acc, i) => acc + i.quantity, 0));

  filteredItems = computed(() => {
    if (this.selectedCategory() === 'All') return this.catalog();
    return this.catalog().filter(i => i.category === this.selectedCategory());
  });

  addToCart(item: RewardItem) {
    const c = this.activeCustomer();
    if (c) {
      this.dataService.addToCart(c.id, item);
    }
  }
}