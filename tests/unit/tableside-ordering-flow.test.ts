import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assessTablesideOrderingReadiness,
  inferTablesideFlowStep,
  TABLESIDE_FLOW_STEPS,
  TABLESIDE_ORDERING_FLOW_POLICY_ID,
  TABLESIDE_ORDERING_ROUTE,
  tablesideOrderHref,
} from "@/lib/pos/tableside-ordering-flow-policy";

const ROOT = process.cwd();

describe("tableside ordering flow (Absolute Final Task 42)", () => {
  it("locks TouchBistro-parity flow policy and five steps", () => {
    expect(TABLESIDE_ORDERING_FLOW_POLICY_ID).toBe("tableside-ordering-flow-absolute-final-v1");
    expect(TABLESIDE_ORDERING_ROUTE).toBe("/dashboard/pos/handheld");
    expect(TABLESIDE_FLOW_STEPS.map((step) => step.id)).toEqual([
      "select_table",
      "open_tab",
      "add_items",
      "fire_kds",
      "pay_close",
    ]);
  });

  it("infers current flow step from waiter state", () => {
    expect(
      inferTablesideFlowStep({
        selectedTableId: null,
        hasOpenTab: false,
        tabItemCount: 0,
        cartLineCount: 0,
        lastKdsOrderId: null,
      }),
    ).toBe("select_table");

    expect(
      inferTablesideFlowStep({
        selectedTableId: "t1",
        hasOpenTab: false,
        tabItemCount: 0,
        cartLineCount: 0,
        lastKdsOrderId: null,
      }),
    ).toBe("open_tab");

    expect(
      inferTablesideFlowStep({
        selectedTableId: "t1",
        hasOpenTab: true,
        tabItemCount: 0,
        cartLineCount: 2,
        lastKdsOrderId: null,
      }),
    ).toBe("fire_kds");

    expect(
      inferTablesideFlowStep({
        selectedTableId: "t1",
        hasOpenTab: true,
        tabItemCount: 3,
        cartLineCount: 0,
        lastKdsOrderId: "order-1",
      }),
    ).toBe("pay_close");
  });

  it("builds deep link href for floor plan → handheld tableside order", () => {
    expect(tablesideOrderHref()).toBe("/dashboard/pos/handheld");
    expect(tablesideOrderHref("abc-123")).toBe("/dashboard/pos/handheld?tableId=abc-123");
  });

  it("assesses readiness blockers for tableside ordering", () => {
    const ready = assessTablesideOrderingReadiness({
      tableCount: 8,
      registerCount: 1,
      staffCount: 2,
      productCount: 40,
    });
    expect(ready.ready).toBe(true);
    expect(ready.blockers).toEqual([]);

    const blocked = assessTablesideOrderingReadiness({
      tableCount: 0,
      registerCount: 0,
      staffCount: 0,
      productCount: 0,
    });
    expect(blocked.ready).toBe(false);
    expect(blocked.blockers.length).toBe(4);
  });

  it("wires flow strip into handheld ordering client", () => {
    const client = readFileSync(
      join(ROOT, "components/pos/handheld-ordering-client.tsx"),
      "utf8",
    );
    expect(client).toContain("TablesideOrderingFlowStrip");
    expect(client).toContain("fireHandheldToKdsAction");
    expect(client).toContain('data-testid="tableside-ordering-root"');
    expect(client).toContain('data-testid="handheld-ordering-root"');
  });

  it("accepts tableId deep link on handheld page", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/pos/handheld/page.tsx"), "utf8");
    expect(page).toContain("initialTableId={tableId");
    expect(page).toContain("searchParams");
  });

  it("links floor plan tables to tableside ordering", () => {
    const floorPlan = readFileSync(join(ROOT, "components/restaurant/floor-plan.tsx"), "utf8");
    expect(floorPlan).toContain("tablesideOrderHref");
    expect(floorPlan).toContain('data-testid="floor-plan-tableside-order-link"');
  });

  it("loads readiness via tableside ordering flow service", () => {
    const service = readFileSync(
      join(ROOT, "services/pos/tableside-ordering-flow-service.ts"),
      "utf8",
    );
    expect(service).toContain("loadTablesideOrderingFlowModel");
    expect(service).toContain("loadHandheldOrderingBootstrap");
  });
});
