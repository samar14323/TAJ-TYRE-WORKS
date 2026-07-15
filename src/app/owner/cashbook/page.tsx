"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Plus, Trash2, Search, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { dbStore, Expense, Invoice, Tyre } from "@/lib/store";

export default function OwnerCashBook() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tyres, setTyres] = useState<Tyre[]>([]);

  // Add Expense Form
  const [category, setCategory] = useState<"Salary" | "Rent" | "Electricity" | "Tea" | "Transport" | "Internet" | "Maintenance" | "Other">("Tea");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  const [successMsg, setSuccessMsg] = useState("");

  const loadData = () => {
    setExpenses(dbStore.getExpenses());
    setInvoices(dbStore.getInvoices());
    setTyres(dbStore.getTyres());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      category,
      amount,
      description
    };

    dbStore.addExpense(newExp);
    setSuccessMsg("Expense transaction logged successfully.");
    setAmount(0);
    setDescription("");
    loadData();

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      const currentExpenses = dbStore.getExpenses();
      const filtered = currentExpenses.filter((e) => e.id !== id);
      dbStore.saveExpenses(filtered);
      loadData();
    }
  };

  // Financial calculations
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.netTotal, 0);

  // Cost of Goods Sold (COGS)
  // Back-calculate from tyres purchased prices
  let totalCogs = 0;
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      // Find matching tyre in current inventory or mock
      const tyre = tyres.find((t) => t.id === item.tyreId);
      const unitPurchaseCost = tyre ? tyre.purchasePrice : Math.floor(item.price * 0.70); // Fallback: 70% of price
      totalCogs += unitPurchaseCost * item.quantity;
    });
  });

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalExpenses;

  // Split payment totals
  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  let creditSales = 0;

  invoices.forEach((inv) => {
    if (inv.splitPayments) {
      cashSales += inv.splitPayments.cashAmount;
      upiSales += inv.splitPayments.upiAmount;
      cardSales += inv.splitPayments.cardAmount;
      creditSales += inv.splitPayments.creditAmount;
    } else {
      if (inv.paymentMethod === "Cash") cashSales += inv.netTotal;
      else if (inv.paymentMethod === "UPI") upiSales += inv.netTotal;
      else if (inv.paymentMethod === "Card") cardSales += inv.netTotal;
      else if (inv.paymentMethod === "Credit") creditSales += inv.netTotal;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          FINANCIAL ACCOUNTING LEDGER
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Landmark className="w-6 h-6 text-amber-500" />
          Daily Cash Book & Expenses
        </h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div>
            <span className="text-[10px] text-white/40 block font-mono">GROSS REVENUES</span>
            <span className="text-xl font-mono font-bold text-white tracking-wide block mt-1">
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono mt-4 block">
            From {invoices.length} transaction tickets
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div>
            <span className="text-[10px] text-white/40 block font-mono">COST OF GOODS (COGS)</span>
            <span className="text-xl font-mono font-bold text-white/60 tracking-wide block mt-1">
              ₹{totalCogs.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-white/40 font-mono mt-4 block">
            Wholesale tyre purchase valuations
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div>
            <span className="text-[10px] text-white/40 block font-mono">TOTAL EXPENSES</span>
            <span className="text-xl font-mono font-bold text-rose-400 tracking-wide block mt-1">
              ₹{totalExpenses.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-rose-400 font-mono mt-4 block">
            Salaries, Rent, Tea and Utilities
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col justify-between hover:border-amber-500/20 transition relative">
          <div>
            <span className="text-[10px] text-white/40 block font-mono">NET BUSINESS PROFIT</span>
            <span className={`text-xl font-mono font-bold block mt-1 ${netProfit >= 0 ? "text-amber-500 text-glow" : "text-rose-500"}`}>
              ₹{netProfit.toLocaleString()}
            </span>
          </div>
          <span className="text-[9px] text-amber-500 font-mono mt-4 block">
            Actual net returns after costs & bills
          </span>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LHS: Cash book split payment ledger & expenses list (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Payment Split Ledger Card */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              Split Payment Revenue Splits
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] text-white/40 block uppercase">UPI Wallet</span>
                <span className="font-bold text-white block mt-1">₹{upiSales.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] text-white/40 block uppercase">Cash in Hand</span>
                <span className="font-bold text-white block mt-1">₹{cashSales.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] text-white/40 block uppercase">Card Swipe</span>
                <span className="font-bold text-white block mt-1">₹{cardSales.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
                <span className="text-[9px] text-white/40 block uppercase">Credit Due</span>
                <span className="font-bold text-rose-400 block mt-1">₹{creditSales.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
              Expenses Records
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 font-mono">
                    <th className="py-2">Date / Category</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-white/5 text-white/80">
                      <td className="py-3 font-semibold">
                        <span className="block font-mono text-[9px] text-white/40">{exp.date}</span>
                        <span className="text-amber-500 text-xs font-bold uppercase font-mono">{exp.category}</span>
                      </td>
                      <td className="py-3 text-white/70 max-w-xs truncate">{exp.description}</td>
                      <td className="py-3 text-right font-mono text-rose-400 font-bold">₹{exp.amount.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-rose-400 hover:text-rose-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-white/30 italic">
                        No expenses logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RHS: Add expense form (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2">
              ⚡ Log Daily Expense
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/50">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-white outline-none focus:border-amber-500"
                >
                  <option value="Salary">Mechanic Salary / Wages</option>
                  <option value="Rent">Shop Site Rent</option>
                  <option value="Electricity">Electricity / Energy Bills</option>
                  <option value="Tea">Tea / Snacks / Food</option>
                  <option value="Transport">Freight / Transport Costs</option>
                  <option value="Internet">Internet / Digital Tools</option>
                  <option value="Maintenance">Equipment Maintenance</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/50">Amount (₹)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-white font-mono outline-none focus:border-amber-500 text-right"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/50">Details / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tea for alignment clients"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-white outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider rounded-lg transition"
              >
                Log Expense
              </button>
            </form>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start animate-fade-in mt-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
