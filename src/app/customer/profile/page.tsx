"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Phone, 
  Car, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send, 
  ArrowRight, 
  FileText, 
  RefreshCw,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { authService } from "@/lib/auth";

interface CorrectionRequest {
  id: string;
  requestId: string;
  field: "MOBILE_NUMBER" | "VEHICLE_NUMBER";
  currentValue: string;
  requestedValue: string;
  reason?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  adminNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

interface CurrentProfile {
  id: string;
  name: string;
  phone: string;
  username?: string | null;
  vehicles: { id: string; model: string; plateNumber: string }[];
}

export default function CustomerProfileCorrectionPage() {
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [field, setField] = useState<"MOBILE_NUMBER" | "VEHICLE_NUMBER">("MOBILE_NUMBER");
  const [requestedValue, setRequestedValue] = useState("");
  const [reason, setReason] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await authService.getCustomerCorrectionRequests();
      if (res.success) {
        if (res.currentProfile) setProfile(res.currentProfile);
        if (res.requests) setRequests(res.requests);
      } else {
        setErrorMsg(res.error || "Failed to load profile details.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCurrentSavedValue = (): string => {
    if (!profile) return "Loading...";
    if (field === "MOBILE_NUMBER") {
      return profile.phone || "Not recorded";
    }
    return profile.vehicles[0]?.plateNumber || "Not recorded";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!requestedValue.trim()) {
      setErrorMsg("Please enter the requested new value.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.submitProfileCorrection({
        field,
        requestedValue: requestedValue.trim(),
        reason: reason.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(
          `Request ${res.requestId || ""} submitted successfully! The workshop owner will verify and approve your correction.`
        );
        setRequestedValue("");
        setReason("");
        await loadData();
      } else {
        setErrorMsg(res.error || "Failed to submit correction request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          ACCOUNT GOVERNANCE & PROFILE VERIFICATION
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <User className="w-6 h-6 text-amber-500" />
          Request Profile Correction
        </h2>
        <p className="text-xs text-white/55 mt-1 max-w-2xl leading-relaxed">
          Need to correct a mistake in your registered mobile number or vehicle plate number? Submit a secure correction request. Your changes will be verified by the workshop manager before taking effect.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Current Verified Account Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Customer Name</span>
            <span className="text-xs font-bold text-white block">{profile?.name || "Client"}</span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Username</span>
            <span className="text-xs font-mono font-bold text-amber-500 block">
              @{profile?.username || "Not configured"}
            </span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Registered Mobile</span>
            <span className="text-xs font-mono font-bold text-white block">{profile?.phone || "Loading..."}</span>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase block mb-1">Primary Plate</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
              {profile?.vehicles[0]?.plateNumber || "None recorded"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Submit Form (LHS: 6 cols) & Submission History (RHS: 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-5">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Submit New Correction Request
              </h3>
              <p className="text-[10px] text-white/45 mt-0.5">
                Select the field you wish to update and supply the corrected details.
              </p>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2.5 items-center leading-relaxed animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2.5 items-center leading-relaxed animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field to correct */}
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  1. Field to Correct
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setField("MOBILE_NUMBER");
                      setRequestedValue("");
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      field === "MOBILE_NUMBER"
                        ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Mobile Number
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setField("VEHICLE_NUMBER");
                      setRequestedValue("");
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      field === "VEHICLE_NUMBER"
                        ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    Vehicle Number
                  </button>
                </div>
              </div>

              {/* Current Saved Value */}
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  2. Current Saved Value
                </label>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/70 text-xs font-mono flex items-center justify-between">
                  <span>{getCurrentSavedValue()}</span>
                  <span className="text-[9px] font-mono uppercase bg-white/5 text-white/40 px-2 py-0.5 rounded">
                    Existing Record
                  </span>
                </div>
              </div>

              {/* Requested New Value */}
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  3. Requested New {field === "MOBILE_NUMBER" ? "Mobile Number" : "Vehicle Plate Number"}
                </label>
                <input
                  type={field === "MOBILE_NUMBER" ? "tel" : "text"}
                  required
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  placeholder={
                    field === "MOBILE_NUMBER"
                      ? "Enter 10-digit mobile (e.g. 9876543210)"
                      : "Enter vehicle plate (e.g. DL3C-AM-1234)"
                  }
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white font-mono outline-none transition"
                />
                <span className="text-[9px] font-mono text-white/40 block mt-1">
                  {field === "MOBILE_NUMBER"
                    ? "Must be a 10-digit Indian mobile number."
                    : "Must include state prefix (e.g. DL, HR, UP, OD)."}
                </span>
              </div>

              {/* Reason */}
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">
                  4. Reason for Correction <span className="text-white/30 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Typo in last digit during signup, or purchased a new car."
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none transition resize-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Request for Approval
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Requests History List (RHS: 6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                My Correction Requests
              </h3>
              <button
                onClick={loadData}
                className="text-xs text-amber-500 hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-white/40 text-xs font-mono">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                Loading your requests...
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl space-y-2">
                <HelpCircle className="w-6 h-6 mx-auto text-white/20" />
                <p>You have not submitted any profile correction requests yet.</p>
                <p className="text-[10px] text-white/30">
                  Any submitted requests will appear here with live review status.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 relative overflow-hidden"
                  >
                    {/* Top Row: Request ID & Status Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {req.requestId}
                        </span>
                        <span className="text-[10px] font-mono text-white/40">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          req.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : req.status === "Rejected"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {req.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === "Rejected" && <XCircle className="w-3 h-3" />}
                        {req.status === "Pending" && <Clock className="w-3 h-3 animate-pulse" />}
                        {req.status}
                      </span>
                    </div>

                    {/* Change Comparison */}
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50 text-[10px] uppercase font-mono">
                          {req.field === "MOBILE_NUMBER" ? "Mobile Number" : "Vehicle Number"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-white/50 line-through truncate max-w-[140px]">
                          {req.currentValue}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-amber-400 truncate max-w-[140px]">
                          {req.requestedValue}
                        </span>
                      </div>
                    </div>

                    {/* Customer's Reason */}
                    {req.reason && (
                      <p className="text-[11px] text-white/60 leading-relaxed italic">
                        "{req.reason}"
                      </p>
                    )}

                    {/* Owner Response Note (if Approved or Rejected) */}
                    {req.adminNote && (
                      <div
                        className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                          req.status === "Rejected"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[10px] uppercase font-mono">
                            Workshop Manager Decision Note:
                          </span>
                          <span>{req.adminNote}</span>
                        </div>
                      </div>
                    )}

                    {req.status === "Pending" && (
                      <p className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Your original profile remains unchanged while pending approval.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
