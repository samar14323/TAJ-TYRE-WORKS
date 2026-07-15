"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Compass, Clock, CheckCircle2, AlertTriangle, MonitorPlay } from "lucide-react";
import { dbStore, JobCard } from "@/lib/store";

export default function WorkshopTV() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  const loadJobs = () => {
    setJobCards(dbStore.getJobCards());
  };

  useEffect(() => {
    loadJobs();
    
    // Auto refresh every 5 seconds to mock a real TV monitor feed
    const interval = setInterval(loadJobs, 5000);

    // Live clock update
    const clockInterval = setInterval(() => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const waitingJobs = jobCards.filter((j) => j.status === "Waiting");
  const activeJobs = jobCards.filter((j) => j.status === "In Progress" || j.status === "Quality Check");
  const readyJobs = jobCards.filter((j) => j.status === "Completed").slice(0, 5); // Show latest 5 completed

  // Wait time calculations (e.g. 15 mins per waiting vehicle)
  const estWaitTime = Math.max(10, waitingJobs.length * 15);

  return (
    <div className="min-h-screen bg-[#020204] text-[#f4f4f7] p-8 flex flex-col justify-between font-sans overflow-hidden relative select-none">
      
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER SECTION */}
      <header className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-spin-slow">
            <Compass className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-white">TAJ TYRE WORKS</h1>
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block -mt-0.5">
              Workshop Bay Live Status Feed
            </span>
          </div>
        </div>

        {/* Live Wait Timer indicator */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[9px] text-white/40 block font-mono">AVG BAY WAIT TIME</span>
            <span className="text-xl font-mono font-bold text-amber-500 text-glow">
              ~{estWaitTime} Mins
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/10"></div>

          {/* Time Clock */}
          <div className="text-right">
            <span className="text-[9px] text-white/40 block font-mono">LOCAL STATION TIME</span>
            <span className="text-xl font-mono font-bold text-white tracking-wide">
              {currentTime || "17:49:17"}
            </span>
          </div>
        </div>
      </header>

      {/* WORKSHOP LIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Column 1: Vehicles in Queue (LHS: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">
              Queue waiting list ({waitingJobs.length})
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar">
            {waitingJobs.map((job) => (
              <div key={job.id} className="p-4 bg-cyber-gray border border-white/5 rounded-xl space-y-2 relative pl-6">
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white tracking-wide text-sm">{job.vehicleNumber}</h3>
                    <p className="text-[10px] text-white/50 font-mono mt-0.5">{job.vehicleModel}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/40 uppercase bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    Waiting
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-white/60 font-mono border-t border-white/5 pt-2">
                  <span>Job: {job.services[0]}</span>
                  <span>Est: {job.estimatedFinish}</span>
                </div>
              </div>
            ))}

            {waitingJobs.length === 0 && (
              <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-white/30 italic">
                No vehicles waiting in queues.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Active Service Bays (Midd: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              Active service bays monitor ({activeJobs.length})
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4 overflow-y-auto pr-1 no-scrollbar">
            {/* Bay 1 Alignment */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[100px] transition duration-300 ${
              jobCards.some((j) => j.bay === "Bay 1 (Alignment)" && j.status !== "Completed")
                ? "bg-blue-500/5 border-blue-500/20"
                : "bg-white/5 border-white/5"
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">BAY 1 — 3D Computerized Alignment</span>
                {jobCards.some((j) => j.bay === "Bay 1 (Alignment)" && j.status !== "Completed") ? (
                  <span className="text-[8px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase animate-pulse">
                    Active
                  </span>
                ) : (
                  <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                    Available
                  </span>
                )}
              </div>
              {jobCards.some((j) => j.bay === "Bay 1 (Alignment)" && j.status !== "Completed") ? (
                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] font-mono text-white/60">
                    <p>Plate: <span className="text-white font-bold">{jobCards.find(j => j.bay === "Bay 1 (Alignment)" && j.status !== "Completed")?.vehicleNumber}</span></p>
                    <p>Tech: {jobCards.find(j => j.bay === "Bay 1 (Alignment)" && j.status !== "Completed")?.mechanic}</p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">Calibrating...</span>
                </div>
              ) : (
                <p className="text-[10px] text-white/30 italic mt-4">Bay ready for alignment vehicle entry.</p>
              )}
            </div>

            {/* Bay 2 Fitting */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[100px] transition duration-300 ${
              jobCards.some((j) => j.bay === "Bay 2 (Fitting)" && j.status !== "Completed")
                ? "bg-blue-500/5 border-blue-500/20"
                : "bg-white/5 border-white/5"
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">BAY 2 — Tubeless Tyre Fitting</span>
                {jobCards.some((j) => j.bay === "Bay 2 (Fitting)" && j.status !== "Completed") ? (
                  <span className="text-[8px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase animate-pulse">
                    Active
                  </span>
                ) : (
                  <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                    Available
                  </span>
                )}
              </div>
              {jobCards.some((j) => j.bay === "Bay 2 (Fitting)" && j.status !== "Completed") ? (
                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] font-mono text-white/60">
                    <p>Plate: <span className="text-white font-bold">{jobCards.find(j => j.bay === "Bay 2 (Fitting)" && j.status !== "Completed")?.vehicleNumber}</span></p>
                    <p>Tech: {jobCards.find(j => j.bay === "Bay 2 (Fitting)" && j.status !== "Completed")?.mechanic}</p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">Fitting tyres...</span>
                </div>
              ) : (
                <p className="text-[10px] text-white/30 italic mt-4">Bay ready for tyre replacement check-ins.</p>
              )}
            </div>

            {/* Bay 4 Nitrogen */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between min-h-[100px] transition duration-300 ${
              jobCards.some((j) => j.bay === "Bay 4 (Nitrogen)" && j.status !== "Completed")
                ? "bg-blue-500/5 border-blue-500/20"
                : "bg-white/5 border-white/5"
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">BAY 4 — 98% Nitrogen Inflation</span>
                {jobCards.some((j) => j.bay === "Bay 4 (Nitrogen)" && j.status !== "Completed") ? (
                  <span className="text-[8px] font-mono font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase animate-pulse">
                    Active
                  </span>
                ) : (
                  <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                    Available
                  </span>
                )}
              </div>
              {jobCards.some((j) => j.bay === "Bay 4 (Nitrogen)" && j.status !== "Completed") ? (
                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] font-mono text-white/60">
                    <p>Plate: <span className="text-white font-bold">{jobCards.find(j => j.bay === "Bay 4 (Nitrogen)" && j.status !== "Completed")?.vehicleNumber}</span></p>
                    <p>Tech: {jobCards.find(j => j.bay === "Bay 4 (Nitrogen)" && j.status !== "Completed")?.mechanic}</p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">Inflating...</span>
                </div>
              ) : (
                <p className="text-[10px] text-white/30 italic mt-4">Bay ready for nitrogen top-up.</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Ready for Delivery (RHS: 3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Ready for delivery ({readyJobs.length})
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[50vh] pr-1 no-scrollbar">
            {readyJobs.map((job) => (
              <div key={job.id} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative pl-6">
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500"></div>
                <div className="flex items-center gap-1 text-[8px] font-mono text-emerald-400 font-bold uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Service Done
                </div>
                <h3 className="font-bold text-white tracking-wide text-sm">{job.vehicleNumber}</h3>
                <p className="text-[10px] text-white/50 font-mono mt-0.5">{job.customerName}</p>
              </div>
            ))}

            {readyJobs.length === 0 && (
              <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-xs text-white/30 italic">
                Waiting for active jobs to complete.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TV STATUS FOOTER TICKER */}
      <footer className="mt-8 border-t border-white/10 pt-4 flex justify-between items-center text-[10px] font-mono text-white/40">
        <span className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-amber-500" />
          Live TV workshop calibration system synced to Samar terminal logs.
        </span>
        <span className="uppercase text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded">
          ● Online feed
        </span>
      </footer>
    </div>
  );
}
