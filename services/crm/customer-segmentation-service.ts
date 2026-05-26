import type { CustomerStatus, KitchenCustomer } from "@prisma/client";

export type CrmSegmentLabel =
  | "VIP"
  | "NEW"
  | "REPEAT"
  | "AT_RISK"
  | "DORMANT"
  | "HIGH_LTV"
  | "CATERING_LEAD"
  | "SUBSCRIPTION_CANDIDATE"
  | "ALLERGY_SENSITIVE"
  | "DELIVERY_HEAVY";

export function deriveSegmentProposals(
  customer: Pick<
    KitchenCustomer,
    | "status"
    | "type"
    | "lifetimeValueCents"
    | "totalOrders"
    | "lastOrderAt"
    | "preferredFulfillmentType"
    | "allergiesJson"
  >,
): CrmSegmentLabel[] {
  const labels = new Set<CrmSegmentLabel>();
  if (customer.status === "VIP" || customer.status === "ACTIVE") {
    if (customer.lifetimeValueCents >= 400_000) labels.add("VIP");
  }
  if (customer.status === "NEW" || customer.totalOrders <= 1) labels.add("NEW");
  if (customer.totalOrders >= 3) labels.add("REPEAT");
  if (customer.status === "AT_RISK") labels.add("AT_RISK");
  if (customer.status === "INACTIVE") labels.add("DORMANT");
  if (customer.lifetimeValueCents >= 250_000) labels.add("HIGH_LTV");
  if (customer.preferredFulfillmentType === "DELIVERY") labels.add("DELIVERY_HEAVY");
  if (
    customer.type === "COMPANY" ||
    customer.type === "CATERING_CLIENT" ||
    customer.type === "EVENT_CLIENT"
  ) {
    labels.add("CATERING_LEAD");
  }
  if (allergiesPresent(customer.allergiesJson)) labels.add("ALLERGY_SENSITIVE");
  return [...labels];
}

function allergiesPresent(json: unknown): boolean {
  if (Array.isArray(json)) return json.length > 0;
  if (json && typeof json === "object") return Object.keys(json as Record<string, unknown>).length > 0;
  return false;
}

export function statusDrivesSegment(status: CustomerStatus): CrmSegmentLabel | null {
  if (status === "VIP") return "VIP";
  if (status === "AT_RISK") return "AT_RISK";
  if (status === "INACTIVE") return "DORMANT";
  if (status === "NEW") return "NEW";
  return null;
}
