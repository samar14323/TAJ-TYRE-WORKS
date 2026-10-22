"use client";

// TypeScript Interfaces

export interface Tyre {
  id: string;
  brand: string;
  name: string;
  category: 
    | "Car Tyres"
    | "Bike Tyres"
    | "Truck Tyres"
    | "Tractor Tyres"
    | "Tubes"
    | "Wheels"
    | "Accessories"
    | "Batteries"
    | "Nitrogen Services"
    | "Wheel Alignment"
    | "Wheel Balancing";
  size: string;
  mrp: number;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  location: string;
  supplier: string;
  dateAdded: string;
  barcode: string;
  qrCode: string;
  description?: string;
  warranty?: string;
  imageUrl?: string;
}


export interface Vehicle {
  id: string;
  model: string;
  plateNumber: string;
  tyreInstalled: string;
  installDate: string;
  mileage: number;
  warrantyExpiry: string;
  nextReplacement: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  serviceType: "Fitting" | "Alignment" | "Balancing" | "Nitrogen";
  date: string;
  timeSlot: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  mechanicName?: string;
  timeTaken?: number;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  username?: string;
  password?: string;
  visits: number;
  purchasesCount: number;
  totalSpent: number;
  trustLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
  savings: number;
  vehicles: Vehicle[];
  notes: string;
  // Expanded Phase 4 fields
  rewardPoints?: number;
  outstandingAmount?: number;
  favoriteBrand?: string;
  averageBill?: number;
}

export interface InvoiceItem {
  tyreId: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  hsnCode: string; // e.g. 4011 for tyres, 4013 for tubes, 9987 for alignment
  gstRate: number; // 28% for tyres, 18% for services
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subTotal: number;
  gstAmount: number;
  discountApplied: number;
  netTotal: number;
  paymentMethod: "Cash" | "UPI" | "Card" | "Credit";
  // Split payment amounts
  splitPayments?: {
    cashAmount: number;
    upiAmount: number;
    cardAmount: number;
    creditAmount: number;
  };
  ownerSignature: string;
  customerSignature: string;
  gstin?: string;
  jobCardId?: string; // Links to the job card
}

export interface JobTimelineStep {
  step: "Vehicle Arrived" | "Inspection" | "Tyre Installed" | "Alignment" | "Quality Check" | "Payment" | "Delivered";
  timestamp: string;
  completed: boolean;
}

export interface JobCard {
  id: string;
  jobId: string; // e.g. #TTW-2026-00152
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehicleNumber: string;
  services: string[];
  mechanic: string;
  bay: "Bay 1 (Alignment)" | "Bay 2 (Fitting)" | "Bay 3 (Balancing)" | "Bay 4 (Nitrogen)";
  status: "Waiting" | "In Progress" | "Quality Check" | "Completed";
  estimatedFinish: string;
  timeline: JobTimelineStep[];
  beforePhoto?: string;
  afterPhoto?: string;
  damagePhoto?: string;
  customerSignature?: string;
  ownerSignature?: string;
  odometerReading: number;
}

export interface Expense {
  id: string;
  date: string;
  category: "Salary" | "Rent" | "Electricity" | "Tea" | "Transport" | "Internet" | "Maintenance" | "Other";
  amount: number;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  stockSupplied: number;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  pendingAmount: number;
  // Expanded Phase 4 fields
  rating: number; // 1 to 5 stars
  avgDeliveryTime: string; // e.g. "2 Days"
  pendingOrdersCount: number;
  lastPurchaseDate: string;
  outstandingBalance: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-001
  supplierId: string;
  supplierName: string;
  date: string;
  items: {
    name: string;
    brand: string;
    size: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  totalAmount: number;
  status: "Draft" | "Sent" | "Received" | "Cancelled";
}

export interface Notification {
  id: string;
  role: "Owner" | "Customer" | "Employee" | "Dealer";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Initial Mock Seed Data
const initialTyres: Tyre[] = [
  { id: "t-1", brand: "Apollo", name: "Alnac 4G", category: "Car Tyres", size: "185/65 R15", mrp: 4200, purchasePrice: 2900, sellingPrice: 3850, quantity: 18, location: "Shelf A3", supplier: "Apex Distributors", dateAdded: "2026-04-10", barcode: "8901234001", qrCode: "qr-8901234001" },
  { id: "t-2", brand: "MRF", name: "Wanderer A/T", category: "Car Tyres", size: "235/70 R16", mrp: 8100, purchasePrice: 5500, sellingPrice: 7200, quantity: 3, location: "Shelf B1", supplier: "MRF Regional Hub", dateAdded: "2026-05-12", barcode: "8901234002", qrCode: "qr-8901234002" },
  { id: "t-3", brand: "CEAT", name: "SecuraDrive", category: "Car Tyres", size: "195/55 R16", mrp: 4900, purchasePrice: 3300, sellingPrice: 4300, quantity: 14, location: "Shelf A5", supplier: "Shree Ji Tyres", dateAdded: "2026-05-20", barcode: "8901234003", qrCode: "qr-8901234003" },
  { id: "t-4", brand: "Michelin", name: "Primacy 4 ST", category: "Car Tyres", size: "195/55 R16", mrp: 9800, purchasePrice: 7200, sellingPrice: 9100, quantity: 8, location: "Premium Section", supplier: "Michelin Imports India", dateAdded: "2026-06-02", barcode: "8901234004", qrCode: "qr-8901234004" },
  { id: "t-5", brand: "JK", name: "Jet Steel JDH5", category: "Truck Tyres", size: "10.00 R20", mrp: 21000, purchasePrice: 15500, sellingPrice: 18500, quantity: 24, location: "Heavy Stacks C", supplier: "JK Tyre Depot", dateAdded: "2026-03-15", barcode: "8901234005", qrCode: "qr-8901234005" },
  { id: "t-6", brand: "Bridgestone", name: "Sturdo", category: "Car Tyres", size: "185/65 R15", mrp: 6200, purchasePrice: 4500, sellingPrice: 5600, quantity: 11, location: "Shelf A1", supplier: "Bridgestone North", dateAdded: "2026-06-10", barcode: "8901234006", qrCode: "qr-8901234006" }
];


const initialCustomers: Customer[] = [
  {
    id: "c-1",
    name: "Mohammad Samar",
    phone: "9199936181",
    visits: 6,
    purchasesCount: 2,
    totalSpent: 11500,
    trustLevel: "Silver",
    savings: 1200,
    vehicles: [
      { id: "v-1", model: "Honda City (2021)", plateNumber: "DL3C-AM-1234", tyreInstalled: "Apollo Alnac 4G", installDate: "2025-05-10", mileage: 34500, warrantyExpiry: "2030-05-10", nextReplacement: "2028-10-15" }
    ],
    notes: "Preferred customer, VIP treatment.",
    rewardPoints: 450,
    outstandingAmount: 0,
    favoriteBrand: "Apollo",
    averageBill: 5750
  },
  {
    id: "c-2",
    name: "Rahul Sharma",
    phone: "9876543210",
    visits: 4,
    purchasesCount: 1,
    totalSpent: 4300,
    trustLevel: "Bronze",
    savings: 300,
    vehicles: [
      { id: "v-2", model: "Hyundai i20", plateNumber: "HR26-BY-5678", tyreInstalled: "CEAT SecuraDrive", installDate: "2026-01-15", mileage: 22000, warrantyExpiry: "2031-01-15", nextReplacement: "2029-06-20" }
    ],
    notes: "Requires regular alignment alerts.",
    rewardPoints: 120,
    outstandingAmount: 0,
    favoriteBrand: "CEAT",
    averageBill: 4300
  },
  {
    id: "c-3",
    name: "Vikas Yadav",
    phone: "9911223344",
    visits: 12,
    purchasesCount: 4,
    totalSpent: 74000,
    trustLevel: "Gold",
    savings: 8500,
    vehicles: [
      { id: "v-3", model: "Mahindra Scorpio", plateNumber: "UP16-TR-8899", tyreInstalled: "MRF Wanderer A/T", installDate: "2025-09-08", mileage: 45000, warrantyExpiry: "2031-09-08", nextReplacement: "2028-02-14" },
      { id: "v-4", model: "Tata Truck 1613", plateNumber: "UP16-EX-9900", tyreInstalled: "JK Jet Steel", installDate: "2026-02-10", mileage: 98000, warrantyExpiry: "2029-02-10", nextReplacement: "2027-08-10" }
    ],
    notes: "Fleet transport operator. Invoices require GST split.",
    rewardPoints: 1800,
    outstandingAmount: 15000,
    favoriteBrand: "JK",
    averageBill: 18500
  }
];

const initialJobCards: JobCard[] = [
  {
    id: "job-1",
    jobId: "TTW-2026-00151",
    customerId: "c-2",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    vehicleModel: "Hyundai i20",
    vehicleNumber: "HR26-BY-5678",
    services: ["Wheel Alignment", "Wheel Balancing"],
    mechanic: "Karan Singh",
    bay: "Bay 1 (Alignment)",
    status: "Completed",
    estimatedFinish: "11:00 AM",
    odometerReading: 22000,
    beforePhoto: "before_align.jpg",
    afterPhoto: "after_align.jpg",
    timeline: [
      { step: "Vehicle Arrived", timestamp: "2026-07-15T10:05:00Z", completed: true },
      { step: "Inspection", timestamp: "2026-07-15T10:12:00Z", completed: true },
      { step: "Tyre Installed", timestamp: "2026-07-15T10:15:00Z", completed: false },
      { step: "Alignment", timestamp: "2026-07-15T10:30:00Z", completed: true },
      { step: "Quality Check", timestamp: "2026-07-15T10:45:00Z", completed: true },
      { step: "Payment", timestamp: "2026-07-15T10:50:00Z", completed: true },
      { step: "Delivered", timestamp: "2026-07-15T11:00:00Z", completed: true }
    ]
  },
  {
    id: "job-2",
    jobId: "TTW-2026-00152",
    customerId: "c-1",
    customerName: "Mohammad Samar",
    customerPhone: "9199936181",
    vehicleModel: "Honda City (2021)",
    vehicleNumber: "DL3C-AM-1234",
    services: ["Nitrogen Filling"],
    mechanic: "Amit Kumar",
    bay: "Bay 4 (Nitrogen)",
    status: "In Progress",
    estimatedFinish: "05:45 PM",
    odometerReading: 34500,
    timeline: [
      { step: "Vehicle Arrived", timestamp: "2026-07-15T17:15:00Z", completed: true },
      { step: "Inspection", timestamp: "2026-07-15T17:22:00Z", completed: true },
      { step: "Tyre Installed", timestamp: "", completed: false },
      { step: "Alignment", timestamp: "", completed: false },
      { step: "Quality Check", timestamp: "", completed: false },
      { step: "Payment", timestamp: "", completed: false },
      { step: "Delivered", timestamp: "", completed: false }
    ]
  }
];

const initialInvoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "TTW-2026-001",
    date: "2026-07-10",
    customerId: "c-1",
    customerName: "Mohammad Samar",
    customerPhone: "9199936181",
    items: [
      { tyreId: "t-1", name: "Alnac 4G", brand: "Apollo", quantity: 2, price: 3850, hsnCode: "4011", gstRate: 28, total: 7700 }
    ],
    subTotal: 6015.62,
    gstAmount: 1684.38,
    discountApplied: 0,
    netTotal: 7700,
    paymentMethod: "UPI",
    ownerSignature: "Mohammad Samar",
    customerSignature: "M. Samar",
    gstin: "07AAJFT2008T1Z8"
  }
];

const initialExpenses: Expense[] = [
  { id: "exp-1", date: "2026-07-14", category: "Salary", amount: 15000, description: "Mechanic Karan Singh monthly wages" },
  { id: "exp-2", date: "2026-07-15", category: "Rent", amount: 20000, description: "Workshop site lease rent payment" },
  { id: "exp-3", date: "2026-07-15", category: "Tea", amount: 320, description: "Tea and snacks for garage staff" },
  { id: "exp-4", date: "2026-07-15", category: "Electricity", amount: 4800, description: "Monthly commercial energy bill" }
];

const initialSuppliers: Supplier[] = [
  { id: "s-1", name: "Apex Distributors", contactPerson: "Rajesh Gupta", phone: "9812345670", email: "apex@tyredist.com", stockSupplied: 120, paymentStatus: "Paid", pendingAmount: 0, rating: 5, avgDeliveryTime: "2 Days", pendingOrdersCount: 0, lastPurchaseDate: "2026-06-15", outstandingBalance: 0 },
  { id: "s-2", name: "MRF Regional Hub", contactPerson: "S. K. Murthy", phone: "9998887776", email: "delhihub@mrf.com", stockSupplied: 85, paymentStatus: "Pending", pendingAmount: 42000, rating: 4, avgDeliveryTime: "3 Days", pendingOrdersCount: 1, lastPurchaseDate: "2026-07-01", outstandingBalance: 42000 },
  { id: "s-3", name: "Shree Ji Tyres", contactPerson: "Sunil Jain", phone: "9833322211", email: "shreejityre@gmail.com", stockSupplied: 210, paymentStatus: "Overdue", pendingAmount: 68000, rating: 3, avgDeliveryTime: "5 Days", pendingOrdersCount: 2, lastPurchaseDate: "2026-05-10", outstandingBalance: 68000 }
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2026-001",
    supplierId: "s-1",
    supplierName: "Apex Distributors",
    date: "2026-07-15",
    items: [
      { name: "Alnac 4G", brand: "Apollo", size: "185/65 R15", quantity: 20, unitCost: 2900, total: 58000 }
    ],
    totalAmount: 58000,
    status: "Sent"
  }
];

const initialNotifications: Notification[] = [
  { id: "n-1", role: "Owner", title: "Low Stock Warning", message: "MRF Wanderer A/T is down to 3 units. Reorder recommended.", date: "2026-07-15", read: false },
  { id: "n-2", role: "Customer", title: "Loyalty Discount Unlocked!", message: "Congratulations! You have completed 5 visits. Enjoy a 10% OFF coupon.", date: "2026-07-14", read: false }
];

class LocalDB {
  private isBatchSyncing = false;

  private syncAction(action: string, data: any): void {
    if (this.isBatchSyncing) return;
    if (typeof window !== "undefined") {
      fetch("/api/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, data }),
      }).catch((err) => {
        console.error(`Failed to sync action ${action} to Neon:`, err);
      });
    }
  }

  async syncWithServer(): Promise<void> {
    try {
      const res = await fetch("/api/store");
      const json = await res.json();
      if (json.success && json.data) {
        this.isBatchSyncing = true;
        try {
          const d = json.data;
          if (d.tyres && d.tyres.length > 0) this.saveTyres(d.tyres);
          if (d.customers && d.customers.length > 0) this.saveCustomers(d.customers);
          if (d.jobCards && d.jobCards.length > 0) this.saveJobCards(d.jobCards);
          if (d.invoices && d.invoices.length > 0) this.saveInvoices(d.invoices);
          if (d.expenses && d.expenses.length > 0) this.saveExpenses(d.expenses);
          if (d.suppliers && d.suppliers.length > 0) this.saveSuppliers(d.suppliers);
          if (d.purchaseOrders && d.purchaseOrders.length > 0) this.savePurchaseOrders(d.purchaseOrders);
          if (d.notifications && d.notifications.length > 0) this.saveNotifications(d.notifications);
          if (d.appointments && d.appointments.length > 0) this.saveAppointments(d.appointments);
        } finally {
          this.isBatchSyncing = false;
        }
        console.log("Database successfully synchronized with Neon PostgreSQL.");
      }
    } catch (e) {
      console.error("Failed to sync with server:", e);
    }
  }

  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Getters
  getTyres(): Tyre[] { return this.getStorageItem("ttw_tyres_v4", initialTyres); }
  getCustomers(): Customer[] { return this.getStorageItem("ttw_customers_v4", initialCustomers); }
  getJobCards(): JobCard[] { return this.getStorageItem("ttw_jobcards_v4", initialJobCards); }
  getInvoices(): Invoice[] { return this.getStorageItem("ttw_invoices_v4", initialInvoices); }
  getExpenses(): Expense[] { return this.getStorageItem("ttw_expenses_v4", initialExpenses); }
  getSuppliers(): Supplier[] { return this.getStorageItem("ttw_suppliers_v4", initialSuppliers); }
  getPurchaseOrders(): PurchaseOrder[] { return this.getStorageItem("ttw_po_v4", initialPurchaseOrders); }
  getNotifications(): Notification[] { return this.getStorageItem("ttw_notifications_v4", initialNotifications); }
  getAppointments(): Appointment[] { 
    return this.getStorageItem("ttw_appointments_v4", []);
  }

  // Setters
  saveTyres(val: Tyre[]): void { 
    this.setStorageItem("ttw_tyres_v4", val); 
    this.syncAction("saveTyres", val);
  }
  saveCustomers(val: Customer[]): void { 
    this.setStorageItem("ttw_customers_v4", val); 
    this.syncAction("saveCustomers", val);
  }
  saveJobCards(val: JobCard[]): void { 
    this.setStorageItem("ttw_jobcards_v4", val); 
    this.syncAction("saveJobCards", val);
  }
  saveInvoices(val: Invoice[]): void { 
    this.setStorageItem("ttw_invoices_v4", val); 
  }
  saveExpenses(val: Expense[]): void { 
    this.setStorageItem("ttw_expenses_v4", val); 
    this.syncAction("saveExpenses", val);
  }
  saveSuppliers(val: Supplier[]): void { 
    this.setStorageItem("ttw_suppliers_v4", val); 
    this.syncAction("saveSuppliers", val);
  }
  savePurchaseOrders(val: PurchaseOrder[]): void { 
    this.setStorageItem("ttw_po_v4", val); 
    this.syncAction("savePurchaseOrders", val);
  }
  saveNotifications(val: Notification[]): void { 
    this.setStorageItem("ttw_notifications_v4", val); 
    this.syncAction("saveNotifications", val);
  }
  saveAppointments(val: Appointment[]): void { 
    this.setStorageItem("ttw_appointments_v4", val); 
    this.syncAction("saveAppointments", val);
  }

  // Core Actions
  addJobCard(job: JobCard): void {
    this.isBatchSyncing = true;
    try {
      const list = this.getJobCards();
      list.unshift(job);
      this.saveJobCards(list);

      // Auto notify
      this.addNotification({
        id: `n-${Date.now()}`,
        role: "Owner",
        title: "New Job Card Registered",
        message: `Job ${job.jobId} created for ${job.customerName} - ${job.vehicleModel} (${job.vehicleNumber})`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("addJobCard", job);
  }

  addAppointment(apt: Appointment): void {
    this.isBatchSyncing = true;
    try {
      const list = this.getAppointments();
      list.unshift(apt);
      this.saveAppointments(list);
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("addAppointment", apt);
  }

  addInvoice(invoice: Invoice): void {
    this.isBatchSyncing = true;
    try {
      const invoices = this.getInvoices();
      invoices.unshift(invoice);
      this.saveInvoices(invoices);

      // 1. Decrement tyre inventory
      const tyres = this.getTyres();
      invoice.items.forEach((item) => {
        const tyre = tyres.find((t) => t.id === item.tyreId);
        if (tyre) {
          tyre.quantity = Math.max(0, tyre.quantity - item.quantity);
          if (tyre.quantity < 5) {
            this.addNotification({
              id: `n-low-${Date.now()}-${Math.random()}`,
              role: "Owner",
              title: "Low Stock Alert",
              message: `${tyre.brand} ${tyre.name} is low: ${tyre.quantity} left.`,
              date: invoice.date,
              read: false
            });
          }
        }
      });
      this.saveTyres(tyres);

      // 2. Update Customer details
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === invoice.customerId || c.phone === invoice.customerPhone);
      if (customer) {
        customer.purchasesCount += invoice.items.length;
        customer.totalSpent += invoice.netTotal;
        customer.savings += invoice.discountApplied;
        
        const pointsEarned = Math.floor(invoice.netTotal * 0.05);
        customer.rewardPoints = (customer.rewardPoints ?? 0) + pointsEarned;
        
        customer.averageBill = Math.floor(customer.totalSpent / customer.purchasesCount);
        if (invoice.items.length > 0) {
          customer.favoriteBrand = invoice.items[0].brand;
        }

        invoice.items.forEach(item => {
          if (item.hsnCode === "4011") {
            customer.vehicles.forEach(veh => {
              if (invoice.jobCardId) {
                const jc = this.getJobCards().find(j => j.id === invoice.jobCardId);
                if (jc && jc.vehicleNumber === veh.plateNumber) {
                  veh.tyreInstalled = `${item.brand} ${item.name}`;
                  veh.installDate = invoice.date;
                }
              } else {
                veh.tyreInstalled = `${item.brand} ${item.name}`;
                veh.installDate = invoice.date;
              }
            });
          }
        });

        if (invoice.paymentMethod === "Credit") {
          customer.outstandingAmount = (customer.outstandingAmount ?? 0) + invoice.netTotal;
        }

        if (customer.totalSpent > 50000) customer.trustLevel = "Platinum";
        else if (customer.totalSpent > 25000) customer.trustLevel = "Gold";
        else if (customer.totalSpent > 10000) customer.trustLevel = "Silver";

        this.saveCustomers(customers);
      }
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("addInvoice", invoice);
  }

  incrementCustomerVisit(customerId: string): number {
    this.isBatchSyncing = true;
    let nextVisits = 0;
    try {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        customer.visits += 1;
        nextVisits = customer.visits;
        
        if (customer.visits === 5) {
          this.addNotification({
            id: `notif-c-5-${Date.now()}`,
            role: "Customer",
            title: "10% Coupon Ready",
            message: "You have completed 5 visits. Use code TAJ10OFF.",
            date: new Date().toISOString().split("T")[0],
            read: false
          });
        }
        this.saveCustomers(customers);
      }
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("saveCustomers", this.getCustomers());
    return nextVisits;
  }

  decrementCustomerVisit(customerId: string): number {
    this.isBatchSyncing = true;
    let nextVisits = 0;
    try {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === customerId);
      if (customer && customer.visits > 0) {
        customer.visits -= 1;
        nextVisits = customer.visits;
        this.saveCustomers(customers);
      }
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("saveCustomers", this.getCustomers());
    return nextVisits;
  }

  resetCustomerVisits(customerId: string): void {
    this.isBatchSyncing = true;
    try {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        customer.visits = 0;
        this.saveCustomers(customers);
      }
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("saveCustomers", this.getCustomers());
  }

  addNotification(n: Notification): void {
    this.isBatchSyncing = true;
    try {
      const list = this.getNotifications();
      list.unshift(n);
      this.saveNotifications(list);
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("saveNotifications", this.getNotifications());
  }

  addExpense(exp: Expense): void {
    this.isBatchSyncing = true;
    try {
      const list = this.getExpenses();
      list.unshift(exp);
      this.saveExpenses(list);
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("saveExpenses", this.getExpenses());
  }

  addPurchaseOrder(po: PurchaseOrder): void {
    this.isBatchSyncing = true;
    try {
      const list = this.getPurchaseOrders();
      list.unshift(po);
      this.savePurchaseOrders(list);
    } finally {
      this.isBatchSyncing = false;
    }
    this.syncAction("savePurchaseOrders", this.getPurchaseOrders());
  }

  // Developer mode overrides
  resetDatabase(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ttw_tyres_v4");
      localStorage.removeItem("ttw_customers_v4");
      localStorage.removeItem("ttw_jobcards_v4");
      localStorage.removeItem("ttw_invoices_v4");
      localStorage.removeItem("ttw_expenses_v4");
      localStorage.removeItem("ttw_suppliers_v4");
      localStorage.removeItem("ttw_po_v4");
      localStorage.removeItem("ttw_notifications_v4");
      localStorage.removeItem("ttw_appointments_v4");
      window.location.reload();
    }
  }


  seedSampleInventory(): void {
    this.saveTyres(initialTyres);
    this.saveCustomers(initialCustomers);
    this.saveJobCards(initialJobCards);
    this.saveInvoices(initialInvoices);
    this.saveExpenses(initialExpenses);
    this.saveSuppliers(initialSuppliers);
    this.savePurchaseOrders(initialPurchaseOrders);
    this.saveNotifications(initialNotifications);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  exportData(): string {
    const payload = {
      tyres: this.getTyres(),
      customers: this.getCustomers(),
      jobCards: this.getJobCards(),
      invoices: this.getInvoices(),
      expenses: this.getExpenses(),
      suppliers: this.getSuppliers(),
      purchaseOrders: this.getPurchaseOrders(),
      notifications: this.getNotifications()
    };
    return JSON.stringify(payload, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.tyres) this.saveTyres(parsed.tyres);
      if (parsed.customers) this.saveCustomers(parsed.customers);
      if (parsed.jobCards) this.saveJobCards(parsed.jobCards);
      if (parsed.invoices) this.saveInvoices(parsed.invoices);
      if (parsed.expenses) this.saveExpenses(parsed.expenses);
      if (parsed.suppliers) this.saveSuppliers(parsed.suppliers);
      if (parsed.purchaseOrders) this.savePurchaseOrders(parsed.purchaseOrders);
      if (parsed.notifications) this.saveNotifications(parsed.notifications);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export const dbStore = new LocalDB();
