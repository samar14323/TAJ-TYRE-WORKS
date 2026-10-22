"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  User,
  Phone,
  Car,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { authService, RecoveryRequestType } from "@/lib/auth";

function RecoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab: "submit" | "status"
  const initialTab = searchParams.get("tab") === "status" ? "status" : "submit";
  const [activeTab, setActiveTab] = useState<"submit" | "status">(initialTab);

  // Form Fields for Submission
  const initialType = (searchParams.get("type") as RecoveryRequestType) || "FORGOT_PASSWORD";
  const [requestType, setRequestType] = useState<RecoveryRequestType>(
    ["FORGOT_USERNAME", "FORGOT_PASSWORD", "CHANGE_USERNAME"].includes(initialType)
      ? initialType
      : "FORGOT_PASSWORD"
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [requestedUsername, setRequestedUsername] = useState("");
  const [reason, setReason] = useState("");

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    requestId: string;
    requestType: RecoveryRequestType;
    message: string;
  } | null>(null);
  const [copiedRequestId, setCopiedRequestId] = useState(false);

  // Status Lookup Form
  const [lookupRequestId, setLookupRequestId] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);

  useEffect(() => {
    const typeParam = searchParams.get("type") as RecoveryRequestType;
    if (typeParam && ["FORGOT_USERNAME", "FORGOT_PASSWORD", "CHANGE_USERNAME"].includes(typeParam)) {
      setRequestType(typeParam);
    }
    if (searchParams.get("tab") === "status") {
      setActiveTab("status");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    if (!/^\d{10}$/.test(phone)) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      setIsSubmitting(false);
      return;
    }

    if (requestType === "CHANGE_USERNAME" && (!requestedUsername.trim() || requestedUsername.trim().length < 3)) {
      setSubmitError("Please enter a desired username of at least 3 characters.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await authService.submitRecoveryRequest({
        requestType,
        fullName: fullName.trim(),
        phone: phone.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase() || undefined,
        requestedUsername: requestType === "CHANGE_USERNAME" ? requestedUsername.trim() : undefined,
        reason: reason.trim() || undefined,
      });

      setIsSubmitting(false);

      if (res.success && res.requestId) {
        setSubmittedData({
          requestId: res.requestId,
          requestType,
          message: res.message || "Your request has been submitted for owner approval.",
        });
        // Pre-fill lookup fields for easy status check later
        setLookupRequestId(res.requestId);
        setLookupPhone(phone.trim());
      } else {
        setSubmitError(res.error || "Unable to submit recovery request.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Network error. Please try again.");
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");
    setLookupResult(null);
    setIsLookingUp(true);

    try {
      const res = await authService.checkRecoveryStatus(lookupRequestId.trim().toUpperCase(), lookupPhone.trim());
      setIsLookingUp(false);

      if (res.success && res.request) {
        setLookupResult(res.request);
      } else {
        setLookupError(res.error || "No matching recovery request found.");
      }
    } catch (err: any) {
      setIsLookingUp(false);
      setLookupError(err.message || "Network error. Please try again.");
    }
  };

  const copyRequestIdToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedRequestId(true);
    setTimeout(() => setCopiedRequestId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col justify-center items-center p-6 relative font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
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
              AUTHORIZED ACCOUNT RECOVERY
            </span>
            <h2 className="text-2xl font-bold text-white tracking-wide">
              Taj Account Assistance
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Secure, owner-reviewed account recovery without insecure SMS OTPs.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-cyber-gray-dark border border-white/5 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("submit")}
              className={`py-2 rounded text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "submit"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Submit Request
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`py-2 rounded text-xs font-semibold tracking-wider uppercase transition ${
                activeTab === "status"
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Check Status
            </button>
          </div>

          {/* TAB 1: SUBMIT RECOVERY REQUEST */}
          {activeTab === "submit" && (
            <div>
              {submittedData ? (
                /* Success Confirmation View */
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white">Recovery Request Submitted</h3>
                    <p className="text-xs text-white/70 mt-1">
                      {submittedData.message}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-white/40">
                      Your Request Tracking ID
                    </div>
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-2.5">
                      <span className="font-mono text-amber-400 font-bold tracking-wider text-base">
                        {submittedData.requestId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyRequestIdToClipboard(submittedData.requestId)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                      >
                        {copiedRequestId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed pt-1">
                      Save this Request ID. The workshop owner will verify your details against shop records. Once approved, you can view your credentials or reset your password on the <strong>Check Status</strong> tab.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("status");
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider transition text-center"
                    >
                      Check Status Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedData(null);
                        setFullName("");
                        setPhone("");
                        setVehicleNumber("");
                        setRequestedUsername("");
                        setReason("");
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition text-center"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                /* Request Submission Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Request Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60">
                      Select Request Type
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "FORGOT_PASSWORD", label: "Reset Password" },
                        { id: "FORGOT_USERNAME", label: "Forgot Username" },
                        { id: "CHANGE_USERNAME", label: "Change Username" },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setRequestType(type.id as RecoveryRequestType)}
                          className={`p-2 rounded-lg text-left border transition text-xs ${
                            requestType === type.id
                              ? "bg-amber-500/10 border-amber-500 text-amber-400 font-semibold"
                              : "bg-white/5 border-white/5 text-white/60 hover:border-white/20"
                          }`}
                        >
                          <span className="block font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Registered customer full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition"
                      />
                      <User className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60">
                      Registered Mobile Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition font-mono"
                      />
                      <Phone className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Vehicle Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60 flex items-center justify-between">
                      <span>Vehicle Plate Number</span>
                      <span className="text-[9px] text-white/40 lowercase">(helps owner verify you)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. DL 01 AB 1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition font-mono uppercase"
                      />
                      <Car className="w-4 h-4 text-white/30 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Requested New Username (only if CHANGE_USERNAME) */}
                  {requestType === "CHANGE_USERNAME" && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="text-[10px] font-mono uppercase text-white/60">
                        Desired New Username *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. rahul_tyres"
                          value={requestedUsername}
                          onChange={(e) => setRequestedUsername(e.target.value)}
                          className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none transition font-mono"
                        />
                        <Sparkles className="w-4 h-4 text-amber-500/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Reason / Verification Details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60 flex items-center justify-between">
                      <span>Verification Notes (Optional)</span>
                      <span className="text-[9px] text-white/40 lowercase">e.g. bill no, tyre model</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add details to help the workshop owner quickly confirm your identity..."
                      value={reason ?? ""}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg p-2.5 text-xs text-white outline-none transition resize-none"
                    />
                  </div>

                  {/* Error Alert */}
                  {submitError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white/60 flex gap-2 items-start">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      For security, credentials are never sent over public channels. Once the owner approves your request, you can securely access your username or reset your password directly on this portal.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Submit Request for Approval</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CHECK REQUEST STATUS */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <form onSubmit={handleLookup} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/60">
                    Request Tracking ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="REC-2026-XXXXX"
                    value={lookupRequestId}
                    onChange={(e) => setLookupRequestId(e.target.value.toUpperCase())}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition font-mono uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-white/60">
                    Registered Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2.5 px-3 text-sm text-white outline-none transition font-mono"
                  />
                </div>

                {lookupError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-start leading-relaxed">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLookingUp ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Check Request Status</span>
                    </>
                  )}
                </button>
              </form>

              {/* Status Result Card */}
              {lookupResult && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Tracking ID</span>
                      <span className="font-mono text-sm font-bold text-white">{lookupResult.requestId}</span>
                    </div>
                    {/* Status Badge */}
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          lookupResult.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : lookupResult.status === "Rejected"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {lookupResult.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {lookupResult.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {lookupResult.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
                        {lookupResult.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 text-white/70">
                    <div>
                      <span className="text-white/40">Request Type: </span>
                      <span className="font-semibold text-white">
                        {lookupResult.requestType === "FORGOT_USERNAME" && "Forgot Username"}
                        {lookupResult.requestType === "FORGOT_PASSWORD" && "Password Reset"}
                        {lookupResult.requestType === "CHANGE_USERNAME" && "Username Change"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40">Submitted: </span>
                      <span>{new Date(lookupResult.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* PENDING VIEW */}
                  {lookupResult.status === "Pending" && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90 leading-relaxed">
                      Your request is currently awaiting review by the workshop owner. You will be able to access your credentials here as soon as it is approved.
                    </div>
                  )}

                  {/* REJECTED VIEW */}
                  {lookupResult.status === "Rejected" && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300/90 leading-relaxed space-y-1">
                      <div className="font-semibold text-rose-400">Request Not Approved</div>
                      <p>
                        {lookupResult.adminNote
                          ? `Reason from workshop owner: "${lookupResult.adminNote}"`
                          : "Your recovery request could not be verified against workshop records. Please visit Taj Tyre Works in person with your vehicle registration or invoice."}
                      </p>
                    </div>
                  )}

                  {/* APPROVED VIEW */}
                  {lookupResult.status === "Approved" && (
                    <div className="space-y-3 pt-1">
                      {/* FORGOT_USERNAME APPROVED */}
                      {lookupResult.requestType === "FORGOT_USERNAME" && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                            Verified Username
                          </span>
                          <div className="text-base font-mono font-bold text-white bg-black/40 p-2.5 rounded border border-white/10">
                            {lookupResult.verifiedUsername || "(Verified Customer)"}
                          </div>
                          <p className="text-[11px] text-white/60">
                            You can now sign in using this username and your existing password.
                          </p>
                          <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1 underline"
                          >
                            <span>Proceed to Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* CHANGE_USERNAME APPROVED */}
                      {lookupResult.requestType === "CHANGE_USERNAME" && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                          <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                            Username Updated
                          </span>
                          <div className="text-base font-mono font-bold text-white bg-black/40 p-2.5 rounded border border-white/10">
                            {lookupResult.requestedUsername}
                          </div>
                          <p className="text-[11px] text-white/60">
                            The owner approved your username change. Your account has been updated without altering your history.
                          </p>
                          <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 pt-1 underline"
                          >
                            <span>Proceed to Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* FORGOT_PASSWORD APPROVED */}
                      {lookupResult.requestType === "FORGOT_PASSWORD" && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                          {lookupResult.resetCompleted ? (
                            <div className="text-xs text-white/70">
                              <span className="font-semibold text-emerald-400 block mb-1">
                                Password Reset Completed
                              </span>
                              This secure reset token has already been used. You can sign in with your new password.
                              <div className="pt-2">
                                <Link
                                  href="/login"
                                  className="text-amber-400 hover:underline font-semibold"
                                >
                                  Go to Login &rarr;
                                </Link>
                              </div>
                            </div>
                          ) : lookupResult.resetToken ? (
                            <div>
                              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold mb-1">
                                Reset Authorised
                              </span>
                              <p className="text-xs text-white/80 mb-3">
                                The workshop owner has verified your request and authorized a password reset. Click below to choose your new password.
                              </p>
                              <Link
                                href={`/reset-password?token=${encodeURIComponent(lookupResult.resetToken)}`}
                                className="block w-full text-center py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase tracking-wider transition"
                              >
                                Set New Password Now
                              </Link>
                            </div>
                          ) : (
                            <div className="text-xs text-white/70">
                              <span className="font-semibold text-emerald-400 block mb-1">
                                Approved by Owner
                              </span>
                              Please obtain your single-use reset authorization link directly from the workshop owner or manager.
                            </div>
                          )}
                        </div>
                      )}

                      {lookupResult.adminNote && (
                        <div className="text-[11px] text-white/50 italic bg-black/20 p-2 rounded">
                          Owner note: &ldquo;{lookupResult.adminNote}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountRecoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white/60">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      }
    >
      <RecoveryContent />
    </Suspense>
  );
}
