"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
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
  RefreshCw,
  ArrowRight,
  MessageSquare,
  Check,
  X,
  CreditCard,
  Calendar,
  Wrench,
  Shield,
  ExternalLink,
  History,
  Eye,
  Info,
  ChevronRight,
  Tag,
  Receipt,
  FileClock
} from "lucide-react";
import { authService } from "@/lib/auth";

interface CustomerVehicle {
  id: string;
  brand?: string;
  model: string;
  year?: number;
  fuelType?: string;
  plateNumber: string;
  tyreInstalled?: string | null;
  installDate?: string | null;
  mileage?: number;
  warrantyExpiry?: string | null;
  nextReplacement?: string | null;
}

interface CustomerInvoiceItem {
  id: string;
  name: string;
  brand: string;
  quantity: number;
  price: number;
  hsnCode?: string;
  gstRate?: number;
  total: number;
}

interface CustomerPayment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
}

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  subTotal: number;
  gstAmount: number;
  discountApplied: number;
  netTotal: number;
  gstin?: string | null;
  items?: CustomerInvoiceItem[];
  payments?: CustomerPayment[];
}

interface CustomerJobCard {
  id: string;
  jobId: string;
  vehicleModel: string;
  vehicleNumber: string;
  services: string[];
  mechanic: string;
  bay: string;
  status: string;
  estimatedFinish?: string;
  createdAt: string;
}

interface CustomerAppointment {
  id: string;
  vehicleNumber: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  status: string;
  mechanicName?: string | null;
  timeTaken?: number | null;
}

interface CorrectionRequestHistory {
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

interface FullCustomerDossier {
  id: string;
  name: string;
  phone: string;
  username?: string | null;
  createdAt: string;
  visits: number;
  purchasesCount: number;
  totalSpent: number;
  trustLevel?: string;
  savings?: number;
  notes?: string | null;
  rewardPoints?: number;
  outstandingAmount?: number;
  favoriteBrand?: string | null;
  averageBill?: number;
  address?: string | null;
  city?: string | null;
  vehicles: CustomerVehicle[];
  invoices: CustomerInvoice[];
  jobCards: CustomerJobCard[];
  appointments: CustomerAppointment[];
  correctionRequests: CorrectionRequestHistory[];
}

interface LinkedCustomerSummary {
  id: string;
  name: string;
  phone: string;
  username?: string | null;
  visits: number;
  trustLevel?: string;
  totalSpent?: number;
  vehicles: CustomerVehicle[];
  invoices: {
    id: string;
    invoiceNumber: string;
    date: string;
    netTotal: number;
  }[];
}

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
  customer?: LinkedCustomerSummary | null;
}

export default function OwnerCorrectionRequestsPage() {
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & selection
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);

  // Full Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [fullCustomerDossier, setFullCustomerDossier] = useState<FullCustomerDossier | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<"overview" | "vehicles" | "billing" | "services" | "history">("overview");

  // Confirmation Dialog state
  const [adminNote, setAdminNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "APPROVE" | "REJECT" | null;
    request: CorrectionRequest | null;
  }>({
    open: false,
    action: null,
    request: null,
  });

  const getOwnerUsername = (): string => {
    const session = authService.getCurrentSession();
    return session?.username || "MHDSAM";
  };

  const loadRequests = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const ownerUsername = getOwnerUsername();
      const res = await authService.getOwnerCorrectionRequests(ownerUsername);

      if (res.success && res.requests) {
        setRequests(res.requests);
        if (res.counts) setCounts(res.counts);

        if (res.requests.length > 0) {
          if (selectedRequest) {
            const updated = res.requests.find((r: CorrectionRequest) => r.id === selectedRequest.id);
            setSelectedRequest(updated || res.requests[0]);
          } else {
            setSelectedRequest(res.requests[0]);
          }
        }
      } else {
        setErrorMsg(res.error || "Failed to load correction requests.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Fetch full customer profile and relational history from server
  const openFullCustomerProfile = async (req: CorrectionRequest) => {
    setSelectedRequest(req);
    setIsProfileModalOpen(true);
    setIsLoadingProfile(true);
    setProfileModalTab("overview");
    setFullCustomerDossier(null);

    try {
      const ownerUsername = getOwnerUsername();
      const res = await authService.getCustomerFullDossier(ownerUsername, {
        requestId: req.requestId,
      });

      if (res.success && res.customer) {
        setFullCustomerDossier(res.customer);
      } else {
        setErrorMsg(res.error || "Could not retrieve full customer dossier.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load customer profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Open confirmation dialog before applying action
  const promptConfirmAction = (action: "APPROVE" | "REJECT", req?: CorrectionRequest) => {
    const target = req || selectedRequest;
    if (!target) return;
    setConfirmDialog({
      open: true,
      action,
      request: target,
    });
  };

  // Execute confirmed action (Approve / Reject)
  const executeConfirmedAction = async () => {
    if (!confirmDialog.request || !confirmDialog.action) return;

    setIsProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const ownerUsername = getOwnerUsername();
      const res = await authService.processOwnerCorrectionAction(ownerUsername, {
        requestId: confirmDialog.request.requestId,
        action: confirmDialog.action,
        adminNote: adminNote.trim() || undefined,
      });

      if (res.success) {
        const actionLabel = confirmDialog.action === "APPROVE" ? "approved and applied" : "rejected";
        setSuccessMsg(`Correction request ${confirmDialog.request.requestId} was successfully ${actionLabel}.`);
        setAdminNote("");
        setConfirmDialog({ open: false, action: null, request: null });

        // If full profile modal is open, refresh dossier
        if (isProfileModalOpen && confirmDialog.request) {
          await openFullCustomerProfile(confirmDialog.request);
        }

        await loadRequests();
      } else {
        setErrorMsg(res.error || `Failed to process request.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute decision.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = r.customer?.name?.toLowerCase() || "";
      const phone = r.customer?.phone || "";
      const currentVal = r.currentValue.toLowerCase();
      const reqVal = r.requestedValue.toLowerCase();
      const reqId = r.requestId.toLowerCase();
      return name.includes(q) || phone.includes(q) || currentVal.includes(q) || reqVal.includes(q) || reqId.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block mb-1">
          WORKSHOP ADMINISTRATION & IDENTITY GOVERNANCE
        </span>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-amber-500" />
          Customer Correction Requests
        </h2>
        <p className="text-xs text-white/55 mt-1 max-w-2xl leading-relaxed">
          Review, verify, and approve customer profile corrections. Inspect full customer dossiers, vehicle registries, past invoices, and service histories prior to making an authorized decision.
        </p>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter("Pending")}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            statusFilter === "Pending" ? "bg-amber-500/10 border-amber-500/40" : "glass-panel border-white/5 hover:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-500 flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              Pending Review
            </span>
            <span className="text-xl font-bold font-mono text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
              {counts.pending}
            </span>
          </div>
          <span className="text-xs text-white/40 block mt-2">Requires workshop decision</span>
        </div>

        <div 
          onClick={() => setStatusFilter("Approved")}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            statusFilter === "Approved" ? "bg-emerald-500/10 border-emerald-500/40" : "glass-panel border-white/5 hover:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              {counts.approved}
            </span>
          </div>
          <span className="text-xs text-white/40 block mt-2">Applied to database</span>
        </div>

        <div 
          onClick={() => setStatusFilter("Rejected")}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            statusFilter === "Rejected" ? "bg-rose-500/10 border-rose-500/40" : "glass-panel border-white/5 hover:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-rose-400 flex items-center gap-1.5 font-bold">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </span>
            <span className="text-xl font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
              {counts.rejected}
            </span>
          </div>
          <span className="text-xs text-white/40 block mt-2">Declined by workshop</span>
        </div>

        <div 
          onClick={() => setStatusFilter("ALL")}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            statusFilter === "ALL" ? "bg-white/10 border-white/30" : "glass-panel border-white/5 hover:border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-white/60 flex items-center gap-1.5 font-bold">
              <FileText className="w-3.5 h-3.5" />
              All Submissions
            </span>
            <span className="text-xl font-bold font-mono text-white bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
              {counts.total}
            </span>
          </div>
          <span className="text-xs text-white/40 block mt-2">Audit history record</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2.5 items-center leading-relaxed animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-2.5 items-center leading-relaxed animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Requests List (5 cols) & Review Detail Panel (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Requests List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-panel p-5 rounded-2xl border-white/5 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search customer, phone, plate, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none transition"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-mono">
                {(["Pending", "Approved", "Rejected", "ALL"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex-1 py-1.5 rounded-lg font-bold uppercase transition ${
                      statusFilter === tab
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="py-16 text-center text-white/40 text-xs font-mono">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-500" />
                Loading correction requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-16 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl">
                No requests found matching current filter.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {filteredRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-left space-y-2 relative group ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5"
                          : "bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          {req.customer?.name || "Customer"}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                            req.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : req.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                        <span className="flex items-center gap-1">
                          {req.field === "MOBILE_NUMBER" ? (
                            <>
                              <Phone className="w-3 h-3 text-amber-500" /> Mobile Correction
                            </>
                          ) : (
                            <>
                              <Car className="w-3 h-3 text-amber-500" /> Plate Correction
                            </>
                          )}
                        </span>
                        <span>{req.requestId}</span>
                      </div>

                      {/* Side-by-side Mini Diff */}
                      <div className="flex items-center gap-1.5 font-mono text-xs bg-black/30 p-2 rounded-lg">
                        <span className="text-white/40 truncate max-w-[90px]">{req.currentValue}</span>
                        <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="font-bold text-amber-400 truncate max-w-[110px]">
                          {req.requestedValue}
                        </span>
                      </div>

                      {/* Quick action to open Full Profile */}
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openFullCustomerProfile(req);
                          }}
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 transition py-0.5 px-1.5 rounded hover:bg-white/5"
                        >
                          <Eye className="w-3 h-3" /> View Full Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Review & Decision Console */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {selectedRequest ? (
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Request Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block mb-0.5">
                    REQUEST VERIFICATION DOSSIER
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedRequest.requestId}
                  </h3>
                  <span className="text-[10px] text-white/40 font-mono">
                    Submitted: {new Date(selectedRequest.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openFullCustomerProfile(selectedRequest)}
                    className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    View Full Customer Profile
                  </button>

                  <span
                    className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      selectedRequest.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : selectedRequest.status === "Rejected"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {selectedRequest.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {selectedRequest.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                    {selectedRequest.status === "Pending" && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                    {selectedRequest.status}
                  </span>
                </div>
              </div>

              {/* Proposed Change Side-by-Side Card */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-amber-500 uppercase block font-bold flex items-center justify-between">
                  <span>Field Being Corrected: {selectedRequest.field === "MOBILE_NUMBER" ? "Mobile Number" : "Vehicle Plate Number"}</span>
                  <span className="text-white/40 text-[9px] font-normal">Side-by-side value audit</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Saved Value */}
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
                    <span className="text-[9px] font-mono text-white/40 uppercase block">
                      Current Saved Value
                    </span>
                    <span className="text-base font-mono text-white/70 block truncate">
                      {selectedRequest.currentValue}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 block">
                      Currently registered in database
                    </span>
                  </div>

                  {/* Requested New Value */}
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 space-y-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase block font-bold">
                      Requested New Value
                    </span>
                    <span className="text-base font-mono font-bold text-amber-400 block truncate">
                      {selectedRequest.requestedValue}
                    </span>
                    <span className="text-[9px] font-mono text-amber-500/70 block">
                      Will replace existing value upon owner approval
                    </span>
                  </div>
                </div>

                {selectedRequest.reason ? (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block mb-0.5">
                      Customer Stated Reason:
                    </span>
                    <p className="text-xs text-white/80 italic leading-relaxed">
                      "{selectedRequest.reason}"
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/30">
                    Reason: Not available (customer submitted without explanation note)
                  </div>
                )}
              </div>

              {/* Security Advisory for Mobile Number Verification */}
              {selectedRequest.field === "MOBILE_NUMBER" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px] uppercase">
                    <ShieldAlert className="w-4 h-4" />
                    Identity Verification Protocol
                  </div>
                  <p className="text-[11px] text-white/75 leading-relaxed">
                    A matching vehicle plate or prior phone number alone is <strong>NOT sufficient proof of ownership</strong>. Ensure the customer has provided valid account credentials, past invoice documentation, or that identity has been confirmed directly via workshop verification.
                  </p>
                </div>
              )}

              {/* Customer Account Background Dossier Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    Customer Account Summary
                  </h4>
                  <button
                    type="button"
                    onClick={() => openFullCustomerProfile(selectedRequest)}
                    className="text-[10px] font-mono text-amber-500 hover:text-amber-400 flex items-center gap-1 transition"
                  >
                    View Complete Profile & History <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Name</span>
                      <span className="font-bold text-white truncate block">
                        {selectedRequest.customer?.name || "Not available"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Username</span>
                      <span className="font-mono text-amber-400 truncate block">
                        {selectedRequest.customer?.username ? `@${selectedRequest.customer.username}` : "Not available"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Registered Phone</span>
                      <span className="font-mono text-white/80 truncate block">
                        {selectedRequest.customer?.phone || "Not available"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-mono text-white/40 uppercase block">Trust Level</span>
                      <span className="font-mono text-amber-500 font-bold uppercase block">
                        {selectedRequest.customer?.trustLevel || "Not available"}
                      </span>
                    </div>
                  </div>

                  {/* Registered Vehicles Summary */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[9px] font-mono text-white/40 uppercase block mb-1.5">
                      Active Customer Vehicles
                    </span>
                    {selectedRequest.customer?.vehicles && selectedRequest.customer.vehicles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.customer.vehicles.map((v) => (
                          <div
                            key={v.id}
                            className="p-2 bg-black/40 border border-white/5 rounded-lg text-xs flex items-center gap-2"
                          >
                            <Car className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-white/80 font-medium">{v.model}</span>
                            <span className="font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              {v.plateNumber}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-white/40 italic">Not available (no vehicles registered).</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Decision Section */}
              {selectedRequest.status === "Pending" ? (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    Administrator Decision Console
                  </h4>

                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase block mb-1.5">
                      Decision Note <span className="text-white/20">(Optional, visible to customer)</span>
                    </label>
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="e.g. Identity verified via customer receipt & security call."
                      className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none transition"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => promptConfirmAction("APPROVE")}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      Approve & Apply to Database
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => promptConfirmAction("REJECT")}
                      className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4 stroke-[3]" />
                      Reject Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-[10px] uppercase">Decision Recorded</span>
                    <span className="font-mono text-white/60 text-[10px]">
                      By @{selectedRequest.reviewedBy || "Owner"} on{" "}
                      {selectedRequest.reviewedAt ? new Date(selectedRequest.reviewedAt).toLocaleString() : "Not available"}
                    </span>
                  </div>
                  {selectedRequest.adminNote ? (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase block mb-0.5">
                        Administrator Note:
                      </span>
                      <p className="text-white/80 italic leading-relaxed">
                        "{selectedRequest.adminNote}"
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/30">
                      Administrator Note: Not available (no note recorded)
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-2xl border-white/5 text-center text-white/40 text-xs">
              Select a correction request from the list to review customer account details.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL CUSTOMER PROFILE & VERIFICATION MODAL                                */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#12141a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {fullCustomerDossier?.name || selectedRequest?.customer?.name || "Customer Profile"}
                    </h3>
                    {fullCustomerDossier?.username && (
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        @{fullCustomerDossier.username}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active Account
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                    Customer ID: {fullCustomerDossier?.id || selectedRequest?.customer?.id || "Not available"} • Member Since: {fullCustomerDossier?.createdAt ? new Date(fullCustomerDossier.createdAt).toLocaleDateString() : "Not available"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-Side Highlight of Requested Correction */}
            {selectedRequest && (
              <div className="bg-amber-500/5 border-b border-amber-500/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pending Modification Request: {selectedRequest.requestId}
                  </span>
                  <span className="font-mono text-white/40 text-[10px]">
                    Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                    <span className="text-[9px] font-mono text-white/40 uppercase block mb-0.5">
                      Current Database Value ({selectedRequest.field === "MOBILE_NUMBER" ? "Mobile" : "Plate"})
                    </span>
                    <span className="font-mono text-white/80 font-bold text-sm">
                      {selectedRequest.currentValue}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                    <span className="text-[9px] font-mono text-amber-500 uppercase block mb-0.5 font-bold">
                      Requested New Value
                    </span>
                    <span className="font-mono text-amber-400 font-bold text-sm">
                      {selectedRequest.requestedValue}
                    </span>
                  </div>
                </div>

                {selectedRequest.reason && (
                  <p className="text-xs text-white/70 italic pt-1">
                    Customer Note: "{selectedRequest.reason}"
                  </p>
                )}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 bg-black/20 text-xs font-mono px-4">
              <button
                type="button"
                onClick={() => setProfileModalTab("overview")}
                className={`py-3 px-4 border-b-2 font-bold uppercase transition flex items-center gap-1.5 ${
                  profileModalTab === "overview"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" /> Account Overview
              </button>

              <button
                type="button"
                onClick={() => setProfileModalTab("vehicles")}
                className={`py-3 px-4 border-b-2 font-bold uppercase transition flex items-center gap-1.5 ${
                  profileModalTab === "vehicles"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Vehicles ({fullCustomerDossier?.vehicles?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setProfileModalTab("billing")}
                className={`py-3 px-4 border-b-2 font-bold uppercase transition flex items-center gap-1.5 ${
                  profileModalTab === "billing"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> Invoices ({fullCustomerDossier?.invoices?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setProfileModalTab("services")}
                className={`py-3 px-4 border-b-2 font-bold uppercase transition flex items-center gap-1.5 ${
                  profileModalTab === "services"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" /> Service History
              </button>

              <button
                type="button"
                onClick={() => setProfileModalTab("history")}
                className={`py-3 px-4 border-b-2 font-bold uppercase transition flex items-center gap-1.5 ${
                  profileModalTab === "history"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-white/40 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" /> Correction Log ({fullCustomerDossier?.correctionRequests?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {isLoadingProfile ? (
                <div className="py-20 text-center font-mono text-xs text-white/40">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-amber-500" />
                  Retrieving complete customer records from PostgreSQL...
                </div>
              ) : !fullCustomerDossier ? (
                <div className="py-12 text-center text-white/40 text-xs font-mono">
                  No profile data available for this customer.
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {profileModalTab === "overview" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Security Verification Protocol Notice */}
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                        <span className="font-mono text-amber-400 font-bold uppercase flex items-center gap-1.5 text-[11px]">
                          <ShieldCheck className="w-4 h-4" /> Identity Verification Guidelines
                        </span>
                        <p className="text-white/80 leading-relaxed text-[11px]">
                          When verifying mobile phone updates: Verify the customer identity by cross-referencing previous billing invoices, service receipts, or direct identity call. A matching vehicle number or possession of old phone details alone does not constitute proof of identity.
                        </p>
                      </div>

                      {/* Profile Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Full Name</span>
                          <span className="text-sm font-bold text-white block truncate">
                            {fullCustomerDossier.name || "Not available"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Current Mobile Number</span>
                          <span className="text-sm font-mono text-amber-400 block truncate">
                            {fullCustomerDossier.phone || "Not available"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Portal Username</span>
                          <span className="text-sm font-mono text-white/80 block truncate">
                            {fullCustomerDossier.username ? `@${fullCustomerDossier.username}` : "Not available"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Account Creation Date</span>
                          <span className="text-xs font-mono text-white/70 block">
                            {fullCustomerDossier.createdAt ? new Date(fullCustomerDossier.createdAt).toLocaleDateString() : "Not available"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Account Status</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold block">
                            Active
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Trust Tier</span>
                          <span className="text-xs font-mono text-amber-500 font-bold uppercase block">
                            {fullCustomerDossier.trustLevel || "Bronze"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Lifetime Total Spent</span>
                          <span className="text-sm font-mono text-emerald-400 font-bold block">
                            ₹{fullCustomerDossier.totalSpent ? fullCustomerDossier.totalSpent.toLocaleString() : "0"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Total Workshop Visits</span>
                          <span className="text-sm font-mono text-white/80 block">
                            {fullCustomerDossier.visits ?? 0} visits
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Outstanding Balance</span>
                          <span className="text-sm font-mono text-rose-400 block">
                            ₹{fullCustomerDossier.outstandingAmount ? fullCustomerDossier.outstandingAmount.toLocaleString() : "0"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Reward Points</span>
                          <span className="text-sm font-mono text-amber-400 block">
                            {fullCustomerDossier.rewardPoints ?? 0} pts
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">Preferred Tyre Brand</span>
                          <span className="text-xs font-mono text-white/70 block">
                            {fullCustomerDossier.favoriteBrand || "Not available"}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase block">City / Address</span>
                          <span className="text-xs font-mono text-white/70 block truncate">
                            {fullCustomerDossier.city || fullCustomerDossier.address || "Not available"}
                          </span>
                        </div>
                      </div>

                      {/* Internal Notes */}
                      {fullCustomerDossier.notes && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                            Workshop Profile Notes
                          </span>
                          <p className="text-white/80 italic leading-relaxed">
                            "{fullCustomerDossier.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: VEHICLES & WARRANTY */}
                  {profileModalTab === "vehicles" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/50 uppercase">
                          Registered Vehicles ({fullCustomerDossier.vehicles.length})
                        </span>
                        <span className="text-[10px] font-mono text-amber-500">
                          Warranty & Service Details
                        </span>
                      </div>

                      {fullCustomerDossier.vehicles.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                          Not available (no vehicles currently linked to this customer account).
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fullCustomerDossier.vehicles.map((v) => (
                            <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-white flex items-center gap-2">
                                  <Car className="w-4 h-4 text-amber-500" />
                                  {v.brand ? `${v.brand} ` : ""}{v.model}
                                </span>
                                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {v.plateNumber}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                <div>
                                  <span className="text-white/40 block">Year & Fuel</span>
                                  <span className="text-white/80">{v.year || "N/A"} • {v.fuelType || "N/A"}</span>
                                </div>

                                <div>
                                  <span className="text-white/40 block">Mileage</span>
                                  <span className="text-white/80">{v.mileage ? `${v.mileage.toLocaleString()} km` : "Not available"}</span>
                                </div>

                                <div>
                                  <span className="text-white/40 block">Tyres Installed</span>
                                  <span className="text-white/80">{v.tyreInstalled || "Not available"}</span>
                                </div>

                                <div>
                                  <span className="text-white/40 block">Install Date</span>
                                  <span className="text-white/80">
                                    {v.installDate ? new Date(v.installDate).toLocaleDateString() : "Not available"}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-white/40 block">Warranty Expiry</span>
                                  <span className="text-emerald-400">
                                    {v.warrantyExpiry ? new Date(v.warrantyExpiry).toLocaleDateString() : "Not available"}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-white/40 block">Next Replacement</span>
                                  <span className="text-amber-400">
                                    {v.nextReplacement ? new Date(v.nextReplacement).toLocaleDateString() : "Not available"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: INVOICES & BILLING */}
                  {profileModalTab === "billing" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/50 uppercase">
                          Invoices & Transaction History ({fullCustomerDossier.invoices.length})
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          Total Billed: ₹{fullCustomerDossier.totalSpent.toLocaleString()}
                        </span>
                      </div>

                      {fullCustomerDossier.invoices.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                          Not available (no invoice or transaction records found for this customer).
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {fullCustomerDossier.invoices.map((inv) => (
                            <div key={inv.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                                <div className="flex items-center gap-2">
                                  <Receipt className="w-4 h-4 text-emerald-400" />
                                  <span className="font-mono font-bold text-sm text-white">
                                    {inv.invoiceNumber}
                                  </span>
                                  <span className="text-[10px] font-mono text-white/40">
                                    {new Date(inv.date).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 font-mono text-xs">
                                  <span className="text-white/40">
                                    Subtotal: ₹{inv.subTotal.toLocaleString()}
                                  </span>
                                  <span className="text-white/40">
                                    GST: ₹{inv.gstAmount.toLocaleString()}
                                  </span>
                                  <span className="text-emerald-400 font-bold text-sm">
                                    Total: ₹{inv.netTotal.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Items list */}
                              {inv.items && inv.items.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[9px] font-mono text-white/40 uppercase block">
                                    Purchased Items & Services:
                                  </span>
                                  <div className="space-y-1">
                                    {inv.items.map((it) => (
                                      <div
                                        key={it.id}
                                        className="flex items-center justify-between text-xs font-mono bg-black/30 p-2 rounded-lg"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Tag className="w-3 h-3 text-amber-500" />
                                          <span className="text-white/90">{it.name}</span>
                                          <span className="text-white/40 text-[10px]">({it.brand})</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-white/70">
                                          <span>Qty: {it.quantity}</span>
                                          <span>@ ₹{it.price.toLocaleString()}</span>
                                          <span className="font-bold text-white">₹{it.total.toLocaleString()}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Payments breakdown */}
                              {inv.payments && inv.payments.length > 0 && (
                                <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
                                  <span className="text-white/40 uppercase">Payment Methods:</span>
                                  {inv.payments.map((p) => (
                                    <span
                                      key={p.id}
                                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    >
                                      {p.method}: ₹{p.amount.toLocaleString()} ({p.status})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: SERVICE RECORDS & JOB CARDS */}
                  {profileModalTab === "services" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Job Cards */}
                      <div className="space-y-3">
                        <span className="text-xs font-mono text-white/50 uppercase block">
                          Workshop Job Cards ({fullCustomerDossier.jobCards?.length || 0})
                        </span>

                        {!fullCustomerDossier.jobCards || fullCustomerDossier.jobCards.length === 0 ? (
                          <div className="p-6 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                            Not available (no workshop job cards linked to this customer).
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {fullCustomerDossier.jobCards.map((jc) => (
                              <div key={jc.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-white flex items-center gap-2">
                                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                                    {jc.jobId} - {jc.vehicleModel} ({jc.vehicleNumber})
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {jc.status} • {jc.bay}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
                                  <span>Services: {jc.services.join(", ") || "General Inspection"}</span>
                                  <span>Mechanic: {jc.mechanic || "Not assigned"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Appointments */}
                      <div className="space-y-3 pt-3 border-t border-white/5">
                        <span className="text-xs font-mono text-white/50 uppercase block">
                          Service Appointments ({fullCustomerDossier.appointments?.length || 0})
                        </span>

                        {!fullCustomerDossier.appointments || fullCustomerDossier.appointments.length === 0 ? (
                          <div className="p-6 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                            Not available (no appointment history found).
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {fullCustomerDossier.appointments.map((a) => (
                              <div key={a.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-white block">
                                    {a.serviceType} - {a.vehicleNumber}
                                  </span>
                                  <span className="text-[10px] text-white/40 block">
                                    Slot: {new Date(a.date).toLocaleDateString()} @ {a.timeSlot}
                                  </span>
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70">
                                  {a.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: CORRECTION REQUEST HISTORY */}
                  {profileModalTab === "history" && (
                    <div className="space-y-4 animate-fade-in">
                      <span className="text-xs font-mono text-white/50 uppercase block">
                        Customer Correction Request Audit Trail ({fullCustomerDossier.correctionRequests?.length || 0})
                      </span>

                      {!fullCustomerDossier.correctionRequests || fullCustomerDossier.correctionRequests.length === 0 ? (
                        <div className="p-8 text-center text-white/40 text-xs font-mono border border-dashed border-white/10 rounded-xl">
                          Not available (no previous correction requests recorded).
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {fullCustomerDossier.correctionRequests.map((req) => (
                            <div key={req.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-white flex items-center gap-1.5">
                                  <FileClock className="w-3.5 h-3.5 text-amber-500" />
                                  {req.requestId} ({req.field === "MOBILE_NUMBER" ? "Mobile" : "Vehicle Plate"})
                                </span>
                                <span
                                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                                    req.status === "Approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : req.status === "Rejected"
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 font-mono text-xs bg-black/40 p-2 rounded-lg">
                                <span className="text-white/40">{req.currentValue}</span>
                                <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="font-bold text-amber-400">{req.requestedValue}</span>
                              </div>

                              {req.reason && (
                                <p className="text-[11px] text-white/60 italic">
                                  Customer reason: "{req.reason}"
                                </p>
                              )}

                              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/40">
                                <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                                {req.reviewedBy && (
                                  <span>
                                    Decision by @{req.reviewedBy} on{" "}
                                    {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "N/A"}
                                  </span>
                                )}
                              </div>

                              {req.adminNote && (
                                <div className="text-[10px] font-mono text-white/60 bg-white/5 p-2 rounded">
                                  Note: {req.adminNote}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer with Direct Actions */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-white/40">
                Authorized Owner Access • Real-time PostgreSQL Data
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedRequest && selectedRequest.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => promptConfirmAction("APPROVE", selectedRequest)}
                      className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs uppercase font-mono flex items-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Approve Correction
                    </button>

                    <button
                      type="button"
                      onClick={() => promptConfirmAction("REJECT", selectedRequest)}
                      className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs uppercase font-mono flex items-center gap-1.5 transition"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                      Reject
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPLICIT CONFIRMATION DIALOG (APPROVE / REJECT)                           */}
      {/* ========================================================================= */}
      {confirmDialog.open && confirmDialog.request && confirmDialog.action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#15171e] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmDialog.action === "APPROVE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {confirmDialog.action === "APPROVE" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">
                  {confirmDialog.action === "APPROVE"
                    ? "Confirm Approval of Profile Correction"
                    : "Confirm Rejection of Profile Correction"}
                </h3>
                <span className="text-xs text-white/50 font-mono block mt-0.5">
                  Request ID: {confirmDialog.request.requestId}
                </span>
              </div>
            </div>

            {/* Change Summary Box */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40 font-mono uppercase text-[10px]">Customer:</span>
                <span className="font-bold text-white">{confirmDialog.request.customer?.name || "Customer"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/40 font-mono uppercase text-[10px]">Field to Update:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {confirmDialog.request.field === "MOBILE_NUMBER" ? "Mobile Number" : "Vehicle Plate"}
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
                <div>
                  <span className="text-[9px] text-white/40 block">Current</span>
                  <span className="text-white/70">{confirmDialog.request.currentValue}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500" />
                <div className="text-right">
                  <span className="text-[9px] text-amber-500 block font-bold">
                    {confirmDialog.action === "APPROVE" ? "New Database Value" : "Will remain unchanged"}
                  </span>
                  <span className="text-amber-400 font-bold">{confirmDialog.request.requestedValue}</span>
                </div>
              </div>
            </div>

            {/* Action Explanation Notice */}
            {confirmDialog.action === "APPROVE" ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
                Approving this request will immediately update the customer's live record in PostgreSQL and record your decision in the tamper-proof AuditLog. Historical invoices, bookings, and past transactions remain unchanged.
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed">
                Rejecting this request will mark it as Rejected. No database changes will be made to the customer's phone or vehicle plate.
              </div>
            )}

            {/* Admin Note input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-white/40 uppercase block">
                Decision Note <span className="text-white/20">(Optional, visible to customer)</span>
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  confirmDialog.action === "APPROVE"
                    ? "e.g. Identity verified via customer receipt & security call."
                    : "e.g. Registration document copy did not match requested plate."
                }
                className="w-full bg-cyber-gray border border-white/10 focus:border-amber-500/60 rounded-xl py-2.5 px-3 text-xs text-white outline-none transition"
              />
            </div>

            {/* Dialog Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={executeConfirmedAction}
                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase font-mono tracking-wider transition flex items-center justify-center gap-2 ${
                  confirmDialog.action === "APPROVE"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/10"
                    : "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10"
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : confirmDialog.action === "APPROVE" ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    Confirm Approval & Apply
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 stroke-[3]" />
                    Confirm Rejection
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setConfirmDialog({ open: false, action: null, request: null })}
                className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono uppercase transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
