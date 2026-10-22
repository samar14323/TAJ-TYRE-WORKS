"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  CalendarDays, 
  Car, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  ChevronRight, 
  Bell, 
  ArrowRight, 
  Info, 
  Phone,
  UserCheck
} from "lucide-react";
import { dbStore, Customer } from "@/lib/store";

export default function CustomerHome() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [userName, setUserName] = useState("Client");

  useEffect(() => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    const name = localStorage.getItem("ttw_currentUserName") || "Mohammad Samar";
    setUserName(name);

    // Look up customer details in store
    const list = dbStore.getCustomers();
    const found = list.find((c) => c.phone === phone);
    if (found) {
      setCustomer(found);
    } else {
      // Fallback fallback
      const mockCustomer: Customer = {
        id: "c-temp",
        name: name,
        phone: phone,
        visits: 5,
        purchasesCount: 1,
        totalSpent: 7700,
        trustLevel: "Silver",
        savings: 800,
        vehicles: [
          { id: "v-temp", model: "Honda City (2021)", plateNumber: "DL3C-AM-1234", tyreInstalled: "Apollo Alnac 4G", installDate: "2025-05-10", mileage: 34500, warrantyExpiry: "2030-05-10", nextReplacement: "2028-10-15" }
        ],
        notes: ""
      };
      setCustomer(mockCustomer);
    }
  }, []);

  const activeVehicle = customer?.vehicles[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          PERSONALIZED CLIENT CONSOLE
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
          Good day, <span className="text-amber-500">{userName}</span>
        </h2>
        <p className="text-xs text-white/60 mt-1.5 max-w-xl">
          Welcome back. Here is the real-time status of your active tyre warranties, garage appointments, and unlockable loyalty rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Actions & Vehicle (LHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Actions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/customer/appointments" 
              className="p-5 bg-cyber-gray hover:bg-cyber-gray-light border border-white/5 hover:border-amber-500/30 rounded-2xl flex flex-col justify-between h-40 transition group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition"></div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-amber-500 transition">Book Appointment</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">Schedule alignment, balancing or nitrogen refills online.</p>
              </div>
            </Link>

            <Link 
              href="/customer/stock" 
              className="p-5 bg-cyber-gray hover:bg-cyber-gray-light border border-white/5 hover:border-amber-500/30 rounded-2xl flex flex-col justify-between h-40 transition group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition"></div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-amber-500 transition">Browse Inventory</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">Search dynamic sizes, brand stocks, and compare warranty models.</p>
              </div>
            </Link>
          </div>

          {/* Active Vehicle Card */}
          {activeVehicle ? (
            <div className="glass-panel p-5 rounded-2xl border-white/5">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                <span className="text-[10px] font-mono text-white/40 uppercase block">Active Primary Vehicle</span>
                <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeVehicle.plateNumber}
                </span>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-amber-500">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{activeVehicle.model}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase font-mono">Installed tyre</span>
                      <span className="font-semibold text-white/90 truncate block">{activeVehicle.tyreInstalled}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase font-mono">Current Odometer</span>
                      <span className="font-semibold text-white/90 block font-mono">{activeVehicle.mileage.toLocaleString()} KM</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase font-mono">Next replacement</span>
                      <span className="font-semibold text-amber-500 block font-mono">{activeVehicle.nextReplacement}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase font-mono">Warranty expiry</span>
                      <span className="font-semibold text-white/90 block font-mono">{activeVehicle.warrantyExpiry}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                <Link 
                  href="/customer/vehicles" 
                  className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  View Vehicle History Timeline
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-5 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
              No primary vehicle registered. Update profile to add details.
            </div>
          )}

          {/* Profile Correction Callout */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                Need to correct your mobile or plate number?
              </h4>
              <p className="text-[10px] text-white/50 mt-0.5">
                Submit a correction request for workshop verification and updates.
              </p>
            </div>
            <Link
              href="/customer/profile"
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-lg border border-amber-500/20 transition shrink-0"
            >
              Request Correction
            </Link>
          </div>
        </div>

        {/* Loyalty & Offers summary (RHS: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Loyalty Circle Indicator Card */}
          <div className="glass-panel-amber p-6 rounded-2xl border-amber-500/10 flex flex-col items-center text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block mb-4">
              TAJ LOYALTY CARD
            </span>

            {/* Visit Progress Circle (Mathematical SVG representation) */}
            {customer && (
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                {/* Background Ring SVG */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-white/5 fill-transparent" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-amber-500 fill-transparent transition-all duration-500" 
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(20, customer.visits) / 20)}`}
                  />
                </svg>
                {/* Centered Stats */}
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white font-mono block">
                    {customer.visits}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-mono block -mt-1">
                    /20 Visits
                  </span>
                </div>
              </div>
            )}

            {customer && (
              <div className="w-full space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {customer.visits >= 20 ? "Platinum VIP Member" : customer.visits >= 10 ? "Gold Tier Member" : "Silver Tier Member"}
                  </h4>
                  <span className="text-[10px] font-mono text-amber-500 block mt-0.5">
                    {customer.visits < 5 
                      ? `${5 - customer.visits} more visits to unlock 10% OFF` 
                      : customer.visits < 10 
                      ? `${10 - customer.visits} more visits to unlock 20% OFF` 
                      : customer.visits < 20 
                      ? `${20 - customer.visits} more visits to achieve VIP status`
                      : "Maximum loyalty rewards unlocked!"}
                  </span>
                </div>

                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-[11px] text-white/60 leading-relaxed text-left flex gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Loyalty visits are ticked and recorded by the shop manager **Samar** during tyre fitting checks at checkout.
                  </span>
                </div>

                <Link 
                  href="/customer/offers" 
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider text-center transition block"
                >
                  View Unlocked Coupons
                </Link>
              </div>
            )}
          </div>

          {/* Quick Contact & Consultation */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            <h4 className="text-xs font-mono text-white/40 uppercase">DIRECT CONSOLE CHAT</h4>
            
            <div className="space-y-3">
              <a 
                href={`https://wa.me/919199936181?text=Hi%20Samar,%20I'm%20signed%20in%20to%20my%20Customer%20Dashboard%20and%20need%20assistance%20regarding%20my%20${activeVehicle?.model || 'vehicle'}%20tyres.`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white/90 font-medium transition group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Consult Mohammad Samar</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition" />
              </a>
              
              <a 
                href="tel:9199936181"
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white/90 font-medium transition group"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>Call Hotline Direct</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:translate-x-1 transition" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
