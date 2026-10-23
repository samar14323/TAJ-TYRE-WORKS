import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { TyreCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

/**
 * Helper to authenticate owner authorization
 */
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

/**
 * GET /api/owner/inventory
 * Retrieves complete inventory catalogue with physical stock, purchase costs, and statuses.
 */
export async function GET(req: Request) {
  try {
    const owner = await verifyOwner(req);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Owner clearance required." },
        { status: 403 }
      );
    }

    // 1. Fetch all catalogue products with their physical inventory
    const catalogueItems = await prisma.tyreCatalogue.findMany({
      include: {
        tyres: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: [
        { brand: "asc" },
        { size: "asc" },
        { pattern: "asc" },
      ],
    });

    // 2. Fetch any standalone Tyres that are not linked to a catalogue entry
    const standaloneTyres = await prisma.tyre.findMany({
      where: {
        catalogueId: null,
      },
      include: {
        supplier: true,
      },
    });

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    // Format products for Owner Inventory UI
    const products: any[] = [];

    // Add catalogue items
    for (const item of catalogueItems) {
      const hasInventory = item.tyres.length > 0;
      const primaryTyre = hasInventory ? item.tyres[0] : null;
      const quantity = hasInventory ? item.tyres.reduce((s, t) => s + (t.quantity || 0), 0) : 0;

      let status: "Catalogue Only" | "In Stock" | "Out of Stock";
      if (!hasInventory) {
        status = "Catalogue Only";
      } else if (quantity > 0) {
        status = "In Stock";
      } else {
        status = "Out of Stock";
      }

      products.push({
        id: primaryTyre ? primaryTyre.id : `cat-${item.id}`,
        catalogueId: item.id,
        isCatalogueOnly: !hasInventory,
        status,
        sku: item.sku,
        brand: item.brand,
        name: item.pattern,
        pattern: item.pattern,
        size: item.size,
        category: item.category,
        position: item.position,
        isPositionConfirmed: item.isPositionConfirmed,
        description: item.description || "",
        warranty: primaryTyre?.warranty || item.warranty || "5 Years",
        imageUrl: primaryTyre?.imageUrl || item.imageUrl || null,
        grip: item.grip,
        noise: item.noise,
        durability: item.durability,

        // Inventory pricing and physical stock
        quantity,
        purchasePrice: primaryTyre?.purchasePrice || 0,
        sellingPrice: primaryTyre?.sellingPrice || 0,
        mrp: primaryTyre?.mrp || 0,
        location: primaryTyre?.location || "Unassigned",
        supplier: primaryTyre?.supplier?.name || "Not Assigned",
        supplierId: primaryTyre?.supplierId || null,
        barcode: primaryTyre?.barcode || "",
        qrCode: primaryTyre?.qrCode || "",
        dateAdded: primaryTyre?.dateAdded ? primaryTyre.dateAdded.toISOString().split("T")[0] : "",
      });
    }

    // Add standalone tyres (e.g. historical records)
    for (const t of standaloneTyres) {
      products.push({
        id: t.id,
        catalogueId: null,
        isCatalogueOnly: false,
        status: t.quantity > 0 ? "In Stock" : "Out of Stock",
        sku: `LEGACY-${t.id.slice(0, 8)}`,
        brand: t.brand,
        name: t.name,
        pattern: t.name,
        size: t.size,
        category: t.category.replace(/_/g, " "),
        position: t.position || "Standard",
        isPositionConfirmed: true,
        description: t.description || "",
        warranty: t.warranty || "5 Years",
        imageUrl: t.imageUrl || null,
        quantity: t.quantity,
        purchasePrice: t.purchasePrice,
        sellingPrice: t.sellingPrice,
        mrp: t.mrp,
        location: t.location,
        supplier: t.supplier?.name || "Direct Supplier",
        supplierId: t.supplierId,
        barcode: t.barcode,
        qrCode: t.qrCode,
        dateAdded: t.dateAdded ? t.dateAdded.toISOString().split("T")[0] : "",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        products,
        suppliers,
      },
    });
  } catch (error: any) {
    console.error("GET /api/owner/inventory error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory records." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/owner/inventory
 * Handles inventory modifications: adding catalogue product to stock, updating quantities, or creating custom products.
 */
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
    const { action, payload } = body;

    // Resolve default supplier if needed
    let defaultSupplier = await prisma.supplier.findFirst();
    if (!defaultSupplier) {
      defaultSupplier = await prisma.supplier.create({
        data: {
          name: "Authorized Tyre Distributor",
          contactPerson: "Warehouse Manager",
          phone: "+91 9199936181",
          email: "distributor@tajtyreworks.com",
        },
      });
    }

    switch (action) {
      // 1. Safe addition of Catalogue Product to Physical Inventory (without duplicate records)
      case "INITIALIZE_INVENTORY": {
        const { catalogueId, quantity, purchasePrice, sellingPrice, mrp, location, supplierId } = payload;
        if (!catalogueId) {
          return NextResponse.json({ success: false, error: "Catalogue ID is required." }, { status: 400 });
        }

        const cat = await prisma.tyreCatalogue.findUnique({
          where: { id: catalogueId },
        });

        if (!cat) {
          return NextResponse.json({ success: false, error: "Catalogue item not found." }, { status: 404 });
        }

        // Map category to enum
        let catEnum: TyreCategory = TyreCategory.Car_Tyres;
        if (cat.category.toLowerCase().includes("bike")) catEnum = TyreCategory.Bike_Tyres;
        else if (cat.category.toLowerCase().includes("scoot")) catEnum = TyreCategory.Bike_Tyres;
        else if (cat.category.toLowerCase().includes("truck")) catEnum = TyreCategory.Truck_Tyres;

        // Check if Tyre already exists for this catalogueId (idempotent upsert)
        const existingTyre = await prisma.tyre.findFirst({
          where: { catalogueId },
        });

        let savedTyre;
        if (existingTyre) {
          savedTyre = await prisma.tyre.update({
            where: { id: existingTyre.id },
            data: {
              quantity: Number(quantity) || 0,
              purchasePrice: Number(purchasePrice) || 0,
              sellingPrice: Number(sellingPrice) || 0,
              mrp: Number(mrp) || Number(sellingPrice) || 0,
              location: location || "Main Warehouse",
              supplierId: supplierId || existingTyre.supplierId,
              position: cat.position,
            },
          });
        } else {
          // Generate unique barcode & qr
          const barcode = `890${Math.floor(1000000 + Math.random() * 9000000)}`;
          savedTyre = await prisma.tyre.create({
            data: {
              brand: cat.brand,
              name: cat.pattern,
              category: catEnum,
              size: cat.size,
              mrp: Number(mrp) || Number(sellingPrice) || 0,
              purchasePrice: Number(purchasePrice) || 0,
              sellingPrice: Number(sellingPrice) || 0,
              quantity: Number(quantity) || 0,
              location: location || "Main Warehouse",
              barcode,
              qrCode: `qr-${barcode}`,
              description: cat.description,
              warranty: cat.warranty,
              position: cat.position,
              supplierId: supplierId || defaultSupplier.id,
              catalogueId: cat.id,
            },
          });
        }

        return NextResponse.json({
          success: true,
          message: `Physical inventory initialized for ${cat.brand} ${cat.pattern} (${cat.size}).`,
          data: savedTyre,
        });
      }

      // 2. Update existing inventory record
      case "UPDATE_INVENTORY": {
        const { tyreId, quantity, purchasePrice, sellingPrice, mrp, location, supplierId, warranty } = payload;
        if (!tyreId) {
          return NextResponse.json({ success: false, error: "Tyre ID is required." }, { status: 400 });
        }

        const updated = await prisma.tyre.update({
          where: { id: tyreId },
          data: {
            quantity: Number(quantity),
            purchasePrice: Number(purchasePrice),
            sellingPrice: Number(sellingPrice),
            mrp: Number(mrp),
            location: location || undefined,
            supplierId: supplierId || undefined,
            warranty: warranty || undefined,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Inventory details updated successfully.",
          data: updated,
        });
      }

      // 3. Create brand-new custom product in Catalogue AND Inventory
      case "CREATE_PRODUCT": {
        const { brand, name, size, category, position, quantity, purchasePrice, sellingPrice, mrp, location, supplierId, description, warranty } = payload;

        if (!brand || !name || !size) {
          return NextResponse.json({ success: false, error: "Brand, Name, and Tyre Size are required." }, { status: 400 });
        }

        // Generate clean stable SKU
        const cleanBrand = brand.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        const cleanPattern = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
        const cleanSize = size.trim().replace(/[^A-Z0-9]/gi, "");
        const cleanPos = (position || "FR").slice(0, 2).toUpperCase();
        const sku = `${cleanBrand}-${cleanPattern}-${cleanSize}-${cleanPos}-${Date.now().toString().slice(-4)}`;

        // Map category
        let normCat = "Bike";
        let catEnum: TyreCategory = TyreCategory.Bike_Tyres;
        const catLower = (category || "").toLowerCase();
        if (catLower.includes("car")) {
          normCat = "Car";
          catEnum = TyreCategory.Car_Tyres;
        } else if (catLower.includes("scoot")) {
          normCat = "Scooty";
          catEnum = TyreCategory.Bike_Tyres;
        } else if (catLower.includes("truck")) {
          normCat = "Truck";
          catEnum = TyreCategory.Truck_Tyres;
        }

        // 1. Create in TyreCatalogue
        const catalogueEntry = await prisma.tyreCatalogue.create({
          data: {
            sku,
            brand: brand.trim(),
            pattern: name.trim(),
            size: size.trim(),
            category: normCat,
            position: position || "Front / Rear",
            isPositionConfirmed: true,
            description: description || `${brand} ${name} tyre in size ${size}.`,
            warranty: warranty || "5 Years",
          },
        });

        // 2. Create in Tyre (physical inventory)
        const barcode = `890${Math.floor(1000000 + Math.random() * 9000000)}`;
        const inventoryEntry = await prisma.tyre.create({
          data: {
            brand: brand.trim(),
            name: name.trim(),
            category: catEnum,
            size: size.trim(),
            mrp: Number(mrp) || Number(sellingPrice) || 0,
            purchasePrice: Number(purchasePrice) || 0,
            sellingPrice: Number(sellingPrice) || 0,
            quantity: Number(quantity) || 0,
            location: location || "Main Warehouse",
            barcode,
            qrCode: `qr-${barcode}`,
            description: description || null,
            warranty: warranty || "5 Years",
            position: position || "Front / Rear",
            supplierId: supplierId || defaultSupplier.id,
            catalogueId: catalogueEntry.id,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Created product ${brand} ${name} (${size}) in Catalogue and Inventory.`,
          data: {
            catalogue: catalogueEntry,
            inventory: inventoryEntry,
          },
        });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST /api/owner/inventory error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process inventory action." },
      { status: 500 }
    );
  }
}
