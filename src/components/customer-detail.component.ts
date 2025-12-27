import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Customer } from '../services/data.service';

@Component({
  selector: 'app-customer-detail',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    @if (customer(); as c) {
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="min-w-0 flex-1">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {{ c.name }}
            </h2>
            <div class="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <span class="mr-1.5">📧</span> {{ c.email }}
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500">
                <span class="mr-1.5">📅</span> Member since {{ c.joinDate }}
              </div>
              <div class="mt-2 flex items-center text-sm">
                <span class="mr-1.5">⭐</span> 
                <span [class]="getBadgeClass(c)">{{ getCustomerType(c) }} Member</span>
              </div>
            </div>
          </div>
          <div class="mt-4 flex md:ml-4 md:mt-0">
             <a routerLink="/rewards" (click)="setActiveCustomer(c.id)" class="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
               Redeem Points (Shop)
             </a>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
           <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
             <dt class="truncate text-sm font-medium text-gray-500">Total Spend</dt>
             <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">₹{{ getTotalSpend(c) | number }}</dd>
           </div>
           <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
             <dt class="truncate text-sm font-medium text-gray-500">Available Points</dt>
             <dd class="mt-1 text-3xl font-semibold tracking-tight text-green-600">{{ getPoints(c) | number }}</dd>
             <p class="text-xs text-gray-400 mt-1">Earn Rate: {{ getEarnRate(c) }}</p>
           </div>
           <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
             <dt class="truncate text-sm font-medium text-gray-500">Redeemed Points</dt>
             <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-400">{{ c.pointsRedeemed | number }}</dd>
           </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Credit Cards Section -->
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">Credit Cards</h3>
              <div class="space-y-4">
                 @for (card of c.cards; track card.number) {
                    <div class="flex items-center justify-between p-3 border rounded bg-gray-50">
                       <div class="flex items-center gap-3">
                         <div class="bg-blue-100 p-2 rounded text-blue-600 text-xs font-bold">CARD</div>
                         <div>
                            <p class="text-sm font-medium text-gray-900">{{ card.bankName }}</p>
                            <p class="text-xs text-gray-500 font-mono">{{ card.number }}</p>
                         </div>
                       </div>
                    </div>
                 }
                 @if (c.cards.length === 0) {
                   <p class="text-sm text-gray-500 italic">No cards added.</p>
                 }

                 <!-- Add Card Form -->
                 <div class="mt-6 border-t pt-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Add New Card</h4>
                    <div class="grid grid-cols-1 gap-3">
                       <input [(ngModel)]="newCardBank" placeholder="Bank Name" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                       <input [(ngModel)]="newCardNumber" placeholder="Card Number (XXXX-XXXX...)" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                       <button (click)="addCard(c.id)" class="w-full rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Add Card</button>
                    </div>
                    @if (cardError()) {
                       <p class="mt-2 text-xs text-red-600">{{ cardError() }}</p>
                    }
                 </div>
              </div>
            </div>
          </div>

          <!-- Transaction Generation -->
          <div class="bg-white shadow sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-base font-semibold leading-6 text-gray-900 mb-4">Action Center</h3>
              <div class="bg-yellow-50 p-4 rounded-md mb-4 border border-yellow-100">
                <h4 class="text-sm font-bold text-yellow-800">Simulation Config</h4>
                <ul class="list-disc list-inside text-xs text-yellow-700 mt-1">
                  <li>Generates exactly 50 transactions</li>
                  <li>Amounts: ₹500 - ₹50,000</li>
                  <li>Assigned randomly to cards</li>
                </ul>
              </div>
              
              <button 
                [disabled]="c.cards.length === 0"
                (click)="generateTransactions(c.id)"
                class="w-full inline-flex justify-center items-center rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                @if (c.cards.length > 0) {
                  Generate 50 New Transactions
                } @else {
                  Add Card to Enable Generation
                }
              </button>
            </div>
          </div>
        </div>

        <!-- History Tabs -->
        <div class="mt-8">
           <div class="bg-white shadow sm:rounded-lg overflow-hidden">
             
             <!-- Tab Header -->
             <div class="border-b border-gray-200">
               <nav class="-mb-px flex" aria-label="Tabs">
                 <button 
                   (click)="activeHistoryTab.set('transactions')"
                   [class]="activeHistoryTab() === 'transactions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                   class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors cursor-pointer focus:outline-none">
                   Transaction History (Earned)
                 </button>
                 <button 
                   (click)="activeHistoryTab.set('redemptions')"
                   [class]="activeHistoryTab() === 'redemptions' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                   class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors cursor-pointer focus:outline-none">
                   Redemption History (Spent)
                 </button>
               </nav>
             </div>

             <!-- Tab Content -->
             <div class="max-h-96 overflow-y-auto custom-scrollbar">
               @if (activeHistoryTab() === 'transactions') {
                 <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50 sticky top-0 shadow-sm">
                      <tr>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Card</th>
                        <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      @for (tx of c.transactions; track tx.id) {
                        <tr>
                          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500 font-mono">{{ tx.id }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ tx.date }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">{{ tx.cardNumber }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-medium">₹{{ tx.amount | number }}</td>
                        </tr>
                      } @empty {
                         <tr>
                           <td colspan="4" class="py-10 text-center text-gray-500">No transactions generated yet.</td>
                         </tr>
                      }
                    </tbody>
                 </table>
               } @else {
                 <!-- Redemption Table -->
                 <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50 sticky top-0 shadow-sm">
                      <tr>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Order ID</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items Redeemed</th>
                        <th class="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Points Used</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      @for (order of customerOrders(); track order.id) {
                        <tr>
                          <td class="whitespace-nowrap px-3 py-4 text-xs text-gray-500 font-mono">{{ order.id }}</td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ order.date | date:'medium' }}</td>
                          <td class="px-3 py-4 text-sm text-gray-500">
                            @if (order.items && order.items.length > 0) {
                              <ul class="list-disc list-inside">
                                @for (item of order.items; track item.item.id) {
                                  <li>{{ item.quantity }}x {{ item.item.name }}</li>
                                }
                              </ul>
                            } @else {
                              <span class="text-xs italic text-gray-400">{{ order.itemsSummary }}</span>
                            }
                          </td>
                          <td class="whitespace-nowrap px-3 py-4 text-sm font-bold text-red-600 text-right">-{{ order.totalCost | number }}</td>
                        </tr>
                      } @empty {
                         <tr>
                           <td colspan="4" class="py-10 text-center text-gray-500">No redemptions found for this customer.</td>
                         </tr>
                      }
                    </tbody>
                 </table>
               }
             </div>
           </div>
        </div>

      </div>
    } @else {
      <div class="text-center py-20 text-gray-500">Customer not found or loading...</div>
    }
  `
})
export class CustomerDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);

  customerId = signal<string | null>(null);
  activeHistoryTab = signal<'transactions' | 'redemptions'>('transactions');
  
  newCardNumber = '';
  newCardBank = '';
  cardError = signal('');

  customer = computed(() => {
    const id = this.customerId();
    if (!id) return null;
    return this.dataService.getCustomerById(id)();
  });

  customerOrders = computed(() => {
    const cId = this.customerId();
    if (!cId) return [];
    // Return orders for this customer, sorted new to old
    return this.dataService.orders()
      .filter(o => o.customerId === cId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.customerId.set(params.get('id'));
    });
  }

  getCustomerType(c: Customer): string {
    const join = new Date(c.joinDate);
    const now = new Date();
    const diff = (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return diff >= 3 ? 'Premium' : 'Regular';
  }

  getEarnRate(c: Customer): string {
    return this.getCustomerType(c) === 'Premium' ? '10%' : '5%';
  }

  getBadgeClass(c: Customer): string {
    return this.getCustomerType(c) === 'Premium' 
      ? 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800' 
      : 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800';
  }

  getPoints(c: Customer): number {
    return this.dataService.calculatePoints(c);
  }

  getTotalSpend(c: Customer): number {
    return c.transactions.reduce((acc, t) => acc + t.amount, 0);
  }

  addCard(id: string) {
    if (!this.newCardNumber || !this.newCardBank) {
      this.cardError.set('Fill both fields');
      return;
    }
    try {
      this.dataService.addCard(id, this.newCardNumber, this.newCardBank);
      this.newCardNumber = '';
      this.newCardBank = '';
      this.cardError.set('');
    } catch (e: any) {
      this.cardError.set(e.message);
    }
  }

  generateTransactions(id: string) {
    this.dataService.generateTransactions(id);
  }

  setActiveCustomer(id: string) {
    this.dataService.activeCustomerId.set(id);
  }
}