"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Edit, Trash2, Search, CheckCircle2, AlertTriangle, X, RefreshCw, Scan, QrCode } from "lucide-react";
import { dbStore, Tyre } from "@/lib/store";

export default function OwnerInventory() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals/Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTyre, setEditingTyre] = useState<Tyre | null>(null);

  // Form Fields
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Car" | "SUV" | "Truck" | "Tractor" | "Bike">("Car");
  const [size, setSize] = useState("");
  const [mrp, setMrp] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("");
  const [supplier, setSupplier] = useState("");

  // Barcode Scanner Simulator State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mockScanTarget, setMockScanTarget] = useState("");
  const [scannedFeedback, setScannedFeedback] = useState("");
  const [highlightedTyreId, setHighlightedTyreId] = useState("");

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
      qrCode: `qr-${Math.random().toString(36).substr(2, 9)}`
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
          supplier
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
    if (confirm("Are you sure you want to delete this tyre from inventory?")) {
      const currentTyres = dbStore.getTyres();
      const filtered = currentTyres.filter((t) => t.id !== id);
      dbStore.saveTyres(filtered);
      loadTyres();
    }
  };

  const resetFormFields = () => {
    setBrand("");
    setName("");
    setCategory("Car");
    setSize("");
    setMrp(0);
    setPurchasePrice(0);
    setSellingPrice(0);
    setQuantity(0);
    setLocation("");
    setSupplier("");
  };

  // Mock Barcode Scan action
  const triggerMockScan = () => {
    if (!mockScanTarget) return;
    
    setScannedFeedback("Scanning barcode...");
    setTimeout(() => {
      const found = tyres.find((t) => t.id === mockScanTarget);
      if (found) {
        setScannedFeedback(`SUCCESS! Scanned: ${found.brand} ${found.name} (${found.barcode})`);
        
        // Highlight row in list
        setHighlightedTyreId(found.id);
        
        // Close scanner after delay
        setTimeout(() => {
          setIsScannerOpen(false);
          setScannedFeedback("");
          
          // Scroll target into view
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

  // Filtered List
  const filteredTyres = tyres.filter((t) => {
    return (
      t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            REAL-TIME INVENTORY CONTROL
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500" />
            Stock Inventory Directory
          </h2>
        </div>

        <div className="flex gap-2">
          {/* Barcode scanner button */}
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setMockScanTarget("");
              setScannedFeedback("");
            }}
            className="px-4 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <Scan className="w-4 h-4" />
            Scan Barcode
          </button>

          <button
            onClick={() => {
              resetFormFields();
              setIsAddOpen(true);
            }}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            Add Tyre
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Filter by brand, size, name or rack shelf..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
        />
      </div>

      {/* Grid inventory list */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-cyber-gray-dark border-b border-white/5 text-white/50 font-mono">
                <th className="p-4">Brand / Name</th>
                <th className="p-4">Size Specs</th>
                <th className="p-4">Segment</th>
                <th className="p-4 text-right">MRP</th>
                <th className="p-4 text-right">Purchase Price</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-center">Quantity</th>
                <th className="p-4">Shelf Slot</th>
                <th className="p-4">Barcode / QR</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTyres.map((t) => (
                <tr 
                  key={t.id} 
                  id={`row-${t.id}`}
                  className={`border-b border-white/5 transition duration-300 hover:bg-white/5 ${
                    t.id === highlightedTyreId 
                      ? "bg-amber-500/10 border-amber-500/40" 
                      : t.quantity < 5 
                      ? "bg-rose-500/5 hover:bg-rose-500/10" 
                      : ""
                  }`}
                >
                  <td className="p-4">
                    <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase">{t.brand}</span>
                    <span className="font-bold text-white text-sm">{t.name}</span>
                  </td>
                  <td className="p-4 font-mono font-semibold">{t.size}</td>
                  <td className="p-4 font-semibold text-white/70">{t.category}</td>
                  <td className="p-4 text-right font-mono">₹{t.mrp.toLocaleString()}</td>
                  <td className="p-4 text-right font-mono text-white/60">₹{t.purchasePrice.toLocaleString()}</td>
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
                  <td className="p-4 font-semibold text-white/70">{t.location}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] text-white/40">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{t.barcode}</span>
                      <QrCode className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                  </td>
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

              {filteredTyres.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-white/30 italic">
                    No tyres in inventory matching query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode scanner mock dialog */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-cyber-gray-dark border border-white/10 p-6 rounded-2xl max-w-sm w-full relative">
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
                Pick a target tyre model to simulate a hardware scanner code reading.
              </p>

              <select
                value={mockScanTarget}
                onChange={(e) => setMockScanTarget(e.target.value)}
                className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
              >
                <option value="">-- Select Mock Tyre --</option>
                {tyres.map((t) => (
                  <option key={`scan-${t.id}`} value={t.id}>
                    {t.brand} {t.name} ({t.barcode})
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

      {/* Add Tyre Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-lg w-full relative my-8">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6">
              Add New Tyre Stock
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alnac 4G"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Size Spec</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 185/70 R14"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Segment</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Bike">Bike</option>
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
                  <label className="text-[10px] font-mono uppercase text-white/50">Shelf Shelf</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf A3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Supplier</label>
                  <input
                    type="text"
                    required
                    placeholder="Supplier Name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider transition"
              >
                Add Inventory Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tyre Dialog Modal */}
      {isEditOpen && editingTyre && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-lg w-full relative my-8">
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
              Edit Tyre Properties
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
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Model Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
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
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-white/50">Segment</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Bike">Bike</option>
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
                  <label className="text-[10px] font-mono uppercase text-white/50">Shelf Slot</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                  />
                </div>
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
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider transition"
              >
                Update Product Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
