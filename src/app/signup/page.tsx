"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Car,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { authService } from "@/lib/auth";

export default function CustomerSignupPage() {
  const router = useRouter();

  // ONLY 3 fields as required
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyRegisteredNotice, setAlreadyRegisteredNotice] = useState(false);
  const [needsActivationNotice, setNeedsActivationNotice] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setAlreadyRegisteredNotice(false);
    setNeedsActivationNotice(false);

    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!vehicleNumber.trim()) {
      setErrorMsg("Please enter your vehicle number.");
      return;
    }

    setIsSubmitting(true);
    const res = await authService.customerSignup({
      name: name.trim(),
      phone: phone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
    });
    setIsSubmitting(false);

    if (res.success && res.token) {
      // Redirect to the secure username & password setup page with the activation token
      router.push(`/set-password?token=${encodeURIComponent(res.token)}`);
    } else {
      setErrorMsg(res.error || "Failed to create customer account.");
      if (res.alreadyRegistered) {
        setAlreadyRegisteredNotice(true);
      }
      if (res.needsExistingActivation) {
        setNeedsActivationNotice(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-500 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border-white/5">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              TAJ TYRE WORKS &bull; PORTAL ONBOARDING
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Customer Sign Up
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Register your vehicle profile to access tyre warranties, appointments, and loyalty card.
            </p>
          </div>

          <div className="transition-all duration-200">
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Field 1: Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Samar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                  <User className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9199936181"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white font-mono outline-none transition"
                  />
                  <Phone className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Vehicle Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Vehicle Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL3C-AM-1234 or HR26-BY-5678"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white font-mono uppercase outline-none transition"
                  />
                  <Car className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMsg}</span>
                    {alreadyRegisteredNotice && (
                      <Link
                        href="/login"
                        className="block mt-1 text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        Click here to Sign In with Username & Password &rarr;
                      </Link>
                    )}
                    {needsActivationNotice && (
                      <Link
                        href="/activate"
                        className="block mt-1 text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        Click here to Activate Existing Account &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 mt-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Proceed to Set Username & Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Navigation Links */}
              <div className="pt-3 text-center border-t border-white/5 space-y-1.5">
                <p className="text-[11px] text-white/50">
                  Already have an active account?{" "}
                  <Link href="/login" className="text-amber-500 hover:underline font-semibold">
                    Sign In
                  </Link>
                </p>
                <p className="text-[10px] text-white/40">
                  Existing in-store client without password?{" "}
                  <Link href="/activate" className="text-white/70 hover:text-amber-400 underline">
                    Activate Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
