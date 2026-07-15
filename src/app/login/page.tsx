"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, UserCheck, ShieldAlert, ArrowLeft, RefreshCw, KeyRound, AlertTriangle } from "lucide-react";

type Role = "Owner" | "Customer" | "Employee" | "Dealer";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Role>("Customer");
  
  // Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // OTP 2FA Step
  const [otpStep, setOtpStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (activeTab === "Customer") {
        // Customer login via phone number
        if (phone === "9199936181" || phone === "9876543210" || phone === "9911223344") {
          localStorage.setItem("ttw_currentUserRole", "Customer");
          localStorage.setItem("ttw_currentUserName", phone === "9199936181" ? "Mohammad Samar" : phone === "9876543210" ? "Rahul Sharma" : "Vikas Yadav");
          localStorage.setItem("ttw_currentUserPhone", phone);
          router.push("/customer");
        } else {
          setErrorMsg("Phone number not registered. Use demo values (e.g. 9199936181).");
        }
      } 
      
      else if (activeTab === "Owner") {
        if (username === "samar" && password === "admin123") {
          // Trigger mock 2FA OTP Step
          setOtpStep(true);
        } else {
          setErrorMsg("Invalid administrator credentials. Hint: samar / admin123");
        }
      } 
      
      else if (activeTab === "Employee") {
        if ((username === "mechanic" && password === "mech123") || (username === "reception" && password === "rec123")) {
          localStorage.setItem("ttw_currentUserRole", "Employee");
          localStorage.setItem("ttw_currentUserName", username === "mechanic" ? "Karan Singh (Mechanic)" : "Amit Kumar (Reception)");
          localStorage.setItem("ttw_employeeType", username === "mechanic" ? "Mechanic" : "Receptionist");
          router.push("/employee");
        } else {
          setErrorMsg("Invalid employee credentials. Hint: mechanic / mech123 or reception / rec123");
        }
      } 
      
      else if (activeTab === "Dealer") {
        if (username === "dealer" && password === "dealer123") {
          localStorage.setItem("ttw_currentUserRole", "Dealer");
          localStorage.setItem("ttw_currentUserName", "Standard Wholesalers Inc.");
          router.push("/dealer");
        } else {
          setErrorMsg("Invalid dealer credentials. Hint: dealer / dealer123");
        }
      }
    }, 800);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Allow any 6 digit code or demo code
      if (otp.length === 6) {
        localStorage.setItem("ttw_currentUserRole", "Owner");
        localStorage.setItem("ttw_currentUserName", "Mohammad Samar (Owner)");
        router.push("/owner");
      } else {
        setErrorMsg("Invalid 2FA OTP code. Enter any 6-digit code.");
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
                      onClick={() => {
                        setActiveTab(role);
                        setErrorMsg("");
                        setUsername("");
                        setPassword("");
                        setPhone("");
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
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition"
                      />
                      <span className="text-[10px] text-white/40 block">No password needed. Simply login using your registered mobile.</span>
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
                          <span className="text-[9px] text-amber-500 hover:underline cursor-pointer">Forgot?</span>
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
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
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
                  <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                    <KeyRound className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-bounce" />
                    <h4 className="text-xs font-bold text-white uppercase">2-Factor Authentication Required</h4>
                    <p className="text-[10px] text-white/60 mt-1">A secure verification code was simulated for Samar. Enter any 6-digit code to log in.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-white/60">6-Digit Security Token</label>
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
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start">
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

        {/* Demo Credentials Box */}
        <div className="mt-6 p-4 rounded-xl bg-cyber-gray/30 border border-white/5 flex flex-col gap-2 relative">
          <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-white/5 pb-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>DEMO SIGN-IN CREDENTIALS (CLICKABLE)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed">
            <button
              onClick={() => {
                setActiveTab("Customer");
                setPhone("9199936181");
                setOtpStep(false);
                setErrorMsg("");
              }}
              className="text-left bg-white/5 hover:bg-white/10 p-2 rounded border border-white/5 text-white/70 hover:text-white transition"
            >
              <span className="font-bold text-amber-500 block">CUSTOMER PORTAL</span>
              Phone: 9199936181
            </button>

            <button
              onClick={() => {
                setActiveTab("Owner");
                setUsername("samar");
                setPassword("admin123");
                setOtpStep(false);
                setErrorMsg("");
              }}
              className="text-left bg-white/5 hover:bg-white/10 p-2 rounded border border-white/5 text-white/70 hover:text-white transition"
            >
              <span className="font-bold text-amber-500 block">OWNER (ADMIN) PORTAL</span>
              samar / admin123
            </button>

            <button
              onClick={() => {
                setActiveTab("Employee");
                setUsername("mechanic");
                setPassword("mech123");
                setOtpStep(false);
                setErrorMsg("");
              }}
              className="text-left bg-white/5 hover:bg-white/10 p-2 rounded border border-white/5 text-white/70 hover:text-white transition"
            >
              <span className="font-bold text-amber-500 block">STAFF (MECHANIC)</span>
              mechanic / mech123
            </button>

            <button
              onClick={() => {
                setActiveTab("Dealer");
                setUsername("dealer");
                setPassword("dealer123");
                setOtpStep(false);
                setErrorMsg("");
              }}
              className="text-left bg-white/5 hover:bg-white/10 p-2 rounded border border-white/5 text-white/70 hover:text-white transition"
            >
              <span className="font-bold text-amber-500 block">DEALER PORTAL</span>
              dealer / dealer123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
