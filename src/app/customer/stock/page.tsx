"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, HelpCircle, Layers, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { dbStore, Tyre } from "@/lib/store";

export default function CustomerStock() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  useEffect(() => {
    setTyres(dbStore.getTyres());
  }, []);

  const brands = Array.from(new Set(tyres.map((t) => t.brand)));
  const categories = Array.from(new Set(tyres.map((t) => t.category)));

  const filteredTyres = tyres.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.size.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || t.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const getStatusBadge = (qty: number) => {
    if (qty === 0) {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
          <XCircle className="w-3 h-3" /> OUT OF STOCK
        </span>
      );
    } else if (qty < 5) {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> LIMITED STOCK ({qty})
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> AVAILABLE ({qty})
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
            placeholder="Search by Tyre Name, Brand or Size (e.g. Apollo, R16)..."
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
                {c} Segment
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
                {b} Manufacturer
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTyres.map((tyre) => (
          <div key={tyre.id} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative group">
            {/* Visual background glow */}
            <div className="absolute top-2 right-2 pointer-events-none opacity-40 group-hover:opacity-70 transition">
              {getStatusBadge(tyre.quantity)}
            </div>

            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block mb-0.5">
                {tyre.brand}
              </span>
              <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-500 transition">
                {tyre.name}
              </h3>
              <span className="text-[11px] text-white/50 block font-mono mt-1">
                Size Spec: {tyre.size}
              </span>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-white/60">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Shelf Location</span>
                  <span className="font-semibold text-white/80">{tyre.location}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Vehicle Segment</span>
                  <span className="font-semibold text-white/80">{tyre.category} Fitment</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6">
              <div>
                <span className="text-[9px] text-white/40 block">ESTIMATED PRICE</span>
                <span className="text-base font-mono font-bold text-white tracking-wide">
                  ₹{tyre.sellingPrice.toLocaleString()}
                </span>
              </div>

              <a
                href={`https://wa.me/919199936181?text=Hi%20Samar,%20I'm%20inquiring%20about%20the%20${tyre.brand}%20${tyre.name}%20(${tyre.size})%20listed%20in%20your%20inventory%20catalog.%20Please%20provide%20availability%20and%20the%20latest%20price.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold uppercase tracking-wider transition"
              >
                Inquire Price
              </a>
            </div>
          </div>
        ))}

        {filteredTyres.length === 0 && (
          <div className="col-span-full py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs flex flex-col items-center justify-center gap-2">
            <Layers className="w-8 h-8 opacity-45 mb-1 text-amber-500" />
            <span>No tyres matching the search query or filter selection were found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
