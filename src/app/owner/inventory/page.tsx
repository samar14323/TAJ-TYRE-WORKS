"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, Plus, Edit, Trash2, Search, CheckCircle2, 
  AlertTriangle, X, RefreshCw, Scan, QrCode, Download, Upload, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Filter, ArrowUpDown,
  PackagePlus, Check, HelpCircle
} from "lucide-react";
import { dbStore, Tyre } from "@/lib/store";

export interface OwnerProductItem {
  id: string;
  catalogueId: string | null;
  isCatalogueOnly: boolean;
  status: "Catalogue Only" | "In Stock" | "Out of Stock";
  sku: string;
  brand: string;
  name: string;
  pattern: string;
  size: string;
  category: string;
  position?: string;
  isPositionConfirmed?: boolean;
  description?: string;
  warranty?: string;
  imageUrl?: string | null;
  grip?: string;
  noise?: string;
  durability?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  location: string;
  supplier: string;
  supplierId?: string | null;
  barcode: string;
  qrCode: string;
  dateAdded: string;
}

export default function OwnerInventory() {
  const [products, setProducts] = useState<OwnerProductItem[]>([]);
  const [suppliersList, setSuppliersList] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals/Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInitStockOpen, setIsInitStockOpen] = useState(false);
  const [targetInitItem, setTargetInitItem] = useState<OwnerProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<OwnerProductItem | null>(null);

  // Filters, Sorting & Pagination State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStockFilter, setSelectedStockFilter] = useState("All"); // All, In Stock, Low Stock, Out of Stock, Catalogue Only
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");
  const [sortField, setSortField] = useState<"name" | "mrp" | "sellingPrice" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form Fields (For Custom Add or Edit)
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Bike Tyres");
  const [size, setSize] = useState("");
  const [position, setPosition] = useState("Rear");
  const [mrp, setMrp] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("Main Warehouse");
  const [supplier, setSupplier] = useState("MRF Regional Hub");
  const [description, setDescription] = useState("");
  const [warranty, setWarranty] = useState("5 Years");
  const [imageUrl, setImageUrl] = useState("");

  // Barcode Scanner Simulator State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mockScanTarget, setMockScanTarget] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState("");
  const [highlightedProductId, setHighlightedProductId] = useState("");

  const categoriesList = [
    "Car Tyres",
    "Bike Tyres",
    "Scooty Tyres",
    "Truck Tyres",
    "Tractor Tyres",
    "Tubes",
    "Wheels",
    "Accessories",
    "Batteries",
    "Nitrogen Services",
    "Wheel Alignment",
    "Wheel Balancing"
  ];

  // Helper to get owner username
  const getOwnerUsername = () => {
    if (typeof window === "undefined") return "MHDSAM";
    const sessionStr = localStorage.getItem("ttw_currentSession");
    if (sessionStr) {
      try {
        const sess = JSON.parse(sessionStr);
        if (sess.username) return sess.username;
      } catch {}
    }
    return localStorage.getItem("ttw_currentUsername") || "MHDSAM";
  };

  // Load inventory from database API
  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const username = getOwnerUsername();
      const res = await fetch("/api/owner/inventory", {
        headers: {
          "x-owner-username": username,
        },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data.products || []);
        if (json.data.suppliers) {
          setSuppliersList(json.data.suppliers);
        }
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to fetch /api/owner/inventory, falling back to local store:", e);
    }

    // Fallback to local store
    try {
      const localTyres = dbStore.getTyres();
      const mapped: OwnerProductItem[] = localTyres.map((t) => ({
        id: t.id,
        catalogueId: t.catalogueId || null,
        isCatalogueOnly: false,
        status: t.quantity > 0 ? "In Stock" : "Out of Stock",
        sku: t.catalogueSku || `SKU-${t.id.slice(0, 8)}`,
        brand: t.brand,
        name: t.name,
        pattern: t.name,
        size: t.size,
        category: t.category,
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
        supplier: t.supplier || "Distributor",
        barcode: t.barcode,
        qrCode: t.qrCode,
        dateAdded: t.dateAdded || "",
      }));
      setProducts(mapped);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Open "Initialize Stock" dialog for a Catalogue-Only product
  const handleOpenInitStock = (item: OwnerProductItem) => {
    setTargetInitItem(item);
    setBrand(item.brand);
    setName(item.pattern);
    setSize(item.size);
    setPosition(item.position || "Rear");
    setCategory(item.category.includes("Bike") ? "Bike Tyres" : item.category.includes("Scoot") ? "Scooty Tyres" : "Car Tyres");
    
    // Set sensible defaults for physical stock initialization
    setQuantity(10);
    setPurchasePrice(item.category.includes("Car") ? 3200 : 1650);
    setSellingPrice(item.category.includes("Car") ? 4100 : 2150);
    setMrp(item.category.includes("Car") ? 4500 : 2400);
    setLocation("Rack A1");
    setSupplier(suppliersList[0]?.name || "MRF Regional Hub");
    setWarranty(item.warranty || "5 Years");
    setDescription(item.description || "");
    setImageUrl(item.imageUrl || "");
    setIsInitStockOpen(true);
  };

  // Submit physical stock initialization
  const handleInitStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInitItem || !targetInitItem.catalogueId) return;

    try {
      const username = getOwnerUsername();
      const res = await fetch("/api/owner/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": username,
        },
        body: JSON.stringify({
          action: "INITIALIZE_INVENTORY",
          payload: {
            catalogueId: targetInitItem.catalogueId,
            quantity,
            purchasePrice,
            sellingPrice,
            mrp,
            location,
            supplierId: suppliersList.find((s) => s.name === supplier)?.id || undefined,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsInitStockOpen(false);
        setTargetInitItem(null);
        await loadInventory();
        // Also update local store for offline/invoice access
        if (json.data) {
          const currentTyres = dbStore.getTyres();
          const existingIndex = currentTyres.findIndex((t) => t.id === json.data.id || (t.catalogueId && t.catalogueId === json.data.catalogueId));
          if (existingIndex >= 0) {
            currentTyres[existingIndex] = { ...currentTyres[existingIndex], ...json.data };
          } else {
            currentTyres.push({
              id: json.data.id,
              brand: json.data.brand,
              name: json.data.name,
              category: json.data.category.replace(/_/g, " "),
              size: json.data.size,
              mrp: json.data.mrp,
              purchasePrice: json.data.purchasePrice,
              sellingPrice: json.data.sellingPrice,
              quantity: json.data.quantity,
              location: json.data.location,
              supplier,
              dateAdded: new Date().toISOString().split("T")[0],
              barcode: json.data.barcode,
              qrCode: json.data.qrCode,
              description: json.data.description,
              warranty: json.data.warranty,
              imageUrl: json.data.imageUrl,
              position: json.data.position,
              catalogueId: json.data.catalogueId,
            });
          }
          dbStore.saveTyres(currentTyres);
        }
      } else {
        alert(json.error || "Failed to initialize stock.");
      }
    } catch (e: any) {
      alert("Error saving stock initialization: " + e.message);
    }
  };

  // Submit brand-new custom product
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const username = getOwnerUsername();
      const res = await fetch("/api/owner/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": username,
        },
        body: JSON.stringify({
          action: "CREATE_PRODUCT",
          payload: {
            brand,
            name,
            size,
            category,
            position,
            quantity,
            purchasePrice,
            sellingPrice,
            mrp,
            location,
            supplierId: suppliersList.find((s) => s.name === supplier)?.id || undefined,
            description,
            warranty,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        resetFormFields();
        await loadInventory();
      } else {
        alert(json.error || "Failed to create product.");
      }
    } catch (e: any) {
      alert("Error creating product: " + e.message);
    }
  };

  // Open Edit Dialog
  const handleEditOpen = (product: OwnerProductItem) => {
    setEditingProduct(product);
    setBrand(product.brand);
    setName(product.name);
    setCategory(product.category);
    setSize(product.size);
    setPosition(product.position || "Rear");
    setMrp(product.mrp);
    setPurchasePrice(product.purchasePrice);
    setSellingPrice(product.sellingPrice);
    setQuantity(product.quantity);
    setLocation(product.location);
    setSupplier(product.supplier);
    setDescription(product.description || "");
    setWarranty(product.warranty || "5 Years");
    setImageUrl(product.imageUrl || "");
    setIsEditOpen(true);
  };

  // Submit Product Updates
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // If it was a catalogue-only product, route to initialize inventory
    if (editingProduct.isCatalogueOnly && editingProduct.catalogueId) {
      setTargetInitItem(editingProduct);
      await handleInitStockSubmit(e);
      setIsEditOpen(false);
      return;
    }

    try {
      const username = getOwnerUsername();
      const res = await fetch("/api/owner/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": username,
        },
        body: JSON.stringify({
          action: "UPDATE_INVENTORY",
          payload: {
            tyreId: editingProduct.id,
            quantity,
            purchasePrice,
            sellingPrice,
            mrp,
            location,
            supplierId: suppliersList.find((s) => s.name === supplier)?.id || undefined,
            warranty,
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsEditOpen(false);
        setEditingProduct(null);
        await loadInventory();
      } else {
        alert(json.error || "Failed to update product.");
      }
    } catch (e: any) {
      alert("Error updating product: " + e.message);
    }
  };

  // Delete inventory record
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or zero-out inventory for ${name}?`)) return;
    
    const updated = products.map((p) => p.id === id ? { ...p, quantity: 0, status: "Out of Stock" as const } : p);
    setProducts(updated);
    
    // Sync to dbStore
    const currentTyres = dbStore.getTyres();
    const filtered = currentTyres.map((t) => t.id === id ? { ...t, quantity: 0 } : t);
    dbStore.saveTyres(filtered);
  };

  const resetFormFields = () => {
    setBrand("");
    setName("");
    setSize("");
    setPosition("Rear");
    setMrp(0);
    setPurchasePrice(0);
    setSellingPrice(0);
    setQuantity(0);
    setLocation("Main Warehouse");
    setDescription("");
    setWarranty("5 Years");
    setImageUrl("");
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["SKU", "Brand", "Model", "Category", "Size", "Position", "Status", "Stock", "MRP", "PurchaseCost", "SellingPrice", "RackSlot", "Supplier", "Warranty"];
    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.brand}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.size}"`,
      `"${p.position || ""}"`,
      `"${p.status}"`,
      p.quantity,
      p.mrp,
      p.purchasePrice,
      p.sellingPrice,
      `"${p.location}"`,
      `"${p.supplier}"`,
      `"${p.warranty || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `ttw_catalogue_inventory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Barcode Scanner Simulator
  const triggerMockScan = () => {
    if (!mockScanTarget) return;
    setScannedFeedback("Scanning barcode...");
    setTimeout(() => {
      const found = products.find((t) => t.id === mockScanTarget || t.sku === mockScanTarget || t.barcode === mockScanTarget);
      if (found) {
        setScannedFeedback(`MATCH: ${found.brand} ${found.name} (${found.size}) - ${found.status}`);
        setHighlightedProductId(found.id);
        setTimeout(() => {
          setIsScannerOpen(false);
          setScannedFeedback("");
          const element = document.getElementById(`row-${found.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 1500);
      } else {
        setScannedFeedback("Error: Product barcode not found.");
      }
    }, 800);
  };

  // Sorting Handler
  const requestSort = (field: typeof sortField) => {
    let order: typeof sortOrder = "asc";
    if (sortField === field && sortOrder === "asc") {
      order = "desc";
    }
    setSortField(field);
    setSortOrder(order);
  };

  // Filtered & Sorted Products
  const filteredProducts = products
    .filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.brand.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      
      const matchesCategory = selectedCategoryFilter === "All" || p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase().replace(/ tyres/g, ""));
      const matchesBrand = selectedBrandFilter === "All" || p.brand.toLowerCase() === selectedBrandFilter.toLowerCase();
      
      let matchesStock = true;
      if (selectedStockFilter === "In Stock") {
        matchesStock = p.status === "In Stock" && p.quantity > 0;
      } else if (selectedStockFilter === "Low Stock") {
        matchesStock = p.status === "In Stock" && p.quantity > 0 && p.quantity < 5;
      } else if (selectedStockFilter === "Out of Stock") {
        matchesStock = p.status === "Out of Stock" || (!p.isCatalogueOnly && p.quantity === 0);
      } else if (selectedStockFilter === "Catalogue Only") {
        matchesStock = p.isCatalogueOnly || p.status === "Catalogue Only";
      }

      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryFilter, selectedBrandFilter, selectedStockFilter]);

  // KPI Counts
  const totalCatalogCount = products.length;
  const inStockCount = products.filter((p) => p.status === "In Stock" && p.quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock" || (!p.isCatalogueOnly && p.quantity === 0)).length;
  const catalogueOnlyCount = products.filter((p) => p.isCatalogueOnly || p.status === "Catalogue Only").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-cyber-gray-dark/30 border border-white/5 p-6 rounded-2xl">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            DATABASE POWERED CMS &bull; SHARED MASTER CATALOGUE
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500 animate-pulse" />
            Inventory & Showroom Catalogue Manager
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Unified single source of truth: MRF & CEAT master catalogue synchronized across Owner Inventory and Customer Showroom in PostgreSQL.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Barcode scanner */}
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setMockScanTarget("");
              setScannedFeedback("");
            }}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <Scan className="w-3.5 h-3.5 text-amber-500" />
            Scan Barcode
          </button>

          {/* Add Custom Product */}
          <button
            onClick={() => {
              resetFormFields();
              setIsAddOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <Plus className="w-4 h-4" />
            Add Custom Tyre
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[10px] font-mono text-white/40 uppercase block">Total Catalogue SKUs</span>
          <span className="text-2xl font-mono font-bold text-white mt-1 block">{totalCatalogCount}</span>
          <span className="text-[10px] text-white/40 mt-0.5 block">MRF, CEAT & Custom</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-mono text-emerald-400 uppercase block">Physically In Stock</span>
          <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">{inStockCount}</span>
          <span className="text-[10px] text-emerald-400/70 mt-0.5 block">Active warehouse units</span>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] font-mono text-rose-400 uppercase block">Out of Stock</span>
          <span className="text-2xl font-mono font-bold text-rose-400 mt-1 block">{outOfStockCount}</span>
          <span className="text-[10px] text-rose-400/70 mt-0.5 block">Quantity = 0 units</span>
        </div>

        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
          <span className="text-[10px] font-mono text-sky-400 uppercase block">Catalogue Only</span>
          <span className="text-2xl font-mono font-bold text-sky-400 mt-1 block">{catalogueOnlyCount}</span>
          <span className="text-[10px] text-sky-400/70 mt-0.5 block">Ready for physical stock setup</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-cyber-gray-dark/40 border border-white/5 p-4 rounded-xl items-center">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by brand, size (e.g. 80/100-18), SKU, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition font-mono"
          />
        </div>

        {/* Brand Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Brands</option>
            <option value="MRF">MRF Tyres</option>
            <option value="CEAT">CEAT Tyres</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Categories</option>
            <option value="Bike">Bike Tyres</option>
            <option value="Scooty">Scooty Tyres</option>
            <option value="Car">Car Tyres</option>
            <option value="Truck">Truck Tyres</option>
          </select>
        </div>

        {/* Stock Filter */}
        <div className="md:col-span-2">
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock (&gt; 0)</option>
            <option value="Low Stock">Low Stock (&lt; 5)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
            <option value="Catalogue Only">Catalogue Only</option>
          </select>
        </div>

        {/* Reset button */}
        <div className="md:col-span-1 text-center">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategoryFilter("All");
              setSelectedBrandFilter("All");
              setSelectedStockFilter("All");
            }}
            className="p-2 text-white/50 hover:text-amber-500 transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Main Inventory & Catalogue Table */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-cyber-gray-dark border-b border-white/5 text-white/50 font-mono">
                <th className="p-4 w-16">Preview</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition" onClick={() => requestSort("name")}>
                  Product & SKU <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">Size & Fitment</th>
                <th className="p-4">Inventory Status</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-right" onClick={() => requestSort("mrp")}>
                  MRP (₹) <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4 text-right">Purchase (₹)</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-right" onClick={() => requestSort("sellingPrice")}>
                  Selling (₹) <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-center" onClick={() => requestSort("quantity")}>
                  Physical Stock <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Shelf Slot</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => {
                const isHighlight = p.id === highlightedProductId;
                return (
                  <tr 
                    key={p.id}
                    id={`row-${p.id}`}
                    className={`border-b border-white/5 transition duration-200 hover:bg-white/5 ${
                      isHighlight
                        ? "bg-amber-500/15 border-amber-500/40"
                        : p.status === "Catalogue Only"
                        ? "bg-sky-950/10"
                        : p.quantity === 0
                        ? "bg-rose-950/10"
                        : ""
                    }`}
                  >
                    <td className="p-4">
                      {p.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                          <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-lg border text-[9px] font-mono font-bold flex items-center justify-center ${
                          p.brand === "MRF" ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-sky-500/30 bg-sky-500/10 text-sky-400"
                        }`}>
                          {p.brand}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          p.brand === "MRF" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                        }`}>
                          {p.brand}
                        </span>
                        <span className="font-bold text-white text-sm">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                        SKU: {p.sku}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-white/70">
                      {p.category}
                    </td>

                    <td className="p-4 font-mono font-semibold">
                      <span className="text-amber-400 font-bold block">{p.size}</span>
                      {p.position && (
                        <span className={`text-[9px] font-mono uppercase inline-block mt-0.5 px-1 rounded border ${
                          !p.isPositionConfirmed
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : p.position === "Front"
                            ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {p.position} {!p.isPositionConfirmed ? "(*)" : ""}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {p.status === "In Stock" ? (
                        <span className="inline-flex items-center gap-1 font-mono uppercase font-bold text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <Check className="w-2.5 h-2.5" /> In Stock ({p.quantity})
                        </span>
                      ) : p.status === "Out of Stock" ? (
                        <span className="inline-flex items-center gap-1 font-mono uppercase font-bold text-[9px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400">
                          <AlertTriangle className="w-2.5 h-2.5" /> Out of Stock (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono uppercase font-bold text-[9px] px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                          <HelpCircle className="w-2.5 h-2.5" /> Catalogue Only
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right font-mono">
                      {p.isCatalogueOnly ? <span className="text-white/20">-</span> : `₹${p.mrp.toLocaleString()}`}
                    </td>

                    <td className="p-4 text-right font-mono text-white/50">
                      {p.isCatalogueOnly ? <span className="text-white/20">-</span> : `₹${p.purchasePrice.toLocaleString()}`}
                    </td>

                    <td className="p-4 text-right font-mono text-amber-500 font-bold">
                      {p.isCatalogueOnly ? <span className="text-white/20">-</span> : `₹${p.sellingPrice.toLocaleString()}`}
                    </td>

                    <td className="p-4 text-center">
                      {p.isCatalogueOnly ? (
                        <span className="text-[10px] font-mono text-white/30 italic">Not Stocked</span>
                      ) : (
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          p.quantity === 0
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : p.quantity < 5
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse font-extrabold"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        }`}>
                          {p.quantity}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-white/60">
                      {p.isCatalogueOnly ? <span className="text-white/20">-</span> : p.location}
                    </td>

                    <td className="p-4 text-center">
                      {p.isCatalogueOnly ? (
                        <button
                          onClick={() => handleOpenInitStock(p)}
                          className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-mono text-[10px] uppercase font-bold transition flex items-center gap-1 mx-auto"
                          title="Initialize physical stock for this tyre"
                        >
                          <PackagePlus className="w-3 h-3" />
                          Stock This Tyre
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditOpen(p)}
                            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-amber-500/30 hover:text-amber-500 transition"
                            title="Edit Stock & Pricing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, `${p.brand} ${p.name}`)}
                            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-rose-500/30 hover:text-rose-400 transition"
                            title="Zero Out / Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-white/30 italic">
                    {isLoading ? "Loading shared inventory catalogue..." : "No products matching current filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-cyber-gray-dark/50 border-t border-white/5 p-4 flex items-center justify-between">
          <div className="text-xs text-white/40 font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} SKUs
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white transition outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-white/80 px-3">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white transition outline-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Modal: Initialize Physical Stock for a Catalogue-Only Tyre */}
      {isInitStockOpen && targetInitItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-sky-500/40 p-6 sm:p-8 rounded-2xl max-w-lg w-full relative my-8 shadow-2xl">
            <button 
              onClick={() => {
                setIsInitStockOpen(false);
                setTargetInitItem(null);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest block mb-1">
              PHYSICAL INVENTORY INITIALIZATION
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-sky-400" />
              Stock {targetInitItem.brand} {targetInitItem.pattern}
            </h3>

            {/* Readonly product spec badge */}
            <div className="my-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono grid grid-cols-2 gap-2 text-white/70">
              <div>
                <span className="text-white/40 block text-[9px] uppercase">SKU:</span>
                <span className="font-bold text-white">{targetInitItem.sku}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase">Size & Fitment:</span>
                <span className="font-bold text-amber-400">{targetInitItem.size} [{targetInitItem.position || "Fitment"}]</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase">Category:</span>
                <span>{targetInitItem.category}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[9px] uppercase">Warranty:</span>
                <span>{targetInitItem.warranty || "5 Years"}</span>
              </div>
            </div>

            <form onSubmit={handleInitStockSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">MRP (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Rack / Shelf Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Shelf A3"
                    className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-white/50">Supplier Distributor</label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-sky-500 rounded-lg py-2 px-3 text-white outline-none transition"
                >
                  {suppliersList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  {suppliersList.length === 0 && <option value="Authorized Tyre Distributor">Authorized Tyre Distributor</option>}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-black font-extrabold uppercase tracking-wider transition shadow-lg shadow-sky-500/20"
                >
                  Confirm & Initialize Physical Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Existing Product */}
      {isEditOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-xl w-full relative my-8">
            <button 
              onClick={() => {
                setIsEditOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              EDIT INVENTORY & PRICING
            </span>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct.brand} {editingProduct.name} ({editingProduct.size})
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Physical Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">MRP (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Shelf Slot</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Warranty Spec</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider transition mt-2"
              >
                Save Updated Product Details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Brand-New Custom Tyre */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-xl w-full relative my-8">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              NEW MASTER CATALOGUE & INVENTORY PRODUCT
            </span>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Add Tyre Product
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MRF, CEAT"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Tread Pattern / Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zapper FS, Milaze"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Tyre Size</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 80/100-18"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Fitment Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  >
                    <option value="Front">Front</option>
                    <option value="Rear">Rear</option>
                    <option value="Front / Rear">Front / Rear</option>
                    <option value="Verification Needed">Verification Needed (*)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  >
                    <option value="Bike Tyres">Bike Tyres</option>
                    <option value="Scooty Tyres">Scooty Tyres</option>
                    <option value="Car Tyres">Car Tyres</option>
                    <option value="Truck Tyres">Truck Tyres</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Shelf Slot</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Warranty</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider transition mt-2"
              >
                Add to Catalogue & Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Barcode Scanner Simulator Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#0c0c14] border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <button
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              OPTICAL BARCODE SCANNER
            </span>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Scan className="w-4 h-4 text-amber-500" />
              Scan Tyre SKU / Barcode
            </h3>

            <div className="space-y-3">
              <select
                value={mockScanTarget}
                onChange={(e) => setMockScanTarget(e.target.value)}
                className="w-full bg-cyber-gray border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono outline-none"
              >
                <option value="">Select a product to simulate scan...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.name} ({p.size}) - SKU: {p.sku}
                  </option>
                ))}
              </select>

              <button
                onClick={triggerMockScan}
                disabled={!mockScanTarget}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-bold font-mono text-xs uppercase transition"
              >
                Simulate Laser Scan
              </button>

              {scannedFeedback && (
                <div className={`p-3 rounded-lg text-xs font-mono border ${
                  scannedFeedback.startsWith("MATCH")
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}>
                  {scannedFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
