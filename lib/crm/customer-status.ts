import type { CustomerStatus } from "@prisma/client";

export const CUSTOMER_STATUS_VALUES = [
  "ACTIVE",
  "NEW",
  "VIP",
  "AT_RISK",
  "INACTIVE",
  "BLOCKED",
  "ARCHIVED",
] as const satisfies readonly CustomerStatus[];

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: "Active",
  NEW: "New",
  VIP: "VIP",
  AT_RISK: "At risk",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  ARCHIVED: "Archived",
};

export const CUSTOMER_STATUS_BADGE: Record<CustomerStatus, "default" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: "default",
  NEW: "secondary",
  VIP: "default",
  AT_RISK: "outline",
  INACTIVE: "outline",
  BLOCKED: "destructive",
  ARCHIVED: "destructive",
};

/** Statuses that should be treated as "do not contact" for marketing. */
export const CUSTOMER_STATUS_BLOCKED_FOR_MARKETING: readonly CustomerStatus[] = ["BLOCKED", "ARCHIVED"];

export function isMarketingEligible(status: CustomerStatus, marketingConsent: boolean): boolean {
  if (CUSTOMER_STATUS_BLOCKED_FOR_MARKETING.includes(status)) return false;
  return marketingConsent;
}
