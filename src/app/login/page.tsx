"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Sparkles,
} from "lucide-react";
import { authService } from "@/lib/auth";
import { dbStore } from "@/lib/store";

type Role = "Customer" | "Owner" | "Employee" | "Dealer";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Role>("Customer");

  // Login Form Fields: ONLY Username and Password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unactivatedPhone, setUnactivatedPhone] = useState<string | null>(null);

  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      if (session.role === "Owner") router.push("/owner");
      else if (session.role === "Customer") router.push("/customer");
      else if (session.role === "Employee") router.push("/employee");
      else if (session.role === "Dealer") router.push("/dealer");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setUnactivatedPhone(null);
    setIsSubmitting(true);

    try {
      if (activeTab === "Customer") {
        // Customer Login via Username + Password (server-side bcrypt verification & rate limiting)
        const authRes = await authService.customerLogin(username, password);
        setIsSubmitting(false);

        if (authRes.success) {
          try {
            await dbStore.syncWithServer();
          } catch (syncErr) {
            console.warn("Store sync notice:", syncErr);
          }

          authService.createSession(
            "Customer",
            authRes.name || "Customer",
            authRes.username || username,
            authRes.phone
          );
          router.push("/customer");
        } else {
          setErrorMsg(authRes.error || "Invalid username or password.");
          if (authRes.needsActivation && authRes.phone) {
            setUnactivatedPhone(authRes.phone);
          }
        }
      } else if (activeTab === "Owner") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Owner") {
          const displayName = username === "MHDSAM" ? "samar" : "noxis";
          authService.createSession("Owner", displayName, username);
          router.push("/owner");
        } else {
          setErrorMsg(authRes.error || "Invalid administrator credentials.");
        }
      } else if (activeTab === "Employee") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Employee") {
          const empName =
            authRes.name || (username === "mechanic" ? "Karan Singh" : "Amit Kumar");
          const empType =
            authRes.employeeRole ||
            (username === "mechanic" ? "Mechanic" : "Receptionist");

          authService.createSession("Employee", empName, username);
          localStorage.setItem("ttw_employeeType", empType);
          router.push("/employee");
        } else {
          setErrorMsg(authRes.error || "Invalid employee credentials.");
        }
      } else if (activeTab === "Dealer") {
        const authRes = await authService.verifyCredentials(username, password);
        setIsSubmitting(false);
        if (authRes.success && authRes.role === "Dealer") {
          authService.createSession("Dealer", authRes.name || "Dealer", username);
          router.push("/dealer");
        } else {
          setErrorMsg(authRes.error || "Invalid dealer credentials.");
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background ambient lighting */}
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
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              SECURE WORKSPACE SIGN-IN
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Taj Tyre Work Portals
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Sign in with your username and password to access your dashboard.
            </p>
          </div>

          <div className="transition-all duration-200">
            {/* Role Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-cyber-gray-dark border border-white/5 rounded-lg mb-6">
              {(["Customer", "Owner", "Employee", "Dealer"] as Role[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setActiveTab(role);
                    setErrorMsg("");
                    setUnactivatedPhone(null);
                    setUsername("");
                    setPassword("");
                  }}
                  className={`py-1.5 rounded text-[10px] font-semibold tracking-wider uppercase transition ${
                    activeTab === role
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {role === "Employee" ? "Staff" : role}
                </button>
              ))}
            </div>

            {/* Login Form: ONLY Username + Password + Login Button */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Field 1: Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60 flex items-center justify-between">
                  <span>Username</span>
                  {activeTab === "Customer" && (
                    <span className="text-[9px] text-white/40 lowercase">(or registered mobile)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder={
                      activeTab === "Customer"
                        ? "Enter username or mobile"
                        : "Enter username"
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                  <User className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-amber-500 transition p-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {activeTab === "Customer" && (
                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
                    <Link
                      href="/recovery?type=FORGOT_USERNAME"
                      className="hover:text-amber-400 transition underline underline-offset-2"
                    >
                      Forgot Username?
                    </Link>
                    <Link
                      href="/recovery?type=FORGOT_PASSWORD"
                      className="hover:text-amber-400 transition underline underline-offset-2"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{errorMsg}</span>
                    {unactivatedPhone && (
                      <Link
                        href="/activate"
                        className="block mt-1 text-[11px] font-semibold text-amber-400 hover:underline"
                      >
                        Activate your existing in-store account now &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Field 3: Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Access Dashboard</span>
                  </>
                )}
              </button>

              {/* Customer Navigation Links */}
              {activeTab === "Customer" && (
                <div className="pt-3 text-center border-t border-white/5 space-y-1.5">
                  <p className="text-[11px] text-white/50">
                    Don&apos;t have an account yet?{" "}
                    <Link
                      href="/signup"
                      className="text-amber-500 hover:text-amber-400 font-semibold tracking-wide inline-flex items-center gap-1 transition underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Sign Up Here
                    </Link>
                  </p>
                  <p className="text-[10px] text-white/40">
                    Visited our shop previously?{" "}
                    <Link href="/activate" className="text-white/70 hover:text-amber-400 underline">
                      Activate In-Store Account
                    </Link>
                  </p>
                  <p className="text-[10px] text-white/40">
                    Submitted a recovery request?{" "}
                    <Link href="/recovery?tab=status" className="text-amber-400/80 hover:text-amber-400 underline">
                      Track Request Status
                    </Link>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
