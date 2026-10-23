"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Info, CalendarDays, RefreshCw, Send, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { dbStore, Customer } from "@/lib/store";

interface WarrantyCard {
  id: string;
  tyreModel: string;
  brand: string;
  datePurchased: string;
  warrantyPeriod: string; // e.g. "5 Years"
  remainingMonths: number;
  totalMonths: number;
  invoiceNo: string;
  status: "Active" | "Expired" | "Claimed";
}

interface MockClaim {
  id: string;
  tyreModel: string;
  dateSubmitted: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const mockWarranties: Record<string, WarrantyCard[]> = {
  "9199936181": [
    { id: "w-c1-1", tyreModel: "Alnac 4G (185/70 R14)", brand: "Apollo", datePurchased: "2025-05-10", warrantyPeriod: "5 Years", remainingMonths: 46, totalMonths: 60, invoiceNo: "TTW-2026-001", status: "Active" }
  ],
  "9911223344": [
    { id: "w-c3-1", tyreModel: "Jet Steel JDH5 (10.00 R20)", brand: "JK", datePurchased: "2026-02-10", warrantyPeriod: "3 Years", remainingMonths: 31, totalMonths: 36, invoiceNo: "TTW-2026-002", status: "Active" },
    { id: "w-c3-2", tyreModel: "Wanderer A/T (235/70 R16)", brand: "MRF", datePurchased: "2025-09-08", warrantyPeriod: "6 Years", remainingMonths: 50, totalMonths: 72, invoiceNo: "TTW-2025-084", status: "Active" }
  ]
};

export default function CustomerWarranty() {
  const [currentUserPhone, setCurrentUserPhone] = useState("");
  const [warranties, setWarranties] = useState<WarrantyCard[]>([]);
  const [defaultWarranty, setDefaultWarranty] = useState("5 Years (Standard Tyre Models)");
  
  // Claim state
  const [selectedTyre, setSelectedTyre] = useState("");
  const [claimReason, setClaimReason] = useState("");
  const [claimsList, setClaimsList] = useState<MockClaim[]>([
    { id: "cl-001", tyreModel: "Alnac 4G (Rear right)", dateSubmitted: "2026-01-20", reason: "Sidewall crack due to rubber defect", status: "Approved" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    setCurrentUserPhone(phone);
    setWarranties(mockWarranties[phone] || []);

    if (typeof window !== "undefined") {
      const savedWarranty = localStorage.getItem("ttw_defaultWarrantyPeriod");
      if (savedWarranty) setDefaultWarranty(savedWarranty);
    }

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings?.defaultWarrantyPeriod) {
          setDefaultWarranty(d.settings.defaultWarrantyPeriod);
        }
      })
      .catch((e) => console.warn("Failed to fetch settings in warranty:", e));
  }, []);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    setTimeout(() => {
      setIsSubmitting(false);
      const newClaim: MockClaim = {
        id: `cl-${Math.floor(Math.random() * 900) + 100}`,
        tyreModel: selectedTyre || warranties[0]?.tyreModel || "Apollo Alnac 4G",
        dateSubmitted: new Date().toISOString().split("T")[0],
        reason: claimReason,
        status: "Pending"
      };

      setClaimsList((prev) => [newClaim, ...prev]);
      setSuccessMsg("Warranty claim registered successfully. We will inspect the tyre casing.");
      setClaimReason("");
      setSelectedTyre("");

      setTimeout(() => setSuccessMsg(""), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            SECURE WARRANTY REGISTRATION
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Warranty Claims Hub
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-mono text-white/70">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Workshop Policy: {defaultWarranty}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Warranty cards list (LHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Active Certified Warranties
          </h3>

          <div className="space-y-4">
            {warranties.map((w) => {
              const ratio = w.remainingMonths / w.totalMonths;
              return (
                <div key={w.id} className="glass-panel p-5 rounded-2xl border-white/5 relative overflow-hidden group">
                  {/* Glowing line */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-amber-500 uppercase">{w.brand} Manufacturer Cover</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{w.tyreModel}</h4>
                      <span className="text-[10px] text-white/40 block mt-0.5 font-mono">Invoice Ref: {w.invoiceNo}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded">
                      {w.status}
                    </span>
                  </div>

                  {/* Expiration gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-white/60">
                      <span>Remaining Months:</span>
                      <span className="text-white font-bold">{w.remainingMonths} / {w.totalMonths} Mos</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${ratio * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] text-white/40 block leading-tight font-mono">
                      Purchased on {w.datePurchased}. Expires on {w.warrantyPeriod} anniversary.
                    </span>
                  </div>
                </div>
              );
            })}

            {warranties.length === 0 && (
              <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
                No active tyre warranty records detected under this phone number.
              </div>
            )}
          </div>
        </div>

        {/* Claim Submission & Claims Logs (RHS: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest">
              File Warranty Claim
            </h3>

            <form onSubmit={handleClaim} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Select Purchased Tyre</label>
                <select
                  value={selectedTyre}
                  onChange={(e) => setSelectedTyre(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-xs text-white outline-none transition"
                >
                  <option value="">-- Choose Tyre --</option>
                  {warranties.map((w) => (
                    <option key={w.id} value={w.tyreModel}>
                      {w.tyreModel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/50">Reason for claim / defect description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Bubbles on sidewall, tread cracking before 10k km..."
                  value={claimReason}
                  onChange={(e) => setClaimReason(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-xs text-white outline-none transition resize-none leading-relaxed"
                ></textarea>
              </div>

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || warranties.length === 0}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Claim Ticket
              </button>
            </form>
          </div>

          {/* Claims status logs */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h4 className="text-xs font-mono text-white/40 uppercase mb-4">Claims History Logs</h4>
            
            <div className="space-y-3">
              {claimsList.map((cl) => (
                <div key={cl.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-white">{cl.tyreModel}</h5>
                    <span className="text-[9px] text-white/40 block mt-0.5">Submitted: {cl.dateSubmitted}</span>
                  </div>
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                    cl.status === "Approved" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : cl.status === "Pending" 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {cl.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
