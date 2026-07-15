"use client";

import React, { useState, useEffect } from "react";
import { Award, Check, Lock, Gift, Star, ShieldAlert, Sparkles } from "lucide-react";
import { dbStore, Customer } from "@/lib/store";

interface Coupon {
  code: string;
  title: string;
  requirement: string;
  discount: string;
  visitsNeeded: number;
}

const mockCoupons: Coupon[] = [
  { code: "TAJ10OFF", title: "Bronze Loyalty Discount", requirement: "Complete 5 verified visits", discount: "10% OFF on next purchase", visitsNeeded: 5 },
  { code: "TAJ20OFF", title: "Silver Loyalty Discount", requirement: "Complete 10 verified visits", discount: "20% OFF on next purchase", visitsNeeded: 10 },
  { code: "TAJVIPGOLD", title: "Gold VIP Loyalty Discount", requirement: "Complete 20 verified visits", discount: "25% OFF + Free wheel alignment service", visitsNeeded: 20 }
];

export default function CustomerOffers() {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const phone = localStorage.getItem("ttw_currentUserPhone") || "9199936181";
    const list = dbStore.getCustomers();
    const found = list.find((c) => c.phone === phone);
    if (found) {
      setCustomer(found);
    }
  }, []);

  const visits = customer?.visits || 0;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          LOYALTY CARD & SPECIAL OFFERS
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Loyalty Rewards Progress
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Tracker (LHS: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel-amber p-6 rounded-2xl border-amber-500/10 flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <Award className="w-10 h-10 text-amber-500 mb-2" />
            <h3 className="text-lg font-bold text-white">Your Visit Loyalty Card</h3>
            <p className="text-xs text-white/50 mt-1 mb-6">
              Complete tyre alignments or fitting checkups at Taj Tyre Works to unlock rewards.
            </p>

            {/* Visit Checkbox grid */}
            <div className="grid grid-cols-5 gap-3.5 mb-6">
              {Array.from({ length: 20 }).map((_, idx) => {
                const stepNum = idx + 1;
                const isChecked = visits >= stepNum;
                const isMilestone = stepNum === 5 || stepNum === 10 || stepNum === 20;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border font-mono text-xs font-bold transition duration-300 relative ${
                        isChecked 
                          ? "bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10" 
                          : "bg-cyber-gray border-white/5 text-white/40"
                      }`}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        stepNum
                      )}
                      
                      {/* Milestone visual dot */}
                      {isMilestone && !isChecked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-[#050507] animate-pulse"></span>
                      )}
                    </div>
                    {isMilestone && (
                      <span className="text-[7px] font-mono text-amber-500 font-bold uppercase mt-0.5">
                        Gift
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shield warnings */}
            <div className="flex gap-2.5 bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl text-[11px] text-rose-300/80 leading-relaxed text-left">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300 mb-0.5">Security Notice:</p>
                <p>Only the owner **Mohammad Samar** can check or increment visits from the admin billing terminal upon job completion. Clients cannot edit these entries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupons List (RHS: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            Unlockable Loyalty Coupons
          </h3>

          <div className="space-y-4">
            {mockCoupons.map((c) => {
              const isUnlocked = visits >= c.visitsNeeded;

              return (
                <div 
                  key={c.code}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition relative overflow-hidden ${
                    isUnlocked
                      ? "glass-panel-amber border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
                      : "glass-panel border-white/5 opacity-60"
                  }`}
                >
                  {/* Visual ribbon */}
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono text-[7px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                      Unlocked
                    </div>
                  )}

                  <div className="flex-1">
                    <span className={`text-[10px] font-mono font-bold uppercase block mb-1 ${isUnlocked ? "text-amber-500" : "text-white/40"}`}>
                      {c.title}
                    </span>
                    <h4 className="text-base font-bold text-white">{c.discount}</h4>
                    <span className="text-xs text-white/50 mt-1 block">
                      Requirement: {c.requirement}
                    </span>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    {isUnlocked ? (
                      <div className="p-3 bg-cyber-gray border border-amber-500/20 rounded-xl text-center">
                        <span className="text-[10px] text-white/40 block font-mono">COUPON CODE</span>
                        <span className="text-xs font-mono font-bold text-amber-500 tracking-wider">
                          {c.code}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-xs text-white/40 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-white/30" />
                        Locked ({visits}/{c.visitsNeeded} visits)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
