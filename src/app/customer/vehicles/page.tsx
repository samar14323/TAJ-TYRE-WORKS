"use client";

import React, { useState, useEffect } from "react";
import { Car, Clock, ShieldCheck, Milestone, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { dbStore, Customer, Vehicle } from "@/lib/store";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  type: "installation" | "alignment" | "balancing" | "nitrogen" | "puncture";
}

const mockTimelineData: Record<string, TimelineEvent[]> = {
  "DL3C-AM-1234": [
    { year: "2025-05-10", title: "Apollo Alnac 4G Installation", description: "Purchased and installed 2 front tyres with tubeless metal valves.", type: "installation" },
    { year: "2025-11-15", title: "Computerized Wheel Alignment", description: "Odometer: 18,200 KM. Corrected toe angle alignment. Rotated tyres front-to-rear.", type: "alignment" },
    { year: "2026-03-02", title: "Precision Wheel Balancing", description: "Spot-balanced front wheel weights to remove minor steering vibration.", type: "balancing" },
    { year: "2026-07-15", title: "Nitrogen Gas Pressure Top-up", description: "Topped up all tyres to 33 PSI with 98% pure Nitrogen.", type: "nitrogen" }
  ],
  "HR26-BY-5678": [
    { year: "2026-01-15", title: "CEAT SecuraDrive Fitting", description: "Fitted 4 tyres with new rubber valves.", type: "installation" },
    { year: "2026-05-10", title: "Tread Depth & Wear Inspection", description: "Odometer: 8,400 KM. Checking casing wear index. Excellent condition.", type: "alignment" }
  ],
  "UP16-TR-8899": [
    { year: "2025-09-08", title: "MRF Wanderer A/T Installation", description: "Heavy-duty off-road tread fitting.", type: "installation" },
    { year: "2026-02-14", title: "Wheel Alignment Check", description: "High-precision alignment correction due to off-road steering impact.", type: "alignment" }
  ]
};

export default function CustomerVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>("");

  useEffect(() => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    const list = dbStore.getCustomers();
    const found = list.find((c) => c.phone === phone);
    if (found && found.vehicles.length > 0) {
      setVehicles(found.vehicles);
      setActiveVehicleId(found.vehicles[0].id);
    }
  }, []);

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const activeTimeline = activeVehicle ? mockTimelineData[activeVehicle.plateNumber] || [] : [];

  const getTimelineIconStyle = (type: string) => {
    switch (type) {
      case "installation":
        return "bg-emerald-500/10 border-emerald-500 text-emerald-400";
      case "alignment":
        return "bg-amber-500/10 border-amber-500 text-amber-400";
      case "balancing":
        return "bg-blue-500/10 border-blue-500 text-blue-400";
      default:
        return "bg-purple-500/10 border-purple-500 text-purple-400";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          VEHICLE PROFILE & MAINTENANCE LOGS
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          My Garage Fleet
        </h2>
      </div>

      {/* Vehicle Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVehicleId(v.id)}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              activeVehicleId === v.id
                ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10"
                : "bg-cyber-gray border-white/5 text-white/70 hover:border-white/10 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{v.model}</span>
            <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 border ${
              activeVehicleId === v.id ? "bg-black/10 border-black/20 text-black" : "bg-white/5 border-white/10 text-white/50"
            }`}>
              {v.plateNumber}
            </span>
          </button>
        ))}
      </div>

      {activeVehicle ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Spec details Card (LHS: 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <span className="text-[9px] font-mono text-amber-500 block uppercase mb-4">SPECIFICATION MATRIX</span>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Model Profile:</span>
                  <span className="text-xs font-bold text-white">{activeVehicle.model}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Registration Plate:</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{activeVehicle.plateNumber}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Installed Tyre Model:</span>
                  <span className="text-xs font-bold text-white">{activeVehicle.tyreInstalled}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Installation Date:</span>
                  <span className="text-xs font-mono font-bold text-white">{activeVehicle.installDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Odometer Mileage:</span>
                  <span className="text-xs font-mono font-bold text-white">{activeVehicle.mileage.toLocaleString()} KM</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-3">
                  <span className="text-xs text-white/50">Warranty Expiry:</span>
                  <span className="text-xs font-mono font-bold text-white">{activeVehicle.warrantyExpiry}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-xs text-white/50">Est. Next Replacement:</span>
                  <span className="text-xs font-mono font-bold text-amber-500">{activeVehicle.nextReplacement}</span>
                </div>
              </div>
            </div>

            {/* Health parameters */}
            <div className="p-5 bg-cyber-gray border border-white/5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-500">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Tire Tread Health</h4>
                <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                  Based on mileage log, remaining tread index is estimated at **68%**. Next balancing recommended at 40,000 KM.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Visual Logs (RHS: 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
              Maintenance History Timeline
            </h3>

            <div className="relative pl-6 border-l border-white/5 space-y-6 py-2">
              {activeTimeline.map((evt, idx) => (
                <div key={idx} className="relative">
                  {/* Visual connector dot */}
                  <div className={`absolute -left-9 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center ${getTimelineIconStyle(evt.type)}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-amber-500 uppercase block mb-1">
                      {evt.year}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-1 bg-white/5 p-2.5 rounded border border-white/5">
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}

              {activeTimeline.length === 0 && (
                <div className="text-xs text-white/40 italic">
                  No maintenance timeline records logged yet for this vehicle plate.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
          No registered vehicle profiles found.
        </div>
      )}
    </div>
  );
}
