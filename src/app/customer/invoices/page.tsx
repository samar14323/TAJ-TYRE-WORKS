"use client";

import React, { useState, useEffect } from "react";
import { FileText, Search, Printer, Download, Eye, X, Check, Shield } from "lucide-react";
import { dbStore, Invoice } from "@/lib/store";

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = () => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    const list = dbStore.getInvoices();
    const userInvs = list.filter((inv) => inv.customerPhone === phone);
    setInvoices(userInvs);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    return (
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          CERTIFIED PURCHASE ARCHIVES
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Invoices & Transactions
        </h2>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by Invoice Number or Product Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
        />
      </div>

      {/* Grid of Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredInvoices.map((inv) => (
          <div 
            key={inv.id}
            className="p-5 bg-cyber-gray border border-white/5 rounded-2xl flex flex-col justify-between hover:border-amber-500/20 transition group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[9px] font-mono text-amber-500 uppercase">GST REGISTERED TRANSACTION</span>
                  <h4 className="text-sm font-bold text-white mt-0.5 font-mono">{inv.invoiceNumber}</h4>
                  <span className="text-[10px] text-white/40 block mt-0.5 font-mono">Date: {inv.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 block font-mono">NET AMOUNT</span>
                  <span className="text-base font-mono font-bold text-white tracking-wide">
                    ₹{inv.netTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-1.5 my-4 border-t border-b border-white/5 py-3">
                {inv.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-white/70">
                      {item.brand} {item.name} <span className="text-[10px] text-white/40 font-mono">x{item.quantity}</span>
                    </span>
                    <span className="text-white font-mono">₹{item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 text-white/50">
                Paid via {inv.paymentMethod}
              </span>

              <button
                onClick={() => setSelectedInvoice(inv)}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-amber-500/5 text-white text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 focus:ring-1 focus:ring-amber-500 outline-none"
              >
                <Eye className="w-3.5 h-3.5 text-amber-500" />
                View Invoice Receipt
              </button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="col-span-full py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
            No transaction invoices found matching query.
          </div>
        )}
      </div>

      {/* Invoice Details Overlay Modal (Print friendly!) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-2xl w-full relative my-8 print:p-0 print:border-none print:bg-white print:text-black">
            
            {/* Close button - hidden on print */}
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-xs bg-white/5 hover:bg-white/10 p-1.5 rounded text-white/60 hover:text-white print:hidden focus:ring-1 focus:ring-amber-500 outline-none"
              aria-label="Close Receipt Overlay"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Print Friendly Invoice Card Area */}
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
                    GSTIN: 07AAJFT2008T1Z8
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-mono font-bold text-xs uppercase block print:text-black">
                    TAX INVOICE
                  </span>
                  <span className="text-xs font-mono font-bold text-white print:text-black block mt-0.5">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <span className="text-[10px] text-white/40 print:text-black/50 block font-mono">
                    Date: {selectedInvoice.date}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-white/40 print:text-black/40 block font-mono">BILLED TO:</span>
                  <p className="font-bold text-white print:text-black">{selectedInvoice.customerName}</p>
                  <p className="text-white/60 print:text-black/70 font-mono mt-0.5">{selectedInvoice.customerPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 print:text-black/40 block font-mono">PAYMENT MODE:</span>
                  <p className="font-bold text-white print:text-black">{selectedInvoice.paymentMethod}</p>
                  <p className="text-emerald-400 print:text-emerald-700 font-bold font-mono text-[10px] mt-0.5">✔ TRANSACTION COMPLETED</p>
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
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 text-white/80 print:border-black/5 print:text-black">
                      <td className="py-2.5">
                        <span className="font-bold block">{item.brand} {item.name}</span>
                        <span className="text-[9px] text-white/40 print:text-black/50 font-mono block">Premium Tyre Segment</span>
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
                    <span>₹{selectedInvoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white/50 print:text-black/60 border-b border-white/5 pb-2 print:border-black/10">
                    <span>CGST + SGST (Combined):</span>
                    <span>₹{selectedInvoice.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedInvoice.discountApplied > 0 && (
                    <div className="flex justify-between text-rose-400 print:text-rose-700">
                      <span>Discount Coupon:</span>
                      <span>-₹{selectedInvoice.discountApplied.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-white font-bold print:text-black pt-1">
                    <span>Invoice Net Total:</span>
                    <span className="text-amber-500 print:text-black">₹{selectedInvoice.netTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-dashed border-white/5 text-xs text-white/50 print:border-black/10 print:text-black/60">
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-amber-500 font-bold print:text-black">
                    {selectedInvoice.ownerSignature}
                  </div>
                  <div className="w-32 h-[1px] bg-white/10 mx-auto my-1.5 print:bg-black/20"></div>
                  <span className="text-[9px] font-mono uppercase block">Mohammad Samar (Manager)</span>
                </div>
                <div className="text-center">
                  <div className="h-8 flex items-center justify-center italic text-white/90 print:text-black">
                    {selectedInvoice.customerSignature}
                  </div>
                  <div className="w-32 h-[1px] bg-white/10 mx-auto my-1.5 print:bg-black/20"></div>
                  <span className="text-[9px] font-mono uppercase block">Customer Signature</span>
                </div>
              </div>

              {/* Trust statement */}
              <div className="text-center bg-white/5 p-3 rounded-lg border border-white/5 text-[9px] text-white/40 leading-relaxed font-mono flex items-center justify-center gap-2 print:bg-black/5 print:text-black/60">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Thank you for choosing Taj Tyre Work. Certified warranties are stored in client databases.</span>
              </div>
            </div>

            {/* Actions Footer - hidden on print */}
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
