"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Clock, CheckCircle2, ChevronLeft, Search, ShieldCheck, User } from "lucide-react";
import { dbStore, JobCard } from "@/lib/store";

function TrackComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryJobId = searchParams.get("jobId") || "";

  const [jobIdInput, setJobIdInput] = useState(queryJobId);
  const [job, setJob] = useState<JobCard | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const searchJob = (id: string) => {
    setErrorMsg("");
    const list = dbStore.getJobCards();
    const found = list.find(
      (j) => j.jobId.toLowerCase() === id.toLowerCase() || j.id === id
    );
    if (found) {
      setJob(found);
      router.push(`/track?jobId=${found.jobId}`);
    } else {
      setJob(null);
      if (id) {
        setErrorMsg("Job Card reference not found. (Hint: Try TTW-2026-00152)");
      }
    }
  };

  useEffect(() => {
    if (queryJobId) {
      searchJob(queryJobId);
    }
  }, [queryJobId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchJob(jobIdInput);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#f4f4f7] py-12 px-6 relative font-sans">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Header Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-500 transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Main Shop Website
        </Link>

        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Live Vehicle Status Tracker</h2>
          <p className="text-xs text-white/50">
            Enter your Job Card reference number to inspect live service bay progress.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Job Card ID (e.g. TTW-2026-00152)"
            value={jobIdInput}
            onChange={(e) => setJobIdInput(e.target.value)}
            className="flex-1 bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-xl py-3 px-4 text-xs text-white outline-none transition uppercase tracking-wider font-mono"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition"
          >
            Locate Job
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Live Status Layout */}
        {job ? (
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block">ACTIVE SERVICE CARD</span>
                <h3 className="text-lg font-bold text-white font-mono mt-0.5">{job.jobId}</h3>
                <span className="text-xs text-white/50 font-mono">Vehicle: {job.vehicleModel}</span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-white/40 block font-mono">ESTIMATED COMPLETION</span>
                <span className="text-base font-mono font-bold text-amber-500 flex items-center gap-1.5 justify-end">
                  <Clock className="w-4 h-4 text-amber-500" />
                  {job.estimatedFinish}
                </span>
              </div>
            </div>

            {/* Bay information */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-[9px] text-white/40 block font-mono uppercase">Assigned Service Bay</span>
                <span className="font-bold text-white block mt-0.5">{job.bay}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 block font-mono uppercase">Assigned Technician</span>
                <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  {job.mechanic}
                </span>
              </div>
            </div>

            {/* Vertical/Horizontal progress timeline */}
            <div className="space-y-4 pt-4">
              <h4 className="text-xs font-mono text-white/40 uppercase">SERVICE TRACK TIMELINE</h4>

              <div className="relative pl-6 border-l border-white/5 space-y-5 py-2">
                {job.timeline.map((step, idx) => {
                  // Determine completed state
                  // Simple check: is this step completed?
                  const isCompleted = step.completed || 
                    (job.status === "Completed") ||
                    (job.status === "Quality Check" && idx <= 4) ||
                    (job.status === "In Progress" && idx <= 1);

                  return (
                    <div key={idx} className="relative">
                      {/* Circle dot */}
                      <div className={`absolute -left-9 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition duration-300 ${
                        isCompleted 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                          : "bg-cyber-gray border-white/10 text-white/20"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-500" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                        )}
                      </div>

                      <div>
                        <h5 className={`text-xs font-bold transition ${isCompleted ? "text-white" : "text-white/40"}`}>
                          {step.step}
                        </h5>
                        <span className="text-[9px] font-mono text-white/40 block mt-0.5">
                          {isCompleted ? step.timestamp || "Status Logged" : "Pending action"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-center text-[10px] text-white/30 leading-relaxed font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Real-time calibration logs secured by Taj Tyre Works node parameters.</span>
            </div>
          </div>
        ) : (
          <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/40 text-xs">
            Search your Job Card reference number to inspect live bay status details.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050507] text-[#f4f4f7] flex items-center justify-center">
        <Compass className="w-12 h-12 text-amber-500 animate-spin-slow" />
      </div>
    }>
      <TrackComponent />
    </Suspense>
  );
}
