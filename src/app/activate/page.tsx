"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Car,
  FileText,
  ShieldAlert,
  RefreshCw,
  ShieldCheck,
  Info,
} from "lucide-react";
import { authService } from "@/lib/auth";

export default function ActivateExistingAccountPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyActiveNotice, setAlreadyActiveNotice] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setAlreadyActiveNotice(false);

    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!vehicleNumber.trim()) {
      setErrorMsg("Please enter your registered vehicle number.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setErrorMsg("Please enter your Taj Tyre Works invoice number from your bill or receipt.");
      return;
    }

    setIsSubmitting(true);
    const res = await authService.verifyExistingCustomer({
      phone: phone.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      invoiceNumber: invoiceNumber.trim().toUpperCase(),
    });
    setIsSubmitting(false);

    if (res.success && res.token) {
      // Identity successfully verified: redirect to set username & password
      router.push(`/set-password?token=${encodeURIComponent(res.token)}`);
    } else {
      setErrorMsg(res.error || "Identity verification failed.");
      if (res.alreadyActive) {
        setAlreadyActiveNotice(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background ambient lighting */}
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
              EXISTING CLIENT ACCOUNT CLAIM
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Activate Existing Account
            </h2>
            <p className="text-xs text-white/50 mt-1">
              If you visited Taj Tyre Works in person, verify your bill details to claim your online account without OTP.
            </p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-4 text-[11px] text-white/70 flex gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              To protect customer privacy without SMS OTPs, your registered mobile number must match your vehicle plate and recent invoice number.
            </span>
          </div>

          <div className="transition-all duration-200">
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Field 1: Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Registered Mobile Number
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

              {/* Field 2: Vehicle Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Registered Vehicle Plate
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

              {/* Field 3: Invoice Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Shop Invoice Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. TTW-2026-001 or TTW-2026-683"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white font-mono uppercase outline-none transition"
                  />
                  <FileText className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[9px] text-white/40 block">Found at the top of your printed receipt or job sheet.</span>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMsg}</span>
                    {alreadyActiveNotice && (
                      <Link
                        href="/login"
                        className="block mt-1 text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        Sign in with your Username and Password &rarr;
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
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Set Username/Password</span>
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-white/5 space-y-1.5">
                <p className="text-[11px] text-white/50">
                  New customer without a past invoice?{" "}
                  <Link href="/signup" className="text-amber-500 hover:underline font-semibold">
                    Register Here
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
