/**
 * KDS bump → packing verify → delivery route E2E policy (QA-16).
 *
 * @see e2e/kds-bump-packing-route.spec.ts
 * @see docs/PACKING_VERIFICATION.md
 * @see app/dashboard/routes/planner/page.tsx
 */

export const KDS_BUMP_PACKING_ROUTE_E2E_POLICY_ID =
  "kds-bump-packing-route-e2e-v1" as const;

export const KDS_BUMP_PACKING_ROUTE_TICKET_VISIBLE_MS = 15_000 as const;

export const KDS_KITCHEN_PATH = "/dashboard/kitchen" as const;
export const PACKING_VERIFY_PATH = "/dashboard/packing/verify" as const;
export const ROUTES_PLANNER_PATH = "/dashboard/routes/planner" as const;
export const ROUTES_OVERVIEW_PATH = "/dashboard/routes" as const;

export const KDS_BUMP_READY_STATUS = "READY" as const;

export const ROUTE_BUILD_FULFILLMENT_TYPE = "DELIVERY" as const;

export function kdsBumpPackingRouteTicketTestId(orderId: string): string {
  return `kds-ticket-${orderId}`;
}

/** Delivery orders with a fulfillment day are eligible for route-by-date build. */
export function isDeliveryRouteBuildEligible(input: {
  fulfillmentType: string;
  pickupDate: Date | null;
  status: string;
}): boolean {
  if (input.fulfillmentType !== ROUTE_BUILD_FULFILLMENT_TYPE) return false;
  if (!input.pickupDate) return false;
  return input.status !== "CANCELLED" && input.status !== "COMPLETED";
}
