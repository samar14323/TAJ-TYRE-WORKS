"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Layers, 
  Calendar, 
  AlertTriangle, 
  CheckSquare, 
  Activity, 
  ArrowUpRight,
  ShieldCheck,
  TrendingDown,
  Wrench,
  DollarSign,
  Users,
  Compass,
  Star,
  Sparkles
} from "lucide-react";
import { dbStore, Tyre, Appointment, Customer, Invoice, JobCard } from "@/lib/store";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function OwnerHome() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", text: "Verify 3D Alignment calibrations", checked: true },
    { id: "2", text: "Check Apollo stock quantities", checked: true },
    { id: "3", text: "Clean laser alignment sensor glass lenses", checked: false },
    { id: "4", text: "Approve pending purchase order PO-002", checked: false },
    { id: "5", text: "Sync daily Cash Book ledgers with GST invoices", checked: true }
  ]);

  useEffect(() => {
    setTyres(dbStore.getTyres());
    setAppointments(dbStore.getAppointments());
    setCustomers(dbStore.getCustomers());
    setInvoices(dbStore.getInvoices());
    setJobCards(dbStore.getJobCards());
  }, []);

  const lowStockTyres = tyres.filter((t) => t.quantity < 5);
  const todayApts = appointments.filter((a) => a.date === new Date().toISOString().split("T")[0] || a.status === "Pending");
  
  // Job Card statuses
  const activeJobs = jobCards.filter((j) => j.status === "In Progress" || j.status === "Waiting" || j.status === "Quality Check");
  const completedJobsCount = jobCards.filter((j) => j.status === "Completed").length;

  const handleChecklistToggle = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

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
  // Subtract fake expenses for the day (e.g. ₹5,000)
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
          Good Morning, <span className="text-glow text-amber-500">Samar</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Checklist & Bay Management (LHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Service Bay Status Management */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-500" />
              Workshop Service Bays Monitor
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Bay 1 (Alignment)</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono uppercase animate-pulse">Occupied</span>
                </div>
                <p className="text-[10px] text-white/40 mt-2 font-mono">Vehicle: HR26-BY-5678</p>
                <p className="text-[10px] text-white/40 font-mono">Tech: Karan Singh</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Bay 2 (Fitting)</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">Available</span>
                </div>
                <p className="text-[10px] text-white/40 mt-2 font-mono">Vehicle: —</p>
                <p className="text-[10px] text-white/40 font-mono">Tech: —</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Bay 3 (Balancing)</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono uppercase">Available</span>
                </div>
                <p className="text-[10px] text-white/40 mt-2 font-mono">Vehicle: —</p>
                <p className="text-[10px] text-white/40 font-mono">Tech: —</p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Bay 4 (Nitrogen)</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono uppercase animate-pulse">Occupied</span>
                </div>
                <p className="text-[10px] text-white/40 mt-2 font-mono">Vehicle: DL3C-AM-1234</p>
                <p className="text-[10px] text-white/40 font-mono">Tech: Amit Kumar</p>
              </div>
            </div>
          </div>

          {/* Active Job Cards */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Active Job Cards Tracker
              </h3>
              <Link 
                href="/owner/billing" 
                className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-semibold"
              >
                Billing Terminal
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {jobCards.map((job) => (
                <div key={job.id} className="p-4 bg-cyber-gray border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 relative pl-6 overflow-hidden">
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                    job.status === "Completed" ? "bg-emerald-500" : job.status === "In Progress" ? "bg-blue-500" : "bg-amber-500"
                  }`}></div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white font-mono uppercase">{job.jobId}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        job.status === "Completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : job.status === "In Progress" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/50 space-y-0.5 font-mono">
                      <p>Client: <span className="text-white">{job.customerName} ({job.customerPhone})</span></p>
                      <p>Plate: <span className="text-white">{job.vehicleNumber} ({job.vehicleModel})</span></p>
                      <p>Services: <span className="text-amber-500 font-bold">{job.services.join(", ")}</span></p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-mono text-white/40 block">Finish Est: {job.estimatedFinish}</span>
                    <Link
                      href={`/track?jobId=${job.jobId}`}
                      className="text-[9px] text-amber-500 font-bold hover:underline block mt-1"
                    >
                      🔍 Track Live Card
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Warnings & Tasks (RHS: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Daily Schedule Checklist */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
              <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-500" />
                Tasks & Checklist
              </h3>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleChecklistToggle(item.id)}
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:border-amber-500/20 transition group select-none"
                >
                  <div 
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      item.checked 
                        ? "bg-amber-500 border-amber-500 text-black" 
                        : "border-white/20 group-hover:border-amber-500"
                    }`}
                  >
                    {item.checked && <span className="text-[9px] font-bold">✓</span>}
                  </div>
                  <span className={`text-xs transition ${
                    item.checked ? "text-white/40 line-through" : "text-white/80 group-hover:text-white"
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock warning widget */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
              Low Stock Warnings
            </h3>

            <div className="space-y-3">
              {lowStockTyres.map((t) => (
                <div key={t.id} className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-rose-400 font-bold block">{t.brand}</span>
                    <h5 className="font-bold text-white leading-tight">{t.name}</h5>
                    <span className="text-[9px] text-white/40 block mt-0.5 font-mono">Location: {t.location}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-rose-400 font-bold text-sm block">{t.quantity}</span>
                    <span className="text-[8px] text-white/40 uppercase">Units left</span>
                  </div>
                </div>
              ))}

              {lowStockTyres.length === 0 && (
                <div className="text-xs text-white/40 text-center py-6 border border-dashed border-white/5 rounded-xl">
                  ✓ All tyre model inventory quantities are healthy.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
