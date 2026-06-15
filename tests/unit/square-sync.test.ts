import { describe, expect, it } from "vitest";

import {
  buildSquareOrderSearchBody,
  externalSquareNote,
  mapSquareOrderState,
  moneyCentsToDecimal,
  parseSquareOrderRows,
} from "@/services/integrations/square-sync-service";

describe("square sync service", () => {
  it("builds idempotent square order tags", () => {
    expect(externalSquareNote("abc123")).toBe("square:order:abc123");
  });

  it("converts Square money cents to decimal dollars", () => {
    expect(moneyCentsToDecimal(1299)).toBe(12.99);
    expect(moneyCentsToDecimal(null)).toBe(0);
  });

  it("maps Square order states to kitchen status keys", () => {
    expect(mapSquareOrderState("COMPLETED")).toBe("COMPLETED");
    expect(mapSquareOrderState("CANCELED")).toBe("CANCELLED");
    expect(mapSquareOrderState("OPEN")).toBe("CONFIRMED");
  });

  it("parses Square orders search payload", () => {
    const rows = parseSquareOrderRows({
      orders: [
        {
          id: "order-1",
          location_id: "LOC1",
          state: "OPEN",
          created_at: "2026-06-01T12:00:00Z",
          total_money: { amount: 2500, currency: "USD" },
          total_tax_money: { amount: 200, currency: "USD" },
          line_items: [
            {
              uid: "line-1",
              name: "Latte",
              quantity: "2",
              base_price_money: { amount: 1150, currency: "USD" },
            },
          ],
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("order-1");
    expect(rows[0]?.totalCents).toBe(2500);
    expect(rows[0]?.lineItems[0]?.name).toBe("Latte");
    expect(rows[0]?.lineItems[0]?.quantity).toBe(2);
  });

  it("builds Square order search body with 14-day window inputs", () => {
    const start = new Date("2026-05-20T00:00:00.000Z");
    const end = new Date("2026-06-03T00:00:00.000Z");
    const body = buildSquareOrderSearchBody("LOC123", start, end);
    expect(body.location_ids).toEqual(["LOC123"]);
    expect(body.query.filter.state_filter.states).toEqual(["OPEN", "COMPLETED"]);
    expect(body.query.filter.date_time_filter.created_at.start_at).toBe(start.toISOString());
  });
});
