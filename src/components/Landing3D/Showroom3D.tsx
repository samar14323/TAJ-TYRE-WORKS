"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Flame, 
  Search, 
  X, 
  Bike, 
  Car,
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  Layers,
  Compass
} from "lucide-react";
import { SHOWROOM_CATALOGUE, ShowroomCatalogueItem } from "@/data/showroomCatalog";
import { getWhatsAppTyreEnquiryUrl, isWhatsAppConfigured } from "@/lib/whatsapp";
import { dbStore } from "@/lib/store";

export type ShowroomCategoryFilter = "All" | "Bike" | "Scooty" | "Car";
export type ShowroomBrandFilter = "All" | "MRF" | "CEAT";

export default function Showroom3D() {
  const [selectedCategory, setSelectedCategory] = useState<ShowroomCategoryFilter>("All");
  const [selectedBrand, setSelectedBrand] = useState<ShowroomBrandFilter>("All");
  const [sizeSearch, setSizeSearch] = useState<string>("");
  const [activeTyre, setActiveTyre] = useState<ShowroomCatalogueItem | null>(SHOWROOM_CATALOGUE[0]);
  const [catalogItems, setCatalogItems] = useState<ShowroomCatalogueItem[]>(SHOWROOM_CATALOGUE);

  // Synchronize with database-backed shared catalogue from PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function loadCatalogueFromDB() {
      try {
        const res = await fetch("/api/catalogue");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0 && isMounted) {
          setCatalogItems(json.data);
          return;
        }
      } catch (err) {
        console.warn("Could not fetch shared catalogue from /api/catalogue, using local fallback:", err);
      }

      // Local fallback with dbStore integration
      try {
        const dbTyres = dbStore.getTyres();
        if (dbTyres && dbTyres.length > 0 && isMounted) {
          const additionalItems: ShowroomCatalogueItem[] = [];
          dbTyres.forEach((t) => {
            const brandUpper = (t.brand || "").trim().toUpperCase();
            if (brandUpper !== "MRF" && brandUpper !== "CEAT") return;

            const catLower = (t.category || "").toLowerCase();
            const isCar = catLower.includes("car");
            const isScooty = catLower.includes("scooty") || catLower.includes("scooter");
            const isBike = catLower.includes("bike") || (!isCar && !isScooty);

            const brandNorm: "MRF" | "CEAT" = brandUpper === "MRF" ? "MRF" : "CEAT";
            const catNorm: "Bike" | "Scooty" | "Car" = isCar ? "Car" : isScooty ? "Scooty" : "Bike";

            const exists = SHOWROOM_CATALOGUE.some(
              (c) => c.brand === brandNorm && c.size.toLowerCase() === (t.size || "").toLowerCase() && c.pattern.toLowerCase() === (t.name || "").toLowerCase()
            );

            if (!exists) {
              additionalItems.push({
                id: `db-${t.id}`,
                sku: t.catalogueSku || undefined,
                brand: brandNorm,
                category: catNorm,
                size: t.size || "Standard",
                position: (t.position as any) || "Rear",
                isPositionConfirmed: true,
                pattern: t.name,
                warranty: t.warranty || "5 Years",
                grip: "High",
                noise: "Low",
                durability: "Ultra High",
                imageUrl: t.imageUrl || null,
                description: t.description || `${brandNorm} ${t.name} tyre in size ${t.size}.`,
                stockStatus: t.quantity > 0 ? "In Stock" : "Out of Stock",
                physicalQuantity: t.quantity,
                inStock: t.quantity > 0,
              });
            }
          });

          if (additionalItems.length > 0) {
            setCatalogItems([...SHOWROOM_CATALOGUE, ...additionalItems]);
          }
        }
      } catch (e) {
        console.warn("Could not load inventory items for showroom:", e);
      }
    }

    loadCatalogueFromDB();
    return () => { isMounted = false; };
  }, []);

  // Filter catalogue strictly by:
  // 1. Only MRF and CEAT
  // 2. Selected Category (Bike vs Scooty vs All)
  // 3. Selected Brand (MRF vs CEAT vs All)
  // 4. Tyre size or pattern search
  const filteredTyres = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_/]/g, "");
    const qNorm = normalize(sizeSearch);

    return catalogItems.filter((t) => {
      // Category filter
      if (selectedCategory !== "All" && t.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== "All" && t.brand !== selectedBrand) {
        return false;
      }

      // Size & pattern search
      if (!qNorm) return true;

      const sizeNorm = normalize(t.size);
      const patternNorm = normalize(t.pattern);
      const brandNorm = normalize(t.brand);
      const fullNorm = normalize(`${t.brand} ${t.pattern} ${t.size}`);

      return (
        sizeNorm.includes(qNorm) ||
        t.size.toLowerCase().includes(sizeSearch.toLowerCase()) ||
        patternNorm.includes(qNorm) ||
        brandNorm.includes(qNorm) ||
        fullNorm.includes(qNorm)
      );
    });
  }, [catalogItems, selectedCategory, selectedBrand, sizeSearch]);

  // Keep active tyre in view
  useEffect(() => {
    if (filteredTyres.length > 0) {
      if (!activeTyre || !filteredTyres.some((t) => t.id === activeTyre.id)) {
        setActiveTyre(filteredTyres[0]);
      }
    } else {
      setActiveTyre(null);
    }
  }, [filteredTyres, activeTyre]);

  // Quick size chips for common searches
  const commonSizes = useMemo(() => {
    if (selectedCategory === "Scooty") {
      return ["90/90-12", "90/100-10", "100/90-10"];
    } else if (selectedCategory === "Bike") {
      return ["80/100-18", "90/90-19", "120/80-18", "100/80-17", "3.00-18"];
    } else if (selectedCategory === "Car") {
      return ["195/55 R16", "235/70 R16", "185/65 R15", "175/65 R14"];
    }
    return ["80/100-18", "90/90-12", "195/55 R16", "90/100-10", "120/80-18", "3.00-18", "140/70 R17"];
  }, [selectedCategory]);

  // Helper to render verified physical stock status badge
  const renderStockBadge = (tyre: ShowroomCatalogueItem, isCompact = false) => {
    if (tyre.stockStatus === "In Stock" || (tyre.physicalQuantity && tyre.physicalQuantity > 0)) {
      return (
        <span className={`font-mono uppercase font-bold rounded border ${
          isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
        } bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>In Stock ({tyre.physicalQuantity || "Ready"})</span>
        </span>
      );
    }
    if (tyre.stockStatus === "Out of Stock") {
      return (
        <span className={`font-mono uppercase font-bold rounded border ${
          isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
        } bg-rose-500/10 border-rose-500/30 text-rose-400 flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Out of Stock</span>
        </span>
      );
    }
    return (
      <span className={`font-mono uppercase font-bold rounded border ${
        isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
      } bg-sky-500/10 border-sky-500/30 text-sky-400 flex items-center gap-1`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
        <span>Available on Order</span>
      </span>
    );
  };

  // Helper to render Position Badge
  const renderPositionBadge = (tyre: ShowroomCatalogueItem, isCompact = false) => {
    if (!tyre.isPositionConfirmed || tyre.position === "Verification Needed") {
      return (
        <span 
          title="Marked with asterisk (*) in master list. Position requires workshop rim verification."
          className={`font-mono uppercase font-bold rounded border ${
            isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
          } bg-amber-500/10 border-amber-500/30 text-amber-400 flex items-center gap-1`}
        >
          <HelpCircle className="w-2.5 h-2.5 shrink-0" />
          <span>Position Verification Needed (*)</span>
        </span>
      );
    }

    if (tyre.position === "Front") {
      return (
        <span className={`font-mono uppercase font-bold rounded border ${
          isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
        } bg-sky-500/10 border-sky-500/20 text-sky-400 flex items-center gap-1`}>
          <span>Front Fitment</span>
        </span>
      );
    }

    if (tyre.position === "Rear") {
      return (
        <span className={`font-mono uppercase font-bold rounded border ${
          isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
        } bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1`}>
          <span>Rear Fitment</span>
        </span>
      );
    }

    return (
      <span className={`font-mono uppercase font-bold rounded border ${
        isCompact ? "text-[8px] px-1.5 py-0.5" : "text-[9px] px-2 py-0.5"
      } bg-purple-500/10 border-purple-500/20 text-purple-300 flex items-center gap-1`}>
        <span>Front / Rear Compatible</span>
      </span>
    );
  };

  // Helper to render Procedural 3D Tyre Visual with distinct MRF vs CEAT branding and Front vs Rear tread
  const renderProcedural3DTyre = (tyre: ShowroomCatalogueItem, sizeClass = "w-20 h-20") => {
    const isMRF = tyre.brand === "MRF";
    const isFront = tyre.position === "Front";
    const isRear = tyre.position === "Rear";

    // Brand specific color theme
    const brandColor = isMRF ? "text-red-500" : "text-sky-400";
    const brandBg = isMRF ? "bg-red-500/20 border-red-500/40 text-white" : "bg-sky-500/20 border-sky-500/40 text-white";
    const glowRing = isMRF ? "border-red-500/30" : "border-sky-500/30";

    return (
      <div className={`relative ${sizeClass} flex items-center justify-center pointer-events-none select-none`}>
        {/* Outer Rubber Tyre with tread depth */}
        <div className="absolute inset-0 rounded-full border-[10px] border-zinc-900 bg-zinc-950 flex items-center justify-center shadow-2xl">
          {/* Tread Pattern Dynamics: Front directional line vs Rear torque lugs */}
          <div className={`absolute inset-0 rounded-full border ${
            isFront 
              ? "border-dashed border-zinc-700/80" 
              : isRear 
              ? "border-dotted border-amber-500/40" 
              : "border-dashed border-zinc-600/70"
          } animate-spin-slow`}></div>

          {/* Wheel Alloy Spoke Ring */}
          <div className={`w-12 h-12 rounded-full border-2 ${glowRing} flex items-center justify-center bg-zinc-900/90 relative`}>
            {/* Brand Logo Insignia */}
            <div className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-extrabold tracking-tighter ${brandBg} flex items-center justify-center`}>
              {tyre.brand}
            </div>

            {/* Position indicator dot */}
            <div className={`absolute -bottom-1 text-[7px] font-mono uppercase font-bold px-1 rounded bg-black/80 border border-white/10 ${
              isFront ? "text-sky-400" : isRear ? "text-emerald-400" : "text-purple-300"
            }`}>
              {isFront ? "FR" : isRear ? "RR" : "F/R"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Filters: Category (Bike vs Scooty) and Brand (MRF vs CEAT) */}
      <div className="flex flex-col items-center gap-4">
        {/* Category & Brand Dual Controls */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          {/* Category Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-cyber-black border border-white/10 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSizeSearch("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              All Vehicles
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory("Bike");
                setSizeSearch("");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCategory === "Bike"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Bikes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory("Scooty");
                setSizeSearch("");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCategory === "Scooty"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>Scooties</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory("Car");
                setSizeSearch("");
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedCategory === "Car"
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Cars</span>
            </button>
          </div>

          {/* Brand Exclusive Filter: MRF and CEAT ONLY */}
          <div className="inline-flex p-1 rounded-2xl bg-cyber-black border border-white/10 shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedBrand("All")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                selectedBrand === "All"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Both Brands
            </button>

            <button
              type="button"
              onClick={() => setSelectedBrand("MRF")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition cursor-pointer ${
                selectedBrand === "MRF"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500"
                  : "text-white/70 hover:text-red-400 hover:bg-white/5"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>MRF Tyres</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedBrand("CEAT")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-extrabold uppercase tracking-wider transition cursor-pointer ${
                selectedBrand === "CEAT"
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 border border-sky-500"
                  : "text-white/70 hover:text-sky-400 hover:bg-white/5"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>CEAT Tyres</span>
            </button>
          </div>
        </div>

        {/* 2. Tyre Size & Pattern Search Field */}
        <div className="w-full max-w-xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={sizeSearch}
              onChange={(e) => setSizeSearch(e.target.value)}
              placeholder="Search by tyre size (e.g. 80/100-18, 90/90-12, 3.00-18) or pattern name..."
              className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder-white/40 font-mono outline-none transition"
            />
            {sizeSearch && (
              <button
                type="button"
                onClick={() => setSizeSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                title="Clear size search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick size chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[10px] font-mono text-white/40 uppercase mr-1">Quick Sizes:</span>
            {commonSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSizeSearch(sz)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition cursor-pointer ${
                  sizeSearch.toLowerCase() === sz.toLowerCase()
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Shelf (7 cols) + Spec Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Virtual Shelf Layout (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative p-6 bg-cyber-gray/40 border border-white/5 rounded-2xl overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

            <div className="flex justify-between items-center relative z-10 mb-4 pb-3 border-b border-white/5">
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block">
                {selectedBrand !== "All" ? `${selectedBrand} ` : "MRF & CEAT "}
                {selectedCategory !== "All" ? `${selectedCategory} Tyres` : "Two-Wheeler Catalogue"}
              </span>
              <span className="text-[10px] font-mono text-white/40">
                {filteredTyres.length} Pattern{filteredTyres.length === 1 ? "" : "s"} Displayed
              </span>
            </div>

            {/* Virtual Shelves layout */}
            {filteredTyres.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10 my-4">
                {filteredTyres.map((tyre) => (
                  <div key={tyre.id} className="group relative">
                    {/* The Shelf Layer */}
                    <div className="absolute -bottom-2 left-0 right-0 h-4 bg-cyber-gray border-t border-white/10 shadow-lg skew-x-12 origin-bottom pointer-events-none"></div>
                    
                    {/* Tyre Card wrapper */}
                    <motion.div
                      whileHover={{ 
                        y: -15, 
                        rotateY: 8,
                        rotateX: -3,
                        scale: 1.03 
                      }}
                      onClick={() => setActiveTyre(tyre)}
                      className={`cursor-pointer relative aspect-square rounded-xl p-3.5 flex flex-col items-center justify-between border transition duration-300 ${
                        activeTyre?.id === tyre.id
                          ? tyre.brand === "MRF"
                            ? "bg-cyber-gray-light border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
                            : "bg-cyber-gray-light border-sky-500/70 shadow-[0_0_25px_rgba(14,165,233,0.2)]"
                          : "bg-cyber-black/75 border-white/5 group-hover:border-white/20"
                      }`}
                      style={{ transformStyle: "preserve-3d", perspective: "800px" }}
                    >
                      {/* Ambient background ring glow */}
                      <div className={`absolute inset-4 rounded-full bg-gradient-to-tr ${
                        tyre.brand === "MRF" 
                          ? "from-red-600/25 to-red-950/40" 
                          : "from-sky-600/25 to-sky-950/40"
                      } blur-xl opacity-35 group-hover:opacity-75 transition-opacity pointer-events-none`}></div>
                      
                      {/* Top Badges: Brand & Position */}
                      <div className="w-full flex items-center justify-between relative z-10">
                        <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                          tyre.brand === "MRF"
                            ? "bg-red-500/10 border-red-500/30 text-red-400"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                        }`}>
                          {tyre.brand}
                        </span>

                        {renderPositionBadge(tyre, true)}
                      </div>

                      {/* Product Image OR 3D Render */}
                      <div className="relative my-auto transition group-hover:rotate-6 duration-500">
                        {tyre.imageUrl ? (
                          <img
                            src={tyre.imageUrl}
                            alt={`${tyre.brand} ${tyre.pattern}`}
                            className="max-h-20 max-w-20 object-contain drop-shadow-lg"
                          />
                        ) : (
                          renderProcedural3DTyre(tyre, "w-20 h-20")
                        )}
                      </div>

                      {/* Info & Tyre Size Block (PRICES REMOVED) */}
                      <div className="relative z-10 text-center w-full mt-1">
                        <h4 className="text-xs font-bold text-white leading-tight truncate">
                          {tyre.pattern}
                        </h4>

                        {/* Tyre Size Highlight Badge */}
                        <div className="mt-1">
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                            {tyre.size}
                          </span>
                        </div>

                        {/* Live Physical Stock Availability Badge */}
                        <div className="mt-1 flex justify-center">
                          {renderStockBadge(tyre, true)}
                        </div>

                        {/* Price Area: Clear contact message instead of price */}
                        <div className="mt-2">
                          <span className="text-[10px] font-mono font-semibold text-amber-400/90 block leading-tight">
                            Contact for latest price
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              /* No matching size in catalogue */
              <div className="relative z-10 my-16 text-center p-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] max-w-md mx-auto">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">
                  No Matching Tyre Found For &ldquo;{sizeSearch}&rdquo;
                </h4>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  We did not find an MRF or CEAT catalogue entry for size <strong>{sizeSearch}</strong> in the selected filter.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={getWhatsAppTyreEnquiryUrl({
                      brand: selectedBrand !== "All" ? selectedBrand : "MRF / CEAT",
                      pattern: "Pattern Check",
                      size: sizeSearch,
                      category: selectedCategory !== "All" ? selectedCategory : "Two-Wheeler",
                      isPositionConfirmed: false
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Inquire Size &ldquo;{sizeSearch}&rdquo; on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSizeSearch("")}
                    className="text-xs text-amber-500/80 hover:text-amber-400 underline font-mono"
                  >
                    Clear search and view all entries
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-white/5 pt-4 relative z-10">
              <span>Showing verified MRF & CEAT patterns with front/rear specification.</span>
              <span className="font-mono text-amber-500">Taj Master Catalogue v3.0</span>
            </div>
          </div>
        </div>

        {/* Right: Tyre Inspection / Spec Sheet Panel (5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeTyre ? (
              <motion.div
                key={activeTyre.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel-amber p-6 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${
                  activeTyre.brand === "MRF" ? "from-red-600/30 to-red-950/40" : "from-sky-600/30 to-sky-950/40"
                } blur-2xl opacity-35 pointer-events-none`}></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                        activeTyre.brand === "MRF"
                          ? "bg-red-500/20 border-red-500/40 text-red-400"
                          : "bg-sky-500/20 border-sky-500/40 text-sky-400"
                      }`}>
                        {activeTyre.brand} OFFICIAL
                      </span>
                      <span className="text-[10px] uppercase font-mono text-white/50">
                        {activeTyre.category} TYRE
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-white">
                      {activeTyre.brand} <span className={activeTyre.brand === "MRF" ? "text-red-400" : "text-sky-400"}>{activeTyre.pattern}</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        Size: {activeTyre.size}
                      </span>
                      {renderPositionBadge(activeTyre)}
                      {renderStockBadge(activeTyre)}
                    </div>
                  </div>
                </div>

                {/* Price Area: Replaced with Clear Contact Message */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-white/50 uppercase block">Price & Procurement</span>
                    <span className="text-sm font-bold text-amber-400 block mt-0.5">
                      Contact us for the latest price
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded border border-white/10 uppercase">
                    Live Rate on WhatsApp
                  </span>
                </div>

                {/* Ambiguous Position Alert if applicable */}
                {!activeTyre.isPositionConfirmed && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex gap-2.5 items-start mb-6">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase text-[10px] font-mono">Position Verification Needed</span>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                        This pattern entry is marked with an asterisk (*) in tyre master listings. Fitment position (Front or Rear) must be verified by the garage technician against your vehicle&apos;s specific rim diameter and swingarm clearance.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pattern & Compound Properties */}
                <div className="space-y-4 mb-6 border-b border-white/5 pb-6">
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    {activeTyre.description}
                  </p>

                  {/* Grip Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500" /> Wet/Dry Grip
                      </span>
                      <span className="font-semibold text-white">{activeTyre.grip}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${activeTyre.brand === "MRF" ? "bg-red-500" : "bg-sky-500"}`}
                        style={{ 
                          width: activeTyre.grip === "Excellent" ? "100%" : activeTyre.grip === "All-Terrain" ? "90%" : activeTyre.grip === "High" ? "80%" : "65%" 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Noise Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Comfort / Road Noise
                      </span>
                      <span className="font-semibold text-white">{activeTyre.noise}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${activeTyre.brand === "MRF" ? "bg-red-500" : "bg-sky-500"}`}
                        style={{ 
                          width: activeTyre.noise === "Ultra Silent" ? "100%" : activeTyre.noise === "Low" ? "75%" : "50%" 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Durability Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/70 flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-amber-500" /> Tread Life / Durability
                      </span>
                      <span className="font-semibold text-white">{activeTyre.durability}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${activeTyre.brand === "MRF" ? "bg-red-500" : "bg-sky-500"}`}
                        style={{ 
                          width: activeTyre.durability === "Extreme Duty" ? "100%" : activeTyre.durability === "Ultra High" ? "85%" : "70%" 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Additional highlights: Warranty & Construction */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex gap-2.5 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-white/50 uppercase font-mono block leading-tight">WARRANTY</span>
                      <span className="text-xs font-bold text-white leading-tight">{activeTyre.warranty}</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-white/50 uppercase font-mono block leading-tight">TREAD FITMENT</span>
                      <span className="text-xs font-bold text-white leading-tight">
                        {activeTyre.position}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct WhatsApp Contact Button (Pre-filled message) */}
                <div className="flex flex-col gap-2.5">
                  <a
                    href={getWhatsAppTyreEnquiryUrl({
                      brand: activeTyre.brand,
                      pattern: activeTyre.pattern,
                      size: activeTyre.size,
                      position: activeTyre.position,
                      category: activeTyre.category,
                      isPositionConfirmed: activeTyre.isPositionConfirmed
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs uppercase tracking-widest text-center transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact on WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {!isWhatsAppConfigured() && (
                    <span className="text-[10px] text-amber-400/80 font-mono text-center block">
                      Note: Set NEXT_PUBLIC_WHATSAPP_URL in .env to connect your official business number.
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-white/40 text-xs">
                Select a tyre on the shelf to inspect its specifications.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
