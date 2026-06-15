import type { MarketplaceDisputeReason, MarketplaceDisputeStatus } from "@prisma/client";

export const MARKETPLACE_DISPUTE_STATUSES: MarketplaceDisputeStatus[] = [
  "OPEN",
  "VENDOR_RESPONSE",
  "ADMIN_REVIEW",
  "RESOLVED",
];

export const MARKETPLACE_DISPUTE_REASONS: MarketplaceDisputeReason[] = [
  "DAMAGED",
  "NOT_AS_DESCRIBED",
  "WRONG_ITEM",
  "DEFECTIVE",
  "NOT_DELIVERED",
  "OVERAGE",
];

export function disputeStatusLabel(status: MarketplaceDisputeStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function disputeReasonLabel(reason: MarketplaceDisputeReason): string {
  return reason
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function disputeStatusBadgeVariant(
  status: MarketplaceDisputeStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "RESOLVED":
      return "default";
    case "OPEN":
      return "destructive";
    case "ADMIN_REVIEW":
      return "secondary";
    default:
      return "outline";
  }
}

export type DisputeResolutionDecision = "refund" | "pay_vendor" | "split";

export type DisputeResolutionEntry = {
  decision: DisputeResolutionDecision;
  buyerAmount: number;
  vendorAmount: number;
  notes: string;
  resolvedById: string;
  resolvedByEmail: string | null;
  resolvedAt: string;
};

export type StoredDisputeResolution = {
  current: DisputeResolutionEntry;
  history: DisputeResolutionEntry[];
};

export function parseDisputeResolution(raw: string | null | undefined): StoredDisputeResolution | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as StoredDisputeResolution;
    if (parsed?.current?.decision) return parsed;
  } catch {
    return {
      current: {
        decision: "split",
        buyerAmount: 0,
        vendorAmount: 0,
        notes: raw,
        resolvedById: "legacy",
        resolvedByEmail: null,
        resolvedAt: new Date().toISOString(),
      },
      history: [],
    };
  }
  return null;
}

export function serializeDisputeResolution(
  existing: string | null | undefined,
  entry: DisputeResolutionEntry,
): string {
  const parsed = parseDisputeResolution(existing);
  const history = parsed ? [...parsed.history, parsed.current] : [];
  return JSON.stringify({ current: entry, history } satisfies StoredDisputeResolution);
}
