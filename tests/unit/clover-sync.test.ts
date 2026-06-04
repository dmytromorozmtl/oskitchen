import { describe, expect, it } from "vitest";

import {
  buildCloverOrdersFilter,
  externalCloverNote,
  mapCloverOrderState,
  moneyCentsToDecimal,
  parseCloverOrderRows,
} from "@/services/integrations/clover-sync-service";

describe("clover sync service", () => {
  it("builds idempotent clover order tags", () => {
    expect(externalCloverNote("abc123")).toBe("clover:order:abc123");
  });

  it("converts Clover money cents to decimal dollars", () => {
    expect(moneyCentsToDecimal(850)).toBe(8.5);
    expect(moneyCentsToDecimal(undefined)).toBe(0);
  });

  it("maps Clover order states to kitchen status keys", () => {
    expect(mapCloverOrderState("paid")).toBe("COMPLETED");
    expect(mapCloverOrderState("voided")).toBe("CANCELLED");
    expect(mapCloverOrderState("open")).toBe("CONFIRMED");
  });

  it("parses Clover orders API payload with line item elements", () => {
    const rows = parseCloverOrderRows({
      elements: [
        {
          id: "order-1",
          state: "paid",
          createdTime: 1_718_000_000_000,
          total: 1850,
          taxAmount: 150,
          lineItems: {
            elements: [
              {
                id: "line-1",
                name: "Tacos",
                unitQty: 2,
                price: 850,
              },
            ],
          },
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("order-1");
    expect(rows[0]?.totalCents).toBe(1850);
    expect(rows[0]?.lineItems[0]?.name).toBe("Tacos");
    expect(rows[0]?.lineItems[0]?.quantity).toBe(2);
  });

  it("builds Clover createdTime filter from start date", () => {
    const start = new Date("2026-05-20T00:00:00.000Z");
    expect(buildCloverOrdersFilter(start)).toBe(`createdTime>=${start.getTime()}`);
  });
});
