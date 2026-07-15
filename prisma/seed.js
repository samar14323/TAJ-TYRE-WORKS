require('dotenv').config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up existing database records...");
  
  // Clear tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.timeline.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.jobCard.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.tyre.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.dealer.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.settings.deleteMany({});

  console.log("Database clean-up completed.");

  // 1. Seed Owners
  console.log("Seeding owners...");
  const owner1Pass = await bcrypt.hash("@@MdSamar@@", 10);
  const owner2Pass = await bcrypt.hash("@@Noxis001@@", 10);

  const owner1 = await prisma.owner.create({
    data: {
      username: "MHDSAM",
      password: owner1Pass,
      name: "Mohammad Samar"
    }
  });

  const owner2 = await prisma.owner.create({
    data: {
      username: "Noxis99",
      password: owner2Pass,
      name: "Noxis"
    }
  });

  // 2. Seed Employees
  console.log("Seeding employees...");
  const mechPass = await bcrypt.hash("mech123", 10);
  const recPass = await bcrypt.hash("rec123", 10);

  const emp1 = await prisma.employee.create({
    data: {
      username: "mechanic",
      password: mechPass,
      name: "Karan Singh",
      role: "Mechanic"
    }
  });

  const emp2 = await prisma.employee.create({
    data: {
      username: "reception",
      password: recPass,
      name: "Amit Kumar",
      role: "Receptionist"
    }
  });

  // 3. Seed Dealers
  console.log("Seeding dealers...");
  const dealerPass = await bcrypt.hash("dealer123", 10);
  await prisma.dealer.create({
    data: {
      username: "dealer",
      password: dealerPass,
      name: "Apex Tyres Dealer"
    }
  });

  // 4. Seed Suppliers
  console.log("Seeding suppliers...");
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Apex Distributors",
      contactPerson: "Rajesh Gupta",
      phone: "9812345670",
      email: "apex@tyredist.com",
      stockSupplied: 120,
      paymentStatus: "Paid",
      pendingAmount: 0,
      rating: 5,
      avgDeliveryTime: "2 Days",
      pendingOrdersCount: 0,
      lastPurchaseDate: new Date("2026-06-15T00:00:00Z"),
      outstandingBalance: 0
    }
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "MRF Regional Hub",
      contactPerson: "S. K. Murthy",
      phone: "9998887776",
      email: "delhihub@mrf.com",
      stockSupplied: 85,
      paymentStatus: "Pending",
      pendingAmount: 42000,
      rating: 4,
      avgDeliveryTime: "3 Days",
      pendingOrdersCount: 1,
      lastPurchaseDate: new Date("2026-07-01T00:00:00Z"),
      outstandingBalance: 42000
    }
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "Shree Ji Tyres",
      contactPerson: "Sunil Jain",
      phone: "9833322211",
      email: "shreejityre@gmail.com",
      stockSupplied: 210,
      paymentStatus: "Overdue",
      pendingAmount: 68000,
      rating: 3,
      avgDeliveryTime: "5 Days",
      pendingOrdersCount: 2,
      lastPurchaseDate: new Date("2026-05-10T00:00:00Z"),
      outstandingBalance: 68000
    }
  });

  // 5. Seed Tyres
  console.log("Seeding tyres...");
  const tyre1 = await prisma.tyre.create({
    data: {
      brand: "Apollo",
      name: "Alnac 4G",
      category: "Car_Tyres",
      size: "185/65 R15",
      mrp: 4200,
      purchasePrice: 2900,
      sellingPrice: 3850,
      quantity: 18,
      location: "Shelf A3",
      imageUrl: "/tyre_placeholder.png",
      barcode: "8901234001",
      qrCode: "qr-8901234001",
      dateAdded: new Date("2026-04-10T00:00:00Z"),
      supplierId: supplier1.id
    }
  });

  const tyre2 = await prisma.tyre.create({
    data: {
      brand: "MRF",
      name: "Wanderer A/T",
      category: "Car_Tyres",
      size: "235/70 R16",
      mrp: 8100,
      purchasePrice: 5500,
      sellingPrice: 7200,
      quantity: 3,
      location: "Shelf B1",
      imageUrl: "/tyre_placeholder.png",
      barcode: "8901234002",
      qrCode: "qr-8901234002",
      dateAdded: new Date("2026-05-12T00:00:00Z"),
      supplierId: supplier2.id
    }
  });

  const tyre3 = await prisma.tyre.create({
    data: {
      brand: "CEAT",
      name: "SecuraDrive",
      category: "Car_Tyres",
      size: "195/55 R16",
      mrp: 4900,
      purchasePrice: 3300,
      sellingPrice: 4300,
      quantity: 14,
      location: "Shelf A5",
      imageUrl: "/tyre_placeholder.png",
      barcode: "8901234003",
      qrCode: "qr-8901234003",
      dateAdded: new Date("2026-05-20T00:00:00Z"),
      supplierId: supplier3.id
    }
  });


  // 6. Seed Customers
  console.log("Seeding customers...");
  const customer1 = await prisma.customer.create({
    data: {
      name: "Mohammad Samar",
      phone: "9199936181",
      visits: 6,
      purchasesCount: 2,
      totalSpent: 11500,
      trustLevel: "Silver",
      savings: 1200,
      notes: "Preferred customer, VIP treatment.",
      rewardPoints: 450,
      outstandingAmount: 0,
      favoriteBrand: "Apollo",
      averageBill: 5750,
      address: "Sector 15, Vasundhara",
      city: "Ghaziabad"
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Rahul Sharma",
      phone: "9876543210",
      visits: 4,
      purchasesCount: 1,
      totalSpent: 4300,
      trustLevel: "Bronze",
      savings: 300,
      notes: "Requires regular alignment alerts.",
      rewardPoints: 120,
      outstandingAmount: 0,
      favoriteBrand: "CEAT",
      averageBill: 4300,
      address: "Raj Nagar Extension",
      city: "Ghaziabad"
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: "Vikas Yadav",
      phone: "9911223344",
      visits: 12,
      purchasesCount: 4,
      totalSpent: 74000,
      trustLevel: "Gold",
      savings: 8500,
      notes: "Fleet transport operator. Invoices require GST split.",
      rewardPoints: 1800,
      outstandingAmount: 15000,
      favoriteBrand: "JK",
      averageBill: 18500,
      address: "GT Road bypass crossing",
      city: "Ghaziabad"
    }
  });

  // 7. Seed Vehicles
  console.log("Seeding vehicles...");
  await prisma.vehicle.create({
    data: {
      brand: "Honda",
      model: "City (2021)",
      year: 2021,
      fuelType: "Petrol",
      plateNumber: "DL3C-AM-1234",
      tyreInstalled: "Apollo Alnac 4G",
      installDate: new Date("2025-05-10T00:00:00Z"),
      mileage: 34500,
      warrantyExpiry: new Date("2030-05-10T00:00:00Z"),
      nextReplacement: new Date("2028-10-15T00:00:00Z"),
      customerId: customer1.id
    }
  });

  await prisma.vehicle.create({
    data: {
      brand: "Hyundai",
      model: "i20",
      year: 2019,
      fuelType: "Petrol",
      plateNumber: "HR26-BY-5678",
      tyreInstalled: "CEAT SecuraDrive",
      installDate: new Date("2026-01-15T00:00:00Z"),
      mileage: 22000,
      warrantyExpiry: new Date("2031-01-15T00:00:00Z"),
      nextReplacement: new Date("2029-06-20T00:00:00Z"),
      customerId: customer2.id
    }
  });

  // 8. Seed Appointments
  console.log("Seeding appointments...");
  await prisma.appointment.create({
    data: {
      vehicleNumber: "HR26-BY-5678",
      serviceType: "Alignment",
      date: new Date("2026-07-15T00:00:00Z"),
      timeSlot: "10:00 AM - 11:00 AM",
      status: "Completed",
      mechanicName: "Karan Singh",
      timeTaken: 45,
      customerId: customer2.id
    }
  });

  // 9. Seed JobCards & Timelines
  console.log("Seeding job cards...");
  const job1 = await prisma.jobCard.create({
    data: {
      jobId: "TTW-2026-00151",
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
      customerId: customer2.id
    }
  });

  const steps1 = [
    { step: "Vehicle_Arrived", timestamp: "2026-07-15T10:05:00Z", completed: true },
    { step: "Inspection", timestamp: "2026-07-15T10:12:00Z", completed: true },
    { step: "Tyre_Installed", timestamp: "2026-07-15T10:15:00Z", completed: false },
    { step: "Alignment", timestamp: "2026-07-15T10:30:00Z", completed: true },
    { step: "Quality_Check", timestamp: "2026-07-15T10:45:00Z", completed: true },
    { step: "Payment", timestamp: "2026-07-15T10:50:00Z", completed: true },
    { step: "Delivered", timestamp: "2026-07-15T11:00:00Z", completed: true }
  ];

  for (const s of steps1) {
    await prisma.timeline.create({
      data: {
        step: s.step,
        timestamp: new Date(s.timestamp),
        completed: s.completed,
        jobCardId: job1.id
      }
    });
  }

  const job2 = await prisma.jobCard.create({
    data: {
      jobId: "TTW-2026-00152",
      vehicleModel: "Honda City (2021)",
      vehicleNumber: "DL3C-AM-1234",
      services: ["Nitrogen Filling"],
      mechanic: "Amit Kumar",
      bay: "Bay 4 (Nitrogen)",
      status: "In_Progress",
      estimatedFinish: "05:45 PM",
      odometerReading: 34500,
      customerId: customer1.id
    }
  });

  const steps2 = [
    { step: "Vehicle_Arrived", timestamp: "2026-07-15T17:15:00Z", completed: true },
    { step: "Inspection", timestamp: "2026-07-15T17:22:00Z", completed: true },
    { step: "Tyre_Installed", timestamp: "1970-01-01T00:00:00Z", completed: false },
    { step: "Alignment", timestamp: "1970-01-01T00:00:00Z", completed: false },
    { step: "Quality_Check", timestamp: "1970-01-01T00:00:00Z", completed: false },
    { step: "Payment", timestamp: "1970-01-01T00:00:00Z", completed: false },
    { step: "Delivered", timestamp: "1970-01-01T00:00:00Z", completed: false }
  ];

  for (const s of steps2) {
    await prisma.timeline.create({
      data: {
        step: s.step,
        timestamp: new Date(s.timestamp),
        completed: s.completed,
        jobCardId: job2.id
      }
    });
  }

  // 10. Seed Invoices, Items, and Payments
  console.log("Seeding invoices...");
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "TTW-2026-001",
      date: new Date("2026-07-10T00:00:00Z"),
      subTotal: 6015.62,
      gstAmount: 1684.38,
      discountApplied: 0,
      netTotal: 7700,
      ownerSignature: "Mohammad Samar",
      customerSignature: "M. Samar",
      gstin: "07AAJFT2008T1Z8",
      customerId: customer1.id
    }
  });

  await prisma.invoiceItem.create({
    data: {
      tyreId: tyre1.id,
      name: "Alnac 4G",
      brand: "Apollo",
      quantity: 2,
      price: 3850,
      hsnCode: "4011",
      gstRate: 28,
      total: 7700,
      invoiceId: invoice1.id
    }
  });

  await prisma.payment.create({
    data: {
      amount: 7700,
      method: "UPI",
      status: "Completed",
      transactionId: "TXN123456789",
      invoiceId: invoice1.id
    }
  });

  // 11. Seed Expenses
  console.log("Seeding expenses...");
  const expenses = [
    { date: "2026-07-14", category: "Salary", amount: 15000, description: "Mechanic Karan Singh monthly wages" },
    { date: "2026-07-15", category: "Rent", amount: 20000, description: "Workshop site lease rent payment" },
    { date: "2026-07-15", category: "Tea", amount: 320, description: "Tea and snacks for garage staff" },
    { date: "2026-07-15", category: "Electricity", amount: 4800, description: "Monthly commercial energy bill" }
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        date: new Date(exp.date),
        category: exp.category,
        amount: exp.amount,
        description: exp.description
      }
    });
  }

  // 12. Seed PurchaseOrders & Items
  console.log("Seeding purchase orders...");
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-001",
      date: new Date("2026-07-15T00:00:00Z"),
      totalAmount: 58000,
      status: "Sent",
      supplierId: supplier1.id
    }
  });

  await prisma.purchaseOrderItem.create({
    data: {
      name: "Alnac 4G",
      brand: "Apollo",
      size: "185/65 R15",
      quantity: 20,
      unitCost: 2900,
      total: 58000,
      purchaseOrderId: po1.id
    }
  });

  // 13. Seed Notifications
  console.log("Seeding notifications...");
  await prisma.notification.create({
    data: {
      role: "Owner",
      title: "Low Stock Warning",
      message: "MRF Wanderer A/T is down to 3 units. Reorder recommended.",
      date: new Date("2026-07-15T00:00:00Z"),
      read: false
    }
  });

  await prisma.notification.create({
    data: {
      role: "Customer",
      title: "Loyalty Discount Unlocked!",
      message: "Congratulations! You have completed 5 visits. Enjoy a 10% OFF coupon.",
      date: new Date("2026-07-14T00:00:00Z"),
      read: false,
      customerId: customer1.id
    }
  });

  // 14. Seed Settings
  console.log("Seeding settings...");
  await prisma.settings.create({
    data: {
      key: "businessName",
      value: "Taj Tyre Works"
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
