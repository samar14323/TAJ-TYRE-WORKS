import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

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

export async function POST(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const requestId = (body.requestId || "").trim().toUpperCase();
    const action = (body.action || "").trim().toUpperCase(); // "APPROVE" or "REJECT"
    const adminNote = (body.adminNote || "").trim();

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required." },
        { status: 400 }
      );
    }

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Action must be APPROVE or REJECT." },
        { status: 400 }
      );
    }

    // Locate request
    const request = await prisma.accountRecoveryRequest.findUnique({
      where: { requestId },
      include: { customer: true },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Recovery request not found." },
        { status: 404 }
      );
    }

    if (request.status !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Request has already been processed with status "${request.status}".`,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "REJECT") {
      const updated = await prisma.accountRecoveryRequest.update({
        where: { id: request.id },
        data: {
          status: "Rejected",
          adminNote: adminNote || "Identity verification could not be confirmed by workshop.",
          reviewedBy: owner.username,
          reviewedAt: now,
        },
      });

      // Audit log
      try {
        await prisma.auditLog.create({
          data: {
            action: "REJECT_RECOVERY_REQUEST",
            entity: "AccountRecoveryRequest",
            entityId: request.id,
            ownerId: owner.id,
            oldValue: JSON.stringify({ status: "Pending" }),
            newValue: JSON.stringify({ status: "Rejected", adminNote }),
          },
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      console.log(`[OWNER ACTION] Rejected recovery request ${requestId} by ${owner.username}`);

      return NextResponse.json({
        success: true,
        message: "Recovery request has been rejected.",
        request: updated,
      });
    }

    // Processing APPROVAL
    if (request.type === "FORGOT_USERNAME") {
      // Must link to a customer with an active username
      if (!request.customer || !request.customer.username) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot approve username recovery: Customer does not have a username configured yet.",
          },
          { status: 400 }
        );
      }

      const updated = await prisma.accountRecoveryRequest.update({
        where: { id: request.id },
        data: {
          status: "Approved",
          adminNote: adminNote || "Customer identity verified by workshop management.",
          reviewedBy: owner.username,
          reviewedAt: now,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "APPROVE_RECOVERY_USERNAME",
            entity: "AccountRecoveryRequest",
            entityId: request.id,
            ownerId: owner.id,
            oldValue: JSON.stringify({ status: "Pending" }),
            newValue: JSON.stringify({ status: "Approved", verifiedCustomer: request.customer.name }),
          },
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      console.log(`[OWNER ACTION] Approved username recovery request ${requestId} for ${request.customer.name}`);

      return NextResponse.json({
        success: true,
        message: "Username recovery approved. The customer can now view their verified username.",
        request: updated,
        recoveredUsername: request.customer.username,
      });
    } else if (request.type === "FORGOT_PASSWORD") {
      if (!request.customer) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot approve password reset: No customer profile matches the registered mobile number.",
          },
          { status: 400 }
        );
      }

      // Generate single-use, 24-hour cryptographic reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const updated = await prisma.accountRecoveryRequest.update({
        where: { id: request.id },
        data: {
          status: "Approved",
          adminNote: adminNote || "Customer identity verified. Password reset authorized.",
          reviewedBy: owner.username,
          reviewedAt: now,
          resetToken,
          resetTokenExpiry,
          resetCompleted: false,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "APPROVE_RECOVERY_PASSWORD_RESET",
            entity: "AccountRecoveryRequest",
            entityId: request.id,
            ownerId: owner.id,
            oldValue: JSON.stringify({ status: "Pending" }),
            newValue: JSON.stringify({ status: "Approved", tokenExpiry: resetTokenExpiry.toISOString() }),
          },
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      console.log(`[OWNER ACTION] Approved password reset request ${requestId} for ${request.customer.name}. Reset token issued.`);

      return NextResponse.json({
        success: true,
        message: "Password reset authorized. Single-use reset token generated.",
        request: updated,
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}`,
      });
    } else if (request.type === "CHANGE_USERNAME") {
      if (!request.customer) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot approve username change: Customer record not found for this mobile number.",
          },
          { status: 400 }
        );
      }

      if (!request.desiredUsername) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot approve username change: Desired username is missing.",
          },
          { status: 400 }
        );
      }

      // Check if desired username is still available
      const [existingCust, existingOwner, existingEmp, existingDealer] = await Promise.all([
        prisma.customer.findFirst({
          where: {
            username: { equals: request.desiredUsername, mode: "insensitive" },
            NOT: { id: request.customerId! },
          },
        }),
        prisma.owner.findUnique({ where: { username: request.desiredUsername } }),
        prisma.employee.findUnique({ where: { username: request.desiredUsername } }),
        prisma.dealer.findUnique({ where: { username: request.desiredUsername } }),
      ]);

      if (existingCust || existingOwner || existingEmp || existingDealer) {
        return NextResponse.json(
          {
            success: false,
            error: `Desired username "${request.desiredUsername}" is already taken by another account.`,
          },
          { status: 409 }
        );
      }

      // Update customer username without duplicating record
      const oldUsername = request.customer.username;
      await prisma.customer.update({
        where: { id: request.customerId! },
        data: { username: request.desiredUsername },
      });

      const updated = await prisma.accountRecoveryRequest.update({
        where: { id: request.id },
        data: {
          status: "Approved",
          adminNote: adminNote || "Username change approved by management.",
          reviewedBy: owner.username,
          reviewedAt: now,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "APPROVE_RECOVERY_CHANGE_USERNAME",
            entity: "AccountRecoveryRequest",
            entityId: request.id,
            ownerId: owner.id,
            oldValue: JSON.stringify({ oldUsername }),
            newValue: JSON.stringify({ newUsername: request.desiredUsername }),
          },
        });
      } catch (e) {
        console.warn("Audit log notice:", e);
      }

      console.log(`[OWNER ACTION] Approved username change for customer ${request.customer.name} from "${oldUsername}" to "${request.desiredUsername}"`);

      return NextResponse.json({
        success: true,
        message: `Username successfully updated to "${request.desiredUsername}".`,
        request: updated,
        updatedUsername: request.desiredUsername,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown request type." }, { status: 400 });
  } catch (error: any) {
    console.error("[OWNER RECOVERY ACTION ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process recovery action." },
      { status: 500 }
    );
  }
}
