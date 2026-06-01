import type { MarketplacePOStatus } from "@prisma/client";

export const MARKETPLACE_PO_STATUSES: MarketplacePOStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "DISPUTED",
  "CANCELLED",
];

export function marketplaceOrderStatusLabel(status: MarketplacePOStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export type MarketplaceOrderTimelineStep = {
  key: string;
  label: string;
  state: "complete" | "current" | "upcoming" | "skipped";
  at?: string | null;
  detail?: string | null;
};

const FLOW: MarketplacePOStatus[] = [
  "SUBMITTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

export function buildMarketplaceOrderTimeline(input: {
  status: MarketplacePOStatus;
  createdAt: Date;
  approvedAt?: Date | null;
  confirmedDeliveryDate?: Date | null;
  trackingNumber?: string | null;
}): MarketplaceOrderTimelineStep[] {
  const steps: MarketplaceOrderTimelineStep[] = [
    {
      key: "created",
      label: "Order placed",
      state: "complete",
      at: input.createdAt.toISOString(),
    },
  ];

  if (input.status === "PENDING_APPROVAL") {
    steps.push({
      key: "approval",
      label: "Awaiting approval",
      state: "current",
    });
    return steps;
  }

  if (input.approvedAt) {
    steps.push({
      key: "approval",
      label: "Approved",
      state: "complete",
      at: input.approvedAt.toISOString(),
    });
  }

  if (input.status === "CANCELLED") {
    steps.push({
      key: "cancelled",
      label: "Cancelled",
      state: "current",
    });
    return steps;
  }

  if (input.status === "DISPUTED") {
    steps.push({
      key: "disputed",
      label: "Dispute opened",
      state: "current",
    });
    return steps;
  }

  const currentIndex = FLOW.indexOf(input.status);
  for (const status of FLOW) {
    const index = FLOW.indexOf(status);
    let state: MarketplaceOrderTimelineStep["state"] = "upcoming";
    if (currentIndex >= index) state = "complete";
    if (input.status === status) state = "current";

    const step: MarketplaceOrderTimelineStep = {
      key: status.toLowerCase(),
      label: marketplaceOrderStatusLabel(status),
      state,
    };

    if (status === "SHIPPED" && input.trackingNumber) {
      step.detail = `Tracking ${input.trackingNumber}`;
    }
    if (status === "DELIVERED" && input.confirmedDeliveryDate) {
      step.at = input.confirmedDeliveryDate.toISOString();
    }

    steps.push(step);
  }

  return steps;
}

export function marketplaceOrderStatusBadgeVariant(
  status: MarketplacePOStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
    case "DELIVERED":
      return "default";
    case "PENDING_APPROVAL":
    case "DISPUTED":
      return "destructive";
    case "CANCELLED":
    case "DRAFT":
      return "outline";
    default:
      return "secondary";
  }
}
