"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, UserCheck, ShieldAlert, ArrowLeft, RefreshCw, KeyRound, AlertTriangle } from "lucide-react";
import { authService } from "@/lib/auth";
import { dbStore } from "@/lib/store";

type Role = "Owner" | "Customer" | "Employee" | "Dealer";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Role>("Customer");
  
  // Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true";

  // OTP 2FA Step
  const [otpStep, setOtpStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Live captured OTP for console simulator display
  const [simulatedOtp, setSimulatedOtp] = useState("");

  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      if (session.role === "Owner") router.push("/owner");
      else if (session.role === "Customer") router.push("/customer");
      else if (session.role === "Employee") router.push("/employee");
      else if (session.role === "Dealer") router.push("/dealer");
    }
  }, [router]);

  useEffect(() => {
    const handleOtpDispatched = (e: any) => {
      const { phone: dispatchedPhone, otp: code } = e.detail;
      if (dispatchedPhone === phone || dispatchedPhone === "owner-admin") {
        setSimulatedOtp(code);
      }
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener("ttw_otp_dispatched", handleOtpDispatched);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ttw_otp_dispatched", handleOtpDispatched);
      }
    };
  }, [phone]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    // Give a short delay for high-fidelity loading effect
    setTimeout(async () => {
      if (activeTab === "Customer") {
        // Customer login via phone OTP request
        if (!/^\d{10}$/.test(phone)) {
          setErrorMsg("Please enter a valid 10-digit mobile number.");
          setIsSubmitting(false);
          return;
        }

        const otpRes = await authService.requestOtp(phone);
        setIsSubmitting(false);
        if (otpRes.success) {
          setOtpStep(true);
        } else {
          setErrorMsg(otpRes.message);
        }
      } 
      
      else if (activeTab === "Owner") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Owner") {
          const displayName = username === "MHDSAM" ? "samar" : "noxis";
          authService.createSession("Owner", displayName, username);
          router.push("/owner");
        } else {
          setErrorMsg(authRes.error || "Invalid administrator credentials.");
        }
      } 
      
      else if (activeTab === "Employee") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Employee") {
          const empName = authRes.name || (username === "mechanic" ? "Karan Singh" : "Amit Kumar");
          const empType = authRes.employeeRole || (username === "mechanic" ? "Mechanic" : "Receptionist");
          
          authService.createSession("Employee", empName, username);
          localStorage.setItem("ttw_employeeType", empType);
          router.push("/employee");
        } else {
          setErrorMsg(authRes.error || "Invalid employee credentials.");
        }
      } 
      
      else if (activeTab === "Dealer") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Dealer") {
          authService.createSession("Dealer", authRes.name || "Dealer", username);
          router.push("/dealer");
        } else {
          setErrorMsg(authRes.error || "Invalid dealer credentials.");
        }
      }
    }, 800);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    setTimeout(async () => {
      if (activeTab === "Customer") {
        const verifyRes = await authService.verifyOtp(phone, otp);
        setIsSubmitting(false);
        if (verifyRes.success) {
          // Match or create customer profile
          const customersList = dbStore.getCustomers();
          const match = customersList.find(c => c.phone === phone);
          const customerName = match ? match.name : `Client (${phone})`;
          
          authService.createSession("Customer", customerName, phone);
          router.push("/customer");
        } else {
          setErrorMsg(verifyRes.message);
        }
      } else {
        setIsSubmitting(false);
      }
    }, 600);
  };


  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-500 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border-white/5">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              SECURE WORKSPACE SIGN-IN
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Taj Tyre Work Portals
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {!otpStep ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Role Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-cyber-gray-dark border border-white/5 rounded-lg mb-6">
                  {(["Customer", "Owner", "Employee", "Dealer"] as Role[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setActiveTab(role);
                        setErrorMsg("");
                        setUsername("");
                        setPassword("");
                        setPhone("");
                        setSimulatedOtp("");
                      }}
                      className={`py-1.5 rounded text-[10px] font-semibold tracking-wider uppercase transition ${
                        activeTab === role
                          ? "bg-amber-500 text-black font-bold"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {role === "Employee" ? "Staff" : role}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {activeTab === "Customer" ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-white/60">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9199936181"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition"
                      />
                      <span className="text-[10px] text-white/40 block">Secure 2FA OTP code validation required for entry.</span>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-white/60">Username</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-mono uppercase text-white/60">Password</label>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition"
                        />
                      </div>
                    </>
                  )}

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed animate-pulse">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Access Dashboard
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* 2FA Form */}
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                    <KeyRound className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-bounce" />
                    <h4 className="text-xs font-bold text-white uppercase">2-Factor Authentication Required</h4>
                    <p className="text-[10px] text-white/60 mt-1">
                      A single-use OTP code has been dispatched. Expires in 5 minutes.
                    </p>
                    
                    {isDev && simulatedOtp && (
                      <div className="mt-3 p-2 bg-black/40 border border-amber-500/30 rounded text-[10px] font-mono text-amber-500 tracking-wider">
                        [TEST SMS CONSOLE]: CODE IS <span className="font-bold underline">{simulatedOtp}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-white/60">6-Digit OTP Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-center text-white tracking-widest font-mono outline-none transition"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed animate-pulse">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep(false);
                        setOtp("");
                        setErrorMsg("");
                        setSimulatedOtp("");
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-semibold text-xs transition hover:bg-white/5"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Verify & Log In"
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
