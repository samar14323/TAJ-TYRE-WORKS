"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Car,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { authService } from "@/lib/auth";

interface Vehicle {
  brand?: string;
  model?: string;
  plateNumber: string;
}

interface Invoice {
  invoiceNumber: string;
  date: string;
  netTotal: number;
}

interface LinkedCustomer {
  id: string;
  name: string;
  phone: string;
  username: string | null;
  visits: number;
  trustLevel?: string;
  vehicles: Vehicle[];
  invoices: Invoice[];
}

interface RecoveryRequest {
  id: string;
  requestId: string;
  type: "FORGOT_USERNAME" | "FORGOT_PASSWORD" | "CHANGE_USERNAME";
  fullName: string;
  phone: string;
  vehicleNumber?: string | null;
  desiredUsername?: string | null;
  reason?: string | null;
  status: "Pending" | "Approved" | "Rejected";
  adminNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
  resetCompleted?: boolean;
  createdAt: string;
  customer?: LinkedCustomer | null;
}

export default function OwnerRecoveryRequestsPage() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & selection
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Action states
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const getOwnerUsername = (): string => {
    const session = authService.getCurrentSession();
    return session?.username || "MHDSAM";
  };

  const loadRequests = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const ownerUsername = getOwnerUsername();
      const res = await authService.getOwnerRecoveryRequests(ownerUsername);

      if (res.success && res.requests) {
        setRequests(res.requests);
        if (res.requests.length > 0 && !selectedId) {
          // Default to the first pending request, or first request
          const firstPending = res.requests.find((r: RecoveryRequest) => r.status === "Pending");
          setSelectedId(firstPending ? firstPending.id : res.requests[0].id);
        }
      } else {
        setErrorMsg(res.error || "Failed to load recovery requests.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedId);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (!selectedRequest) return;

    if (action === "REJECT" && !adminNote.trim()) {
      if (!confirm("Are you sure you want to reject this request without an explanatory note to the customer?")) {
        return;
      }
    }

    if (action === "APPROVE" && selectedRequest.type === "FORGOT_PASSWORD") {
      const ok = confirm(
        `Approve password reset for ${selectedRequest.fullName} (${selectedRequest.phone})?\n\nThis will generate a secure, 24-hour single-use reset token.`
      );
      if (!ok) return;
    }

    setIsProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const ownerUsername = getOwnerUsername();
      const res = await authService.processOwnerRecoveryAction(ownerUsername, {
        requestId: selectedRequest.requestId,
        action,
        adminNote: adminNote.trim() || undefined,
      });

      setIsProcessing(false);

      if (res.success) {
        setSuccessMsg(res.message || `Request ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
        setAdminNote("");
        await loadRequests();
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setErrorMsg(res.error || `Failed to ${action.toLowerCase()} request.`);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || "An error occurred while processing the request.");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.requestId.toLowerCase().includes(query) ||
      r.fullName.toLowerCase().includes(query) ||
      r.phone.includes(query) ||
      (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(query)) ||
      (r.customer?.username && r.customer.username.toLowerCase().includes(query));

    return matchesStatus && matchesQuery;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const copyToClipboard = (text: string, isUrl: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
            AUTHORIZED IDENTITY VERIFICATION & RECOVERY
          </span>
          <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-amber-500" />
            Customer Recovery Requests
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Verify customer identity against shop receipts before approving username reveal, password resets, or username updates.
          </p>
        </div>

        <button
          onClick={loadRequests}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs border border-white/5 transition self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-center">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2 items-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-cyber-gray-dark border border-white/5 rounded-lg overflow-x-auto">
          {[
            { id: "ALL", label: "All Requests", count: requests.length },
            { id: "Pending", label: "Pending", count: pendingCount, highlight: pendingCount > 0 },
            { id: "Approved", label: "Approved", count: requests.filter((r) => r.status === "Approved").length },
            { id: "Rejected", label: "Rejected", count: requests.filter((r) => r.status === "Rejected").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-black/20 text-black font-bold"
                    : tab.highlight
                    ? "bg-amber-500/20 text-amber-400 font-bold"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search request ID, name, phone, plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white outline-none transition"
          />
        </div>
      </div>

      {/* Main Grid: Request List (5 cols) & Detail/Verification Panel (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* REQUESTS LIST (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          {isLoading ? (
            <div className="glass-panel p-8 text-center text-white/40 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
              Loading recovery requests from database...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="glass-panel p-8 text-center text-white/40 text-xs border border-white/5 rounded-2xl">
              No recovery requests matching current filter.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const isSelected = selectedId === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedId(req.id);
                    setAdminNote("");
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5"
                      : "bg-cyber-gray-dark border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {req.requestId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : req.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{req.fullName}</span>
                    <span className="text-[10px] font-mono text-white/50">{req.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/40 mt-2 pt-2 border-t border-white/5">
                    <span className="text-white/70 font-medium">
                      {req.type === "FORGOT_USERNAME" && "Username Recovery"}
                      {req.type === "FORGOT_PASSWORD" && "Password Reset"}
                      {req.type === "CHANGE_USERNAME" && "Change Username"}
                    </span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DETAIL & VERIFICATION PANEL (7 cols) */}
        <div className="lg:col-span-7">
          {selectedRequest ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">
                    Reviewing Request
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-lg font-bold text-white">
                      {selectedRequest.requestId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedRequest.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : selectedRequest.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">
                    Type of Request
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    {selectedRequest.type === "FORGOT_USERNAME" && "Recover Forgotten Username"}
                    {selectedRequest.type === "FORGOT_PASSWORD" && "Authorize Password Reset"}
                    {selectedRequest.type === "CHANGE_USERNAME" && "Request Username Change"}
                  </span>
                </div>
              </div>

              {/* Submitted Information Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">
                  CUSTOMER SUBMITTED DETAILS
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Full Name</span>
                    <span className="text-white font-medium">{selectedRequest.fullName}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Mobile Number</span>
                    <span className="text-white font-mono">{selectedRequest.phone}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Vehicle Plate Provided</span>
                    <span className="text-white font-mono">{selectedRequest.vehicleNumber || "(Not provided)"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase font-mono">Submitted At</span>
                    <span className="text-white/80">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {selectedRequest.type === "CHANGE_USERNAME" && (
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] font-mono text-purple-400 uppercase block font-bold">
                      Requested New Username
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedRequest.desiredUsername || "(None)"}
                    </span>
                  </div>
                )}

                {selectedRequest.reason && (
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase block">
                      Customer Verification Note / Explanation
                    </span>
                    <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                      &ldquo;{selectedRequest.reason}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Shop Database Verification Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">
                    TAJ WORKSHOP DATABASE RECORDS
                  </span>
                  {selectedRequest.customer ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Account Linked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" /> No Customer Record for this Mobile
                    </span>
                  )}
                </div>

                {selectedRequest.customer ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Database Name</span>
                        <span className="text-white font-medium">{selectedRequest.customer.name}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Current Username</span>
                        <span className="text-amber-400 font-mono font-bold">
                          {selectedRequest.customer.username || "(No username set)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[9px] uppercase font-mono">Shop Visits</span>
                        <span className="text-white font-medium">{selectedRequest.customer.visits} visit(s)</span>
                      </div>
                    </div>

                    {/* Registered Vehicles in Shop */}
                    <div>
                      <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                        Registered Vehicles on Record
                      </span>
                      {selectedRequest.customer.vehicles && selectedRequest.customer.vehicles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedRequest.customer.vehicles.map((v, idx) => {
                            const isMatch =
                              selectedRequest.vehicleNumber &&
                              v.plateNumber.toUpperCase().replace(/\s/g, "") ===
                                selectedRequest.vehicleNumber.toUpperCase().replace(/\s/g, "");
                            return (
                              <span
                                key={idx}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                  isMatch
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                                    : "bg-white/5 border-white/10 text-white/70"
                                }`}
                              >
                                {v.plateNumber} {v.brand && `(${v.brand})`}
                                {isMatch && " ✓ Matches Request"}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] text-white/40 italic">No vehicles registered yet.</span>
                      )}
                    </div>

                    {/* Recent Invoices in Shop */}
                    {selectedRequest.customer.invoices && selectedRequest.customer.invoices.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                          Recent Invoices
                        </span>
                        <div className="space-y-1">
                          {selectedRequest.customer.invoices.map((inv, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-[11px] bg-black/20 px-2 py-1 rounded"
                            >
                              <span className="font-mono text-white/80">{inv.invoiceNumber}</span>
                              <span className="text-white/50">{new Date(inv.date).toLocaleDateString()}</span>
                              <span className="text-amber-400 font-semibold font-mono">
                                ₹{inv.netTotal.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    This phone number does not exist in the Taj Tyre Works customer database. The customer may have entered a wrong phone number or has never shopped at the store.
                  </p>
                )}
              </div>

              {/* REVIEW / AUDIT OUTCOME (for already processed requests) */}
              {selectedRequest.status !== "Pending" && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    selectedRequest.status === "Approved"
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-rose-500/10 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      Request {selectedRequest.status}
                    </span>
                    <span className="text-[10px] text-white/50">
                      Reviewed by {selectedRequest.reviewedBy || "Owner"} on{" "}
                      {selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleString() : "N/A"}
                    </span>
                  </div>

                  {selectedRequest.adminNote && (
                    <div className="text-xs text-white/70 italic bg-black/20 p-2 rounded">
                      Owner Note: &ldquo;{selectedRequest.adminNote}&rdquo;
                    </div>
                  )}

                  {/* Approved Password Reset Token display for owner to assist customer */}
                  {selectedRequest.status === "Approved" && selectedRequest.type === "FORGOT_PASSWORD" && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                        Customer Single-Use Reset Link
                      </span>
                      <p className="text-[11px] text-white/60">
                        {selectedRequest.resetCompleted ? (
                          <span className="text-white/50 font-semibold">
                            ✓ This token has already been used by the customer to update their password.
                          </span>
                        ) : (
                          "You can provide this secure reset link to the verified customer. It will expire 24 hours after issuance."
                        )}
                      </p>

                      {!selectedRequest.resetCompleted && selectedRequest.resetToken && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/10 text-xs">
                            <span className="font-mono text-white/80 truncate flex-1">
                              {typeof window !== "undefined"
                                ? `${window.location.origin}/reset-password?token=${selectedRequest.resetToken}`
                                : `/reset-password?token=${selectedRequest.resetToken}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const url =
                                  typeof window !== "undefined"
                                    ? `${window.location.origin}/reset-password?token=${selectedRequest.resetToken}`
                                    : `/reset-password?token=${selectedRequest.resetToken}`;
                                copyToClipboard(url, true);
                              }}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] inline-flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {copiedUrl ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approved Username Recovery */}
                  {selectedRequest.status === "Approved" && selectedRequest.type === "FORGOT_USERNAME" && (
                    <div className="pt-1 text-xs text-white/80">
                      Verified customer username:{" "}
                      <strong className="text-white font-mono">
                        {selectedRequest.customer?.username || "(Customer Username)"}
                      </strong>
                    </div>
                  )}

                  {/* Approved Username Change */}
                  {selectedRequest.status === "Approved" && selectedRequest.type === "CHANGE_USERNAME" && (
                    <div className="pt-1 text-xs text-white/80">
                      Customer username updated to:{" "}
                      <strong className="text-white font-mono">
                        {selectedRequest.desiredUsername}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* ACTION SECTION (for Pending requests only) */}
              {selectedRequest.status === "Pending" && (
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-white/60 flex items-center justify-between">
                      <span>Owner Verification Note (Optional for Approval, Recommended for Rejection)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified customer by checking tyre invoice #TTW-1048."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full bg-cyber-gray border border-white/5 focus:border-amber-500 rounded-lg p-2.5 text-xs text-white outline-none transition"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 flex gap-2 items-start">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>Identity Verification Rule:</strong> Confirm matching customer name, vehicle plate, or past invoices before approval. For password resets, a cryptographic 24-hr token is issued.
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction("APPROVE")}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Request</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction("REJECT")}
                      className="flex-1 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Reject Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center text-white/40 text-xs border border-white/5 rounded-2xl">
              Select a recovery request from the list to review details and perform verification.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
