"use client";

// Cryptographic hashing using Web Crypto API (SHA-256)
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Valid Owner Accounts Mappings (Username -> SHA-256 Hash of Password)
const OWNER_ACCOUNTS: { [username: string]: string } = {
  "MHDSAM": "9417b0600c32e27d4bc7db921ff38dcf546ec28533fcea509cb623c8243c7752", // @@MdSamar@@
  "Noxis99": "853d7db7a54cbcba61eba5a032694bb0422965363d9c0cb4e0064043f10020f4"  // @@Noxis001@@
};

// 1. Pluggable SMS Provider Architecture
export interface SmsProvider {
  name: string;
  sendOtp(phone: string, otp: string): Promise<boolean>;
}

// Console Provider - Prints OTP to console for debugging, falls back to mock alert
export class ConsoleSmsProvider implements SmsProvider {
  name = "Console/Local SMS Gateway";
  async sendOtp(phone: string, otp: string): Promise<boolean> {
    console.log(`[SMS GATEWAY - MOCK] Dispatched OTP code to Customer (+91 ${phone}):`);
    console.log(`----------------------------------------`);
    console.log(`TAJ TYRE WORKS: Your OTP verification code is: ${otp}. Valid for 5 minutes.`);
    console.log(`----------------------------------------`);
    
    // Dispatch custom event to notify Developer Console / debug helpers
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ttw_otp_dispatched", { detail: { phone, otp } }));
    }
    return true;
  }
}

// Twilio Provider placeholder
export class TwilioSmsProvider implements SmsProvider {
  name = "Twilio Service Gateway";
  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid = "", authToken = "", fromPhone = "") {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    if (!this.accountSid || !this.authToken) {
      console.warn("Twilio API credentials missing. Falling back to Console SMS log.");
      return new ConsoleSmsProvider().sendOtp(phone, otp);
    }
    
    try {
      // In production, this would make an API request to Twilio API
      // Since client-side directly hitting Twilio would expose secrets,
      // in production this connects to a Next.js server-side endpoint (/api/send-otp).
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "twilio", phone, otp })
      });
      return res.ok;
    } catch (e) {
      console.error("Twilio request failed:", e);
      return false;
    }
  }
}

// Global pluggable gateway registry
let currentSmsProvider: SmsProvider = new ConsoleSmsProvider();

export function setSmsProvider(provider: SmsProvider) {
  currentSmsProvider = provider;
}

export function getSmsProvider(): SmsProvider {
  return currentSmsProvider;
}

// 2. Authentication State Management Interfaces
export interface UserSession {
  username: string;
  phone?: string;
  role: "Owner" | "Customer" | "Employee" | "Dealer";
  name: string;
  token: string;
  createdAt: number;
  lastActive?: number;
}

interface OtpRegistry {
  [phone: string]: {
    otp: string;
    expiresAt: number;
    failedAttempts: number;
    lockUntil?: number;
    lastRequested: number;
  };
}

export type RecoveryRequestType = "FORGOT_USERNAME" | "FORGOT_PASSWORD" | "CHANGE_USERNAME";

class AuthServiceManager {
  // Request OTP with rate limits and locks (secure database backed)
  async requestOtp(phone: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Dispatch event for dev tools / UI simulated console
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ttw_otp_dispatched", { detail: { phone, otp: data.otp } }));
        }
        return { success: true, message: data.message, otp: data.otp };
      } else {
        return { success: false, message: data.error || "Failed to dispatch OTP." };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Network error. Please try again." };
    }
  }

  // Verify OTP code (secure database backed)
  async verifyOtp(phone: string, codeInput: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: codeInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Invalid verification code." };
      }
    } catch (e: any) {
      return { success: false, message: e.message || "Network error. Please try again." };
    }
  }

  // Verify credentials for Owner, Employee, or Dealer (secure database backed)
  async verifyCredentials(usernameInput: string, passwordInput: string): Promise<{ success: boolean; role?: "Owner" | "Customer" | "Employee" | "Dealer"; name?: string; employeeRole?: string; error?: string }> {
    try {
      const res = await fetch("/api/auth/owner-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          role: data.role,
          name: data.name,
          employeeRole: data.employeeRole
        };
      } else {
        return { success: false, error: data.error || "Invalid credentials." };
      }
    } catch (e: any) {
      console.error("Auth API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Customer Login via Username + Password (secure server verified & rate-limited)
  async customerLogin(usernameInput: string, passwordInput: string): Promise<{
    success: boolean;
    name?: string;
    username?: string;
    phone?: string;
    customerId?: string;
    error?: string;
    needsActivation?: boolean;
  }> {
    try {
      const res = await fetch("/api/auth/customer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          name: data.name,
          username: data.username,
          phone: data.phone,
          customerId: data.customerId
        };
      } else {
        return {
          success: false,
          error: data.error || "Invalid username or password.",
          needsActivation: data.needsActivation,
          phone: data.phone
        };
      }
    } catch (e: any) {
      console.error("Customer auth API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Customer Signup (Name + Mobile + Vehicle Number - NO OTP)
  async customerSignup(payload: { name: string; phone: string; vehicleNumber: string }): Promise<{
    success: boolean;
    token?: string;
    customerId?: string;
    error?: string;
    alreadyRegistered?: boolean;
    needsExistingActivation?: boolean;
  }> {
    try {
      const res = await fetch("/api/auth/customer-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          token: data.token,
          customerId: data.customerId
        };
      } else {
        return {
          success: false,
          error: data.error || "Signup failed. Please try again.",
          alreadyRegistered: data.alreadyRegistered,
          needsExistingActivation: data.needsExistingActivation
        };
      }
    } catch (e: any) {
      console.error("Customer signup failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Set Username & Password via Secure Token (NO OTP)
  async setupCredentials(payload: {
    token: string;
    username: string;
    password: string;
    confirmPassword: string;
  }): Promise<{
    success: boolean;
    message?: string;
    name?: string;
    username?: string;
    phone?: string;
    customerId?: string;
    error?: string;
  }> {
    try {
      const res = await fetch("/api/auth/setup-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          name: data.name,
          username: data.username,
          phone: data.phone,
          customerId: data.customerId
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to configure credentials."
        };
      }
    } catch (e: any) {
      console.error("Setup credentials API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Existing Customer Account Verification (Invoice & Plate Verification - NO OTP)
  async verifyExistingCustomer(payload: {
    phone: string;
    vehicleNumber: string;
    invoiceNumber: string;
  }): Promise<{
    success: boolean;
    token?: string;
    customerId?: string;
    name?: string;
    error?: string;
    alreadyActive?: boolean;
  }> {
    try {
      const res = await fetch("/api/auth/verify-existing-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          token: data.token,
          customerId: data.customerId,
          name: data.name
        };
      } else {
        return {
          success: false,
          error: data.error || "Verification failed.",
          alreadyActive: data.alreadyActive
        };
      }
    } catch (e: any) {
      console.error("Verify existing customer API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Submit Account Recovery Request (Forgot Username, Forgot Password, Change Username)
  async submitRecoveryRequest(payload: {
    type?: RecoveryRequestType;
    requestType?: RecoveryRequestType;
    name?: string;
    fullName?: string;
    phone: string;
    vehicleNumber?: string;
    invoiceNumber?: string;
    desiredUsername?: string;
    requestedUsername?: string;
    notes?: string;
    reason?: string;
  }): Promise<{ success: boolean; requestId?: string; message?: string; error?: string }> {
    try {
      const res = await fetch("/api/auth/recovery/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          requestId: data.requestId,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to submit recovery request."
        };
      }
    } catch (e: any) {
      console.error("Submit recovery API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Check Recovery Request Status
  async checkRecoveryStatus(
    arg1: string | { requestId: string; phone: string },
    arg2?: string
  ): Promise<{
    success: boolean;
    requestId?: string;
    type?: string;
    requestType?: string;
    status?: string;
    createdAt?: string;
    adminNote?: string;
    username?: string;
    verifiedUsername?: string;
    resetToken?: string;
    isTokenValid?: boolean;
    resetCompleted?: boolean;
    updatedUsername?: string;
    requestedUsername?: string;
    request?: any;
    error?: string;
  }> {
    try {
      const payload =
        typeof arg1 === "object"
          ? arg1
          : { requestId: arg1, phone: arg2 || "" };

      const res = await fetch("/api/auth/recovery/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Normalise fields for callers
        const normalized = {
          ...data,
          requestType: data.type || data.requestType,
          verifiedUsername: data.username || data.verifiedUsername,
          requestedUsername: data.updatedUsername || data.requestedUsername,
          request: {
            ...data,
            requestType: data.type || data.requestType,
            verifiedUsername: data.username || data.verifiedUsername,
            requestedUsername: data.updatedUsername || data.requestedUsername,
          }
        };
        return normalized;
      }
      return data;
    } catch (e: any) {
      console.error("Check recovery status API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Complete Password Reset using Token
  async completePasswordReset(
    arg1: string | { token: string; password: string; confirmPassword?: string },
    arg2?: string
  ): Promise<{ success: boolean; message?: string; username?: string; name?: string; error?: string }> {
    try {
      const payload =
        typeof arg1 === "object"
          ? {
              token: arg1.token,
              password: arg1.password,
              confirmPassword: arg1.confirmPassword || arg1.password
            }
          : {
              token: arg1,
              password: arg2 || "",
              confirmPassword: arg2 || ""
            };

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message,
          username: data.username,
          name: data.name
        };
      } else {
        return {
          success: false,
          error: data.error || "Failed to reset password."
        };
      }
    } catch (e: any) {
      console.error("Complete password reset API failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Owner: Fetch Recovery Requests
  async getOwnerRecoveryRequests(ownerUsername: string): Promise<{ success: boolean; requests?: any[]; error?: string }> {
    try {
      const res = await fetch("/api/owner/recovery-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": ownerUsername
        }
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Get owner recovery requests failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Owner: Process Recovery Action (Approve / Reject)
  async processOwnerRecoveryAction(
    ownerUsername: string,
    payload: { requestId: string; action: "APPROVE" | "REJECT"; adminNote?: string }
  ): Promise<{ success: boolean; message?: string; request?: any; recoveredUsername?: string; resetToken?: string; resetUrl?: string; error?: string }> {
    try {
      const res = await fetch("/api/owner/recovery-requests/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": ownerUsername
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Process owner recovery action failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Customer: Submit Profile Correction Request
  async submitProfileCorrection(payload: {
    field: "MOBILE_NUMBER" | "VEHICLE_NUMBER";
    requestedValue: string;
    reason?: string;
  }): Promise<{ success: boolean; requestId?: string; message?: string; error?: string }> {
    try {
      const session = this.getCurrentSession();
      const phone = session?.phone || (typeof window !== "undefined" ? localStorage.getItem("ttw_currentUserPhone") || "" : "");
      const username = session?.username || (typeof window !== "undefined" ? localStorage.getItem("ttw_currentUsername") || "" : "");

      const res = await fetch("/api/customer/correction-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-customer-phone": phone,
          "x-customer-username": username,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Submit profile correction failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Customer: Fetch own correction requests
  async getCustomerCorrectionRequests(): Promise<{
    success: boolean;
    requests?: any[];
    currentProfile?: any;
    error?: string;
  }> {
    try {
      const session = this.getCurrentSession();
      const phone = session?.phone || (typeof window !== "undefined" ? localStorage.getItem("ttw_currentUserPhone") || "" : "");
      const username = session?.username || (typeof window !== "undefined" ? localStorage.getItem("ttw_currentUsername") || "" : "");

      const res = await fetch("/api/customer/correction-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-customer-phone": phone,
          "x-customer-username": username,
        },
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Get customer correction requests failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Owner: Fetch Correction Requests
  async getOwnerCorrectionRequests(ownerUsername: string): Promise<{
    success: boolean;
    requests?: any[];
    counts?: { total: number; pending: number; approved: number; rejected: number };
    error?: string;
  }> {
    try {
      const res = await fetch("/api/owner/correction-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": ownerUsername,
        },
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Get owner correction requests failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Owner: Process Correction Action (Approve / Reject)
  async processOwnerCorrectionAction(
    ownerUsername: string,
    payload: { requestId: string; action: "APPROVE" | "REJECT"; adminNote?: string }
  ): Promise<{ success: boolean; message?: string; request?: any; error?: string }> {
    try {
      const res = await fetch("/api/owner/correction-requests/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": ownerUsername,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Process owner correction action failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Owner: Fetch Full Customer Dossier & Relational History
  async getCustomerFullDossier(
    ownerUsername: string,
    params: { requestId?: string; customerId?: string }
  ): Promise<{ success: boolean; customer?: any; request?: any; error?: string }> {
    try {
      const query = new URLSearchParams();
      if (params.requestId) query.set("requestId", params.requestId);
      if (params.customerId) query.set("customerId", params.customerId);

      const res = await fetch(`/api/owner/correction-requests/customer-profile?${query.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-owner-username": ownerUsername,
        },
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error("Get customer full dossier failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  }

  // Session Handling
  createSession(role: "Owner" | "Customer" | "Employee" | "Dealer", name: string, identifier: string, customerPhone?: string): UserSession {
    const session: UserSession = {
      username: identifier,
      phone: customerPhone || (role !== "Owner" ? identifier : undefined),
      role,
      name,
      token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      lastActive: Date.now()
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("ttw_currentSession", JSON.stringify(session));
      // Legacy compatibility
      localStorage.setItem("ttw_currentUserRole", role);
      localStorage.setItem("ttw_currentUserName", name);
      if (role === "Customer") {
        localStorage.setItem("ttw_currentUserPhone", session.phone || identifier);
        localStorage.setItem("ttw_currentUsername", identifier);
      }
    }

    return session;
  }

  getCurrentSession(): UserSession | null {
    if (typeof window === "undefined") return null;
    const sessionStr = localStorage.getItem("ttw_currentSession");
    if (!sessionStr) return null;

    try {
      const session: UserSession = JSON.parse(sessionStr);
      const now = Date.now();
      const timeout = 1800000; // 30 minutes of inactivity (1,800,000 ms)

      if (session.lastActive && now - session.lastActive > timeout) {
        this.destroySession();
        return null;
      }

      // Update last active timestamp
      session.lastActive = now;
      localStorage.setItem("ttw_currentSession", JSON.stringify(session));
      return session;
    } catch (e) {
      this.destroySession();
      return null;
    }
  }

  destroySession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ttw_currentSession");
      localStorage.removeItem("ttw_currentUserRole");
      localStorage.removeItem("ttw_currentUserName");
      localStorage.removeItem("ttw_currentUserPhone");
      localStorage.removeItem("ttw_employeeType");
    }
  }

  // Unified Route Guards
  validateRouteAccess(pathname: string): { allowed: boolean; redirectUrl?: string } {
    const session = this.getCurrentSession();
    if (!session) {
      return { allowed: false, redirectUrl: "/login" };
    }

    // Role-based directory checking
    if (pathname.startsWith("/owner") && session.role !== "Owner") {
      return { allowed: false, redirectUrl: this.getDefaultRedirect(session.role) };
    }
    if (pathname.startsWith("/customer") && session.role !== "Customer") {
      return { allowed: false, redirectUrl: this.getDefaultRedirect(session.role) };
    }
    if (pathname.startsWith("/employee") && session.role !== "Employee") {
      return { allowed: false, redirectUrl: this.getDefaultRedirect(session.role) };
    }
    if (pathname.startsWith("/dealer") && session.role !== "Dealer") {
      return { allowed: false, redirectUrl: this.getDefaultRedirect(session.role) };
    }

    return { allowed: true };
  }

  private getDefaultRedirect(role: string): string {
    if (role === "Owner") return "/owner";
    if (role === "Customer") return "/customer";
    if (role === "Employee") return "/employee";
    if (role === "Dealer") return "/login"; // or dealer dashboard
    return "/login";
  }
}

export const authService = new AuthServiceManager();
