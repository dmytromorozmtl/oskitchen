const PLACEHOLDER_EMAIL_RE = /@local\.kitchenos\.invalid$/i;

/** Synthetic guest email generated when no contact is captured at checkout. */
export function isPlaceholderKitchenOsEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return PLACEHOLDER_EMAIL_RE.test(email.trim());
}

export type CustomerDisplayMode = "named" | "walk_in_guest" | "anonymous";

export function resolveCustomerDisplayMode(input: {
  customerName: string | null | undefined;
  customerEmail: string | null | undefined;
}): CustomerDisplayMode {
  const name = (input.customerName ?? "").trim().toLowerCase();
  if (!name || name === "walk-in customer" || name === "walk in customer") {
    if (isPlaceholderKitchenOsEmail(input.customerEmail)) return "walk_in_guest";
    return "anonymous";
  }
  if (isPlaceholderKitchenOsEmail(input.customerEmail)) return "walk_in_guest";
  return "named";
}

/** Primary label for headers and receipts (no synthetic email). */
export function formatCustomerPrimaryLabel(input: {
  customerName: string | null | undefined;
  customerEmail: string | null | undefined;
}): string {
  const mode = resolveCustomerDisplayMode(input);
  if (mode === "walk_in_guest") return "Walk-in customer";
  if (mode === "anonymous") return "Guest";
  return (input.customerName ?? "").trim() || "Customer";
}

/** Secondary line: real email/phone only; never the internal placeholder domain. */
export function formatCustomerContactSubtitle(input: {
  customerEmail: string | null | undefined;
  customerPhone: string | null | undefined;
}): string | null {
  const phone = (input.customerPhone ?? "").trim();
  const email = (input.customerEmail ?? "").trim();
  if (isPlaceholderKitchenOsEmail(email)) {
    return phone ? phone : "No email captured";
  }
  const parts = [email, phone].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function hasMarketableEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return !isPlaceholderKitchenOsEmail(email);
}
