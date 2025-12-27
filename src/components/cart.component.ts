import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        @if (activeCustomer(); as c) {
           <p class="mt-2 text-gray-600">Checking out for <span class="font-semibold text-indigo-600">{{ c.name }}</span></p>
        }
      </div>

      @if (!activeCustomer()) {
        <div class="text-center py-12 bg-white rounded-lg shadow">
           <h3 class="text-lg font-medium text-gray-900">No Customer Selected</h3>
           <p class="mt-2 text-gray-500">Please select a customer to manage their cart.</p>
           <a routerLink="/customers" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
             Go to Customers
           </a>
        </div>
      } @else {
        @if (cartItems().length === 0) {
           <div class="text-center py-20 bg-white rounded-lg shadow border border-dashed border-gray-300">
             <div class="mx-auto h-12 w-12 text-gray-400 text-4xl">🛒</div>
             <h3 class="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
             <div class="mt-6">
               <a routerLink="/rewards" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                 Continue Shopping
               </a>
             </div>
           </div>
        } @else {
           <div class="bg-white shadow overflow-hidden sm:rounded-lg">
             <ul class="divide-y divide-gray-200">
               @for (entry of cartItems(); track entry.item.id) {
                 <li class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                   <div class="flex items-center">
                     <div class="h-16 w-16 flex-shrink-0 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center text-2xl">
                       🎁
                     </div>
                     <div class="ml-4">
                       <h4 class="text-sm font-medium text-gray-900">{{ entry.item.name }}</h4>
                       <p class="text-sm text-gray-500">{{ entry.item.category }}</p>
                       <p class="text-xs text-indigo-600 font-mono mt-1">{{ entry.item.cost | number }} pts per unit</p>
                     </div>
                   </div>
                   <div class="flex items-center gap-6">
                     <div class="flex items-center">
                        <span class="px-4 py-1 text-sm font-medium border rounded bg-gray-50">Qty: {{ entry.quantity }}</span>
                     </div>
                     <div class="text-right w-24">
                        <p class="text-sm font-bold text-gray-900">{{ (entry.quantity * entry.item.cost) | number }}</p>
                        <p class="text-xs text-gray-500">pts</p>
                     </div>
                     <button (click)="removeItem(entry.item.id)" class="text-red-600 hover:text-red-900 text-sm font-medium">Remove</button>
                   </div>
                 </li>
               }
             </ul>
             <div class="bg-gray-50 px-6 py-6 border-t border-gray-200">
               <div class="flex justify-between text-base font-medium text-gray-900 mb-4">
                 <p>Subtotal</p>
                 <p>{{ cartTotal() | number }} pts</p>
               </div>
               <div class="flex justify-between text-sm text-gray-500 mb-6">
                 <p>Available Points</p>
                 <p class="font-mono">{{ availablePoints() | number }} pts</p>
               </div>

               @if (cartTotal() > availablePoints()) {
                 <div class="rounded-md bg-red-50 p-4 mb-6">
                   <div class="flex">
                     <div class="flex-shrink-0">
                       <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                         <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                       </svg>
                     </div>
                     <div class="ml-3">
                       <h3 class="text-sm font-medium text-red-800">Insufficient Balance</h3>
                       <div class="mt-2 text-sm text-red-700">
                         <p>You need {{ (cartTotal() - availablePoints()) | number }} more points to redeem these items.</p>
                       </div>
                     </div>
                   </div>
                 </div>
               }

               <div class="flex gap-4">
                  <a routerLink="/rewards" class="w-1/2 flex justify-center items-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Back to Shop
                  </a>
                  <button 
                    (click)="checkout()"
                    [disabled]="cartTotal() > availablePoints()"
                    class="w-1/2 flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Confirm Redemption
                  </button>
               </div>
             </div>
           </div>
        }
      }
    </div>
  `
})
export class CartComponent {
  dataService = inject(DataService);
  router = inject(Router);

  allCustomers = this.dataService.getAllCustomers();
  
  activeCustomer = computed(() => {
    const id = this.dataService.activeCustomerId();
    if (!id) return null;
    return this.allCustomers().find(c => c.id === id) || null;
  });

  cartItems = computed(() => this.activeCustomer()?.cart || []);
  cartTotal = computed(() => this.cartItems().reduce((acc, i) => acc + (i.item.cost * i.quantity), 0));
  
  availablePoints = computed(() => {
    const c = this.activeCustomer();
    return c ? this.dataService.calculatePoints(c) : 0;
  });

  removeItem(itemId: string) {
    const c = this.activeCustomer();
    if (c) this.dataService.removeFromCart(c.id, itemId);
  }

  checkout() {
    const c = this.activeCustomer();
    if (!c) return;
    try {
      this.dataService.checkoutCart(c.id);
      alert('Order placed successfully!');
      this.router.navigate(['/customers', c.id]);
    } catch (e: any) {
      alert(e.message);
    }
  }
}