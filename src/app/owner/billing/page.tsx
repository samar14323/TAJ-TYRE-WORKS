"use client";

import React, { useState, useEffect, useRef } from "react";
import { Receipt, Search, Plus, Trash2, Printer, CheckCircle2, ShieldAlert, KeyRound, QrCode, Signature, CreditCard, RefreshCw } from "lucide-react";
import { dbStore, Tyre, Customer, Invoice, InvoiceItem } from "@/lib/store";

export default function OwnerBilling() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Selected customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Custom new customer inputs (if not registered)
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [showNewCustForm, setShowNewCustForm] = useState(false);

  // Line items
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [selectedTyreId, setSelectedTyreId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  // Custom labor / service items
  const [serviceName, setServiceName] = useState("Tire Tubeless Fitting Charge");
  const [serviceCost, setServiceCost] = useState(0);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card" | "Credit">("UPI");
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [creditAmount, setCreditAmount] = useState(0);
  const [isSplitActive, setIsSplitActive] = useState(false);

  // Signatures
  const [ownerSign, setOwnerSign] = useState("Mohammad Samar");
  const [customerSign, setCustomerSign] = useState("");

  // GST Tax Optional Toggle
  const [includeGst, setIncludeGst] = useState(true);

  // System states
  const [successInvoice, setSuccessInvoice] = useState<Invoice | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setTyres(dbStore.getTyres());
    setCustomers(dbStore.getCustomers());
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const savedGstPref = localStorage.getItem("ttw_defaultApplyGst");
      if (savedGstPref !== null) {
        setIncludeGst(savedGstPref === "true");
      }
    }

    // Load dynamic GST preference from PostgreSQL database
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.settings?.defaultApplyGst !== undefined) {
          setIncludeGst(d.settings.defaultApplyGst === "true" || d.settings.defaultApplyGst === true);
        }
      })
      .catch((e) => console.warn("Could not fetch GST preference from settings:", e));
  }, []);

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerSearch("");
    setShowNewCustForm(false);
    setCustomerSign(c.name);
  };

  const handleRegisterNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name: newCustName,
      phone: newCustPhone,
      visits: 1,
      purchasesCount: 0,
      totalSpent: 0,
      trustLevel: "Bronze",
      savings: 0,
      vehicles: [],
      notes: "Newly registered at billing terminal.",
      rewardPoints: 50,
      outstandingAmount: 0,
      favoriteBrand: "N/A",
      averageBill: 0
    };

    const currentCustomers = dbStore.getCustomers();
    currentCustomers.push(newCust);
    dbStore.saveCustomers(currentCustomers);
    setSelectedCustomer(newCust);
    setCustomerSign(newCustName);
    setShowNewCustForm(false);
    loadData();
  };

  // Add Tyre to Invoice
  const handleAddTyre = () => {
    setErrorMsg("");
    const tyre = tyres.find((t) => t.id === selectedTyreId);
    if (!tyre) return;

    if (quantity > tyre.quantity) {
      setErrorMsg(`Insufficient stock. Only ${tyre.quantity} units available for ${tyre.brand} ${tyre.name}.`);
      return;
    }

    const price = tyre.sellingPrice;
    const total = price * quantity;

    const newItem: InvoiceItem = {
      tyreId: tyre.id,
      brand: tyre.brand,
      name: `${tyre.name} (${tyre.size})`,
      quantity,
      price,
      hsnCode: "4011", // Tyre HSN
      gstRate: 28, // Tyres carry 28% GST in India
      total
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedTyreId("");
    setQuantity(1);
  };

  // Add Service Item (Fitting, Nitrogen, etc.)
  const handleAddService = () => {
    if (serviceCost <= 0) return;
    if (serviceName.includes("Wheel Alignment") || serviceName.includes("Wheel Balancing")) {
      alert("Wheel Alignment and Wheel Balancing are currently Coming Soon.");
      return;
    }

    const newItem: InvoiceItem = {
      tyreId: `srv-${Date.now()}`,
      brand: "Service",
      name: serviceName,
      quantity: 1,
      price: serviceCost,
      hsnCode: "9987", // Maintenance services HSN
      gstRate: 18, // Service labor carries 18% GST
      total: serviceCost
    };

    setCart((prev) => [...prev, newItem]);
    setServiceCost(0);
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  // Tyres have 28% GST, Services have 18% GST (Optional)
  // In India, list price is usually inclusive of GST, so we back-calculate when GST is active
  // Taxable Value = Total / (1 + (GstRate / 100))
  let totalTaxableValue = 0;
  let totalGstAmount = 0;
  let cartTotal = 0;

  cart.forEach((item) => {
    cartTotal += item.total;
    if (includeGst) {
      const taxRate = item.gstRate;
      const taxableVal = item.total / (1 + taxRate / 100);
      const gstVal = item.total - taxableVal;
      totalTaxableValue += taxableVal;
      totalGstAmount += gstVal;
    } else {
      totalTaxableValue += item.total;
    }
  });

  // Check loyalty visit discount
  // 5 visits -> 10%, 10 visits -> 20%
  let discountPercent = 0;
  if (selectedCustomer) {
    if (selectedCustomer.visits >= 10) discountPercent = 20;
    else if (selectedCustomer.visits >= 5) discountPercent = 10;
  }

  const discountVal = Math.floor(cartTotal * (discountPercent / 100));
  const netTotalVal = Math.max(0, cartTotal - discountVal);

  const handleCreateInvoice = () => {
    if (!selectedCustomer) {
      setErrorMsg("Please select or register a customer first.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("Please add at least one item to invoice.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsSubmitting(false);

      const invoiceNo = `TTW-2026-${Math.floor(100 + Math.random() * 900)}`;

      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNo,
        date: new Date().toISOString().split("T")[0],
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        items: includeGst
          ? cart
          : cart.map((it) => ({ ...it, gstRate: 0 })),
        subTotal: Number(totalTaxableValue.toFixed(2)),
        gstAmount: includeGst ? Number(totalGstAmount.toFixed(2)) : 0,
        discountApplied: discountVal,
        netTotal: netTotalVal,
        paymentMethod,
        ownerSignature: ownerSign,
        customerSignature: customerSign,
        gstin: includeGst ? "07AAJFT2008T1Z8" : undefined
      };

      if (isSplitActive) {
        newInv.splitPayments = {
          cashAmount,
          upiAmount,
          cardAmount,
          creditAmount
        };
      }

      // Link and update corresponding Job Card
      const jobCards = dbStore.getJobCards();
      const job = jobCards.find(
        (j) =>
          (j.customerId === selectedCustomer.id || j.customerPhone === selectedCustomer.phone) &&
          j.status !== "Completed"
      );
      if (job) {
        newInv.jobCardId = job.id;
        job.status = "Completed";
        job.timeline[5].completed = true;
        job.timeline[5].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        job.timeline[6].completed = true;
        job.timeline[6].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dbStore.saveJobCards(jobCards);
      }

      // Add to store database
      dbStore.addInvoice(newInv);
      setSuccessInvoice(newInv);
      
      // Reset terminal states
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSign("");
      loadData();
    }, 1000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          GST TAX BILLING TERMINAL
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Receipt className="w-6 h-6 text-amber-500 animate-pulse" />
          Compile Customer Invoice
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Billing Setup (LHS: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Customer Selection Card */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2">
              1. Customer Information
            </h3>

            {selectedCustomer ? (
              <div className="p-4 bg-white/5 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedCustomer.name}</h4>
                  <p className="text-xs text-white/50 font-mono mt-0.5">{selectedCustomer.phone}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedCustomer.trustLevel} Tier
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-white/5 text-white/50 px-2 py-0.5 rounded border border-white/5">
                      {selectedCustomer.visits} Visits
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Change Client
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none transition"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowNewCustForm(!showNewCustForm);
                      setNewCustName("");
                      setNewCustPhone("");
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 rounded-lg transition shrink-0"
                  >
                    {showNewCustForm ? "Search Registry" : "New Customer"}
                  </button>
                </div>

                {/* Show Search Results dropdown */}
                {customerSearch && (
                  <div className="bg-cyber-gray border border-white/10 rounded-lg max-h-40 overflow-y-auto p-1 space-y-0.5">
                    {customers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.phone.includes(customerSearch)
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left p-2.5 rounded hover:bg-white/5 text-xs text-white/80 hover:text-white flex justify-between"
                        >
                          <span className="font-bold">{c.name}</span>
                          <span className="font-mono text-white/40">{c.phone}</span>
                        </button>
                      ))}
                  </div>
                )}

                {/* New Customer Form */}
                {showNewCustForm && (
                  <form onSubmit={handleRegisterNewCustomer} className="p-4 bg-white/5 border border-white/5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-white/50">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono uppercase text-white/50">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="9999988888"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase text-[10px] tracking-wider rounded-lg transition"
                    >
                      Add & Select
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Add items to cart */}
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-5">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-2">
              2. Add Tyre Line Items
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/50">Choose Tyre Inventory</label>
                <select
                  value={selectedTyreId}
                  onChange={(e) => setSelectedTyreId(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
                >
                  <option value="">-- Select Tyre Model --</option>
                  {tyres.map((t) => (
                    <option key={`bill-${t.id}`} value={t.id}>
                      {t.brand} {t.name} ({t.size}) - Qty: {t.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/50">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 font-mono text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTyre}
                disabled={!selectedTyreId}
                className="sm:col-span-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold uppercase text-[10px] tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 h-[34px]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Tyre Line
              </button>
            </div>

            {/* Custom Labor/Services */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <h4 className="text-[10px] font-mono text-white/40 uppercase">Add Bay Service Labor</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[9px] font-mono uppercase text-white/50">Service Details</label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 transition"
                  >
                    <option value="Tire Tubeless Fitting Charge">Tire Tubeless Fitting Charge</option>
                    <option value="Nitrogen Filling Service">Nitrogen Filling Service</option>
                    <option value="Tubeless Puncture Repair">Tubeless Puncture Repair</option>
                    <option value="Old & New Tyres Fitment">Old & New Tyres Fitment</option>
                    <option value="Wheel Alignment (Labor)" disabled>Wheel Alignment (Labor) — COMING SOON</option>
                    <option value="Wheel Balancing (Labor)" disabled>Wheel Balancing (Labor) — COMING SOON</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[9px] font-mono uppercase text-white/50">Cost (₹)</label>
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(Number(e.target.value))}
                    className="w-full bg-cyber-gray border border-white/5 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddService}
                  disabled={serviceCost <= 0}
                  className="sm:col-span-3 py-2 border border-white/10 hover:border-amber-500/35 bg-white/5 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 h-[34px] disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Service
                </button>
              </div>
            </div>
          </div>

          {/* Cart Table List */}
          <div className="glass-panel p-5 rounded-2xl border-white/5">
            <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest border-b border-white/5 pb-3 mb-4">
              Line Items Compiled
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 font-mono">
                    <th className="py-2">Item Name</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">GST Rate</th>
                    <th className="py-2 text-right">Line Total</th>
                    <th className="py-2 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 text-white/80">
                      <td className="py-3 font-semibold">
                        <span className="block">{item.name}</span>
                        <span className="text-[8px] font-mono text-white/40">HSN: {item.hsnCode}</span>
                      </td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">₹{item.price.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono">{includeGst ? `${item.gstRate}%` : "0% (Exempt)"}</td>
                      <td className="py-3 text-right font-mono">₹{item.total.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-white/30 italic">
                        No billing items added to invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invoice Summary (RHS: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest">
                Invoice Summary
              </h3>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                includeGst ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-white/40 border-white/10"
              }`}>
                {includeGst ? "GST Active" : "Non-GST Bill"}
              </span>
            </div>

            {/* GST Tax Toggle */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Include GST Tax</span>
                <span className="text-[10px] text-white/40 block mt-0.5">
                  {includeGst ? "Standard 28% Tyres / 18% Services" : "Non-GST / Tax-Exempt Bill"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeGst(!includeGst)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  includeGst ? "bg-amber-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                    includeGst ? "translate-x-5" : "translate-x-0 bg-white"
                  }`}
                />
              </button>
            </div>

            {/* Price values */}
            <div className="space-y-2.5 text-xs font-mono border-b border-white/5 pb-4">
              <div className="flex justify-between text-white/50">
                <span>{includeGst ? "Taxable Amount:" : "Subtotal:"}</span>
                <span>₹{totalTaxableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {includeGst ? (
                <div className="flex justify-between text-white/50">
                  <span>GST Tax (Combined):</span>
                  <span>₹{totalGstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ) : (
                <div className="flex justify-between text-emerald-400">
                  <span>GST Tax:</span>
                  <span>₹0.00 (Optional / Non-GST)</span>
                </div>
              )}
              {discountPercent > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Loyalty Discount ({discountPercent}%):</span>
                  <span>-₹{discountVal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-sm border-t border-white/5 pt-2">
                <span>Net Total Amount:</span>
                <span className="text-amber-500">₹{netTotalVal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase text-white/50 block">Payment Mode</label>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold uppercase mb-2">
                <button
                  onClick={() => {
                    setPaymentMethod("UPI");
                    setIsSplitActive(false);
                  }}
                  className={`py-1.5 rounded-lg border text-center transition ${
                    paymentMethod === "UPI" && !isSplitActive ? "bg-amber-500 border-amber-500 text-black" : "bg-cyber-gray border-white/5 text-white/70"
                  }`}
                >
                  UPI
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("Cash");
                    setIsSplitActive(false);
                  }}
                  className={`py-1.5 rounded-lg border text-center transition ${
                    paymentMethod === "Cash" && !isSplitActive ? "bg-amber-500 border-amber-500 text-black" : "bg-cyber-gray border-white/5 text-white/70"
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("Card");
                    setIsSplitActive(false);
                  }}
                  className={`py-1.5 rounded-lg border text-center transition ${
                    paymentMethod === "Card" && !isSplitActive ? "bg-amber-500 border-amber-500 text-black" : "bg-cyber-gray border-white/5 text-white/70"
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("Credit");
                    setIsSplitActive(false);
                  }}
                  className={`py-1.5 rounded-lg border text-center transition ${
                    paymentMethod === "Credit" && !isSplitActive ? "bg-amber-500 border-amber-500 text-black" : "bg-cyber-gray border-white/5 text-white/70"
                  }`}
                >
                  Credit
                </button>
              </div>

              {/* Split Payment Toggle */}
              <button
                onClick={() => {
                  setIsSplitActive(!isSplitActive);
                  setCashAmount(0);
                  setUpiAmount(0);
                  setCardAmount(0);
                  setCreditAmount(0);
                }}
                className={`w-full py-1.5 rounded-lg border text-center font-mono text-[9px] font-bold uppercase transition ${
                  isSplitActive ? "border-amber-500 text-amber-500 bg-amber-500/5 animate-pulse" : "border-white/10 text-white/40"
                }`}
              >
                {isSplitActive ? "⚡ Split Payment Active" : "Activate Split Payment Mode"}
              </button>

              {/* Split inputs */}
              {isSplitActive && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between items-center gap-2">
                    <span>Cash Amount:</span>
                    <input 
                      type="number" 
                      value={cashAmount} 
                      onChange={(e) => setCashAmount(Number(e.target.value))} 
                      className="bg-cyber-gray border border-white/5 rounded px-2 py-0.5 text-right w-24 text-white"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>UPI Amount:</span>
                    <input 
                      type="number" 
                      value={upiAmount} 
                      onChange={(e) => setUpiAmount(Number(e.target.value))} 
                      className="bg-cyber-gray border border-white/5 rounded px-2 py-0.5 text-right w-24 text-white"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span>Card Amount:</span>
                    <input 
                      type="number" 
                      value={cardAmount} 
                      onChange={(e) => setCardAmount(Number(e.target.value))} 
                      className="bg-cyber-gray border border-white/5 rounded px-2 py-0.5 text-right w-24 text-white"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-2 border-t border-white/5 pt-2">
                    <span>Credit / Balance:</span>
                    <input 
                      type="number" 
                      value={creditAmount} 
                      onChange={(e) => setCreditAmount(Number(e.target.value))} 
                      className="bg-cyber-gray border border-white/5 rounded px-2 py-0.5 text-right w-24 text-white"
                    />
                  </div>
                  <div className="text-right text-[9px] text-white/40 mt-1">
                    Split Sum: ₹{(cashAmount + upiAmount + cardAmount + creditAmount).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Signature names */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/40 block">Manager Signature</label>
                <input
                  type="text"
                  value={ownerSign}
                  onChange={(e) => setOwnerSign(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 rounded px-2 py-1.5 text-white outline-none focus:border-amber-500 font-mono italic"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-white/40 block">Customer Signature</label>
                <input
                  type="text"
                  placeholder="Billed Client Sign"
                  value={customerSign}
                  onChange={(e) => setCustomerSign(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/5 rounded px-2 py-1.5 text-white outline-none focus:border-amber-500 font-mono italic"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] flex gap-1.5 items-center leading-relaxed">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleCreateInvoice}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Generate Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success invoice modal receipt */}
      {successInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-2xl w-full relative my-8 print:p-0 print:border-none print:bg-white print:text-black">
            
            <button 
              onClick={() => setSuccessInvoice(null)}
              className="absolute top-4 right-4 text-xs bg-white/5 hover:bg-white/10 p-1.5 rounded text-white/60 hover:text-white print:hidden focus:ring-1 focus:ring-amber-500 outline-none"
            >
              Close Receipt
            </button>

            <div id="print-area" className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4 print:border-black/10">
                <div>
                  <span className="font-mono font-bold text-sm tracking-widest text-white print:text-black">
                    TAJ TYRE WORK
                  </span>
                  <p className="text-[10px] text-white/50 print:text-black/60 font-mono mt-0.5">
                    GT Road bypass, Delhi Crossing, India
                  </p>
                  <p className="text-[10px] text-white/50 print:text-black/60 font-mono">
                    {successInvoice.gstAmount > 0 ? "GSTIN: 07AAJFT2008T1Z8" : "NON-GST RETAIL MEMO"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-mono font-bold text-xs uppercase block print:text-black">
                    {successInvoice.gstAmount > 0 ? "TAX INVOICE" : "RETAIL INVOICE (NON-GST)"}
                  </span>
                  <span className="text-xs font-mono font-bold text-white print:text-black block mt-0.5 font-bold">
                    {successInvoice.invoiceNumber}
                  </span>
                  <span className="text-[10px] text-white/40 print:text-black/50 block font-mono">
                    Date: {successInvoice.date}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-white/40 print:text-black/40 block font-mono">BILLED TO:</span>
                  <p className="font-bold text-white print:text-black">{successInvoice.customerName}</p>
                  <p className="text-white/60 print:text-black/70 font-mono mt-0.5">{successInvoice.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 print:text-black/40 block font-mono">PAYMENT MODE:</span>
                  <p className="font-bold text-white print:text-black">{successInvoice.paymentMethod}</p>
                  <p className="text-emerald-400 print:text-emerald-700 font-bold font-mono text-[10px] mt-0.5">✔ COMPLETED TRANSACTION</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 font-mono print:border-black/10 print:text-black/60">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">GST %</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {successInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 text-white/80 print:border-black/5 print:text-black">
                      <td className="py-2.5">
                        <span className="font-bold block">{item.brand} {item.name}</span>
                        <span className="text-[9px] text-white/40 print:text-black/50 font-mono block">HSN: {item.hsnCode}</span>
                      </td>
                      <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">₹{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right font-mono">{item.gstRate}%</td>
                      <td className="py-2.5 text-right font-mono">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-white/50 print:text-black/60">
                    <span>Taxable Value:</span>
                    <span>₹{successInvoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white/50 print:text-black/60 border-b border-white/5 pb-2 print:border-black/10">
                    <span>{successInvoice.gstAmount > 0 ? "CGST + SGST (Combined):" : "GST Tax (Exempt / ₹0):"}</span>
                    <span>₹{successInvoice.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {successInvoice.discountApplied > 0 && (
                    <div className="flex justify-between text-rose-400 print:text-rose-700">
                      <span>Discount Coupon:</span>
                      <span>-₹{successInvoice.discountApplied.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-white font-bold print:text-black pt-1">
                    <span>Invoice Net Total:</span>
                    <span className="text-amber-500 print:text-black">₹{successInvoice.netTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* UPI payment QR code */}
              {successInvoice.paymentMethod === "UPI" && (
                <div className="bg-[#12121a] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden max-w-sm mx-auto">
                  <div className="text-center sm:text-left">
                    <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest block">UPI Instant Payment</span>
                    <h5 className="font-bold text-white text-xs mt-0.5">Scan to Pay Samar</h5>
                    <p className="text-[10px] text-white/50 font-mono mt-0.5">pa: tajtyreworks05@okaxis</p>
                  </div>
                  <div className="w-20 h-20 bg-white p-1 rounded flex items-center justify-center shrink-0 shadow-lg">
                    {/* Simulated QR block */}
                    <QrCode className="w-full h-full text-black stroke-[1.5]" />
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-dashed border-white/5 text-xs text-white/50 print:border-black/10 print:text-black/60">
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-amber-500 font-bold print:text-black">
                    {successInvoice.ownerSignature}
                  </div>
                  <div className="w-32 h-[1px] bg-white/10 mx-auto my-1.5 print:bg-black/20"></div>
                  <span className="text-[9px] font-mono uppercase block">Mohammad Samar (Manager)</span>
                </div>
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-white/95 print:text-black">
                    {successInvoice.customerSignature}
                  </div>
                  <div className="w-32 h-[1px] bg-white/10 mx-auto my-1.5 print:bg-black/20"></div>
                  <span className="text-[9px] font-mono uppercase block">Customer Signature</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2 justify-end mt-8 border-t border-white/5 pt-4 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
