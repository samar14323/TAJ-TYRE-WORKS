import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Default settings values fallback
export const DEFAULT_SETTINGS: Record<string, string> = {
  businessName: "TAJ TYRE WORKS",
  ownerName: "Mohammad Samar",
  workshopPhone: "+91 9199936181",
  workshopAddress: "Shop No. 4, Main Road, Delhi / NCR",
  workshopTimings: "09:00 AM – 09:00 PM (Daily)",
  activeServiceBays: "4 Bays (Fitting, Nitrogen, Alignment [Coming Soon], Balancing [Coming Soon])",
  defaultWarrantyPeriod: "5 Years (Standard Tyre Models)",
  defaultApplyGst: "true",
  autoSmsReceipts: "true",
  soundAlerts: "true",
  tyreGstRate: "28.0",
  serviceGstRate: "18.0",
};

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

// GET: Retrieve all shared business settings
export async function GET() {
  try {
    const records = await prisma.settings.findMany();
    
    // Map existing records to dictionary
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of records) {
      settingsMap[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    });
  } catch (error: any) {
    console.error("[SETTINGS GET API ERROR]:", error);
    // If database lookup fails temporarily, respond gracefully with defaults
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      fallback: true,
      error: error?.message,
    });
  }
}

// POST: Save/update business settings (Owner clearance required)
export async function POST(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required to modify workshop settings." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const newSettings: Record<string, any> = body.settings || body;

    if (!newSettings || typeof newSettings !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload." },
        { status: 400 }
      );
    }

    // Upsert each key in prisma
    const keys = Object.keys(newSettings);
    const upserts = keys.map((key) => {
      const valStr = String(newSettings[key]);
      return prisma.settings.upsert({
        where: { key },
        update: { value: valStr },
        create: {
          id: `setting-${key}`,
          key,
          value: valStr,
        },
      });
    });

    await prisma.$transaction(upserts);

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_WORKSHOP_SETTINGS",
          entity: "Settings",
          newValue: JSON.stringify(newSettings),
          ownerId: owner.id,
        },
      });
    } catch (auditErr) {
      console.warn("Could not log settings audit record:", auditErr);
    }

    // Fetch updated settings
    const records = await prisma.settings.findMany();
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const r of records) {
      settingsMap[r.key] = r.value;
    }

    return NextResponse.json({
      success: true,
      message: "Workshop settings updated and persisted to database successfully.",
      settings: settingsMap,
    });
  } catch (error: any) {
    console.error("[SETTINGS POST API ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to persist workshop settings." },
      { status: 500 }
    );
  }
}
