"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { authService } from "@/lib/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token.trim()) {
      setErrorMsg("A valid security reset token is required. Please check your reset link or request a new one.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Password and Confirm Password do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.completePasswordReset(token.trim(), newPassword);
      setIsSubmitting(false);

      if (res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res.error || "Unable to reset password. The link may have expired or already been used.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-amber-500 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative border-white/5">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
              AUTHORIZED PASSWORD RESET
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Create New Password
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Set a strong password for your Taj Tyre Works customer account.
            </p>
          </div>

          {success ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Password Updated Successfully</h3>
                <p className="text-xs text-white/70 mt-1">
                  Your new password is now active. Your previous credentials and reset tokens have been invalidated.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                Sign In With New Password &rarr;
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {!token && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    No reset token found in URL. Please use the complete link provided in your recovery status or request one from the owner.
                  </span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-white/60">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Security helper */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white/60 flex gap-2 items-start">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  This single-use reset token expires after 24 hours. Your password will be securely hashed with bcrypt.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Set New Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white/60">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
