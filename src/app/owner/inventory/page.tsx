"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, Plus, Edit, Trash2, Search, CheckCircle2, 
  AlertTriangle, X, RefreshCw, Scan, QrCode, Download, Upload, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Filter, ArrowUpDown
} from "lucide-react";
import { dbStore, Tyre } from "@/lib/store";

export default function OwnerInventory() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals/Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTyre, setEditingTyre] = useState<Tyre | null>(null);

  // Filters, Sorting & Pagination State
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedStockFilter, setSelectedStockFilter] = useState("All"); // All, Low Stock, Out of Stock
  const [sortField, setSortField] = useState<"name" | "mrp" | "sellingPrice" | "quantity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form Fields
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Car Tyres");
  const [size, setSize] = useState("");
  const [mrp, setMrp] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [warranty, setWarranty] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Barcode Scanner Simulator State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mockScanTarget, setMockScanTarget] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState("");
  const [highlightedTyreId, setHighlightedTyreId] = useState("");

  const categoriesList = [
    "Car Tyres",
    "Bike Tyres",
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

  const loadTyres = () => {
    setTyres(dbStore.getTyres());
  };

  useEffect(() => {
    loadTyres();
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTyre: Tyre = {
      id: `t-${Date.now()}`,
      brand,
      name,
      category,
      size,
      mrp,
      purchasePrice,
      sellingPrice,
      quantity,
      location,
      supplier,
      dateAdded: new Date().toISOString().split("T")[0],
      barcode: `890${Math.floor(1000000 + Math.random() * 9000000)}`,
      qrCode: `qr-${Math.random().toString(36).substr(2, 9)}`,
      description,
      warranty,
      imageUrl: imageUrl || undefined
    };

    const currentTyres = dbStore.getTyres();
    currentTyres.push(newTyre);
    dbStore.saveTyres(currentTyres);
    
    // Reset Form
    setIsAddOpen(false);
    resetFormFields();
    loadTyres();
  };

  const handleEditOpen = (tyre: Tyre) => {
    setEditingTyre(tyre);
    setBrand(tyre.brand);
    setName(tyre.name);
    setCategory(tyre.category);
    setSize(tyre.size);
    setMrp(tyre.mrp);
    setPurchasePrice(tyre.purchasePrice);
    setSellingPrice(tyre.sellingPrice);
    setQuantity(tyre.quantity);
    setLocation(tyre.location);
    setSupplier(tyre.supplier);
    setDescription(tyre.description || "");
    setWarranty(tyre.warranty || "");
    setImageUrl(tyre.imageUrl || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTyre) return;

    const currentTyres = dbStore.getTyres();
    const updated = currentTyres.map((t) => {
      if (t.id === editingTyre.id) {
        return {
          ...t,
          brand,
          name,
          category,
          size,
          mrp,
          purchasePrice,
          sellingPrice,
          quantity,
          location,
          supplier,
          description,
          warranty,
          imageUrl: imageUrl || undefined
        };
      }
      return t;
    });

    dbStore.saveTyres(updated);
    setIsEditOpen(false);
    setEditingTyre(null);
    resetFormFields();
    loadTyres();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product from inventory?")) {
      const currentTyres = dbStore.getTyres();
      const filtered = currentTyres.filter((t) => t.id !== id);
      dbStore.saveTyres(filtered);
      loadTyres();
    }
  };

  const resetFormFields = () => {
    setBrand("");
    setName("");
    setCategory("Car Tyres");
    setSize("");
    setMrp(0);
    setPurchasePrice(0);
    setSellingPrice(0);
    setQuantity(0);
    setLocation("");
    setSupplier("");
    setDescription("");
    setWarranty("");
    setImageUrl("");
  };

  // Image upload base64 parser
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Bulk CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file is empty or missing headers.");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const parsedProducts: Tyre[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((val) => val.trim().replace(/^["']|["']$/g, ""));
          if (row.length < headers.length) continue;

          const dataMap: Record<string, string> = {};
          headers.forEach((header, index) => {
            dataMap[header] = row[index];
          });

          const barcode = dataMap.barcode || `890${Math.floor(1000000 + Math.random() * 9000000)}`;
          const qrCode = dataMap.qrCode || `qr-${Math.random().toString(36).substr(2, 9)}`;
          const parsed: Tyre = {
            id: dataMap.id || `t-${Date.now()}-${i}`,
            brand: dataMap.brand || "Generic",
            name: dataMap.name || "Product",
            category: (dataMap.category || "Car Tyres") as any,
            size: dataMap.size || "Standard",
            mrp: Number(dataMap.mrp) || 0,
            purchasePrice: Number(dataMap.purchasePrice) || 0,
            sellingPrice: Number(dataMap.sellingPrice) || 0,
            quantity: Number(dataMap.quantity) || 0,
            location: dataMap.location || "Shelf A1",
            supplier: dataMap.supplier || "Supplier",
            dateAdded: dataMap.dateAdded || new Date().toISOString().split("T")[0],
            barcode,
            qrCode,
            description: dataMap.description || "",
            warranty: dataMap.warranty || "",
            imageUrl: dataMap.imageUrl || undefined
          };
          parsedProducts.push(parsed);
        }

        if (parsedProducts.length === 0) {
          alert("No valid products found in CSV.");
          return;
        }

        if (confirm(`Parsed ${parsedProducts.length} items from CSV. Click OK to merge with current items (matching by barcode), or Cancel to wipe and overwrite entire inventory.`)) {
          const current = dbStore.getTyres();
          const merged = [...current];
          parsedProducts.forEach((parsed) => {
            const idx = merged.findIndex((x) => x.barcode === parsed.barcode);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...parsed, id: merged[idx].id };
            } else {
              merged.push(parsed);
            }
          });
          dbStore.saveTyres(merged);
        } else {
          dbStore.saveTyres(parsedProducts);
        }

        alert("Bulk inventory import successful!");
        loadTyres();
      } catch (err: any) {
        alert(`Error parsing CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Bulk CSV Export
  const handleExportCSV = () => {
    const headers = [
      "id", "brand", "name", "category", "size", "mrp", "purchasePrice", 
      "sellingPrice", "quantity", "location", "supplier", "dateAdded", 
      "barcode", "qrCode", "description", "warranty", "imageUrl"
    ];

    const csvRows = [headers.join(",")];
    tyres.forEach((t) => {
      const row = [
        t.id,
        `"${t.brand.replace(/"/g, '""')}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.category}"`,
        `"${t.size}"`,
        t.mrp,
        t.purchasePrice,
        t.sellingPrice,
        t.quantity,
        `"${t.location}"`,
        `"${t.supplier}"`,
        t.dateAdded,
        t.barcode,
        t.qrCode,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        `"${(t.warranty || "").replace(/"/g, '""')}"`,
        t.imageUrl ? `"${t.imageUrl}"` : ""
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `ttw_inventory_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Barcode Scan action
  const triggerMockScan = () => {
    if (!mockScanTarget) return;
    
    setScannedFeedback("Scanning barcode...");
    setTimeout(() => {
      const found = tyres.find((t) => t.id === mockScanTarget);
      if (found) {
        setScannedFeedback(`SUCCESS! Scanned: ${found.brand} ${found.name} (${found.barcode})`);
        setHighlightedTyreId(found.id);
        
        setTimeout(() => {
          setIsScannerOpen(false);
          setScannedFeedback("");
          const element = document.getElementById(`row-${found.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 1500);
      } else {
        setScannedFeedback("Error: Product not found.");
      }
    }, 1000);
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

  // Filtered, Sorted, and Searched Products
  const filteredTyres = tyres
    .filter((t) => {
      const matchesSearch = 
        t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategoryFilter === "All" || t.category === selectedCategoryFilter;
      
      let matchesStock = true;
      if (selectedStockFilter === "Low Stock") {
        matchesStock = t.quantity > 0 && t.quantity < 5;
      } else if (selectedStockFilter === "Out of Stock") {
        matchesStock = t.quantity === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredTyres.length / itemsPerPage) || 1;
  const paginatedTyres = filteredTyres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryFilter, selectedStockFilter]);

  const lowStockCount = tyres.filter((t) => t.quantity > 0 && t.quantity < 5).length;
  const outOfStockCount = tyres.filter((t) => t.quantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-cyber-gray-dark/30 border border-white/5 p-6 rounded-2xl">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            DATABASE POWERED CMS
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500 animate-pulse" />
            Inventory & Services Manager
          </h2>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Live database records. Instantly updates client lookups, catalogs, and GST billing registers without code modifications.
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

          {/* Import CSV */}
          <label className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase cursor-pointer transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none">
            <Upload className="w-3.5 h-3.5" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>

          {/* Barcode scan simulator */}
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setMockScanTarget("");
              setScannedFeedback("");
            }}
            className="px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 font-mono text-xs uppercase transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            Scan Barcode
          </button>

          {/* Add product button */}
          <button
            onClick={() => {
              resetFormFields();
              setIsAddOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase transition flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 outline-none shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            Add Product
          </button>
        </div>
      </div>

      {/* Metrics Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase">Total SKUs</span>
            <div className="text-xl font-mono font-bold text-white mt-0.5">{tyres.length} items</div>
          </div>
          <Layers className="w-8 h-8 text-white/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/5 flex items-center justify-between bg-rose-500/5 border-rose-500/10">
          <div>
            <span className="text-[10px] font-mono text-rose-400 uppercase">Out of Stock</span>
            <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">{outOfStockCount} SKUs</div>
          </div>
          <X className="w-8 h-8 text-rose-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl border-white/5 flex items-center justify-between bg-amber-500/5 border-amber-500/10">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase">Low Stock Alerts</span>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{lowStockCount} items</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/20 animate-pulse" />
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-cyber-gray-dark/20 border border-white/5 p-4 rounded-xl items-center">
        {/* Search */}
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by brand, size, name, shelf slot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low Stock">Low Stock (&lt; 5)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="lg:col-span-1 text-center">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategoryFilter("All");
              setSelectedStockFilter("All");
            }}
            className="p-2 text-white/50 hover:text-amber-500 transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Main CMS Table Panel */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-cyber-gray-dark border-b border-white/5 text-white/50 font-mono">
                <th className="p-4 w-40">Item Preview</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition" onClick={() => requestSort("name")}>
                  Product Name <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">Size & Spec</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-right" onClick={() => requestSort("mrp")}>
                  MRP (₹) <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4 text-right">Purchase (₹)</th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-right" onClick={() => requestSort("sellingPrice")}>
                  Selling (₹) <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4 cursor-pointer hover:bg-white/5 transition text-center" onClick={() => requestSort("quantity")}>
                  Stock <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="p-4">Warranty</th>
                <th className="p-4">Shelf Slot</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTyres.map((t) => (
                <tr 
                  key={t.id} 
                  id={`row-${t.id}`}
                  className={`border-b border-white/5 transition duration-300 hover:bg-white/5 ${
                    t.id === highlightedTyreId 
                      ? "bg-amber-500/10 border-amber-500/40" 
                      : t.quantity === 0
                      ? "bg-rose-500/5 hover:bg-rose-500/10"
                      : t.quantity < 5 
                      ? "bg-amber-500/5 hover:bg-amber-500/10" 
                      : ""
                  }`}
                >
                  <td className="p-4">
                    {t.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                        <img src={t.imageUrl} alt={t.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-dashed border-white/10 bg-white/5 flex items-center justify-center text-white/30">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-[9px] font-mono text-amber-500 font-bold block uppercase">{t.brand}</span>
                    <span className="font-bold text-white text-sm">{t.name}</span>
                    {t.description && (
                      <span className="text-[10px] text-white/40 block mt-0.5 max-w-[200px] truncate">{t.description}</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-white/70">{t.category}</td>
                  <td className="p-4 font-mono font-semibold">{t.size}</td>
                  <td className="p-4 text-right font-mono">₹{t.mrp.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-white/40">₹{t.purchasePrice.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-amber-500 font-bold">₹{t.sellingPrice.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      t.quantity === 0 
                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                        : t.quantity < 5 
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse font-extrabold" 
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    }`}>
                      {t.quantity}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-semibold text-white/50">{t.warranty || "No warranty"}</td>
                  <td className="p-4 font-semibold text-white/70">{t.location}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditOpen(t)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-amber-500/30 hover:text-amber-500 transition focus:ring-1 focus:ring-amber-500 outline-none"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:border-rose-500/30 hover:text-rose-400 transition focus:ring-1 focus:ring-rose-500 outline-none"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedTyres.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-white/30 italic">
                    No products matching current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-cyber-gray-dark/50 border-t border-white/5 p-4 flex items-center justify-between">
          <div className="text-xs text-white/40 font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTyres.length)} of {filteredTyres.length} SKUs
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

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-[#0c0c14] border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
            <button
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-4">
              <Scan className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
              <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest">
                Mock Barcode Scanner
              </h3>
              <p className="text-xs text-white/60">
                Simulate a terminal barcode gun reading product serials.
              </p>

              <select
                value={mockScanTarget}
                onChange={(e) => setMockScanTarget(e.target.value)}
                className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
              >
                <option value="">-- Select Mock Tyre --</option>
                {tyres.map((t) => (
                  <option key={`scan-${t.id}`} value={t.id}>
                    [{t.barcode}] - {t.brand} {t.name}
                  </option>
                ))}
              </select>

              {scannedFeedback && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs text-amber-500 font-mono leading-relaxed">
                  {scannedFeedback}
                </div>
              )}

              <button
                onClick={triggerMockScan}
                disabled={!mockScanTarget}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                Trigger Scan Signal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-xl w-full relative my-8">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Add Product to CMS
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CEAT, MRF"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Model / Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SecuraDrive"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Size / Spec Parameters</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 195/55 R16 or N/A"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Category Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
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
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Warranty Spec</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Years Unconditional"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Shelf / Warehouse Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf A1"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Supplier Distributor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Distributors"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Image Upload (Max 2MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-cyber-gray border border-white/5 rounded-lg py-1.5 px-3 text-[11px] text-white outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-white/10 file:text-white file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-white/50">Product Description</label>
                <textarea
                  placeholder="Additional specs or details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition h-16 resize-none"
                />
              </div>

              {/* Upload Image Preview */}
              {imageUrl && (
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg">
                  <div className="w-12 h-12 rounded border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                    <img src={imageUrl} alt="Upload preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold">IMAGE CACHED SUCCESSFULLY</span>
                    <span className="text-[9px] text-white/40 block">Will be saved as base64 string directly to PostgreSQL</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-white/40 hover:text-rose-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider transition"
              >
                Add CMS Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditOpen && editingTyre && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-xl w-full relative my-8">
            <button 
              onClick={() => {
                setIsEditOpen(false);
                setEditingTyre(null);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6">
              Edit Product Details
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Model Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Size Spec</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-semibold"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Purchase (₹)</label>
                  <input
                    type="number"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Selling (₹)</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Supplier</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Image Upload (Max 2MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-cyber-gray border border-white/5 rounded-lg py-1.5 px-3 text-[11px] text-white outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:bg-white/10 file:text-white file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-white/50">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition h-16 resize-none"
                />
              </div>

              {/* Upload Image Preview */}
              {imageUrl && (
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-lg">
                  <div className="w-12 h-12 rounded border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                    <img src={imageUrl} alt="Upload preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono text-emerald-400 block font-bold">IMAGE CACHED SUCCESSFULLY</span>
                    <span className="text-[9px] text-white/40 block">Will be saved as base64 string directly to PostgreSQL</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-white/40 hover:text-rose-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-wider transition"
              >
                Save CMS Product Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
