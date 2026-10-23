/**
 * TAJ TYRE WORKS - Centralized WhatsApp Contact Configuration & URL Builder
 * 
 * To set your real WhatsApp link/number, update NEXT_PUBLIC_WHATSAPP_URL in `.env`:
 * e.g. NEXT_PUBLIC_WHATSAPP_URL="https://wa.me/919199936181"
 */

export interface WhatsAppEnquiryParams {
  brand: "MRF" | "CEAT" | string;
  pattern: string;
  size: string;
  position?: "Front" | "Rear" | "Front / Rear" | "Verification Needed" | string;
  isPositionConfirmed?: boolean;
  category: "Bike" | "Scooty" | string;
}

/**
 * Returns the configured WhatsApp base destination URL.
 * Defaults to the environment variable NEXT_PUBLIC_WHATSAPP_URL or fallback placeholder.
 */
export function getWhatsAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (configured && !configured.includes("YOUR_WHATSAPP_NUMBER_HERE")) {
    return configured.replace(/\/+$/, "");
  }
  // Safe default destination until owner specifies their link in .env
  return "https://wa.me/YOUR_WHATSAPP_NUMBER_HERE";
}

/**
 * Checks if the owner has configured a valid WhatsApp destination.
 */
export function isWhatsAppConfigured(): boolean {
  const url = getWhatsAppBaseUrl();
  return !url.includes("YOUR_WHATSAPP_NUMBER_HERE");
}

/**
 * Formats the pre-filled inquiry text exactly as specified:
 * "Hello TAJ TYRE WORKS, I want to enquire about an {Brand} {Pattern} tyre, size {Size}, {Position}, for my {Category}. Please confirm availability and latest price."
 */
export function buildWhatsAppEnquiryMessage(params: WhatsAppEnquiryParams): string {
  const categoryWord = params.category.trim();
  const brandWord = params.brand.trim();
  const patternWord = params.pattern.trim();
  const positionStr = params.position 
    ? (params.isPositionConfirmed === false || params.position === "Verification Needed" 
        ? "position to be verified" 
        : params.position) 
    : "Standard Fitment";

  return `Hello TAJ TYRE WORKS, I want to enquire about an ${brandWord} ${patternWord} tyre, size ${params.size}, ${positionStr}, for my ${categoryWord}. Please confirm availability and latest price.`;
}

/**
 * Builds the fully encoded WhatsApp URL for direct chat initiation.
 */
export function getWhatsAppTyreEnquiryUrl(params: WhatsAppEnquiryParams): string {
  const baseUrl = getWhatsAppBaseUrl();
  const rawMessage = buildWhatsAppEnquiryMessage(params);
  const encoded = encodeURIComponent(rawMessage);
  
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}text=${encoded}`;
}
