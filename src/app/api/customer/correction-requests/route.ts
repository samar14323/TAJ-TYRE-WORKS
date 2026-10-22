import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { normalizePhoneNumber, normalizeVehicleNumber } from "@/lib/correctionValidation";
import { CorrectionField } from "@prisma/client";

async function verifyCustomer(req: Request) {
  const customerId = req.headers.get("x-customer-id")?.trim();
  const phone = req.headers.get("x-customer-phone")?.trim();
  const username = req.headers.get("x-customer-username")?.trim();

  if (!customerId && !phone && !username) {
    return null;
  }

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        customerId ? { id: customerId } : undefined,
        phone ? { phone } : undefined,
        username ? { username: { equals: username, mode: "insensitive" } } : undefined,
      ].filter(Boolean) as any,
    },
    include: {
      vehicles: true,
    },
  });

  return customer;
}

// GET: Fetch customer's own correction requests
export async function GET(req: Request) {
  try {
    const customer = await verifyCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to your customer account." },
        { status: 401 }
      );
    }

    const requests = await prisma.profileCorrectionRequest.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      requests,
      currentProfile: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        username: customer.username,
        vehicles: customer.vehicles.map((v) => ({
          id: v.id,
          model: v.model,
          plateNumber: v.plateNumber,
        })),
      },
    });
  } catch (error: any) {
    console.error("[CUSTOMER CORRECTION GET ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load correction requests." },
      { status: 500 }
    );
  }
}

// POST: Submit a new profile correction request
export async function POST(req: Request) {
  try {
    const customer = await verifyCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to your customer account." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const field = (body.field || "").trim().toUpperCase() as CorrectionField;
    const requestedRaw = (body.requestedValue || "").trim();
    const reason = (body.reason || "").trim();

    if (!field || !["MOBILE_NUMBER", "VEHICLE_NUMBER"].includes(field)) {
      return NextResponse.json(
        { success: false, error: "Field must be either MOBILE_NUMBER or VEHICLE_NUMBER." },
        { status: 400 }
      );
    }

    if (!requestedRaw) {
      return NextResponse.json(
        { success: false, error: "Requested new value is required." },
        { status: 400 }
      );
    }

    // Duplicate submission prevention: check for any existing Pending request for this field
    const existingPending = await prisma.profileCorrectionRequest.findFirst({
      where: {
        customerId: customer.id,
        field,
        status: "Pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error: `You already have a pending correction request (${existingPending.requestId}) for your ${
            field === "MOBILE_NUMBER" ? "Mobile Number" : "Vehicle Number"
          }. Please wait for owner review.`,
        },
        { status: 409 }
      );
    }

    let currentValue = "";
    let normalizedValue = "";

    if (field === "MOBILE_NUMBER") {
      const valResult = normalizePhoneNumber(requestedRaw);
      if (!valResult.isValid) {
        return NextResponse.json({ success: false, error: valResult.error }, { status: 400 });
      }
      normalizedValue = valResult.normalized;
      currentValue = customer.phone;

      if (normalizedValue === currentValue) {
        return NextResponse.json(
          { success: false, error: "The requested mobile number is already your current registered number." },
          { status: 400 }
        );
      }
    } else if (field === "VEHICLE_NUMBER") {
      const valResult = normalizeVehicleNumber(requestedRaw);
      if (!valResult.isValid) {
        return NextResponse.json({ success: false, error: valResult.error }, { status: 400 });
      }
      normalizedValue = valResult.normalized;
      currentValue = customer.vehicles[0]?.plateNumber || "Not registered";

      if (normalizedValue === currentValue) {
        return NextResponse.json(
          { success: false, error: "The requested vehicle plate number is already your current registered plate." },
          { status: 400 }
        );
      }
    }

    // Generate unique human-readable Request ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestId = `PCR-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    const request = await prisma.profileCorrectionRequest.create({
      data: {
        requestId,
        customerId: customer.id,
        field,
        currentValue,
        requestedValue: normalizedValue,
        reason: reason || null,
        status: "Pending",
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request.requestId,
      message: "Profile correction request submitted successfully for workshop owner review.",
      request,
    });
  } catch (error: any) {
    console.error("[CUSTOMER CORRECTION POST ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit correction request." },
      { status: 500 }
    );
  }
}
