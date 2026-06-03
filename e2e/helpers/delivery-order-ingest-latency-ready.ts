import { test } from "@playwright/test";

export function skipDeliveryOrderIngestLatencyIfNotAuthed(): void {
  if (!process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim()) {
    test.skip(
      true,
      "Delivery order ingest latency UI E2E SKIPPED — missing E2E_LOGIN_EMAIL / E2E_LOGIN_PASSWORD",
    );
  }
}

export const hasDeliveryOrderIngestLatencyDb = Boolean(process.env.DATABASE_URL?.trim());

export function skipDeliveryOrderIngestLatencyIfNoDb(): void {
  if (!hasDeliveryOrderIngestLatencyDb) {
    test.skip(true, "Delivery order ingest latency E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipDeliveryOrderIngestLatencyHttpIfNoBaseUrl(): void {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    test.skip(
      true,
      "Delivery order ingest HTTP E2E SKIPPED — set PLAYWRIGHT_BASE_URL (running app required)",
    );
  }
}

/** Sample DoorDash delivery webhook payload for latency probes. */
export function sampleDoorDashDeliveryPayload(stamp: string): Record<string, unknown> {
  return {
    event_id: `dd-evt-${stamp}`,
    order: {
      id: `dd-order-${stamp}`,
      status: "confirmed",
      total: 3200,
      customer: { name: "Delivery Guest" },
      delivery: { address: "456 Market St" },
      items: [{ name: "Combo", quantity: 1, price: 3200 }],
    },
  };
}

/** Sample Grubhub delivery webhook payload for latency probes. */
export function sampleGrubhubDeliveryPayload(stamp: string): Record<string, unknown> {
  return {
    event_id: `gh-evt-${stamp}`,
    order_id: `gh-order-${stamp}`,
    status: "CONFIRMED",
    total: 2800,
    customer: { name: "Grubhub Guest" },
    delivery_address: { formatted: "789 Oak Ave" },
    line_items: [{ name: "Wrap", quantity: 1, price: 2800 }],
  };
}

/** Sample Uber Eats delivery webhook payload for latency probes. */
export function sampleUberEatsDeliveryPayload(stamp: string): Record<string, unknown> {
  return {
    event_id: `ue-evt-${stamp}`,
    meta: { resource_id: `ue-order-${stamp}` },
    order: {
      id: `ue-order-${stamp}`,
      current_state: "CONFIRMED",
      payment: { charges: { total: { amount: 4100 } } },
      eater: { first_name: "Uber", last_name: "Guest" },
      deliveries: [{ location: { address: "101 Pine St" } }],
      cart: { items: [{ title: "Burger", quantity: 1, price: 4100 }] },
    },
  };
}
