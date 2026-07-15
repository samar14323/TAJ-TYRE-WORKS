"use client";

import React, { useState } from "react";
import { Search, Info, Check, RefreshCw } from "lucide-react";

interface VehicleRecommendation {
  type: string;
  brand: string;
  model: string;
  frontSize: string;
  rearSize: string;
  notes: string;
}

const mockRecommendations: VehicleRecommendation[] = [
  // Cars
  { type: "Car", brand: "Maruti Suzuki", model: "Swift (2018-Present)", frontSize: "185/70 R14", rearSize: "185/70 R14", notes: "Best brands: Apollo Alnac 4G, MRF ZLX" },
  { type: "Car", brand: "Maruti Suzuki", model: "Baleno", frontSize: "185/65 R15", rearSize: "185/65 R15", notes: "Best brands: Goodyear TripleMax, Michelin XM2+" },
  { type: "Car", brand: "Hyundai", model: "i20", frontSize: "195/55 R16", rearSize: "195/55 R16", notes: "Best brands: CEAT SecuraDrive, Bridgestone Sturdo" },
  { type: "Car", brand: "Honda", model: "City", frontSize: "185/60 R15", rearSize: "185/60 R15", notes: "Best brands: Yokohama Earth-1, Apollo Aspire" },
  { type: "Car", brand: "Tata", model: "Nexon", frontSize: "215/60 R16", rearSize: "215/60 R16", notes: "Best SUV tyres: JK Ranger, Goodyear Wrangler" },
  { type: "Car", brand: "Mahindra", model: "Scorpio Classic", frontSize: "235/70 R16", rearSize: "235/70 R16", notes: "All-terrain tyres recommended: Apollo Apterra AT2, MRF Wanderer" },
  
  // Bikes
  { type: "Bike", brand: "Hero", model: "Splendor Plus", frontSize: "80/100-18", rearSize: "80/100-18", notes: "Best sellers: CEAT Gripp X3, MRF Nylogrip Ezeeride" },
  { type: "Bike", brand: "Royal Enfield", model: "Classic 350", frontSize: "90/90-19", rearSize: "120/80-18", notes: "Heavy-duty road grips: CEAT Zoom Plus, MRF Zapper" },
  { type: "Bike", brand: "Honda", model: "Activa (Scooter)", frontSize: "90/90-12", rearSize: "90/100-10", notes: "Tubeless: CEAT Milaze, Apollo Actigrip" },

  // Commercial / Trucks
  { type: "Truck/Bus", brand: "Tata", model: "Signa 4825.T", frontSize: "295/90 R20", rearSize: "295/90 R20", notes: "Radial truck tyre: Apollo EnduRace, JK Jet Steel" },
  { type: "Truck/Bus", brand: "Ashok Leyland", model: "U-Truck", frontSize: "10.00 R20", rearSize: "10.00 R20", notes: "Mining & Heavy construction: MRF Musclerok, CEAT Mile XL" },

  // Tractors
  { type: "Tractor", brand: "Mahindra", model: "Arjun Novo 605", frontSize: "7.50-16", rearSize: "16.9-28", notes: "Agriculture tread: Birla Shaan, Apollo FX 515" },
  { type: "Tractor", brand: "John Deere", model: "5310", frontSize: "6.50-20", rearSize: "16.9-28", notes: "High traction mud lugs: MRF Shakti Life, CEAT Vardhan" }
];

export default function TyreSizeFinder() {
  const [vehicleType, setVehicleType] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [result, setResult] = useState<VehicleRecommendation | null>(null);

  // Derive available brands based on selected type
  const availableBrands = Array.from(
    new Set(
      mockRecommendations
        .filter((rec) => !vehicleType || rec.type === vehicleType)
        .map((rec) => rec.brand)
    )
  );

  // Derive available models based on selected type & brand
  const availableModels = mockRecommendations.filter(
    (rec) =>
      (!vehicleType || rec.type === vehicleType) &&
      (!selectedBrand || rec.brand === selectedBrand)
  );

  const handleTypeChange = (type: string) => {
    setVehicleType(type);
    setSelectedBrand("");
    setSelectedModel("");
    setResult(null);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setResult(null);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    const found = mockRecommendations.find(
      (rec) =>
        (!vehicleType || rec.type === vehicleType) &&
        (!selectedBrand || rec.brand === selectedBrand) &&
        rec.model === model
    );
    if (found) {
      setResult(found);
    }
  };

  const handleReset = () => {
    setVehicleType("");
    setSelectedBrand("");
    setSelectedModel("");
    setResult(null);
  };

  return (
    <div className="glass-panel-amber p-6 md:p-8 rounded-2xl w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Background neon blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block mb-1">
            Smart Recommendations
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-500" />
            Tyre Size Finder
          </h3>
        </div>
        
        {(vehicleType || selectedBrand || selectedModel) && (
          <button
            onClick={handleReset}
            className="self-start md:self-auto text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Finder
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Vehicle Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-white/60 uppercase">1. Vehicle Type</label>
          <div className="grid grid-cols-2 gap-2">
            {["Car", "Bike", "Truck/Bus", "Tractor"].map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold transition border text-left ${
                  vehicleType === t
                    ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10"
                    : "bg-cyber-gray border-white/5 text-white/70 hover:border-white/10 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Brand */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-white/60 uppercase">2. Select Manufacturer</label>
          <select
            disabled={!vehicleType}
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2.5 px-3 text-sm text-white/80 focus:border-amber-500 outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Select Brand --</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3: Model */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-white/60 uppercase">3. Choose Model</label>
          <select
            disabled={!selectedBrand}
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2.5 px-3 text-sm text-white/80 focus:border-amber-500 outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="">-- Select Model --</option>
            {availableModels.map((rec) => (
              <option key={rec.model} value={rec.model}>
                {rec.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Section */}
      {result ? (
        <div className="mt-8 p-5 bg-cyber-gray border border-amber-500/20 rounded-xl animate-fade-in relative">
          <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-500 p-1.5 rounded-full border border-amber-500/20">
            <Check className="w-4 h-4" />
          </div>

          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 mb-2.5 inline-block">
            RECOMMENDED FITMENT
          </span>

          <h4 className="text-lg font-bold text-white mb-4">
            {result.brand} - <span className="text-amber-500">{result.model}</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-cyber-gray-light rounded-lg border border-white/5">
              <span className="text-xs text-white/50 block mb-1">FRONT TYRE SIZE</span>
              <span className="text-base font-mono font-bold text-white tracking-wide">
                {result.frontSize}
              </span>
            </div>
            <div className="p-3 bg-cyber-gray-light rounded-lg border border-white/5">
              <span className="text-xs text-white/50 block mb-1">REAR TYRE SIZE</span>
              <span className="text-base font-mono font-bold text-white tracking-wide">
                {result.rearSize}
              </span>
            </div>
          </div>

          <div className="flex gap-2.5 items-start bg-white/5 p-3 rounded-lg text-xs text-white/80 leading-relaxed border border-white/5">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-0.5">Fitting Notes:</p>
              <p className="text-white/75">{result.notes}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const el = document.getElementById("available-stock");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition shadow-lg shadow-amber-500/20"
            >
              Browse Available Stock
            </button>
            <a 
              href={`https://wa.me/919199936181?text=Hi%20Samar,%20I'm%20looking%20for%20tyres%20for%20my%20${encodeURIComponent(result.brand + ' ' + result.model)}.%20Front%20size%20is%20${result.frontSize}%20and%20Rear%20size%20is%20${result.rearSize}.%20Please%20suggest%20options%20and%20prices.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition"
            >
              Consult Mohammad Samar (WhatsApp)
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-8 p-6 border border-dashed border-white/5 rounded-xl text-center text-white/40 text-xs">
          Select vehicle type, manufacturer, and model above to instantly find your recommended tyre size.
        </div>
      )}
    </div>
  );
}
