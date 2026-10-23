"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, HelpCircle, Layers, CheckCircle2, AlertTriangle, XCircle, Image as ImageIcon } from "lucide-react";
import { dbStore, Tyre } from "@/lib/store";
import { getWhatsAppTyreEnquiryUrl } from "@/lib/whatsapp";

export default function CustomerStock() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  useEffect(() => {
    let isMounted = true;
    async function loadStock() {
      try {
        const res = await fetch("/api/catalogue");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0 && isMounted) {
          const mapped: Tyre[] = json.data.map((item: any) => ({
            id: item.id,
            brand: item.brand,
            name: item.pattern,
            category: item.category === "Bike" ? "Bike Tyres" : item.category === "Scooty" ? "Bike Tyres" : "Car Tyres",
            size: item.size,
            mrp: item.mrp || 0,
            purchasePrice: 0,
            sellingPrice: item.sellingPrice || 0,
            quantity: item.physicalQuantity || 0,
            location: "Workshop Ready",
            supplier: "Authorized Distributor",
            dateAdded: new Date().toISOString().split("T")[0],
            barcode: item.sku || "",
            qrCode: `qr-${item.sku || item.id}`,
            description: item.description,
            warranty: item.warranty,
            imageUrl: item.imageUrl,
            position: item.position,
          }));
          setTyres(mapped);
          return;
        }
      } catch (e) {
        console.warn("Could not fetch /api/catalogue, fallback to local store:", e);
      }
      if (isMounted) setTyres(dbStore.getTyres());
    }
    loadStock();
    return () => { isMounted = false; };
  }, []);

  const brands = Array.from(new Set(tyres.map((t) => t.brand))).filter(Boolean);
  const categories = Array.from(new Set(tyres.map((t) => t.category))).filter(Boolean);

  const filteredTyres = tyres.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || t.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const getStatusBadge = (t: Tyre) => {
    if (t.quantity === 0) {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> AVAILABLE ON ORDER
        </span>
      );
    } else if (t.quantity < 5) {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> LIMITED ({t.quantity})
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> AVAILABLE ({t.quantity})
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          REAL-TIME AVAILABLE STOCK
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Warehouse Inventory Catalog
        </h2>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-cyber-gray/40 border border-white/5 p-4 rounded-xl items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by Tyre Name, Brand, Size or Description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
          >
            <option value="All">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTyres.map((tyre) => (
          <div key={tyre.id} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative group overflow-hidden">
            
            {/* Stock status indicator badge */}
            <div className="absolute top-4 right-4 pointer-events-none z-10">
              {getStatusBadge(tyre)}
            </div>

            <div>
              {/* Product Image Header with glass background */}
              <div className="w-full h-40 rounded-xl border border-white/5 overflow-hidden mb-4 bg-[#0a0a10] flex items-center justify-center relative">
                {tyre.imageUrl ? (
                  <img src={tyre.imageUrl} alt={tyre.name} className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-white/20">
                    <ImageIcon className="w-8 h-8 opacity-60" />
                    <span className="text-[9px] font-mono tracking-widest uppercase">No Image Available</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block mb-0.5">
                {tyre.brand}
              </span>
              <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-500 transition">
                {tyre.name}
              </h3>
              <span className="text-[11px] text-white/50 block font-mono mt-1">
                Size Spec: {tyre.size} {tyre.position ? `[${tyre.position}]` : ""}
              </span>

              {tyre.description && (
                <p className="text-xs text-white/40 mt-2 font-sans line-clamp-2 leading-relaxed">
                  {tyre.description}
                </p>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/60">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Warranty Info</span>
                  <span className="font-semibold text-white/80">{tyre.warranty || "5 Years"}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Category</span>
                  <span className="font-semibold text-white/80">{tyre.category}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6">
              <div>
                <span className="text-[9px] text-white/40 block">PRICE & PROCUREMENT</span>
                <span className="text-xs font-mono font-bold text-amber-400 tracking-wide">
                  {tyre.sellingPrice > 0 ? `₹${tyre.sellingPrice.toLocaleString()}` : "Contact for Price"}
                </span>
              </div>

              <a
                href={getWhatsAppTyreEnquiryUrl({
                  brand: tyre.brand,
                  pattern: tyre.name,
                  size: tyre.size,
                  position: tyre.position || "Standard",
                  category: tyre.category.includes("Bike") ? "Bike" : tyre.category.includes("Scoot") ? "Scooty" : "Car",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold uppercase tracking-wider transition"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        ))}

        {filteredTyres.length === 0 && (
          <div className="col-span-full py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs flex flex-col items-center justify-center gap-2">
            <Layers className="w-8 h-8 opacity-45 mb-1 text-amber-500" />
            <span>No products matching the search query or filter selection were found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
