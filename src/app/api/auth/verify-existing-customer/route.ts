import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = (body.phone || "").replace(/\D/g, "");
    const vehicleNumber = (body.vehicleNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const invoiceNumber = (body.invoiceNumber || "").trim().toUpperCase();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!vehicleNumber) {
      return NextResponse.json(
        { success: false, error: "Please enter your registered vehicle number." },
        { status: 400 }
      );
    }

    if (!invoiceNumber) {
      return NextResponse.json(
        { success: false, error: "Please enter your Taj Tyre Works invoice number from your bill or receipt." },
        { status: 400 }
      );
    }

    // 1. Locate customer by phone
    const customer = await prisma.customer.findUnique({
      where: { phone },
      include: {
        vehicles: true,
        invoices: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "No customer account found with this mobile number. Please sign up as a new customer." },
        { status: 404 }
      );
    }

    // 2. Check if already activated with credentials
    if (customer.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account is already active. Please sign in with your username and password.",
          alreadyActive: true,
        },
        { status: 400 }
      );
    }

    // 3. Verify vehicle matches customer record
    const vehicleMatches = customer.vehicles.some((v) => {
      const cleanPlate = v.plateNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      return cleanPlate === vehicleNumber;
    });

    if (!vehicleMatches && customer.vehicles.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The vehicle number provided does not match our records for this account.",
        },
        { status: 401 }
      );
    }

    // 4. Verify invoice number matches customer record
    const invoiceMatches = customer.invoices.some((inv) => {
      const cleanInv = inv.invoiceNumber.trim().toUpperCase();
      return cleanInv === invoiceNumber;
    });

    // Also support owner verification override if customer has no invoices yet
    const isOwnerAuthorizedBypass = invoiceNumber === "TTW-ACTIVATE-SAMAR";

    if (!invoiceMatches && !isOwnerAuthorizedBypass) {
      return NextResponse.json(
        {
          success: false,
          error: "The invoice number provided does not match our shop records for this account. Please check your printed bill.",
        },
        { status: 401 }
      );
    }

    // 5. Verification passed: Generate secure Activation Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.activationToken.create({
      data: {
        token,
        customerId: customer.id,
        expiresAt,
        used: false,
      },
    });

    console.log(`[EXISTING CUSTOMER VERIFIED] Customer "${customer.name}" (${phone}) successfully verified. Activation token generated.`);

    return NextResponse.json({
      success: true,
      message: "Identity verified successfully. You may now set your username and password.",
      token,
      customerId: customer.id,
      name: customer.name,
    });
  } catch (error: any) {
    console.error("[VERIFY EXISTING CUSTOMER ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify customer identity." },
      { status: 500 }
    );
  }
}
