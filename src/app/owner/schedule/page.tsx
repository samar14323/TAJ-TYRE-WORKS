"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";

export default function OwnerSchedulePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-cyber-gray/40 border border-white/5 rounded-2xl">
      <Calendar className="w-12 h-12 text-amber-500 animate-pulse mb-3" />
      <h3 className="text-lg font-bold text-white font-mono uppercase tracking-widest">
        Full Calendar & Checklist Planner
      </h3>
      <p className="text-xs text-white/50 max-w-sm mt-1 mb-4 leading-relaxed">
        This portal displays a full monthly/weekly grid calendar showing appointments bookings, low stock reminders, supplier deadlines, and manager check-lists.
      </p>
      <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 uppercase tracking-widest flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Scheduled for Phase 5
      </span>
    </div>
  );
}
