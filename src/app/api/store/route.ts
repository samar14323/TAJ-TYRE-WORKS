import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { 
  Tyre, 
  Customer, 
  Vehicle, 
  JobCard, 
  Invoice, 
  InvoiceItem, 
  Expense, 
  Supplier, 
  PurchaseOrder, 
  PurchaseOrderItem, 
  Notification, 
  Appointment, 
  TyreCategory, 
  VehicleFuelType, 
  AppointmentStatus, 
  ServiceType, 
  PaymentStatus, 
  OrderStatus, 
  PaymentMethod, 
  JobStatus, 
  TimelineStep, 
  ExpenseCategory 
} from "@prisma/client";

// Input types matching frontend store layout
interface SyncCustomer extends Customer {
  vehicles?: Vehicle[];
}

interface SyncJobCard extends JobCard {
  timeline?: {
    step: string;
    timestamp: string;
    completed: boolean;
  }[];
}

interface SyncInvoice extends Omit<Invoice, "date"> {
  date: string;
  items?: Omit<InvoiceItem, "id" | "invoiceId">[];
  splitPayments?: {
    cashAmount: number;
    upiAmount: number;
    cardAmount: number;
    creditAmount: number;
  };
  paymentMethod: string;
}

interface SyncPurchaseOrder extends Omit<PurchaseOrder, "date"> {
  date: string;
  items?: Omit<PurchaseOrderItem, "id" | "purchaseOrderId">[];
}

interface SyncNotification extends Omit<Notification, "date"> {
  date: string;
}

interface SyncAppointment extends Omit<Appointment, "date"> {
  date: string;
}

// GET handler: Fetches all database records, formatting dates for frontend compatibility
export async function GET() {
  try {
    const rawTyres = await prisma.tyre.findMany();
    const tyres = rawTyres.map((t) => ({
      ...t,
      category: t.category.replace(/_/g, " "),
    }));

    const rawCustomers = await prisma.customer.findMany({
      include: {
        vehicles: true,
      },
    });
    const rawJobCards = await prisma.jobCard.findMany({
      include: {
        timeline: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });
    const rawInvoices = await prisma.invoice.findMany({
      include: {
        items: true,
        payments: true,
      },
    });
    const rawExpenses = await prisma.expense.findMany();
    const rawSuppliers = await prisma.supplier.findMany();
    const rawPurchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        items: true,
      },
    });
    const rawNotifications = await prisma.notification.findMany();
    const rawAppointments = await prisma.appointment.findMany();

    // Formatting date fields back to standard string format for UI compatibility
    const customers = rawCustomers.map((c) => ({
      ...c,
      vehicles: c.vehicles.map((v) => ({
        ...v,
        installDate: v.installDate ? v.installDate.toISOString().split("T")[0] : "",
        warrantyExpiry: v.warrantyExpiry ? v.warrantyExpiry.toISOString().split("T")[0] : "",
        nextReplacement: v.nextReplacement ? v.nextReplacement.toISOString().split("T")[0] : "",
      })),
    }));

    const jobCards = rawJobCards.map((j) => ({
      ...j,
      timeline: j.timeline.map((t) => ({
        step: t.step.replace(/_/g, " "), // convert enums back to space strings
        timestamp: t.timestamp,
        completed: t.completed,
      })),
    }));

    const invoices = rawInvoices.map((inv) => {
      // Reconstruct split payments object if present
      const cash = inv.payments.find((p) => p.method === "Cash")?.amount || 0;
      const upi = inv.payments.find((p) => p.method === "UPI")?.amount || 0;
      const card = inv.payments.find((p) => p.method === "Card")?.amount || 0;
      const credit = inv.payments.find((p) => p.method === "Credit")?.amount || 0;

      const items = inv.items.map((it) => ({
        tyreId: it.tyreId,
        name: it.name,
        brand: it.brand,
        quantity: it.quantity,
        price: it.price,
        hsnCode: it.hsnCode,
        gstRate: it.gstRate,
        total: it.total,
      }));

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date.toISOString().split("T")[0],
        customerId: inv.customerId,
        customerName: customers.find((c) => c.id === inv.customerId)?.name || "Client",
        customerPhone: customers.find((c) => c.id === inv.customerId)?.phone || "",
        items,
        subTotal: inv.subTotal,
        gstAmount: inv.gstAmount,
        discountApplied: inv.discountApplied,
        netTotal: inv.netTotal,
        paymentMethod: inv.payments[0]?.method || "UPI",
        splitPayments: {
          cashAmount: cash,
          upiAmount: upi,
          cardAmount: card,
          creditAmount: credit,
        },
        ownerSignature: inv.ownerSignature,
        customerSignature: inv.customerSignature,
        gstin: inv.gstin || undefined,
        jobCardId: inv.jobCardId || undefined,
      };
    });

    const expenses = rawExpenses.map((e) => ({
      id: e.id,
      date: e.date.toISOString().split("T")[0],
      category: e.category,
      amount: e.amount,
      description: e.description,
    }));

    const suppliers = rawSuppliers.map((s) => ({
      ...s,
      lastPurchaseDate: s.lastPurchaseDate ? s.lastPurchaseDate.toISOString().split("T")[0] : "",
    }));

    const purchaseOrders = rawPurchaseOrders.map((po) => ({
      id: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: suppliers.find((s) => s.id === po.supplierId)?.name || "Supplier",
      date: po.date.toISOString().split("T")[0],
      totalAmount: po.totalAmount,
      status: po.status,
      items: po.items.map((it) => ({
        name: it.name,
        brand: it.brand,
        size: it.size,
        quantity: it.quantity,
        unitCost: it.unitCost,
        total: it.total,
      })),
    }));

    const notifications = rawNotifications.map((n) => ({
      id: n.id,
      role: n.role,
      title: n.title,
      message: n.message,
      date: n.date.toISOString().split("T")[0],
      read: n.read,
    }));

    const appointments = rawAppointments.map((a) => ({
      id: a.id,
      customerName: customers.find((c) => c.id === a.customerId)?.name || "Client",
      customerPhone: customers.find((c) => c.id === a.customerId)?.phone || "",
      vehicleNumber: a.vehicleNumber,
      serviceType: a.serviceType,
      date: a.date.toISOString().split("T")[0],
      timeSlot: a.timeSlot,
      status: a.status,
      mechanicName: a.mechanicName || undefined,
      timeTaken: a.timeTaken || undefined,
      beforePhoto: a.beforePhoto || undefined,
      afterPhoto: a.afterPhoto || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tyres,
        customers,
        jobCards,
        invoices,
        expenses,
        suppliers,
        purchaseOrders,
        notifications,
        appointments,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/store error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST handler: Syncs local localStorage state write-through actions to Neon database via Prisma
export async function POST(req: Request) {
  try {
    const body = await req.json() as { action: string; data: unknown };
    const action = body.action;
    const data = body.data;

    if (!action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    const firstSupplier = await prisma.supplier.findFirst();
    const supplierId = firstSupplier ? firstSupplier.id : "s-placeholder";

    // Setup placeholder supplier if missing
    if (!firstSupplier) {
      await prisma.supplier.create({
        data: {
          id: "s-placeholder",
          name: "Apex Distributors",
          contactPerson: "Rajesh Gupta",
          phone: "9812345670",
          email: "apex@tyredist.com",
        },
      });
    }

    switch (action) {
      case "saveTyres": {
        const tyresData = data as Tyre[];
        const activeBarcodes = tyresData.map((t) => t.barcode).filter(Boolean);
        await prisma.tyre.deleteMany({
          where: {
            barcode: {
              notIn: activeBarcodes
            }
          }
        });

        for (const t of tyresData) {
          const cat = t.category || "Car Tyres";
          const categoryMapped = cat.replace(/ /g, "_") as TyreCategory;

          await prisma.tyre.upsert({
            where: { barcode: t.barcode },
            update: {
              brand: t.brand,
              name: t.name,
              category: categoryMapped,
              size: t.size,
              mrp: t.mrp,
              purchasePrice: t.purchasePrice,
              sellingPrice: t.sellingPrice,
              quantity: t.quantity,
              location: t.location,
              imageUrl: t.imageUrl || null,
              qrCode: t.qrCode,
              description: t.description || null,
              warranty: t.warranty || null,
            },
            create: {
              id: t.id,
              brand: t.brand,
              name: t.name,
              category: categoryMapped,
              size: t.size,
              mrp: t.mrp,
              purchasePrice: t.purchasePrice,
              sellingPrice: t.sellingPrice,
              quantity: t.quantity,
              location: t.location,
              imageUrl: t.imageUrl || null,
              barcode: t.barcode,
              qrCode: t.qrCode,
              description: t.description || null,
              warranty: t.warranty || null,
              supplierId,
            },
          });
        }
        break;
      }

      case "saveCustomers": {
        const customersData = data as SyncCustomer[];
        for (const c of customersData) {
          await prisma.customer.upsert({
            where: { phone: c.phone },
            update: {
              name: c.name,
              visits: c.visits,
              purchasesCount: c.purchasesCount,
              totalSpent: c.totalSpent,
              trustLevel: c.trustLevel,
              savings: c.savings,
              notes: c.notes || null,
              rewardPoints: c.rewardPoints || 0,
              outstandingAmount: c.outstandingAmount || 0,
              favoriteBrand: c.favoriteBrand || null,
              averageBill: c.averageBill || 0,
              address: c.address || null,
              city: c.city || null,
            },
            create: {
              id: c.id,
              name: c.name,
              phone: c.phone,
              visits: c.visits,
              purchasesCount: c.purchasesCount,
              totalSpent: c.totalSpent,
              trustLevel: c.trustLevel,
              savings: c.savings,
              notes: c.notes || null,
              rewardPoints: c.rewardPoints || 0,
              outstandingAmount: c.outstandingAmount || 0,
              favoriteBrand: c.favoriteBrand || null,
              averageBill: c.averageBill || 0,
              address: c.address || null,
              city: c.city || null,
            },
          });

          // Sync nested customer vehicles
          if (c.vehicles) {
            for (const v of c.vehicles) {
              const fuelMapped = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"].includes(v.fuelType)
                ? (v.fuelType as VehicleFuelType)
                : VehicleFuelType.Petrol;

              await prisma.vehicle.upsert({
                where: { plateNumber: v.plateNumber },
                update: {
                  model: v.model,
                  tyreInstalled: v.tyreInstalled || null,
                  installDate: v.installDate ? new Date(v.installDate) : null,
                  mileage: v.mileage,
                  warrantyExpiry: v.warrantyExpiry ? new Date(v.warrantyExpiry) : null,
                  nextReplacement: v.nextReplacement ? new Date(v.nextReplacement) : null,
                },
                create: {
                  id: v.id,
                  brand: v.model.split(" ")[0] || "Honda",
                  model: v.model,
                  year: v.year || 2021,
                  fuelType: fuelMapped,
                  plateNumber: v.plateNumber,
                  tyreInstalled: v.tyreInstalled || null,
                  installDate: v.installDate ? new Date(v.installDate) : null,
                  mileage: v.mileage,
                  warrantyExpiry: v.warrantyExpiry ? new Date(v.warrantyExpiry) : null,
                  nextReplacement: v.nextReplacement ? new Date(v.nextReplacement) : null,
                  customerId: c.id,
                },
              });
            }
          }
        }
        break;
      }

      case "addJobCard": {
        const jobCardData = data as SyncJobCard;
        const jobStatusMapped = ["Waiting", "In_Progress", "Quality_Check", "Completed"].includes(jobCardData.status)
          ? (jobCardData.status as JobStatus)
          : JobStatus.Waiting;

        await prisma.jobCard.create({
          data: {
            id: jobCardData.id,
            jobId: jobCardData.jobId,
            vehicleModel: jobCardData.vehicleModel,
            vehicleNumber: jobCardData.vehicleNumber,
            services: jobCardData.services,
            mechanic: jobCardData.mechanic,
            bay: jobCardData.bay,
            status: jobStatusMapped,
            estimatedFinish: jobCardData.estimatedFinish,
            beforePhoto: jobCardData.beforePhoto || null,
            afterPhoto: jobCardData.afterPhoto || null,
            damagePhoto: jobCardData.damagePhoto || null,
            customerSignature: jobCardData.customerSignature || null,
            ownerSignature: jobCardData.ownerSignature || null,
            odometerReading: jobCardData.odometerReading,
            customerId: jobCardData.customerId,
          },
        });

        if (jobCardData.timeline) {
          for (const t of jobCardData.timeline) {
            const stepEnum = t.step.replace(/ /g, "_") as TimelineStep;
            await prisma.timeline.create({
              data: {
                step: stepEnum,
                timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
                completed: t.completed,
                jobCardId: jobCardData.id,
              },
            });
          }
        }
        break;
      }

      case "saveJobCards": {
        const jobCardsData = data as SyncJobCard[];
        for (const jc of jobCardsData) {
          const statusMapped = ["Waiting", "In_Progress", "Quality_Check", "Completed"].includes(jc.status)
            ? (jc.status as JobStatus)
            : JobStatus.Waiting;

          await prisma.jobCard.upsert({
            where: { jobId: jc.jobId },
            update: {
              status: statusMapped,
              estimatedFinish: jc.estimatedFinish,
              beforePhoto: jc.beforePhoto || null,
              afterPhoto: jc.afterPhoto || null,
              damagePhoto: jc.damagePhoto || null,
              customerSignature: jc.customerSignature || null,
              ownerSignature: jc.ownerSignature || null,
              odometerReading: jc.odometerReading,
            },
            create: {
              id: jc.id,
              jobId: jc.jobId,
              vehicleModel: jc.vehicleModel,
              vehicleNumber: jc.vehicleNumber,
              services: jc.services,
              mechanic: jc.mechanic,
              bay: jc.bay,
              status: statusMapped,
              estimatedFinish: jc.estimatedFinish,
              odometerReading: jc.odometerReading,
              customerId: jc.customerId,
            },
          });

          // Sync timeline steps
          await prisma.timeline.deleteMany({ where: { jobCardId: jc.id } });
          if (jc.timeline) {
            for (const t of jc.timeline) {
              const stepEnum = t.step.replace(/ /g, "_") as TimelineStep;
              await prisma.timeline.create({
                data: {
                  step: stepEnum,
                  timestamp: t.timestamp ? new Date(t.timestamp) : new Date(),
                  completed: t.completed,
                  jobCardId: jc.id,
                },
              });
            }
          }
        }
        break;
      }

      case "addAppointment": {
        const appointmentData = data as SyncAppointment;
        const appStatusMapped = ["Pending", "In_Progress", "Completed", "Cancelled"].includes(appointmentData.status)
          ? (appointmentData.status as AppointmentStatus)
          : AppointmentStatus.Pending;
        const appServiceMapped = ["Fitting", "Alignment", "Balancing", "Nitrogen"].includes(appointmentData.serviceType)
          ? (appointmentData.serviceType as ServiceType)
          : ServiceType.Alignment;

        await prisma.appointment.create({
          data: {
            id: appointmentData.id,
            vehicleNumber: appointmentData.vehicleNumber,
            serviceType: appServiceMapped,
            date: new Date(appointmentData.date),
            timeSlot: appointmentData.timeSlot,
            status: appStatusMapped,
            mechanicName: appointmentData.mechanicName || null,
            timeTaken: appointmentData.timeTaken || null,
            beforePhoto: appointmentData.beforePhoto || null,
            afterPhoto: appointmentData.afterPhoto || null,
            customerId: appointmentData.customerId,
          },
        });
        break;
      }

      case "saveAppointments": {
        const appointmentsData = data as SyncAppointment[];
        for (const a of appointmentsData) {
          const appStatus = ["Pending", "In_Progress", "Completed", "Cancelled"].includes(a.status)
            ? (a.status as AppointmentStatus)
            : AppointmentStatus.Pending;
          const appService = ["Fitting", "Alignment", "Balancing", "Nitrogen"].includes(a.serviceType)
            ? (a.serviceType as ServiceType)
            : ServiceType.Alignment;

          await prisma.appointment.upsert({
            where: { id: a.id },
            update: {
              status: appStatus,
              mechanicName: a.mechanicName || null,
              timeTaken: a.timeTaken || null,
              beforePhoto: a.beforePhoto || null,
              afterPhoto: a.afterPhoto || null,
            },
            create: {
              id: a.id,
              vehicleNumber: a.vehicleNumber,
              serviceType: appService,
              date: new Date(a.date),
              timeSlot: a.timeSlot,
              status: appStatus,
              mechanicName: a.mechanicName || null,
              timeTaken: a.timeTaken || null,
              beforePhoto: a.beforePhoto || null,
              afterPhoto: a.afterPhoto || null,
              customerId: a.customerId || "c-placeholder",
            },
          });
        }
        break;
      }

      case "addInvoice": {
        const invoiceData = data as SyncInvoice;
        await prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.create({
            data: {
              id: invoiceData.id,
              invoiceNumber: invoiceData.invoiceNumber,
              date: new Date(invoiceData.date),
              subTotal: invoiceData.subTotal,
              gstAmount: invoiceData.gstAmount,
              discountApplied: invoiceData.discountApplied,
              netTotal: invoiceData.netTotal,
              ownerSignature: invoiceData.ownerSignature,
              customerSignature: invoiceData.customerSignature,
              gstin: invoiceData.gstin || null,
              jobCardId: invoiceData.jobCardId || null,
              customerId: invoiceData.customerId,
            },
          });

          if (invoiceData.items) {
            for (const item of invoiceData.items) {
              await tx.invoiceItem.create({
                data: {
                  tyreId: item.tyreId,
                  name: item.name,
                  brand: item.brand,
                  quantity: item.quantity,
                  price: item.price,
                  hsnCode: item.hsnCode,
                  gstRate: item.gstRate,
                  total: item.total,
                  invoiceId: invoice.id,
                },
              });

              // Decrement tyre quantities
              await tx.tyre.update({
                where: { id: item.tyreId },
                data: {
                  quantity: {
                    decrement: item.quantity,
                  },
                },
              });
            }
          }

          // Create payment entries for invoice split/standard payments
          const splits = invoiceData.splitPayments || { cashAmount: 0, upiAmount: 0, cardAmount: 0, creditAmount: 0 };
          const method = invoiceData.paymentMethod;

          if (method === "Cash" || splits.cashAmount > 0) {
            await tx.payment.create({
              data: {
                amount: splits.cashAmount > 0 ? splits.cashAmount : invoiceData.netTotal,
                method: "Cash" as PaymentMethod,
                invoiceId: invoice.id,
              },
            });
          }
          if (method === "UPI" || splits.upiAmount > 0) {
            await tx.payment.create({
              data: {
                amount: splits.upiAmount > 0 ? splits.upiAmount : invoiceData.netTotal,
                method: "UPI" as PaymentMethod,
                invoiceId: invoice.id,
              },
            });
          }
          if (method === "Card" || splits.cardAmount > 0) {
            await tx.payment.create({
              data: {
                amount: splits.cardAmount > 0 ? splits.cardAmount : invoiceData.netTotal,
                method: "Card" as PaymentMethod,
                invoiceId: invoice.id,
              },
            });
          }
          if (method === "Credit" || splits.creditAmount > 0) {
            await tx.payment.create({
              data: {
                amount: splits.creditAmount > 0 ? splits.creditAmount : invoiceData.netTotal,
                method: "Credit" as PaymentMethod,
                invoiceId: invoice.id,
              },
            });
          }

          // Update customer spent values
          const pointsEarned = Math.floor(invoiceData.netTotal * 0.05);
          const creditAmount = method === "Credit" ? invoiceData.netTotal : 0;
          const itemsLength = invoiceData.items ? invoiceData.items.length : 0;

          await tx.customer.update({
            where: { id: invoiceData.customerId },
            data: {
              purchasesCount: { increment: itemsLength },
              totalSpent: { increment: invoiceData.netTotal },
              savings: { increment: invoiceData.discountApplied },
              rewardPoints: { increment: pointsEarned },
              outstandingAmount: { increment: creditAmount },
            },
          });
        });
        break;
      }

      case "saveExpenses": {
        const expensesData = data as (Omit<Expense, "date"> & { date: string })[];
        for (const e of expensesData) {
          const expenseCatMapped = ["Salary", "Rent", "Electricity", "Tea", "Transport", "Internet", "Maintenance", "Other"].includes(e.category)
            ? (e.category as ExpenseCategory)
            : ExpenseCategory.Other;

          await prisma.expense.upsert({
            where: { id: e.id },
            update: {
              date: new Date(e.date),
              category: expenseCatMapped,
              amount: e.amount,
              description: e.description,
            },
            create: {
              id: e.id,
              date: new Date(e.date),
              category: expenseCatMapped,
              amount: e.amount,
              description: e.description,
            },
          });
        }
        break;
      }

      case "saveSuppliers": {
        const suppliersData = data as (Omit<Supplier, "lastPurchaseDate"> & { lastPurchaseDate?: string })[];
        for (const s of suppliersData) {
          const paymentStatusMapped = ["Paid", "Pending", "Overdue"].includes(s.paymentStatus)
            ? (s.paymentStatus as PaymentStatus)
            : PaymentStatus.Paid;

          await prisma.supplier.upsert({
            where: { name: s.name },
            update: {
              contactPerson: s.contactPerson,
              phone: s.phone,
              email: s.email,
              stockSupplied: s.stockSupplied,
              paymentStatus: paymentStatusMapped,
              pendingAmount: s.pendingAmount,
              rating: s.rating,
              avgDeliveryTime: s.avgDeliveryTime,
              pendingOrdersCount: s.pendingOrdersCount,
              lastPurchaseDate: s.lastPurchaseDate ? new Date(s.lastPurchaseDate) : null,
              outstandingBalance: s.outstandingBalance,
            },
            create: {
              id: s.id,
              name: s.name,
              contactPerson: s.contactPerson,
              phone: s.phone,
              email: s.email,
              stockSupplied: s.stockSupplied,
              paymentStatus: paymentStatusMapped,
              pendingAmount: s.pendingAmount,
              rating: s.rating,
              avgDeliveryTime: s.avgDeliveryTime,
              pendingOrdersCount: s.pendingOrdersCount,
              lastPurchaseDate: s.lastPurchaseDate ? new Date(s.lastPurchaseDate) : null,
              outstandingBalance: s.outstandingBalance,
            },
          });
        }
        break;
      }

      case "savePurchaseOrders": {
        const poData = data as SyncPurchaseOrder[];
        for (const po of poData) {
          const poStatusMapped = ["Draft", "Sent", "Received", "Cancelled"].includes(po.status)
            ? (po.status as OrderStatus)
            : OrderStatus.Draft;

          await prisma.purchaseOrder.upsert({
            where: { poNumber: po.poNumber },
            update: {
              status: poStatusMapped,
              totalAmount: po.totalAmount,
            },
            create: {
              id: po.id,
              poNumber: po.poNumber,
              date: new Date(po.date),
              totalAmount: po.totalAmount,
              status: poStatusMapped,
              supplierId: po.supplierId || supplierId,
            },
          });

          // Sync nested PO items
          if (po.items) {
            await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: po.id } });
            for (const item of po.items) {
              await prisma.purchaseOrderItem.create({
                data: {
                  name: item.name,
                  brand: item.brand,
                  size: item.size,
                  quantity: item.quantity,
                  unitCost: item.unitCost,
                  total: item.total,
                  purchaseOrderId: po.id,
                },
              });
            }
          }
        }
        break;
      }

      case "saveNotifications": {
        const notificationsData = data as SyncNotification[];
        for (const n of notificationsData) {
          await prisma.notification.upsert({
            where: { id: n.id },
            update: {
              read: n.read,
            },
            create: {
              id: n.id,
              role: n.role,
              title: n.title,
              message: n.message,
              date: new Date(n.date),
              read: n.read,
            },
          });
        }
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unhandled action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/store error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
