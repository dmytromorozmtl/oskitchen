import { describe, expect, it } from "vitest";

import {
  buildLightspeedSalesQuery,
  externalLightspeedNote,
  mapLightspeedOrderState,
  parseLightspeedOrderRows,
} from "@/services/integrations/lightspeed-sync-service";

describe("lightspeed sync service", () => {
  it("builds idempotent lightspeed order tags", () => {
    expect(externalLightspeedNote("sale-99")).toBe("lightspeed:order:sale-99");
  });

  it("maps Lightspeed sale states to kitchen status keys", () => {
    expect(mapLightspeedOrderState("CLOSED")).toBe("COMPLETED");
    expect(mapLightspeedOrderState("VOIDED")).toBe("CANCELLED");
    expect(mapLightspeedOrderState("OPEN")).toBe("CONFIRMED");
  });

  it("parses Lightspeed sales API payload with line items", () => {
    const rows = parseLightspeedOrderRows({
      data: [
        {
          id: "sale-1",
          status: "CLOSED",
          total: 42.5,
          tax: 3.5,
          subtotal: 39,
          lines: [
            {
              id: "line-1",
              name: "Pasta",
              quantity: 1,
              unitPrice: 39,
            },
          ],
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("sale-1");
    expect(rows[0]?.total).toBe(42.5);
    expect(rows[0]?.lineItems[0]?.name).toBe("Pasta");
  });

  it("builds Lightspeed sales query with ISO window", () => {
    const start = new Date("2026-05-20T00:00:00.000Z");
    const end = new Date("2026-06-03T00:00:00.000Z");
    const query = buildLightspeedSalesQuery(start, end);
    expect(query.from).toBe(start.toISOString());
    expect(query.to).toBe(end.toISOString());
    expect(query.pageSize).toBe(100);
  });
});
