"use client";

import React, { useState } from "react";
import { Settings, Database, RefreshCw, Download, Upload, ShieldAlert, CheckCircle2, FileJson } from "lucide-react";
import { dbStore } from "@/lib/store";

export default function OwnerSettings() {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [backupPayload, setBackupPayload] = useState("");
  const [importPayload, setImportPayload] = useState("");

  const handleReset = () => {
    if (confirm("WARNING: This will wipe all inventory, invoices, cashbook logs, and customers from browser storage. Proceed?")) {
      dbStore.resetDatabase();
      setSuccessMsg("Database successfully wiped and reloaded.");
    }
  };

  const handleSeed = () => {
    if (confirm("This will restore the standard mock seed data and overwrite current entries. Proceed?")) {
      dbStore.seedSampleInventory();
      setSuccessMsg("Sample mock database seeded successfully.");
    }
  };

  const handleExport = () => {
    const data = dbStore.exportData();
    setBackupPayload(data);
    setSuccessMsg("JSON backup payload generated below. Copy and save this text.");
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const success = dbStore.importData(importPayload);
    if (success) {
      setSuccessMsg("Database successfully restored from JSON payload!");
      setImportPayload("");
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setErrorMsg("Failed to parse JSON structure. Please check payload formatting.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          CONSOLE PREFERENCES & DEBUG GATES
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Settings & Developer Tools
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Developer tools (LHS: 6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-500" />
              Developer Database Gates (Owner Only)
            </h3>

            <p className="text-xs text-white/55 leading-relaxed mb-6">
              Use these tools to control database persistence, restore standard demo scenarios, or backup local state values during evaluation.
            </p>

            <div className="space-y-4">
              {/* Seed Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Seed Demo Database</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">Fills inventory, customers, invoices, and supplier details.</p>
                </div>
                <button
                  onClick={handleSeed}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Seed Database
                </button>
              </div>

              {/* Reset Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase text-rose-400">Wipe Local Database</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">Clears all data from browser localStorage keys.</p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Wipe Database
                </button>
              </div>

              {/* Export Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Export Database Payload</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">Generates a JSON block representing the complete state.</p>
                </div>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-white/10 hover:border-amber-500/35 bg-white/5 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  Export JSON
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="mt-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start leading-relaxed animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mt-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed animate-fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* JSON Backup textareas (RHS: 6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Import Panel */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-500" />
              Restore Database Payload
            </h3>
            
            <form onSubmit={handleImport} className="space-y-4">
              <textarea
                required
                rows={5}
                placeholder='Paste exported JSON string block here... {"tyres": [...]}'
                value={importPayload}
                onChange={(e) => setImportPayload(e.target.value)}
                className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 px-3 text-xs text-white font-mono outline-none transition resize-none leading-relaxed"
              ></textarea>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition"
              >
                Import/Restore JSON Payload
              </button>
            </form>
          </div>

          {/* Export View Panel */}
          {backupPayload && (
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-3 animate-fade-in">
              <h4 className="text-xs font-mono text-white/40 uppercase flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-amber-500" />
                Exported Backup String
              </h4>
              <textarea
                readOnly
                rows={6}
                value={backupPayload}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full bg-cyber-gray-dark border border-white/5 rounded-lg py-2 px-3 text-xs text-white/60 font-mono outline-none cursor-pointer"
              ></textarea>
              <span className="text-[10px] text-white/40 block font-mono text-center">Click inside text box to select all, then copy.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
