/**
 * Validation and normalization helpers for customer profile corrections.
 */

export function normalizePhoneNumber(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== "string") {
    return { isValid: false, normalized: "", error: "Mobile number is required." };
  }

  // Strip all non-digit characters
  let digits = raw.replace(/\D/g, "");

  // If starts with country code 91 and has 12 digits, strip 91
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Indian mobile numbers must be exactly 10 digits starting with 6, 7, 8, or 9
  if (digits.length !== 10) {
    return {
      isValid: false,
      normalized: digits,
      error: "Mobile number must be exactly 10 digits (e.g., 9876543210).",
    };
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      isValid: false,
      normalized: digits,
      error: "Mobile number must start with a valid digit (6, 7, 8, or 9).",
    };
  }

  return { isValid: true, normalized: digits };
}

export function normalizeVehicleNumber(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== "string") {
    return { isValid: false, normalized: "", error: "Vehicle plate number is required." };
  }

  // Trim and uppercase
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  // Plain alphanumeric version
  const rawAlphaNumeric = cleaned.replace(/-/g, "");

  if (rawAlphaNumeric.length < 6 || rawAlphaNumeric.length > 13) {
    return {
      isValid: false,
      normalized: cleaned,
      error: "Vehicle number must be between 6 and 13 characters (e.g. DL3C-AM-1234 or OD08Z3420).",
    };
  }

  // Check state prefix (at least 2 letters)
  if (!/^[A-Z]{2}/.test(rawAlphaNumeric)) {
    return {
      isValid: false,
      normalized: cleaned,
      error: "Vehicle number must begin with a valid 2-letter state code (e.g. DL, HR, UP, OD).",
    };
  }

  return { isValid: true, normalized: cleaned };
}
