import { describe, expect, it } from "vitest";

import {
  buildToastOrdersQuery,
  externalToastNote,
  mapToastOrderState,
  parseToastOrderRows,
} from "@/services/integrations/toast-sync-service";

describe("toast sync service", () => {
  it("builds idempotent toast order tags", () => {
    expect(externalToastNote("guid-abc")).toBe("toast:order:guid-abc");
  });

  it("maps Toast order states to kitchen status keys", () => {
    expect(mapToastOrderState("CLOSED")).toBe("COMPLETED");
    expect(mapToastOrderState("VOIDED")).toBe("CANCELLED");
    expect(mapToastOrderState("OPEN")).toBe("CONFIRMED");
  });

  it("parses Toast orders API payload with checks and selections", () => {
    const rows = parseToastOrderRows([
      {
        guid: "order-1",
        displayNumber: "1042",
        businessDate: "2026-06-01",
        status: "CLOSED",
        checks: [
          {
            selections: [
              {
                guid: "sel-1",
                displayName: "Burger",
                quantity: 1,
                price: { amount: 14.5 },
              },
            ],
            totalAmount: { amount: 15.75 },
            taxAmount: { amount: 1.25 },
          },
        ],
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("order-1");
    expect(rows[0]?.displayNumber).toBe("1042");
    expect(rows[0]?.lineItems[0]?.name).toBe("Burger");
    expect(rows[0]?.total).toBe(15.75);
  });

  it("builds Toast orders query with yyyy-MM-dd window", () => {
    const start = new Date("2026-05-20T00:00:00.000Z");
    const end = new Date("2026-06-03T00:00:00.000Z");
    const query = buildToastOrdersQuery(start, end);
    expect(query.startDate).toBe("2026-05-20");
    expect(query.endDate).toBe("2026-06-03");
    expect(query.pageSize).toBe(100);
  });
});
