import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimit";
import { RecoveryRequestType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const typeStr = (body.type || body.requestType || "").trim();
    const name = (body.name || body.fullName || "").trim();
    const phone = (body.phone || "").replace(/\D/g, "");
    const vehicleNumber = (body.vehicleNumber || "").trim().toUpperCase();
    const invoiceNumber = (body.invoiceNumber || "").trim().toUpperCase() || null;
    const desiredUsername = (body.desiredUsername || body.requestedUsername || "").trim() || null;
    const notes = (body.notes || body.reason || "").trim() || null;

    // 1. Rate limiting (max 3 submissions per IP/phone per 15 min)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rateLimitKey = `recovery_submit:${phone || ip}`;
    const limitCheck = checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000);

    if (limitCheck.isBlocked) {
      const waitMinutes = Math.ceil((limitCheck.waitSeconds || 60) / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many recovery requests submitted. Please wait ${waitMinutes} minute(s) before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate Request Type
    if (!["FORGOT_USERNAME", "FORGOT_PASSWORD", "CHANGE_USERNAME"].includes(typeStr)) {
      return NextResponse.json(
        { success: false, error: "Please select a valid recovery request type." },
        { status: 400 }
      );
    }
    const type = typeStr as RecoveryRequestType;

    // 3. Validate Required Fields
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide your registered full name." },
        { status: 400 }
      );
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!vehicleNumber || vehicleNumber.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please provide your registered vehicle registration number." },
        { status: 400 }
      );
    }

    // 4. Validate Desired Username if Request Type is CHANGE_USERNAME
    if (type === "CHANGE_USERNAME") {
      if (!desiredUsername || desiredUsername.length < 3 || desiredUsername.length > 30) {
        return NextResponse.json(
          { success: false, error: "Desired username must be between 3 and 30 characters in length." },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(desiredUsername)) {
        return NextResponse.json(
          { success: false, error: "Desired username can only contain letters, numbers, hyphens, and underscores." },
          { status: 400 }
        );
      }

      // Check if desired username is already taken
      const [existingCust, existingOwner, existingEmp, existingDealer] = await Promise.all([
        prisma.customer.findFirst({ where: { username: { equals: desiredUsername, mode: "insensitive" } } }),
        prisma.owner.findUnique({ where: { username: desiredUsername } }),
        prisma.employee.findUnique({ where: { username: desiredUsername } }),
        prisma.dealer.findUnique({ where: { username: desiredUsername } }),
      ]);

      if (existingCust || existingOwner || existingEmp || existingDealer) {
        return NextResponse.json(
          { success: false, error: `The username "${desiredUsername}" is already taken. Please choose another.` },
          { status: 409 }
        );
      }
    }

    // 5. Look up Customer in database by phone (if registered)
    const matchedCustomer = await prisma.customer.findUnique({
      where: { phone },
      include: { vehicles: true },
    });

    // 6. Generate formatted unique Request ID (e.g. REC-2026-89412)
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const requestId = `REC-${year}-${randomSuffix}`;

    // 7. Save Recovery Request in database
    const recoveryRequest = await prisma.accountRecoveryRequest.create({
      data: {
        requestId,
        type,
        status: "Pending",
        name,
        phone,
        vehicleNumber,
        invoiceNumber,
        desiredUsername,
        notes,
        customerId: matchedCustomer ? matchedCustomer.id : null,
      },
    });

    // 8. Record in Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "SUBMIT_RECOVERY_REQUEST",
          entity: "AccountRecoveryRequest",
          entityId: recoveryRequest.id,
          newValue: JSON.stringify({
            requestId,
            type,
            phoneMasked: `${phone.slice(0, 3)}****${phone.slice(7)}`,
            vehicleNumber,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log notice:", auditErr);
    }

    // Record rate limit attempt
    recordFailedAttempt(rateLimitKey, 3, 15 * 60 * 1000);

    console.log(`[RECOVERY SUBMIT] Created request ${requestId} (${type}) for customer "${name}" (${phone})`);

    // Return confirmation without revealing any credentials
    return NextResponse.json({
      success: true,
      requestId,
      type,
      message:
        "Your account recovery request has been submitted successfully and is pending owner verification. Please keep your Request ID for tracking.",
    });
  } catch (error: any) {
    console.error("[RECOVERY SUBMIT ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit recovery request." },
      { status: 500 }
    );
  }
}
