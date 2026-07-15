"use client";

import React, { useState } from "react";
import { Scale, Check, HelpCircle } from "lucide-react";

interface CompareTyre {
  name: string;
  brand: string;
  price: string;
  warranty: string;
  gripScore: number; // Out of 10
  noiseScore: number; // Out of 10
  mileageScore: number; // Out of 10
  suitability: string;
}

const compareTyresList: CompareTyre[] = [
  { brand: "Apollo", name: "Alnac 4G", price: "₹3,850", warranty: "5 Years", gripScore: 8, noiseScore: 7, mileageScore: 9, suitability: "Daily commuting, high durabilty" },
  { brand: "MRF", name: "Wanderer A/T", price: "₹7,200", warranty: "6 Years", gripScore: 9, noiseScore: 5, mileageScore: 8, suitability: "Off-roading, SUV, gravel roads" },
  { brand: "CEAT", name: "SecuraDrive", price: "₹4,300", warranty: "5 Years", gripScore: 8, noiseScore: 9, mileageScore: 8, suitability: "Highway cruising, high speed stability" },
  { brand: "Michelin", name: "Primacy 4 ST", price: "₹9,100", warranty: "3 Years", gripScore: 10, noiseScore: 10, mileageScore: 7, suitability: "Luxury cars, quietness, ultimate grip" },
  { brand: "JK", name: "UX Royale", price: "₹3,900", warranty: "5 Years", gripScore: 7, noiseScore: 7, mileageScore: 9, suitability: "Urban commuting, fuel efficiency" },
  { brand: "Bridgestone", name: "Sturdo", price: "₹5,600", warranty: "5 Years", gripScore: 9, noiseScore: 8, mileageScore: 9, suitability: "High mileage long distance travel" }
];

export default function TyreComparison() {
  const [tyre1Index, setTyre1Index] = useState<number>(0);
  const [tyre2Index, setTyre2Index] = useState<number>(2);

  const t1 = compareTyresList[tyre1Index];
  const t2 = compareTyresList[tyre2Index];

  return (
    <div id="tyre-comparison" className="glass-panel p-6 md:p-8 rounded-2xl w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[150px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs uppercase font-mono text-amber-500 tracking-widest block">
            Side-by-Side Analysis
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Tyre Comparison Tool
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Divider line for desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5 -translate-x-1/2"></div>

        {/* Tyre 1 Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-white/50">Compare Tyre A</label>
            <select
              value={tyre1Index}
              onChange={(e) => setTyre1Index(Number(e.target.value))}
              className="bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500 outline-none w-full"
            >
              {compareTyresList.map((t, idx) => (
                <option key={`t1-${idx}`} value={idx} disabled={idx === tyre2Index}>
                  {t.brand} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Details Card 1 */}
          <div className="p-4 bg-cyber-gray-dark border border-white/5 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase text-amber-500 font-mono tracking-wider">{t1.brand}</span>
              <h4 className="text-lg font-bold text-white mt-0.5">{t1.name}</h4>
              <span className="text-xs text-white/40 block mt-0.5">Est. {t1.price}</span>
            </div>

            <div className="space-y-3.5 my-6">
              {/* Grip */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Grip & Traction</span>
                  <span className="font-bold text-white">{t1.gripScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t1.gripScore * 10}%` }}></div>
                </div>
              </div>

              {/* Quietness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Cabin Quietness</span>
                  <span className="font-bold text-white">{t1.noiseScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t1.noiseScore * 10}%` }}></div>
                </div>
              </div>

              {/* Mileage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Tread Life / Mileage</span>
                  <span className="font-bold text-white">{t1.mileageScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t1.mileageScore * 10}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Warranty:</span>
                <span className="font-semibold text-white">{t1.warranty}</span>
              </div>
              <div className="text-[11px] text-white/70 leading-relaxed bg-white/5 p-2.5 rounded border border-white/5 mt-2">
                <span className="font-bold block text-[10px] text-white/40 mb-0.5">BEST SUITED FOR:</span>
                {t1.suitability}
              </div>
            </div>
          </div>
        </div>

        {/* Tyre 2 Selection */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono uppercase text-white/50">Compare Tyre B</label>
            <select
              value={tyre2Index}
              onChange={(e) => setTyre2Index(Number(e.target.value))}
              className="bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:border-amber-500 outline-none w-full"
            >
              {compareTyresList.map((t, idx) => (
                <option key={`t2-${idx}`} value={idx} disabled={idx === tyre1Index}>
                  {t.brand} - {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Details Card 2 */}
          <div className="p-4 bg-cyber-gray-dark border border-white/5 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase text-amber-500 font-mono tracking-wider">{t2.brand}</span>
              <h4 className="text-lg font-bold text-white mt-0.5">{t2.name}</h4>
              <span className="text-xs text-white/40 block mt-0.5">Est. {t2.price}</span>
            </div>

            <div className="space-y-3.5 my-6">
              {/* Grip */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Grip & Traction</span>
                  <span className="font-bold text-white">{t2.gripScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t2.gripScore * 10}%` }}></div>
                </div>
              </div>

              {/* Quietness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Cabin Quietness</span>
                  <span className="font-bold text-white">{t2.noiseScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t2.noiseScore * 10}%` }}></div>
                </div>
              </div>

              {/* Mileage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Tread Life / Mileage</span>
                  <span className="font-bold text-white">{t2.mileageScore}/10</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t2.mileageScore * 10}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Warranty:</span>
                <span className="font-semibold text-white">{t2.warranty}</span>
              </div>
              <div className="text-[11px] text-white/70 leading-relaxed bg-white/5 p-2.5 rounded border border-white/5 mt-2">
                <span className="font-bold block text-[10px] text-white/40 mb-0.5">BEST SUITED FOR:</span>
                {t2.suitability}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a 
          href={`https://wa.me/919199936181?text=Hi%20Samar,%20I'm%20comparing%20the%20${t1.brand}%20${t1.name}%20with%20the%20${t2.brand}%20${t2.name}.%20Can%20you%20please%20recommend%20which%20one%20is%20better%20and%20provide%20pricing%20options?`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition"
        >
          Consult Mohammad Samar on these options
        </a>
      </div>
    </div>
  );
}
