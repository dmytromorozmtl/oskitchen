import type { PackingVerificationItemStatus, PackingVerificationSessionStatus } from "@prisma/client";

export const SESSION_STATUS_LABEL: Record<PackingVerificationSessionStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  PASSED: "Passed",
  FAILED: "Failed",
  PARTIAL: "Partial",
  OVERRIDDEN: "Overridden",
  CANCELLED: "Cancelled",
};

export const ITEM_STATUS_LABEL: Record<PackingVerificationItemStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  MISSING: "Missing",
  EXTRA: "Extra",
  WRONG_ITEM: "Wrong item",
  DAMAGED: "Damaged",
  SUBSTITUTED: "Substituted",
};

export function itemStatusTone(
  status: PackingVerificationItemStatus,
): "default" | "secondary" | "destructive" | "outline" | "success" {
  switch (status) {
    case "VERIFIED":
    case "SUBSTITUTED":
      return "success";
    case "MISSING":
    case "WRONG_ITEM":
    case "DAMAGED":
      return "destructive";
    default:
      return "outline";
  }
}
