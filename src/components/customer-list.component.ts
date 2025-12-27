import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Customers</h1>
          <p class="mt-2 text-sm text-gray-700">A list of all customers in the bank associated with the rewards program.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button (click)="showModal.set(true)" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:w-auto">
            Add Customer
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="mt-6 flex gap-4">
        <input 
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          type="text" 
          placeholder="Search by name..." 
          class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
        >
      </div>

      <!-- Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Join Date</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cards</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  @for (customer of filteredCustomers(); track customer.id) {
                    <tr>
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ customer.name }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ customer.email }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ customer.joinDate }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">
                        <span [class]="getBadgeClass(customer.joinDate)">
                          {{ getCustomerType(customer.joinDate) }}
                        </span>
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ customer.cards.length }}</td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <a [routerLink]="['/customers', customer.id]" class="text-blue-600 hover:text-blue-900 mr-4">View</a>
                        <button (click)="deleteCustomer(customer.id)" class="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="py-10 text-center text-gray-500">No customers found.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Create New Customer</h3>
                <div class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input 
                      type="text" 
                      [ngModel]="newName()" 
                      (ngModelChange)="newName.set($event)"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      [ngModel]="newEmail()"
                      (ngModelChange)="newEmail.set($event)"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Join Date</label>
                    <input 
                      type="date" 
                      [ngModel]="newJoinDate()"
                      (ngModelChange)="newJoinDate.set($event)"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button (click)="createCustomer()" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">Create</button>
                <button (click)="showModal.set(false)" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CustomerListComponent {
  dataService = inject(DataService);
  customers = this.dataService.getAllCustomers();
  
  searchTerm = signal('');
  showModal = signal(false);
  
  // Form signals
  newName = signal('');
  newEmail = signal('');
  newJoinDate = signal('');

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.customers().filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.email.toLowerCase().includes(term)
    );
  });

  getCustomerType(joinDate: string): string {
    const join = new Date(joinDate);
    const now = new Date();
    const diff = (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return diff >= 3 ? 'Premium' : 'Regular';
  }

  getBadgeClass(joinDate: string): string {
    const type = this.getCustomerType(joinDate);
    return type === 'Premium' 
      ? 'inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800'
      : 'inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800';
  }

  createCustomer() {
    const name = this.newName();
    const email = this.newEmail();
    const joinDate = this.newJoinDate();

    if (name && email && joinDate) {
      this.dataService.createCustomer(name, email, joinDate);
      
      // Reset and close
      this.newName.set('');
      this.newEmail.set('');
      this.newJoinDate.set('');
      this.showModal.set(false);
    }
  }

  deleteCustomer(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.dataService.deleteCustomer(id);
    }
  }
}