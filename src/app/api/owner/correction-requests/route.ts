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

// GET: Retrieve all customer profile correction requests
export async function GET(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required." },
        { status: 403 }
      );
    }

    const requests = await prisma.profileCorrectionRequest.findMany({
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
            totalSpent: true,
            vehicles: {
              select: {
                id: true,
                brand: true,
                model: true,
                plateNumber: true,
              },
            },
            invoices: {
              select: {
                id: true,
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

    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const approvedCount = requests.filter((r) => r.status === "Approved").length;
    const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

    return NextResponse.json({
      success: true,
      requests,
      counts: {
        total: requests.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error: any) {
    console.error("[OWNER CORRECTION REQUESTS GET ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve correction requests." },
      { status: 500 }
    );
  }
}
