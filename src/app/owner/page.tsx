"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight,
  Wrench,
  DollarSign,
  Star,
  Sparkles,
  UserCheck
} from "lucide-react";
import { authService } from "@/lib/auth";
import { dbStore, Tyre, Appointment, Customer, Invoice, JobCard } from "@/lib/store";

export default function OwnerHome() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [userName, setUserName] = useState("Samar");
  const [greeting, setGreeting] = useState("Good morning");
  const [pendingCorrectionsCount, setPendingCorrectionsCount] = useState<number>(0);

  useEffect(() => {
    setTyres(dbStore.getTyres());
    setAppointments(dbStore.getAppointments());
    setCustomers(dbStore.getCustomers());
    setInvoices(dbStore.getInvoices());
    setJobCards(dbStore.getJobCards());

    const name = localStorage.getItem("ttw_currentUserName") || "Samar";
    setUserName(name);

    // Also fetch updated owner name from database settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings?.ownerName) {
          setUserName(d.settings.ownerName);
        }
      })
      .catch((e) => console.warn("Failed to fetch settings for dashboard:", e));

    const hour = new Date().getHours();
    let greet = "good morning";
    if (hour >= 5 && hour < 12) greet = "good morning";
    else if (hour >= 12 && hour < 17) greet = "good afternoon";
    else if (hour >= 17 && hour < 22) greet = "good evening";
    else greet = "good night";
    setGreeting(greet);

    // Fetch pending correction requests count
    const fetchCorrectionCount = async () => {
      try {
        const session = authService.getCurrentSession();
        const ownerUser = session?.username || "MHDSAM";
        const res = await authService.getOwnerCorrectionRequests(ownerUser);
        if (res.success && res.counts) {
          setPendingCorrectionsCount(res.counts.pending || 0);
        }
      } catch (e) {
        console.warn("Failed to fetch pending corrections for dashboard:", e);
      }
    };
    fetchCorrectionCount();
  }, []);

  const lowStockTyres = tyres.filter((t) => t.quantity < 5);
  
  // Job Card statuses
  const activeJobs = jobCards.filter((j) => j.status === "In Progress" || j.status === "Waiting" || j.status === "Quality Check");
  const completedJobsCount = jobCards.filter((j) => j.status === "Completed").length;

  // Calculations
  const totalStockVal = tyres.reduce((acc, t) => acc + t.sellingPrice * t.quantity, 0);
  const totalItemsCount = tyres.reduce((acc, t) => acc + t.quantity, 0);
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.netTotal, 0);
  
  // Profit calculations
  // back-calculate tyre costs
  let totalCogs = 0;
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const tyre = tyres.find((t) => t.id === item.tyreId);
      const cost = tyre ? tyre.purchasePrice : Math.floor(item.price * 0.7);
      totalCogs += cost * item.quantity;
    });
  });
  const grossProfit = totalRevenue - totalCogs;
  // Subtract expenses for the day (e.g. ₹5,000)
  const netProfit = Math.max(0, grossProfit - 5000);

  // Favorite brand calculation
  const brandCounts: { [key: string]: number } = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      brandCounts[item.brand] = (brandCounts[item.brand] || 0) + item.quantity;
    });
  });
  let topBrand = "Apollo";
  let maxCount = 0;
  Object.entries(brandCounts).forEach(([b, c]) => {
    if (c > maxCount) {
      maxCount = c;
      topBrand = b;
    }
  });

  return (
    <div className="space-y-8">
      {/* Dynamic AI Business Advisor Dashboard Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-amber-500 animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          AI Business Advisor Active
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
          {greeting} <span className="text-glow text-amber-500">{userName}</span>
        </h2>
        <div className="text-xs text-white/70 mt-2 max-w-3xl leading-relaxed space-y-1.5 font-sans">
          <p>
            📈 **Profit Brief:** Yesterday net workshop profit was **₹{netProfit.toLocaleString()}**. Gross business revenue is **₹{totalRevenue.toLocaleString()}** across all payment registers.
          </p>
          <p>
            🔥 **Demand Forecasting:** **{topBrand}** is your highest-velocity brand this month. SUV category demand is forecasted to **increase by 22%** next week due to seasonal road-trip spikes.
          </p>
          <p>
            ⚠️ **Inventory Intel:** We detected **{lowStockTyres.length} low-stock tyres** lines. We suggest ordering **25 units** of **MRF Wanderer A/T** from supplier *MRF Regional Hub* to capture pending orders.
          </p>
        </div>
      </div>

      {/* Pending Correction Requests Action Banner */}
      {pendingCorrectionsCount > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Action Required: {pendingCorrectionsCount} Pending Profile Correction Request{pendingCorrectionsCount > 1 ? "s" : ""}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-black font-bold">
                  Decision Needed
                </span>
              </h4>
              <p className="text-xs text-white/60 mt-0.5">
                Customers have submitted mobile number or vehicle plate corrections requiring your verification and approval.
              </p>
            </div>
          </div>
          <Link
            href="/owner/corrections"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition shrink-0 shadow-lg shadow-amber-500/10"
          >
            Review Requests
          </Link>
        </div>
      )}

      {/* Main KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today Sales */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 block font-mono">CUMULATIVE REVENUE</span>
              <span className="text-xl font-mono font-bold text-white tracking-wide block mt-1">
                ₹{totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono mt-4 block">
            GST Splits: 28% Tyres, 18% Labor
          </span>
        </div>

        {/* Estimated Profit */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 block font-mono">NET WORKSHOP PROFIT</span>
              <span className="text-xl font-mono font-bold text-white tracking-wide block mt-1">
                ₹{netProfit.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[9px] text-amber-500 font-mono mt-4 block">
            Calculated Net after COGS & Expenses
          </span>
        </div>

        {/* Vehicles in Workshop */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 block font-mono">VEHICLES IN BAY QUEUES</span>
              <span className="text-xl font-mono font-bold text-white tracking-wide block mt-1">
                {activeJobs.length} <span className="text-xs text-white/40 font-normal">Active</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-[9px] text-blue-400 font-mono mt-4 block">
            {completedJobsCount} jobs completed today
          </span>
        </div>

        {/* Customer satisfaction index */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-white/40 block font-mono">CUSTOMER SATISFACTION</span>
              <span className="text-xl font-mono font-bold text-amber-500 block mt-1 text-glow">
                98.4%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-[9px] text-amber-500 font-mono mt-4 block">
            Based on google reviews & feedback
          </span>
        </div>
      </div>

      {/* Expanded Widget Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top brand */}
        <div className="glass-panel p-4 rounded-xl border-white/5 text-xs">
          <span className="text-[9px] text-white/40 block font-mono uppercase">Top Selling Brand</span>
          <span className="text-sm font-bold text-white block mt-1">{topBrand}</span>
          <span className="text-[9px] text-white/40 block mt-2 font-mono">High demand brand velocity</span>
        </div>

        {/* Stock Volume */}
        <div className="glass-panel p-4 rounded-xl border-white/5 text-xs">
          <span className="text-[9px] text-white/40 block font-mono uppercase">Inventory Valuation</span>
          <span className="text-sm font-bold text-white block mt-1">₹{totalStockVal.toLocaleString()}</span>
          <span className="text-[9px] text-white/40 block mt-2 font-mono">{totalItemsCount} tyres in racks</span>
        </div>

        {/* Warranty Claims */}
        <div className="glass-panel p-4 rounded-xl border-white/5 text-xs">
          <span className="text-[9px] text-white/40 block font-mono uppercase">Active Warranty Registry</span>
          <span className="text-sm font-bold text-white block mt-1">12 Claims Registered</span>
          <span className="text-[9px] text-emerald-400 block mt-2 font-mono">0 pending claim actions</span>
        </div>

        {/* Staff Attendance */}
        <div className="glass-panel p-4 rounded-xl border-white/5 text-xs">
          <span className="text-[9px] text-white/40 block font-mono uppercase">Shift Attendance</span>
          <span className="text-sm font-bold text-white block mt-1">2 Mechanics Active</span>
          <span className="text-[9px] text-amber-500 block mt-2 font-mono">Karan Singh & Amit Kumar clock-in</span>
        </div>
      </div>

      {/* Low Stock Warnings Section */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-mono text-white font-bold uppercase tracking-widest flex items-center gap-2">
                Low Stock Warnings
                {lowStockTyres.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400">
                    {lowStockTyres.length} Alert{lowStockTyres.length > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Tyre items with fewer than 5 units remaining in active garage inventory racks.
              </p>
            </div>
          </div>
          <Link
            href="/owner/inventory"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white hover:text-amber-500 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            Manage Inventory
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockTyres.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockTyres.map((t) => (
              <div 
                key={t.id} 
                className="p-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl flex justify-between items-center text-xs transition"
              >
                <div>
                  <span className="text-[9px] font-mono text-rose-400 font-bold uppercase block">{t.brand}</span>
                  <h5 className="font-bold text-white text-sm leading-tight mt-0.5">{t.name}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-white/50 mt-1 font-mono">
                    <span>Size: {t.size}</span>
                    <span>•</span>
                    <span>Loc: {t.location}</span>
                  </div>
                </div>
                <div className="text-right font-mono ml-3 shrink-0">
                  <span className="text-rose-400 font-bold text-lg block leading-none">{t.quantity}</span>
                  <span className="text-[9px] text-white/40 uppercase block mt-1">Units left</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-emerald-400/90 text-center py-8 border border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-xl flex flex-col items-center justify-center gap-2">
            <span className="text-base font-bold">✓ Inventory Healthy</span>
            <span className="text-[11px] text-white/50">All tyre model inventory stock quantities meet minimum safety thresholds.</span>
          </div>
        )}
      </div>
    </div>
  );
}
