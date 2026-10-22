"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Receipt, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Wrench, 
  Percent, 
  KeyRound,
  Save
} from "lucide-react";

export default function OwnerSettings() {
  const [userName, setUserName] = useState("Mohammad Samar");
  const [phone, setPhone] = useState("+91 9199936181");
  const [address, setAddress] = useState("Shop No. 4, Main Road, Delhi / NCR");
  
  // Operating Schedule & Bay Capacity editable settings
  const [workshopTimings, setWorkshopTimings] = useState("09:00 AM – 09:00 PM (Daily)");
  const [activeServiceBays, setActiveServiceBays] = useState("4 Bays (Alignment, Fitting, Balancing, Nitrogen)");
  const [defaultWarrantyPeriod, setDefaultWarrantyPeriod] = useState("5 Years (Standard Tyre Models)");

  // Tax & Billing Preferences
  const [defaultApplyGst, setDefaultApplyGst] = useState(true);
  const [autoSmsReceipts, setAutoSmsReceipts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedName = localStorage.getItem("ttw_currentUserName");
    if (savedName) setUserName(savedName);

    const savedPhone = localStorage.getItem("ttw_workshopPhone");
    if (savedPhone) setPhone(savedPhone);

    const savedAddress = localStorage.getItem("ttw_workshopAddress");
    if (savedAddress) setAddress(savedAddress);

    const savedTimings = localStorage.getItem("ttw_workshopTimings");
    if (savedTimings) setWorkshopTimings(savedTimings);

    const savedBays = localStorage.getItem("ttw_activeServiceBays");
    if (savedBays) setActiveServiceBays(savedBays);

    const savedWarranty = localStorage.getItem("ttw_defaultWarrantyPeriod");
    if (savedWarranty) setDefaultWarrantyPeriod(savedWarranty);

    const savedGst = localStorage.getItem("ttw_defaultApplyGst");
    if (savedGst !== null) setDefaultApplyGst(savedGst === "true");

    const savedSms = localStorage.getItem("ttw_autoSmsReceipts");
    if (savedSms !== null) setAutoSmsReceipts(savedSms === "true");

    const savedSound = localStorage.getItem("ttw_soundAlerts");
    if (savedSound !== null) setSoundAlerts(savedSound === "true");
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("ttw_currentUserName", userName);
      localStorage.setItem("ttw_workshopPhone", phone);
      localStorage.setItem("ttw_workshopAddress", address);
      localStorage.setItem("ttw_workshopTimings", workshopTimings);
      localStorage.setItem("ttw_activeServiceBays", activeServiceBays);
      localStorage.setItem("ttw_defaultWarrantyPeriod", defaultWarrantyPeriod);
      localStorage.setItem("ttw_defaultApplyGst", String(defaultApplyGst));
      localStorage.setItem("ttw_autoSmsReceipts", String(autoSmsReceipts));
      localStorage.setItem("ttw_soundAlerts", String(soundAlerts));
    }
    setSuccessMsg("Workshop schedule, bay capacity & billing preferences saved successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          WORKSHOP ADMINISTRATION & CONFIGURATION
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Workshop Settings
        </h2>
        <p className="text-xs text-white/55 mt-1 max-w-2xl">
          Manage garage business information, operating schedule, service bays, warranty policies, and tax billing defaults.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2.5 items-center leading-relaxed animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Workshop Profile & Operations (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Workshop Profile Card */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              Workshop Identity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Business / Trading Name
                </label>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-white text-xs font-semibold flex items-center justify-between">
                  <span>TAJ TYRE WORKS</span>
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Registered
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Primary Owner / Administrator Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition"
                  placeholder="Owner Name"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Direct Hotline & WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-amber-500 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition"
                    placeholder="+91 Phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Physical Workshop Location
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-amber-500 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition"
                    placeholder="Workshop address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Hours & Facilities Card (Editable Settings) */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Operating Schedule & Bay Capacity
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Workshop Timings
                </label>
                <input
                  type="text"
                  value={workshopTimings}
                  onChange={(e) => setWorkshopTimings(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition font-mono"
                  placeholder="e.g. 09:00 AM – 09:00 PM (Daily)"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Active Service Bays
                </label>
                <input
                  type="text"
                  value={activeServiceBays}
                  onChange={(e) => setActiveServiceBays(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition font-mono"
                  placeholder="e.g. 4 Bays (Alignment, Fitting, Balancing, Nitrogen)"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  Default Warranty Period
                </label>
                <input
                  type="text"
                  value={defaultWarrantyPeriod}
                  onChange={(e) => setDefaultWarrantyPeriod(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-medium outline-none transition font-mono"
                  placeholder="e.g. 5 Years (Standard Tyre Models)"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Invoicing, GST & System Security (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Tax & Invoicing Rules Card */}
          <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-500" />
              Invoicing & Tax Parameters
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    Default GST in Billing
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {defaultApplyGst 
                      ? "Standard GST enabled (28% Tyres, 18% Services)" 
                      : "Optional Non-GST / Tax-exempt billing active by default"}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={defaultApplyGst}
                  onChange={(e) => setDefaultApplyGst(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-500" />
                    Statutory Tyre GST Rate
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Standard rate for automotive tyres & tubes</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  28.0%
                </span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    Statutory Service GST Rate
                  </h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Wheel alignment, wheel balancing, nitrogen refills</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  18.0%
                </span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Invoice Number Format</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Sequential invoice serials</p>
                </div>
                <span className="text-xs font-mono font-semibold text-white/80">
                  #TTW-YYYY-XXXXX
                </span>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Accepted Payment Channels</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">Multi-mode split billing supported</p>
                </div>
                <span className="text-xs font-mono font-semibold text-white/80">
                  Cash, UPI, Card, Credit
                </span>
              </div>
            </div>
          </div>

          {/* Preferences & Security Overview Card */}
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <h3 className="text-sm font-mono text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Preferences
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition">
                <div>
                  <span className="text-xs font-bold text-white block">WhatsApp / SMS Receipt Prompt</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Prompt to send digital bill links at checkout</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSmsReceipts}
                  onChange={(e) => setAutoSmsReceipts(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.07] transition">
                <div>
                  <span className="text-xs font-bold text-white block">Bay Status Sound Alerts</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Audio notification on queue and bay timeline updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Credential Recovery Gate</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Manage customer password reset requests</span>
                </div>
                <Link
                  href="/owner/recovery"
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  View Requests
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <Save className="w-3.5 h-3.5" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
