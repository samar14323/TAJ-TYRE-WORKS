import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper to authenticate owner authorization
async function verifyOwner(req: Request) {
  const ownerUsername =
    req.headers.get("x-owner-username") ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    "";

  if (!ownerUsername) return null;

  return await prisma.owner.findUnique({
    where: { username: ownerUsername },
  });
}

// GET: Retrieve complete customer profile and full historical relationships for owner verification
export async function GET(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required to view full customer profile." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId")?.trim();
    const customerId = searchParams.get("customerId")?.trim();

    if (!requestId && !customerId) {
      return NextResponse.json(
        { success: false, error: "Either requestId or customerId must be provided." },
        { status: 400 }
      );
    }

    let targetCustomerId = customerId;
    let targetRequest: any = null;

    if (requestId) {
      targetRequest = await prisma.profileCorrectionRequest.findUnique({
        where: { requestId },
      });

      if (!targetRequest) {
        return NextResponse.json(
          { success: false, error: `Correction request with ID "${requestId}" not found.` },
          { status: 404 }
        );
      }

      targetCustomerId = targetRequest.customerId;
    }

    if (!targetCustomerId) {
      return NextResponse.json(
        { success: false, error: "Associated customer could not be determined." },
        { status: 404 }
      );
    }

    // Fetch the complete customer dossier with all existing relational records
    const customer = await prisma.customer.findUnique({
      where: { id: targetCustomerId },
      select: {
        id: true,
        name: true,
        phone: true,
        username: true,
        createdAt: true,
        visits: true,
        purchasesCount: true,
        totalSpent: true,
        trustLevel: true,
        savings: true,
        notes: true,
        rewardPoints: true,
        outstandingAmount: true,
        favoriteBrand: true,
        averageBill: true,
        address: true,
        city: true,
        // Exclude password and activation tokens for data security
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            fuelType: true,
            plateNumber: true,
            tyreInstalled: true,
            installDate: true,
            mileage: true,
            warrantyExpiry: true,
            nextReplacement: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            date: true,
            subTotal: true,
            gstAmount: true,
            discountApplied: true,
            netTotal: true,
            gstin: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                name: true,
                brand: true,
                quantity: true,
                price: true,
                hsnCode: true,
                gstRate: true,
                total: true,
              },
            },
            payments: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                transactionId: true,
                createdAt: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
        jobCards: {
          select: {
            id: true,
            jobId: true,
            vehicleModel: true,
            vehicleNumber: true,
            services: true,
            mechanic: true,
            bay: true,
            status: true,
            estimatedFinish: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        appointments: {
          select: {
            id: true,
            vehicleNumber: true,
            serviceType: true,
            date: true,
            timeSlot: true,
            status: true,
            mechanicName: true,
            timeTaken: true,
            createdAt: true,
          },
          orderBy: { date: "desc" },
        },
        correctionRequests: {
          select: {
            id: true,
            requestId: true,
            field: true,
            currentValue: true,
            requestedValue: true,
            reason: true,
            status: true,
            adminNote: true,
            reviewedBy: true,
            reviewedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer record not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: targetRequest,
      customer,
    });
  } catch (error: any) {
    console.error("[OWNER FULL CUSTOMER PROFILE GET ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load full customer profile." },
      { status: 500 }
    );
  }
}
