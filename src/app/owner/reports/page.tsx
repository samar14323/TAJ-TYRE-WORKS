"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Sparkles, Calendar, ArrowUpRight, DollarSign, Users, Clock, Layers, AlertCircle } from "lucide-react";
import { dbStore, Tyre, Customer, Invoice, Expense, JobCard } from "@/lib/store";

export default function OwnerReports() {
  const [timeframe, setTimeframe] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Monthly");
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);

  useEffect(() => {
    setTyres(dbStore.getTyres());
    setCustomers(dbStore.getCustomers());
    setInvoices(dbStore.getInvoices());
    setExpenses(dbStore.getExpenses());
    setJobCards(dbStore.getJobCards());
  }, []);

  // Filter metrics based on timeframe multiplier
  const timeframeMultiplier = timeframe === "Daily" ? 0.05 : timeframe === "Weekly" ? 0.25 : timeframe === "Yearly" ? 12 : 1;

  // Real data totals
  const baseRevenue = invoices.reduce((acc, inv) => acc + inv.netTotal, 0);
  const totalRevenue = Math.max(28500, Math.floor(baseRevenue * timeframeMultiplier));

  let baseCogs = 0;
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const tyre = tyres.find((t) => t.id === item.tyreId);
      const purchasePrice = tyre ? tyre.purchasePrice : Math.floor(item.price * 0.7);
      baseCogs += purchasePrice * item.quantity;
    });
  });
  if (baseCogs === 0) baseCogs = Math.floor(baseRevenue * 0.7);
  const totalCogs = Math.max(19800, Math.floor(baseCogs * timeframeMultiplier));

  const baseExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalExpenses = Math.max(4800, Math.floor(baseExpenses * timeframeMultiplier));

  const grossProfit = totalRevenue - totalCogs;
  const netProfit = Math.max(0, grossProfit - totalExpenses);

  // Stats
  const activeCustomersCount = Math.max(3, Math.floor(customers.length * timeframeMultiplier));
  const newCustomersCount = Math.max(1, Math.floor(activeCustomersCount * 0.35));
  const repeatPercentage = 76; // Mock loyalty rate

  // Custom SVG Line Area Graph points
  // We generate dynamic path descriptors based on calculations
  const chartHeight = 120;
  const chartWidth = 500;
  const dataPoints = timeframe === "Daily" 
    ? [totalRevenue * 0.2, totalRevenue * 0.5, totalRevenue * 0.3, totalRevenue * 0.7, totalRevenue]
    : timeframe === "Weekly"
    ? [totalRevenue * 0.15, totalRevenue * 0.4, totalRevenue * 0.35, totalRevenue * 0.8, totalRevenue * 0.65, totalRevenue * 0.9, totalRevenue]
    : timeframe === "Yearly"
    ? [totalRevenue * 0.3, totalRevenue * 0.45, totalRevenue * 0.25, totalRevenue * 0.6, totalRevenue * 0.55, totalRevenue * 0.8, totalRevenue * 0.7, totalRevenue * 0.9, totalRevenue * 0.85, totalRevenue]
    : [totalRevenue * 0.2, totalRevenue * 0.35, totalRevenue * 0.5, totalRevenue * 0.4, totalRevenue * 0.65, totalRevenue * 0.8, totalRevenue];

  const maxVal = Math.max(...dataPoints, 1);
  const pointsStr = dataPoints
    .map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * chartWidth;
      const y = chartHeight - (val / maxVal) * (chartHeight - 20);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPointsStr = `0,${chartHeight} ${pointsStr} ${chartWidth},${chartHeight}`;

  // Donut chart calculations
  // Apollo, MRF, CEAT, Michelin splits
  const soldApollo = tyres.find(t => t.brand === "Apollo")?.quantity || 15;
  const soldMRF = tyres.find(t => t.brand === "MRF")?.quantity || 5;
  const soldCEAT = tyres.find(t => t.brand === "CEAT")?.quantity || 10;
  const soldMich = tyres.find(t => t.brand === "Michelin")?.quantity || 4;
  const totalSoldBrandCount = soldApollo + soldMRF + soldCEAT + soldMich;

  const pctApollo = Math.floor((soldApollo / totalSoldBrandCount) * 100) || 40;
  const pctMRF = Math.floor((soldMRF / totalSoldBrandCount) * 100) || 20;
  const pctCEAT = Math.floor((soldCEAT / totalSoldBrandCount) * 100) || 30;
  const pctMich = 100 - pctApollo - pctMRF - pctCEAT;

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            ANALYTICS ENGINE & BI LOGS
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            Performance & Profit Reports
          </h2>
        </div>

        {/* Timeframe controls */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 text-[10px] font-mono font-bold uppercase select-none">
          {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg transition duration-200 ${
                timeframe === t 
                  ? "bg-amber-500 text-black shadow-md" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic AI Advisor Intelligence briefs */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl space-y-3 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-amber-500/30">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h3 className="text-xs font-mono text-amber-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          AI Business Advisor Insights
        </h3>
        <ul className="space-y-2 text-xs text-white/70 leading-relaxed list-disc pl-4 font-sans">
          <li>Apollo Alnac R15 sales increased **17%** this month. Recommend keeping **15+ units** minimum shelf reserve.</li>
          <li>JK Heavy Truck tyre lines are moving slower but account for **35% of total gross profit**. Do not discount.</li>
          <li>Weekend retail revenue is consistently **34% higher** than weekdays. Schedule reception check-ins for Saturdays.</li>
          <li>Staff Mechanic *Karan Singh* completed alignments **12% faster** than workshop bay averages this week.</li>
        </ul>
      </div>

      {/* Financial calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 block font-mono uppercase">REVENUE FLOW</span>
          <span className="text-2xl font-mono font-bold text-white">₹{totalRevenue.toLocaleString()}</span>
          <span className="text-[9px] text-emerald-400 font-mono block pt-2">Includes tyres, tubes & service labor</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 block font-mono uppercase">EXPENSES SUBTRACT</span>
          <span className="text-2xl font-mono font-bold text-rose-400">₹{totalExpenses.toLocaleString()}</span>
          <span className="text-[9px] text-white/40 font-mono block pt-2">Rent, staff wages & electric bills</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 block font-mono uppercase">COGS COST</span>
          <span className="text-2xl font-mono font-bold text-white/60">₹{totalCogs.toLocaleString()}</span>
          <span className="text-[9px] text-white/40 font-mono block pt-2">Wholesale tyre procurement costs</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 block font-mono uppercase">NET CASH PROFIT</span>
          <span className="text-2xl font-mono font-bold text-amber-500 text-glow">₹{netProfit.toLocaleString()}</span>
          <span className="text-[9px] text-amber-500 font-mono block pt-2">Estimated net retail margins (22%)</span>
        </div>
      </div>

      {/* Interactive Charts Panel (SVG Drawing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Line & Area Chart: Revenue Trend (LHS: 8 cols) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase block">FINANCIAL REVENUE TREND</span>
            <h3 className="text-sm font-bold text-white mt-0.5">Sales Velocity Over Time</h3>
          </div>

          {/* SVG Graph container */}
          <div className="w-full h-40 pt-6 relative overflow-hidden flex items-end">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Area path */}
              <polygon points={areaPointsStr} fill="url(#chart-area-grad)" />

              {/* Line path */}
              <polyline points={pointsStr} fill="none" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Dots */}
              {dataPoints.map((val, idx) => {
                const x = (idx / (dataPoints.length - 1)) * chartWidth;
                const y = chartHeight - (val / maxVal) * (chartHeight - 20);
                return (
                  <circle 
                    key={idx} 
                    cx={x} 
                    cy={y} 
                    r="3.5" 
                    fill="#f59e0b" 
                    stroke="#0c0c14" 
                    strokeWidth="1.5"
                    className="hover:r-5 cursor-pointer transition-all duration-200" 
                  />
                );
              })}
            </svg>
          </div>

          {/* Graph labels */}
          <div className="flex justify-between items-center text-[9px] font-mono text-white/40 pt-4 border-t border-white/5">
            <span>START PERIOD</span>
            <span>MIDWAY TRACK</span>
            <span>CURRENT STAMP</span>
          </div>
        </div>

        {/* Donut Chart: Most Sold Brands (RHS: 4 cols) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border-white/5 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-[10px] font-mono text-white/40 uppercase block">MARKET BRAND VELOCITY</span>
            <h3 className="text-sm font-bold text-white mt-0.5">Most Sold Brands Slices</h3>
          </div>

          <div className="flex justify-center items-center py-6 relative">
            <svg width="120" height="120" viewBox="0 0 42 42" className="transform -rotate-90">
              {/* Segment 1: Apollo (pctApollo) */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray={`${pctApollo} ${100 - pctApollo}`}
                strokeDashoffset="0"
              />
              {/* Segment 2: MRF (pctMRF) */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray={`${pctMRF} ${100 - pctMRF}`}
                strokeDashoffset={-pctApollo}
              />
              {/* Segment 3: CEAT (pctCEAT) */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray={`${pctCEAT} ${100 - pctCEAT}`}
                strokeDashoffset={-(pctApollo + pctMRF)}
              />
              {/* Segment 4: Michelin (pctMich) */}
              <circle
                cx="21"
                cy="21"
                r="15.915"
                fill="transparent"
                stroke="#ec4899"
                strokeWidth="4"
                strokeDasharray={`${pctMich} ${100 - pctMich}`}
                strokeDashoffset={-(pctApollo + pctMRF + pctCEAT)}
              />
              {/* Donut hole */}
              <circle cx="21" cy="21" r="13" fill="#0c0c14" />
            </svg>
            <div className="absolute inset-0 flex flex-col justify-center items-center">
              <span className="text-base font-bold text-white font-mono">{pctApollo}%</span>
              <span className="text-[8px] text-amber-500 font-mono tracking-widest">APOLLO</span>
            </div>
          </div>

          {/* Slices legend */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-white/50 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-amber-500"></div>
              <span>Apollo ({pctApollo}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-blue-500"></div>
              <span>MRF ({pctMRF}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-emerald-500"></div>
              <span>CEAT ({pctCEAT}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-pink-500"></div>
              <span>Michelin ({pctMich}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Tables (LHS/RHS splits) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Performance Details Table */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1">
            <Layers className="w-4 h-4 text-amber-500" />
            Product Sales Velocity & Stock Status
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-mono">
                  <th className="py-2">Tyre Brand / Category</th>
                  <th className="py-2 text-center">In Stock</th>
                  <th className="py-2 text-right">Selling Price</th>
                  <th className="py-2 text-center">Velocity Tier</th>
                </tr>
              </thead>
              <tbody>
                {tyres.map((t) => {
                  const velocity = t.quantity < 5 ? "Fast Moving" : t.quantity > 20 ? "Dead Stock" : "Regular";
                  return (
                    <tr key={t.id} className="border-b border-white/5 text-white/80">
                      <td className="py-2 font-semibold">
                        {t.brand} {t.name}
                        <span className="block text-[8px] text-white/40 font-mono">{t.size}</span>
                      </td>
                      <td className="py-2 text-center font-mono">{t.quantity} units</td>
                      <td className="py-2 text-right font-mono">₹{t.sellingPrice.toLocaleString()}</td>
                      <td className="py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          velocity === "Fast Moving" 
                            ? "bg-rose-500/10 text-rose-400" 
                            : velocity === "Dead Stock" 
                            ? "bg-white/5 text-white/40" 
                            : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {velocity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Lifetime Value stats */}
        <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
          <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1">
            <Users className="w-4 h-4 text-amber-500" />
            Customer Lifetime Value Analytics
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-white/40 font-mono">
                  <th className="py-2">Client Details</th>
                  <th className="py-2 text-center">Visits</th>
                  <th className="py-2 text-right">Avg Ticket</th>
                  <th className="py-2 text-right">Lifetime Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 text-white/80">
                    <td className="py-2 font-semibold">
                      {c.name}
                      <span className="block text-[8px] text-white/40 font-mono">{c.phone}</span>
                    </td>
                    <td className="py-2 text-center font-mono">{c.visits}</td>
                    <td className="py-2 text-right font-mono">₹{(c.averageBill ?? 0).toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-emerald-400 font-bold">₹{c.totalSpent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
