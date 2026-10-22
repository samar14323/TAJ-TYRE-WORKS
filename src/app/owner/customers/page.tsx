"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, PlusCircle, Trash2, Award, FileText, CheckCircle2, ShieldAlert, Sparkles, Phone, User, Landmark } from "lucide-react";
import { dbStore, Customer, Invoice } from "@/lib/store";

export default function OwnerCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Edit / Add notes
  const [notesText, setNotesText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = () => {
    const list = dbStore.getCustomers();
    setCustomers(list);
    setInvoices(dbStore.getInvoices());
    if (list.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(list[0].id);
      setNotesText(list[0].notes ?? "");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c.id);
    setNotesText(c.notes ?? "");
  };

  const handleIncrementVisit = (cId: string) => {
    dbStore.incrementCustomerVisit(cId);
    setSuccessMsg("Visits incremented. Unlocked coupons updated in database.");
    loadData();
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDecrementVisit = (cId: string) => {
    dbStore.decrementCustomerVisit(cId);
    setSuccessMsg("Visits decremented.");
    loadData();
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleResetVisits = (cId: string) => {
    if (confirm("Are you sure you want to reset visit milestones for this customer?")) {
      dbStore.resetCustomerVisits(cId);
      setSuccessMsg("Visits reset to zero.");
      loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleSaveNotes = () => {
    if (!activeCustomer) return;
    const list = dbStore.getCustomers();
    const found = list.find((c) => c.id === activeCustomer.id);
    if (found) {
      found.notes = notesText;
      dbStore.saveCustomers(list);
      setSuccessMsg("Customer registry notes updated.");
      loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  });

  const activeInvoices = activeCustomer 
    ? invoices.filter((inv) => inv.customerId === activeCustomer.id || inv.customerPhone === activeCustomer.phone)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          CLIENT RELATIONSHIP MANAGEMENT
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" />
          Customer Loyalty Registry
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer list (LHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search customer registry by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
            />
          </div>

          {/* Table list */}
          <div className="glass-panel rounded-2xl border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-cyber-gray-dark border-b border-white/5 text-white/50 font-mono">
                    <th className="p-3">Customer Details</th>
                    <th className="p-3 text-center">Visits</th>
                    <th className="p-3 text-right">Spends</th>
                    <th className="p-3 text-center">Reward Points</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3">Fav Brand</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr 
                      key={c.id} 
                      onClick={() => handleSelectCustomer(c)}
                      className={`border-b border-white/5 transition cursor-pointer hover:bg-white/5 ${
                        selectedCustomerId === c.id ? "bg-amber-500/10 border-amber-500/30" : ""
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-bold text-white block text-sm">{c.name}</span>
                        <span className="font-mono text-white/40 block mt-0.5">{c.phone}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white/80">{c.visits}</td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-bold">₹{c.totalSpent.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold bg-amber-500/15 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[10px]">
                          {c.rewardPoints ?? 0} pts
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-rose-400">
                        {(c.outstandingAmount ?? 0) > 0 ? `₹${(c.outstandingAmount ?? 0).toLocaleString()}` : "—"}
                      </td>
                      <td className="p-3 font-semibold text-white/70">{c.favoriteBrand || "N/A"}</td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-white/30 italic">
                        No clients found in registry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer detail panel (RHS: 5 cols) */}
        <div className="lg:col-span-5">
          {activeCustomer ? (
            <div className="glass-panel-amber p-6 rounded-2xl border-amber-500/10 space-y-6">
              {/* Header profile details */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-mono text-amber-500 uppercase">CLIENT IN-DEPTH MATRIX</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeCustomer.name}</h3>
                  <span className="text-xs text-white/50 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    {activeCustomer.phone}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-0.5 rounded uppercase">
                  {activeCustomer.trustLevel} Client
                </span>
              </div>

              {/* Loyalty visits editor */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Loyalty visits management</span>
                
                <div className="flex justify-between items-center bg-cyber-gray-dark border border-white/5 p-3 rounded-lg">
                  <span className="text-xs text-white/70 font-mono">Current visits count:</span>
                  <span className="text-lg font-mono font-bold text-amber-500">{activeCustomer.visits}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono font-bold uppercase">
                  <button
                    onClick={() => handleIncrementVisit(activeCustomer.id)}
                    className="py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded transition text-center"
                  >
                    + Add Visit
                  </button>
                  <button
                    onClick={() => handleDecrementVisit(activeCustomer.id)}
                    className="py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition text-center"
                  >
                    - Remove
                  </button>
                  <button
                    onClick={() => handleResetVisits(activeCustomer.id)}
                    className="py-2 bg-rose-500 hover:bg-rose-600 text-white rounded transition text-center"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Ledger Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[9px] text-white/40 block uppercase">Lifetime Spends</span>
                  <span className="text-sm font-bold text-white block mt-0.5">₹{activeCustomer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-[9px] text-white/40 block uppercase">Outstanding Credit</span>
                  <span className="text-sm font-bold text-rose-400 block mt-0.5">₹{(activeCustomer.outstandingAmount ?? 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Transaction Purchases History */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Transaction History</span>
                <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                  {activeInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-[#050507]/40 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white font-mono">{inv.invoiceNumber}</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Method: {inv.paymentMethod}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-500">₹{inv.netTotal.toLocaleString()}</span>
                    </div>
                  ))}
                  {activeInvoices.length === 0 && (
                    <div className="text-[10px] text-white/30 italic">No transaction records logged.</div>
                  )}
                </div>
              </div>

              {/* Notes form */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-[9px] font-mono uppercase text-white/40 block">Customer registry notes</label>
                <textarea
                  rows={2}
                  value={notesText ?? ""}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 resize-none leading-relaxed"
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-[10px] tracking-wider rounded-lg transition"
                >
                  Save Notes
                </button>
              </div>

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
              Select a customer card from the left registry to inspect stats.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
