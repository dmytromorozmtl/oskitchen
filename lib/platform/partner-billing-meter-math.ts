import type { PartnerBillingMeterKind } from "@prisma/client";

/** Publisher payout share of gross platform meter revenue. */
export function computePartnerPublisherShareCents(input: {
  grossCents: number;
  revenueShareBps: number;
}): number {
  if (input.grossCents <= 0 || input.revenueShareBps <= 0) return 0;
  return Math.round((input.grossCents * input.revenueShareBps) / 10_000);
}

export function sumMeterEventsPublisherShareCents(
  events: Array<{ unitAmountCents: number; quantity: number }>,
  revenueShareBps: number,
): number {
  const gross = events.reduce((sum, row) => sum + row.unitAmountCents * row.quantity, 0);
  return computePartnerPublisherShareCents({ grossCents: gross, revenueShareBps });
}

export function partnerBillingMeterKindLabel(kind: PartnerBillingMeterKind): string {
  switch (kind) {
    case "INSTALL_NEW":
      return "New installs";
    case "INSTALL_ACTIVE":
      return "Active installs";
    case "INSTALL_REVOKED":
      return "Revoked installs";
    case "API_REQUEST":
      return "Partner API requests";
    case "WEBHOOK_DELIVERY":
      return "Webhook deliveries";
    default:
      return String(kind).replace(/_/g, " ").toLowerCase();
  }
}
