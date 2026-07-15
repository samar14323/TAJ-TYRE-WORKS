"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, Flame } from "lucide-react";

interface ShowroomTyre {
  id: string;
  name: string;
  brand: "Apollo" | "MRF" | "CEAT" | "JK" | "Birla" | "Goodyear" | "Michelin" | "Bridgestone" | "Yokohama";
  category: "Car" | "SUV" | "Truck" | "Tractor" | "Bike";
  price: string;
  warranty: string;
  grip: "Excellent" | "High" | "Medium" | "All-Terrain";
  noise: "Ultra Silent" | "Low" | "Moderate";
  durability: "Ultra High" | "High" | "Extreme Duty";
  imageBg: string; // Background color pattern for 3D look
  status: "Available" | "Out of Stock" | "Limited Stock";
}

const showroomTyres: ShowroomTyre[] = [
  {
    id: "tyre-1",
    name: "Alnac 4G",
    brand: "Apollo",
    category: "Car",
    price: "₹3,850",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageBg: "from-amber-600/30 to-amber-950/40",
    status: "Available"
  },
  {
    id: "tyre-2",
    name: "Wanderer A/T",
    brand: "MRF",
    category: "SUV",
    price: "₹7,200",
    warranty: "6 Years",
    grip: "All-Terrain",
    noise: "Moderate",
    durability: "Extreme Duty",
    imageBg: "from-red-600/30 to-red-950/40",
    status: "Available"
  },
  {
    id: "tyre-3",
    name: "SecuraDrive",
    brand: "CEAT",
    category: "Car",
    price: "₹4,300",
    warranty: "5 Years",
    grip: "High",
    noise: "Ultra Silent",
    durability: "High",
    imageBg: "from-blue-600/30 to-blue-950/40",
    status: "Limited Stock"
  },
  {
    id: "tyre-4",
    name: "Primacy 4 ST",
    brand: "Michelin",
    category: "Car",
    price: "₹9,100",
    warranty: "3 Years",
    grip: "Excellent",
    noise: "Ultra Silent",
    durability: "High",
    imageBg: "from-emerald-600/30 to-emerald-950/40",
    status: "Available"
  },
  {
    id: "tyre-5",
    name: "Jet Steel JDH5",
    brand: "JK",
    category: "Truck",
    price: "₹18,500",
    warranty: "3 Years (Unconditional)",
    grip: "High",
    noise: "Moderate",
    durability: "Extreme Duty",
    imageBg: "from-purple-600/30 to-purple-950/40",
    status: "Available"
  },
  {
    id: "tyre-6",
    name: "Sturdo",
    brand: "Bridgestone",
    category: "Car",
    price: "₹5,600",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageBg: "from-zinc-600/30 to-zinc-900/40",
    status: "Available"
  }
];

export default function Showroom3D() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTyre, setActiveTyre] = useState<ShowroomTyre | null>(showroomTyres[0]);

  const filteredTyres = selectedCategory === "All"
    ? showroomTyres
    : showroomTyres.filter((t) => t.category === selectedCategory);

  return (
    <div className="w-full">
      {/* Category selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["All", "Car", "SUV", "Truck"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition border ${
              (selectedCategory === cat)
                ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                : "bg-cyber-gray border-white/5 text-white/70 hover:border-white/10 hover:text-white"
            }`}
          >
            {cat === "All" ? "All Showroom" : `${cat} Tyres`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Shelf Layout (Left: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="relative p-6 bg-cyber-gray/40 border border-white/5 rounded-2xl overflow-hidden min-h-[400px] flex flex-col justify-between">
            {/* Shelf structure background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase block">
              Hover to select & Inspect
            </span>

            {/* Virtual Shelves layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10 my-8">
              {filteredTyres.map((tyre) => (
                <div key={tyre.id} className="group relative">
                  {/* The Shelf Layer */}
                  <div className="absolute -bottom-2 left-0 right-0 h-4 bg-cyber-gray border-t border-white/10 shadow-lg skew-x-12 origin-bottom pointer-events-none"></div>
                  
                  {/* Tyre 3D Card wrapper */}
                  <motion.div
                    whileHover={{ 
                      y: -25, 
                      rotateY: 15,
                      rotateX: -5,
                      scale: 1.05 
                    }}
                    onClick={() => setActiveTyre(tyre)}
                    className={`cursor-pointer relative aspect-square rounded-xl p-4 flex flex-col items-center justify-between border transition duration-300 ${
                      activeTyre?.id === tyre.id
                        ? "bg-cyber-gray-light border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
                        : "bg-cyber-black/70 border-white/5 group-hover:border-white/15"
                    }`}
                    style={{ transformStyle: "preserve-3d", perspective: "800px" }}
                  >
                    {/* Glowing background ring */}
                    <div className={`absolute inset-4 rounded-full bg-gradient-to-tr ${tyre.imageBg} blur-xl opacity-40 group-hover:opacity-75 transition-opacity`}></div>
                    
                    {/* Simulated 3D Tyre render */}
                    <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none transition group-hover:rotate-12 duration-500">
                      {/* Outer tyre border */}
                      <div className="absolute w-20 h-20 rounded-full border-[10px] border-zinc-800 flex items-center justify-center shadow-2xl">
                        {/* Metallic Rim spoke representation */}
                        <div className="absolute w-14 h-14 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[7px] text-amber-500 font-bold">
                            {tyre.brand[0]}
                          </div>
                        </div>
                        {/* Tyre Tread indicators */}
                        <div className="absolute inset-0 rounded-full border border-dashed border-black/80 animate-spin-slow"></div>
                      </div>
                    </div>

                    <div className="relative z-10 text-center w-full">
                      <span className="text-[10px] uppercase font-mono block text-white/50 mb-0.5">
                        {tyre.brand}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-tight truncate">
                        {tyre.name}
                      </h4>
                      <span className="text-xs font-mono font-semibold text-amber-500 block mt-1">
                        {tyre.price}
                      </span>
                    </div>

                    {/* Stock badge */}
                    <span className={`absolute top-2 right-2 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      tyre.status === "Available"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : tyre.status === "Limited Stock"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}>
                      {tyre.status}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="text-xs text-white/40 flex justify-between items-center border-t border-white/5 pt-4">
              <span>Click a tyre to inspect its compound properties.</span>
              <span className="font-mono text-amber-500">Taj 3D Rack v1.0</span>
            </div>
          </div>
        </div>

        {/* Tyre Inspection / Spec Sheet Panel (Right: 5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeTyre && (
              <motion.div
                key={activeTyre.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel-amber p-6 rounded-2xl shadow-2xl relative overflow-hidden"
              >
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${activeTyre.imageBg} blur-2xl opacity-30 pointer-events-none`}></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs uppercase font-mono text-amber-500 tracking-wider">
                      SPECIFICATION HUB
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {activeTyre.brand} <span className="text-amber-500">{activeTyre.name}</span>
                    </h3>
                    <span className="text-xs text-white/50 font-mono mt-0.5 block">
                      Category: {activeTyre.category} Fitment
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/40 block">EST. PRICE</span>
                    <span className="text-xl font-mono font-bold text-amber-500">
                      {activeTyre.price}
                    </span>
                  </div>
                </div>

                {/* Compound Properties */}
                <div className="space-y-4 mb-6 border-b border-white/5 pb-6">
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
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: activeTyre.grip === "Excellent" ? "100%" : activeTyre.grip === "All-Terrain" ? "90%" : activeTyre.grip === "High" ? "80%" : "60%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Noise Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/77 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Comfort / Cabin Noise
                      </span>
                      <span className="font-semibold text-white">{activeTyre.noise}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: activeTyre.noise === "Ultra Silent" ? "100%" : activeTyre.noise === "Low" ? "75%" : "50%" }}
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
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: activeTyre.durability === "Extreme Duty" ? "100%" : activeTyre.durability === "Ultra High" ? "85%" : "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Additional highlights */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 flex gap-2 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-white/50 block leading-tight">WARRANTY</span>
                      <span className="text-xs font-bold text-white">{activeTyre.warranty}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex gap-2 items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-white/50 block leading-tight">STRUCTURE</span>
                      <span className="text-xs font-bold text-white">Radial Tubeless</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://wa.me/919199936181?text=Hi%20Samar,%20I'm%20interested%20in%20the%20${activeTyre.brand}%20${activeTyre.name}%20(${activeTyre.category}%20category).%20Please%20let%20me%20know%20availability%20and%20the%20latest%20price.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-widest text-center transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                  >
                    Consult for Latest Price
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => {
                      const el = document.getElementById("tyre-comparison");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-white font-semibold text-xs tracking-wider transition hover:bg-white/5"
                  >
                    Compare with other brands
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
