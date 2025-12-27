import { Injectable, signal, computed, inject } from '@angular/core';

// --- Interfaces ---
export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'ADMIN' | 'USER';
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  totalCost: number;
  itemsSummary: string;
  items?: CartItem[];
}

export interface CartItem {
  item: RewardItem;
  quantity: number;
}

export interface CreditCard {
  number: string;
  bankName: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  cardNumber: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  joinDate: string; 
  cards: CreditCard[];
  transactions: Transaction[];
  pointsRedeemed: number;
  isDeleted: boolean;
  cart: CartItem[];
}

// --- PDF CAPSTONE DATA ---
const CAPSTONE_REWARDS: RewardItem[] = [
  // 5.1 Gift Cards
  { id: '101', category: 'Gift Cards', name: 'Google Play Gift Card', cost: 5000 },
  { id: '102', category: 'Gift Cards', name: 'Apple Gift Card', cost: 6000 },
  { id: '103', category: 'Gift Cards', name: 'Amazon Gift Card', cost: 4500 },
  { id: '104', category: 'Gift Cards', name: 'Flipkart Gift Card', cost: 4500 },
  { id: '105', category: 'Gift Cards', name: 'Swiggy Gift Card', cost: 3500 },
  { id: '106', category: 'Gift Cards', name: 'Zomato Gift Card', cost: 3500 },
  // 5.2 Travel & Holidays
  { id: '201', category: 'Travel', name: 'Trip to Manali', cost: 40000 },
  { id: '202', category: 'Travel', name: 'Trip to Kanyakumari', cost: 30000 },
  { id: '203', category: 'Travel', name: 'Goa Beach Holiday', cost: 45000 },
  { id: '204', category: 'Travel', name: 'Jaipur Heritage Trip', cost: 28000 },
  { id: '205', category: 'Travel', name: 'Ooty Hill Station Trip', cost: 38000 },
  // 5.3 Shopping & Electronics
  { id: '301', category: 'Electronics', name: 'Bluetooth Headphones', cost: 12000 },
  { id: '302', category: 'Electronics', name: 'Smart Watch', cost: 18000 },
  { id: '303', category: 'Electronics', name: 'Wireless Earbuds', cost: 15000 },
  { id: '304', category: 'Electronics', name: 'Smartphone Voucher', cost: 22000 },
  { id: '305', category: 'Electronics', name: 'Laptop Bag', cost: 6000 },
  // 5.4 Dining & Lifestyle
  { id: '401', category: 'Dining', name: 'Dinner for Two', cost: 8000 },
  { id: '402', category: 'Dining', name: 'Café Voucher', cost: 4000 },
  { id: '403', category: 'Dining', name: 'Movie Tickets', cost: 5000 },
  { id: '404', category: 'Dining', name: 'Spa Voucher', cost: 10000 },
  // 5.5 Health & Fitness
  { id: '501', category: 'Health', name: 'Gym Membership (3 mo)', cost: 20000 },
  { id: '502', category: 'Health', name: 'Yoga Classes', cost: 7000 },
  { id: '503', category: 'Health', name: 'Fitness Band', cost: 9000 },
  { id: '504', category: 'Health', name: 'Nutrition Consultation', cost: 6000 },
  // 5.6 Learning
  { id: '601', category: 'Learning', name: 'Online Course Voucher', cost: 10000 },
  { id: '602', category: 'Learning', name: 'E-Book Subscription', cost: 5000 },
  { id: '603', category: 'Learning', name: 'Coding Platform Access', cost: 12000 },
  { id: '604', category: 'Learning', name: 'Music Subscription', cost: 4000 },
];

@Injectable({ providedIn: 'root' })
export class DataService {

  // --- State Signals ---
  currentUser = signal<User | null>(null);
  rewards = signal<RewardItem[]>(CAPSTONE_REWARDS);
  orders = signal<Order[]>([]);
  activeCustomerId = signal<string | null>(null);

  // Mock Customers
  private customers = signal<Customer[]>([
    {
      id: 'CUST001',
      name: 'Rohan Sharma',
      email: 'rohan.s@example.com',
      joinDate: '2020-05-15', // Premium (>= 3 years)
      cards: [
        { number: '4532-XXXX-XXXX-8890', bankName: 'HDFC Regalia' },
        { number: '5412-XXXX-XXXX-1122', bankName: 'SBI Elite' }
      ],
      transactions: [],
      pointsRedeemed: 0,
      isDeleted: false,
      cart: []
    },
    {
      id: 'CUST002',
      name: 'Priya Verma',
      email: 'priya.v@example.com',
      joinDate: '2023-11-10', // Regular (< 3 years)
      cards: [{ number: '4111-XXXX-XXXX-9988', bankName: 'ICICI Coral' }],
      transactions: [],
      pointsRedeemed: 0,
      isDeleted: false,
      cart: []
    }
  ]);

  private cesUsers = signal<User[]>([
    { id: 'u1', username: 'admin', role: 'ADMIN', password: 'admin' },
    { id: 'u2', username: 'user', role: 'USER', password: 'user' }
  ]);

  constructor() {}

  // --- Auth ---
  login(username: string, password?: string): boolean {
    const user = this.cesUsers().find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    this.activeCustomerId.set(null);
  }

  // --- Rewards (Inventory) CRUD ---
  getRewards() {
    return this.rewards;
  }

  addReward(item: Omit<RewardItem, 'id'>) {
    const newItem = { ...item, id: Date.now().toString() };
    this.rewards.update(prev => [...prev, newItem]);
  }

  deleteReward(id: string) {
    this.rewards.update(prev => prev.filter(r => r.id !== id));
  }

  // --- Orders ---
  getOrders() {
    return this.orders;
  }

  // --- Cart & Checkout Logic ---
  addToCart(customerId: string, item: RewardItem) {
    this.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        const existingItem = c.cart.find(i => i.item.id === item.id);
        const newCart = existingItem 
          ? c.cart.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...c.cart, { item, quantity: 1 }];
        return { ...c, cart: newCart };
      }
      return c;
    }));
  }

  removeFromCart(customerId: string, itemId: string) {
    this.customers.update(prev => prev.map(c => {
      if (c.id === customerId) return { ...c, cart: c.cart.filter(i => i.item.id !== itemId) };
      return c;
    }));
  }

  checkoutCart(customerId: string) {
    const customer = this.customers().find(c => c.id === customerId);
    if (!customer) return;

    const cartTotal = customer.cart.reduce((acc, i) => acc + (i.item.cost * i.quantity), 0);
    const availablePoints = this.calculatePoints(customer);

    // Business Rule: Negative reward balance is strictly not allowed
    if (cartTotal > availablePoints) throw new Error('Insufficient points balance!');
    if (customer.cart.length === 0) throw new Error('Cart is empty');

    // Create Order Object
    const newOrder: Order = {
      id: 'ORD-' + Date.now().toString().slice(-6),
      customerId: customer.id,
      customerName: customer.name,
      date: new Date().toISOString(),
      totalCost: cartTotal,
      items: [...customer.cart], // Copy items to prevent reference issues
      itemsSummary: JSON.stringify(customer.cart.map(c => ({ name: c.item.name, qty: c.quantity })))
    };

    // 1. Clear Cart & Deduct Mock Points (pointsRedeemed increases)
    this.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, pointsRedeemed: c.pointsRedeemed + cartTotal, cart: [] };
      }
      return c;
    }));

    // 2. Save Order
    this.orders.update(prev => [newOrder, ...prev]);
  }

  // --- Customer & Point Calculation Helper ---
  getAllCustomers() { return computed(() => this.customers().filter(c => !c.isDeleted)); }
  getCustomerById(id: string) { return computed(() => this.customers().find(c => c.id === id)); }

  calculatePoints(customer: Customer): number {
    if (!customer) return 0;
    
    // Business Rule: Regular < 3 years (5%), Premium >= 3 years (10%)
    const join = new Date(customer.joinDate);
    const now = new Date();
    // Calculate difference in years
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365); 
    
    const isPremium = diffYears >= 3;
    const rate = isPremium ? 0.10 : 0.05;
    
    const totalSpend = customer.transactions.reduce((acc, tx) => acc + tx.amount, 0);
    // Business Rule: Reward points never expire
    return Math.floor(totalSpend * rate) - customer.pointsRedeemed;
  }

  createCustomer(name: string, email: string, joinDate: string) {
    const newCustomer: Customer = {
      id: 'CUST' + Date.now().toString().slice(-4), name, email, joinDate,
      cards: [], transactions: [], pointsRedeemed: 0, isDeleted: false, cart: []
    };
    this.customers.update(prev => [...prev, newCustomer]);
  }

  deleteCustomer(id: string) {
    // Business Rule: Soft delete customer
    this.customers.update(prev => prev.map(c => c.id === id ? { ...c, isDeleted: true } : c));
  }

  addCard(customerId: string, number: string, bankName: string) {
    // Business Rule: Ensure card number uniqueness
    if (this.customers().some(c => c.cards.some(card => card.number === number))) {
      throw new Error('Card number already exists!');
    }
    this.customers.update(prev => prev.map(c => {
      if (c.id === customerId) return { ...c, cards: [...c.cards, { number, bankName }] };
      return c;
    }));
  }

  generateTransactions(customerId: string) {
    const customer = this.customers().find(c => c.id === customerId);
    if (!customer || customer.cards.length === 0) return;

    // Business Rule: "Exactly 50 transactions are generated per request"
    // Business Rule: "Transaction amount range: 500 – 50,000"
    const newTxs: Transaction[] = [];
    
    for (let i = 0; i < 50; i++) {
      // Pick random card from customer's wallet
      const randomCard = customer.cards[Math.floor(Math.random() * customer.cards.length)];
      
      newTxs.push({
        id: 'TXN' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        amount: Math.floor(Math.random() * (50000 - 500 + 1)) + 500,
        cardNumber: randomCard.number,
        description: 'POS Purchase'
      });
    }

    this.customers.update(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, transactions: [...c.transactions, ...newTxs] };
      }
      return c;
    }));
  }

  // --- Admin User Logic ---
  getCESUsers() { return this.cesUsers; }
  
  addCESUser(username: string, role: 'ADMIN' | 'USER', password?: string) {
    this.cesUsers.update(prev => [...prev, { 
      id: Date.now().toString(), 
      username, 
      role, 
      password: password || '123456' 
    }]);
  }

  deleteCESUser(id: string) {
    if (this.cesUsers().find(u => u.id === id)?.id === this.currentUser()?.id) throw new Error('Cannot delete yourself');
    this.cesUsers.update(prev => prev.filter(u => u.id !== id));
  }
}