import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const phone = (body.phone || "").replace(/\D/g, "");
    const vehicleNumber = (body.vehicleNumber || "").trim().toUpperCase();

    // 1. Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!vehicleNumber || vehicleNumber.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid vehicle number / registration plate." },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate registrations using mobile number
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existingCustomer) {
      if (existingCustomer.password) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this mobile number is already registered. Please sign in with your username and password.",
            alreadyRegistered: true,
          },
          { status: 409 }
        );
      } else {
        // Customer exists from garage visits but hasn't activated an online account
        return NextResponse.json(
          {
            success: false,
            error:
              "This mobile number exists from a previous garage visit. To protect your data, please activate your existing account via invoice verification.",
            needsExistingActivation: true,
            phone,
          },
          { status: 409 }
        );
      }
    }

    // 3. Check if vehicle number already belongs to another registered customer
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plateNumber: vehicleNumber },
    });

    if (existingVehicle) {
      return NextResponse.json(
        {
          success: false,
          error: `Vehicle plate "${vehicleNumber}" is already registered in our system.`,
        },
        { status: 409 }
      );
    }

    // 4. Save Customer record in the database
    const newCustomer = await prisma.customer.create({
      data: {
        id: `c-${Date.now()}`,
        name,
        phone,
        trustLevel: "Bronze",
        vehicles: {
          create: {
            brand: vehicleNumber.split("-")[0] || "Standard",
            model: "Vehicle",
            year: new Date().getFullYear(),
            fuelType: "Petrol",
            plateNumber: vehicleNumber,
          },
        },
      },
    });

    // 5. Generate secure, single-use, time-limited Activation Token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.activationToken.create({
      data: {
        token,
        customerId: newCustomer.id,
        expiresAt,
        used: false,
      },
    });

    console.log(`[CUSTOMER SIGNUP] Created new customer "${name}" (${phone}) with vehicle "${vehicleNumber}". Activation token issued.`);

    return NextResponse.json({
      success: true,
      message: "Customer registration successful. Proceed to set up credentials.",
      token,
      customerId: newCustomer.id,
    });
  } catch (error: any) {
    console.error("[CUSTOMER SIGNUP ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to complete customer registration." },
      { status: 500 }
    );
  }
}
