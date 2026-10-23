import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/catalogue
 * Publicly accessible shared catalogue endpoint for Showroom & Customer Portal.
 * Returns shared database-backed tyre catalogue with verified stock availability.
 * Never exposes owner-only purchase costs, suppliers, or internal notes.
 */
export async function GET() {
  try {
    const catalogueItems = await prisma.tyreCatalogue.findMany({
      include: {
        tyres: {
          select: {
            id: true,
            quantity: true,
            sellingPrice: true,
            mrp: true,
            location: true,
            barcode: true,
          },
        },
      },
      orderBy: [
        { brand: "asc" },
        { size: "asc" },
        { pattern: "asc" },
      ],
    });

    const sanitized = catalogueItems.map((item) => {
      const totalQuantity = item.tyres.reduce((sum, t) => sum + (t.quantity || 0), 0);
      const hasInventory = item.tyres.length > 0;
      
      let stockStatus: "Catalogue Only" | "In Stock" | "Out of Stock";
      if (!hasInventory) {
        stockStatus = "Catalogue Only";
      } else if (totalQuantity > 0) {
        stockStatus = "In Stock";
      } else {
        stockStatus = "Out of Stock";
      }

      return {
        id: item.id,
        sku: item.sku,
        brand: item.brand,
        pattern: item.pattern,
        size: item.size,
        category: item.category,
        position: item.position,
        isPositionConfirmed: item.isPositionConfirmed,
        description: item.description || `${item.brand} ${item.pattern} in size ${item.size}.`,
        warranty: item.warranty || "5 Years",
        imageUrl: item.imageUrl || null,
        grip: item.grip || "High",
        noise: item.noise || "Low",
        durability: item.durability || "High",
        
        // Stock Status based on physical database inventory
        hasInventoryRecord: hasInventory,
        stockStatus,
        inStock: totalQuantity > 0,
        physicalQuantity: hasInventory ? totalQuantity : 0,

        // Customer portal selling price if initialized, hidden on public showroom
        sellingPrice: hasInventory && item.tyres[0]?.sellingPrice ? item.tyres[0].sellingPrice : null,
        mrp: hasInventory && item.tyres[0]?.mrp ? item.tyres[0].mrp : null,
      };
    });

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (error: any) {
    console.error("GET /api/catalogue error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load tyre catalogue" },
      { status: 500 }
    );
  }
}
