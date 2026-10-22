import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Helper to authenticate owner authorization
async function verifyOwner(req: Request) {
  const ownerUsername =
    req.headers.get("x-owner-username") ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    "";

  if (!ownerUsername) return null;

  const owner = await prisma.owner.findUnique({
    where: { username: ownerUsername },
  });

  return owner;
}

export async function GET(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required." },
        { status: 403 }
      );
    }

    const requests = await prisma.accountRecoveryRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            username: true,
            visits: true,
            trustLevel: true,
            vehicles: {
              select: {
                brand: true,
                model: true,
                plateNumber: true,
              },
            },
            invoices: {
              select: {
                invoiceNumber: true,
                date: true,
                netTotal: true,
              },
              take: 3,
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error: any) {
    console.error("[OWNER RECOVERY REQUESTS GET ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve recovery requests." },
      { status: 500 }
    );
  }
}
