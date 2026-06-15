import type { ProductMappingStatus, ProductModifierMappingStatus } from "@prisma/client";

export const PRODUCT_MAPPING_STATUS_LABEL: Record<ProductMappingStatus, string> = {
  UNMAPPED: "Unmapped",
  SUGGESTED: "Suggested",
  NEEDS_REVIEW: "Needs review",
  APPROVED: "Approved",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  IGNORED: "Ignored",
  CONFLICT: "Conflict",
  ARCHIVED: "Archived",
};

export const PRODUCT_MAPPING_STATUS_TONE: Record<
  ProductMappingStatus,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  UNMAPPED: "warning",
  SUGGESTED: "info",
  NEEDS_REVIEW: "warning",
  APPROVED: "success",
  CONFIRMED: "success",
  REJECTED: "danger",
  IGNORED: "neutral",
  CONFLICT: "danger",
  ARCHIVED: "neutral",
};

const APPROVED_STATUSES: ProductMappingStatus[] = ["APPROVED", "CONFIRMED"];
const TERMINAL_STATUSES: ProductMappingStatus[] = [
  "APPROVED",
  "CONFIRMED",
  "REJECTED",
  "IGNORED",
  "ARCHIVED",
];

export function isApprovedStatus(status: ProductMappingStatus): boolean {
  return APPROVED_STATUSES.includes(status);
}

export function isTerminalStatus(status: ProductMappingStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isReviewable(status: ProductMappingStatus): boolean {
  return status === "SUGGESTED" || status === "NEEDS_REVIEW" || status === "UNMAPPED" || status === "CONFLICT";
}

export const PRODUCT_MODIFIER_STATUS_LABEL: Record<ProductModifierMappingStatus, string> = {
  UNMAPPED: "Unmapped",
  SUGGESTED: "Suggested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IGNORED: "Ignored",
};
