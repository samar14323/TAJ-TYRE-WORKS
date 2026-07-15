"use client";

import React, { useState, useEffect } from "react";
import { Truck, Search, PlusCircle, Star, Calendar, FileText, CheckCircle2, ShieldAlert, ShoppingBag, Landmark } from "lucide-react";
import { dbStore, Supplier, Tyre, PurchaseOrder } from "@/lib/store";

export default function OwnerSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Purchase Order Form State
  const [selectedTyreId, setSelectedTyreId] = useState("");
  const [poQty, setPoQty] = useState(10);
  const [unitCost, setUnitCost] = useState(0);

  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    const list = dbStore.getSuppliers();
    setSuppliers(list);
    setTyres(dbStore.getTyres());
    setPurchaseOrders(dbStore.getPurchaseOrders());
    if (list.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(list[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTyreId) {
      const match = tyres.find((t) => t.id === selectedTyreId);
      if (match) {
        setUnitCost(match.purchasePrice);
      }
    }
  }, [selectedTyreId, tyres]);

  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  const handleSelectSupplier = (s: Supplier) => {
    setSelectedSupplierId(s.id);
    setSelectedTyreId("");
    setUnitCost(0);
    setSuccessMsg("");
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupplier || !selectedTyreId) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      const tyre = tyres.find((t) => t.id === selectedTyreId);
      if (!tyre) return;

      const total = unitCost * poQty;
      const poNum = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

      const newPo: PurchaseOrder = {
        id: `po-${Date.now()}`,
        poNumber: poNum,
        supplierId: activeSupplier.id,
        supplierName: activeSupplier.name,
        date: new Date().toISOString().split("T")[0],
        items: [
          {
            name: tyre.name,
            brand: tyre.brand,
            size: tyre.size,
            quantity: poQty,
            unitCost,
            total
          }
        ],
        totalAmount: total,
        status: "Sent"
      };

      dbStore.addPurchaseOrder(newPo);
      
      // Notify Owner
      dbStore.addNotification({
        id: `n-${Date.now()}`,
        role: "Owner",
        title: "Purchase Order Sent",
        message: `PO ${poNum} dispatched to ${activeSupplier.name} for ${poQty}x ${tyre.brand} ${tyre.name}`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });

      // Update supplier stats
      const currentSuppliers = dbStore.getSuppliers();
      const match = currentSuppliers.find((s) => s.id === activeSupplier.id);
      if (match) {
        match.pendingOrdersCount += 1;
        match.outstandingBalance += total;
        dbStore.saveSuppliers(currentSuppliers);
      }

      setSuccessMsg(`Purchase Order ${poNum} successfully generated and emailed!`);
      setSelectedTyreId("");
      setPoQty(10);
      setUnitCost(0);
      loadData();
      
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 800);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activePos = activeSupplier
    ? purchaseOrders.filter((po) => po.supplierId === activeSupplier.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          SUPPLY CHAIN & LOGISTICS MANAGEMENT
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Truck className="w-6 h-6 text-amber-500" />
          Wholesale Supplier Directory
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Supplier List (LHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search wholesale distributors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
            />
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-cyber-gray-dark border-b border-white/5 text-white/50 font-mono">
                    <th className="p-3">Distributor</th>
                    <th className="p-3 text-center">Rating</th>
                    <th className="p-3 text-center">Delivery Time</th>
                    <th className="p-3 text-center">Stock Supplied</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3 text-center">Pending POs</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => handleSelectSupplier(s)}
                      className={`border-b border-white/5 transition cursor-pointer hover:bg-white/5 ${
                        selectedSupplierId === s.id ? "bg-amber-500/10 border-amber-500/30" : ""
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-bold text-white block text-sm">{s.name}</span>
                        <span className="font-mono text-white/40 block mt-0.5">{s.contactPerson} ({s.phone})</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: s.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold text-white/70">{s.avgDeliveryTime}</td>
                      <td className="p-3 text-center font-mono">{s.stockSupplied} units</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        ₹{s.outstandingBalance.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          s.pendingOrdersCount > 0 ? "bg-amber-500/15 text-amber-500" : "bg-white/5 text-white/40"
                        }`}>
                          {s.pendingOrdersCount} POs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PO Generator Panel (RHS: 5 cols) */}
        <div className="lg:col-span-5">
          {activeSupplier ? (
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
              {/* Header profile details */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5">
                <div>
                  <span className="text-[9px] font-mono text-amber-500 uppercase">Supplier Details</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{activeSupplier.name}</h3>
                  <p className="text-[11px] text-white/50 mt-0.5">{activeSupplier.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 block font-mono">AVG LEAD TIME</span>
                  <span className="font-bold text-white block mt-0.5">{activeSupplier.avgDeliveryTime}</span>
                </div>
              </div>

              {/* Purchase Order Form */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-wider block">
                  ⚡ Generate New Purchase Order
                </span>

                <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase text-white/50">Tyre Model to Reorder</label>
                    <select
                      value={selectedTyreId}
                      onChange={(e) => setSelectedTyreId(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition"
                    >
                      <option value="">-- Choose Tyre --</option>
                      {tyres.map((t) => (
                        <option key={`po-t-${t.id}`} value={t.id}>
                          {t.brand} {t.name} (Wholesale cost: ₹{t.purchasePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-white/50">Reorder Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={poQty}
                        onChange={(e) => setPoQty(Number(e.target.value))}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-white/50">Unit Cost (₹)</label>
                      <input
                        type="number"
                        value={unitCost}
                        onChange={(e) => setUnitCost(Number(e.target.value))}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-white outline-none transition font-mono"
                      />
                    </div>
                  </div>

                  {selectedTyreId && (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center text-xs font-mono font-bold text-white">
                      <span>Total PO Amount:</span>
                      <span className="text-amber-500">₹{(unitCost * poQty).toLocaleString()}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTyreId}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold uppercase text-[10px] tracking-wider transition"
                  >
                    {isSubmitting ? "Generating PO..." : "Dispatched Purchase Order"}
                  </button>
                </form>
              </div>

              {/* Purchase Order History */}
              <div className="space-y-3 pt-2">
                <span className="text-[9px] font-mono text-white/40 uppercase block flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                  Recent Purchase Orders Dispatched
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar">
                  {activePos.map((po) => (
                    <div key={po.id} className="p-3 bg-[#050507]/40 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white font-mono">{po.poNumber}</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Date: {po.date}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-500">₹{po.totalAmount.toLocaleString()}</span>
                    </div>
                  ))}
                  {activePos.length === 0 && (
                    <div className="text-[10px] text-white/30 italic text-center py-4">No PO records dispatched.</div>
                  )}
                </div>
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
              Select a supplier card from the left registry to manage wholesale bookings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
