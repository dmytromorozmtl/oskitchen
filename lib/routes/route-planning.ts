import type { FulfillmentType, OrderStatus } from "@prisma/client";

export type EligibleOrderFilter = {
  userId: string;
  routeDate: Date;
  brandId?: string | null;
  locationId?: string | null;
  fulfillmentType?: FulfillmentType;
  excludeStatuses?: OrderStatus[];
};

export type EligibleOrderIssue =
  | { kind: "MISSING_ADDRESS"; orderId: string }
  | { kind: "NOT_PACKED"; orderId: string };

export function startOfUtcDay(d: Date): Date {
  const c = new Date(d);
  c.setUTCHours(0, 0, 0, 0);
  return c;
}

export function endOfUtcDay(d: Date): Date {
  const c = new Date(d);
  c.setUTCHours(23, 59, 59, 999);
  return c;
}
