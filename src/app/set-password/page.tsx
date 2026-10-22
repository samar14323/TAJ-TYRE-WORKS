"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/lib/auth";
import { dbStore } from "@/lib/store";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!token.trim()) {
      setErrorMsg("Activation token is missing. Please sign up or request activation again.");
      return;
    }

    if (username.length < 3) {
      setErrorMsg("Username must be at least 3 characters in length.");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      setErrorMsg("Username can only contain letters, numbers, hyphens, and underscores.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters in length.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password and Confirm Password do not match.");
      return;
    }

    setIsSubmitting(true);
    const res = await authService.setupCredentials({
      token: token.trim(),
      username: username.trim(),
      password,
      confirmPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Credentials established successfully! Launching your dashboard...");

      // Sync local store
      try {
        await dbStore.syncWithServer();
      } catch (syncErr) {
        console.warn("Sync notice:", syncErr);
      }

      // Initialize session and redirect to Customer Portal
      setTimeout(() => {
        authService.createSession(
          "Customer",
          res.name || "Customer",
          res.username || username,
          res.phone
        );
        router.push("/customer");
      }, 900);
    } else {
      setErrorMsg(res.error || "Failed to set up credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Ambient background blur */}
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
              STEP 2 &bull; ACCOUNT CREDENTIALS
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Set Username & Password
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Create your permanent login credentials to access your Customer Portal anytime.
            </p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-3">
              <p>
                No activation token detected. If you just registered, please follow the link from the signup page or enter your activation token below.
              </p>
              <input
                type="text"
                placeholder="Paste activation token"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                className="w-full bg-cyber-gray border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none"
              />
            </div>
          ) : null}

          <div className="mt-4 transition-all duration-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Choose a Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. samar_taj or customer01"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                  <User className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Enter secure password"
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
              </div>

              {/* Field 3: Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-amber-500 transition p-1 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
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
                    <span>Complete Setup & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center font-mono text-xs">
          Loading credentials portal...
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
