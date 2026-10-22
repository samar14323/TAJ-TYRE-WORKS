import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { normalizePhoneNumber, normalizeVehicleNumber } from "@/lib/correctionValidation";

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

    const request = await prisma.profileCorrectionRequest.findUnique({
      where: { requestId },
      include: {
        customer: {
          include: { vehicles: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Profile correction request not found." },
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

    // Handling REJECT
    if (action === "REJECT") {
      const updated = await prisma.profileCorrectionRequest.update({
        where: { id: request.id },
        data: {
          status: "Rejected",
          adminNote: adminNote || "Correction request rejected by workshop administrator.",
          reviewedBy: owner.username,
          reviewedAt: now,
        },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            action: "REJECT_PROFILE_CORRECTION",
            entity: "ProfileCorrectionRequest",
            entityId: request.id,
            ownerId: owner.id,
            oldValue: JSON.stringify({
              status: "Pending",
              field: request.field,
              currentValue: request.currentValue,
              requestedValue: request.requestedValue,
            }),
            newValue: JSON.stringify({
              status: "Rejected",
              adminNote,
              reviewedBy: owner.username,
            }),
          },
        });
      } catch (e) {
        console.warn("Audit log creation error:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Profile correction request rejected. Customer profile was kept unchanged.",
        request: updated,
      });
    }

    // Handling APPROVE
    if (action === "APPROVE") {
      // 1. Conflict & normalization check for Mobile Number
      if (request.field === "MOBILE_NUMBER") {
        const norm = normalizePhoneNumber(request.requestedValue);
        if (!norm.isValid) {
          return NextResponse.json(
            { success: false, error: norm.error || "Requested mobile number is invalid." },
            { status: 400 }
          );
        }

        // Check if another customer already has this phone number
        const existingAccount = await prisma.customer.findFirst({
          where: {
            phone: norm.normalized,
            id: { not: request.customerId },
          },
        });

        if (existingAccount) {
          return NextResponse.json(
            {
              success: false,
              conflict: true,
              error: `Conflict detected: Mobile number "${norm.normalized}" is already registered to another customer (${existingAccount.name} - ${existingAccount.phone}). Overwriting is blocked to prevent accidental account takeover.`,
            },
            { status: 409 }
          );
        }

        // Apply via server-side database transaction
        const result = await prisma.$transaction(async (tx) => {
          // Update customer phone
          const updatedCustomer = await tx.customer.update({
            where: { id: request.customerId },
            data: { phone: norm.normalized },
          });

          // Update request record
          const updatedReq = await tx.profileCorrectionRequest.update({
            where: { id: request.id },
            data: {
              status: "Approved",
              adminNote: adminNote || "Approved by workshop administrator.",
              reviewedBy: owner.username,
              reviewedAt: now,
            },
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              action: "APPROVE_PROFILE_CORRECTION",
              entity: "Customer",
              entityId: request.customerId,
              ownerId: owner.id,
              oldValue: JSON.stringify({ field: "MOBILE_NUMBER", value: request.currentValue }),
              newValue: JSON.stringify({
                field: "MOBILE_NUMBER",
                value: norm.normalized,
                reviewedBy: owner.username,
                adminNote,
              }),
            },
          });

          return { updatedCustomer, updatedReq };
        });

        return NextResponse.json({
          success: true,
          message: `Profile mobile number updated successfully to "${norm.normalized}".`,
          request: result.updatedReq,
        });
      }

      // 2. Conflict & normalization check for Vehicle Number
      if (request.field === "VEHICLE_NUMBER") {
        const normVeh = normalizeVehicleNumber(request.requestedValue);
        if (!normVeh.isValid) {
          return NextResponse.json(
            { success: false, error: normVeh.error || "Requested vehicle number is invalid." },
            { status: 400 }
          );
        }

        // Check if another customer already owns this vehicle plate
        const existingVeh = await prisma.vehicle.findFirst({
          where: {
            plateNumber: { equals: normVeh.normalized, mode: "insensitive" },
            customerId: { not: request.customerId },
          },
          include: { customer: true },
        });

        if (existingVeh) {
          return NextResponse.json(
            {
              success: false,
              conflict: true,
              error: `Conflict detected: Vehicle plate "${normVeh.normalized}" is already registered to customer ${existingVeh.customer.name} (${existingVeh.customer.phone}). Cannot reassign across customers.`,
            },
            { status: 409 }
          );
        }

        // Apply via server-side database transaction
        const result = await prisma.$transaction(async (tx) => {
          const customerVehicles = await tx.vehicle.findMany({
            where: { customerId: request.customerId },
          });

          if (customerVehicles.length > 0) {
            // Update the customer's matching vehicle or first vehicle
            const targetVehicle =
              customerVehicles.find((v) => v.plateNumber === request.currentValue) ||
              customerVehicles[0];

            await tx.vehicle.update({
              where: { id: targetVehicle.id },
              data: { plateNumber: normVeh.normalized },
            });
          } else {
            // Customer had no vehicle record yet; create initial vehicle entry
            await tx.vehicle.create({
              data: {
                brand: "Vehicle",
                model: "Customer Vehicle",
                year: new Date().getFullYear(),
                fuelType: "Petrol",
                plateNumber: normVeh.normalized,
                customerId: request.customerId,
              },
            });
          }

          // Update request record
          const updatedReq = await tx.profileCorrectionRequest.update({
            where: { id: request.id },
            data: {
              status: "Approved",
              adminNote: adminNote || "Approved by workshop administrator.",
              reviewedBy: owner.username,
              reviewedAt: now,
            },
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              action: "APPROVE_PROFILE_CORRECTION",
              entity: "Vehicle",
              entityId: request.customerId,
              ownerId: owner.id,
              oldValue: JSON.stringify({ field: "VEHICLE_NUMBER", value: request.currentValue }),
              newValue: JSON.stringify({
                field: "VEHICLE_NUMBER",
                value: normVeh.normalized,
                reviewedBy: owner.username,
                adminNote,
              }),
            },
          });

          return { updatedReq };
        });

        return NextResponse.json({
          success: true,
          message: `Vehicle plate number updated successfully to "${normVeh.normalized}".`,
          request: result.updatedReq,
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid field requested." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[OWNER CORRECTION ACTION ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process correction action." },
      { status: 500 }
    );
  }
}
