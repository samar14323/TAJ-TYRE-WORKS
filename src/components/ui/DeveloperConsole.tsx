"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Database, ShieldAlert, RefreshCw, X, Download, Upload, Copy, UserCheck, Code, CheckCircle2 } from "lucide-react";
import { dbStore } from "@/lib/store";

export default function DeveloperConsole() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [jsonPayload, setJsonPayload] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle console with Ctrl + Shift + D
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSeed = () => {
    if (confirm("Reset and seed sample database with tyres, customers, invoices, expenses, and job cards?")) {
      dbStore.seedSampleInventory();
      setSuccessMsg("Sample database seeded successfully.");
      setTimeout(() => setIsOpen(false), 1000);
    }
  };

  const handleWipe = () => {
    if (confirm("Wipe all localStorage database keys? This will reload the page.")) {
      dbStore.resetDatabase();
    }
  };

  const handleExport = () => {
    const data = dbStore.exportData();
    setJsonPayload(data);
    setSuccessMsg("JSON state exported below! Click text box to copy.");
  };

  const handleImport = () => {
    if (!jsonPayload) {
      setErrorMsg("Please paste a JSON backup payload first.");
      return;
    }
    const success = dbStore.importData(jsonPayload);
    if (success) {
      setSuccessMsg("Data restored successfully! Page reloading...");
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setErrorMsg("Invalid JSON payload structure.");
    }
  };

  const forceSwitchRole = (role: "Owner" | "Customer" | "Employee" | "Dealer", name: string) => {
    localStorage.setItem("ttw_currentUserRole", role);
    localStorage.setItem("ttw_currentUserName", name);
    if (role === "Customer") {
      localStorage.setItem("ttw_currentUserPhone", "9199936181");
      router.push("/customer");
    } else if (role === "Employee") {
      localStorage.setItem("ttw_employeeType", "Mechanic");
      router.push("/employee");
    } else if (role === "Owner") {
      router.push("/owner");
    } else {
      router.push("/login");
    }
    setSuccessMsg(`Role switched to ${role}. Redirecting...`);
    setTimeout(() => {
      setIsOpen(false);
      setSuccessMsg("");
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[#0c0c14]/95 border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between font-sans text-xs">
      <div className="space-y-6 overflow-y-auto pr-1 no-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <span className="font-bold text-white font-mono uppercase tracking-wider block">Secret Dev Console</span>
              <span className="text-[8px] text-amber-500 uppercase tracking-widest block font-mono">Taj Admin Gate</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 rounded-lg font-mono">
          Shortcut trigger active. Press **Ctrl + Shift + D** on any screen to hide/show this administrative console.
        </div>

        {/* Database overrides */}
        <div className="space-y-3">
          <h4 className="font-mono text-white/40 uppercase tracking-wider text-[9px]">Local Database Controls</h4>
          
          <button
            onClick={handleSeed}
            className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Seed Sample Data
          </button>

          <button
            onClick={handleWipe}
            className="w-full py-2.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            Wipe Storage Reset
          </button>
        </div>

        {/* Quick Role switcher */}
        <div className="space-y-3 pt-2">
          <h4 className="font-mono text-white/40 uppercase tracking-wider text-[9px]">Force Role Switch Bypass</h4>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <button
              onClick={() => forceSwitchRole("Owner", "Mohammad Samar (Owner)")}
              className="py-2 px-2 bg-white/5 rounded border border-white/5 text-white/70 hover:border-amber-500/30 hover:text-white transition text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              Owner Admin
            </button>
            <button
              onClick={() => forceSwitchRole("Customer", "Rahul Sharma")}
              className="py-2 px-2 bg-white/5 rounded border border-white/5 text-white/70 hover:border-amber-500/30 hover:text-white transition text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              Customer
            </button>
            <button
              onClick={() => forceSwitchRole("Employee", "Karan Singh (Staff)")}
              className="py-2 px-2 bg-white/5 rounded border border-white/5 text-white/70 hover:border-amber-500/30 hover:text-white transition text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              Mechanic
            </button>
            <button
              onClick={() => forceSwitchRole("Dealer", "Wholesale Tyres Inc")}
              className="py-2 px-2 bg-white/5 rounded border border-white/5 text-white/70 hover:border-amber-500/30 hover:text-white transition text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              B2B Dealer
            </button>
          </div>
        </div>

        {/* Export / Import data */}
        <div className="space-y-3 pt-2 border-t border-white/5">
          <h4 className="font-mono text-white/40 uppercase tracking-wider text-[9px]">State Payload JSON Backup</h4>
          
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 font-mono text-[9px] text-white flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3 text-amber-500" /> Export JSON
            </button>
            <button
              onClick={handleImport}
              className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 font-mono text-[9px] text-white flex items-center justify-center gap-1"
            >
              <Upload className="w-3 h-3 text-amber-500" /> Restore JSON
            </button>
          </div>

          <textarea
            rows={5}
            placeholder="JSON state string payload block..."
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
            className="w-full bg-cyber-gray-dark border border-white/5 rounded-lg py-2 px-3 text-[10px] text-white/70 font-mono outline-none focus:border-amber-500 resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      {/* Messages */}
      <div className="pt-4 border-t border-white/5">
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] flex gap-1.5 items-center leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] flex gap-1.5 items-center leading-relaxed">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {!successMsg && !errorMsg && (
          <span className="text-[9px] text-white/30 text-center block font-mono">
            Taj Tyre Works dev console v4.0
          </span>
        )}
      </div>
    </div>
  );
}
