import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  listDefaultKdsStations,
  routeKdsWorkItemToStation,
} from "@/lib/kitchen/kds-multi-station";
import {
  DEFAULT_KDS_STATION_ROUTING_RULES,
  evaluateKdsStationRoutingRules,
  KDS_STATION_ROUTING_RULES_CI_SCRIPTS,
  KDS_STATION_ROUTING_RULES_PANEL_PATH,
  KDS_STATION_ROUTING_RULES_POLICY_ID,
  KDS_STATION_ROUTING_RULES_ROUTE,
  KDS_STATION_ROUTING_RULES_SERVICE_PATH,
  KDS_STATION_ROUTING_RULES_STORAGE_KEY,
  mergeKdsStationRoutingRules,
} from "@/lib/kitchen/kds-station-routing-rules-policy";

const ROOT = process.cwd();

describe("KDS station routing rules (Absolute Final Task 44)", () => {
  it("locks NCR Aloha-parity policy, route, and wiring paths", () => {
    expect(KDS_STATION_ROUTING_RULES_POLICY_ID).toBe(
      "kds-station-routing-rules-absolute-final-v1",
    );
    expect(KDS_STATION_ROUTING_RULES_ROUTE).toBe("/dashboard/kitchen/routing-rules");
    expect(KDS_STATION_ROUTING_RULES_STORAGE_KEY).toBe("kdsStationRoutingRules");
    expect(KDS_STATION_ROUTING_RULES_CI_SCRIPTS).toEqual(["test:ci:kds-station-routing-rules"]);
    expect(DEFAULT_KDS_STATION_ROUTING_RULES.length).toBeGreaterThanOrEqual(9);
  });

  it("evaluates product → category → keyword → default order", () => {
    const rules = mergeKdsStationRoutingRules([
      {
        id: "prod-steak",
        kind: "product",
        match: "prod-ribeye",
        stationName: "Grill",
        priority: 1,
        enabled: true,
        label: "Ribeye override",
      },
      ...DEFAULT_KDS_STATION_ROUTING_RULES,
    ]);

    expect(
      evaluateKdsStationRoutingRules(
        { id: "x", title: "Ribeye steak", productId: "prod-ribeye", productCategory: "SIDES" },
        rules,
      )?.reason,
    ).toBe("rule_product");

    expect(
      evaluateKdsStationRoutingRules(
        { id: "x", title: "House special", productCategory: "MAINS" },
        rules,
      ),
    ).toMatchObject({ stationName: "Grill", reason: "rule_category" });

    expect(
      evaluateKdsStationRoutingRules(
        { id: "x", title: "Neapolitan pizza", productCategory: "OTHER" },
        rules,
      ),
    ).toMatchObject({ stationName: "Pizza", reason: "rule_keyword" });

    expect(
      evaluateKdsStationRoutingRules(
        { id: "x", title: "Mystery item", productCategory: "OTHER" },
        rules,
      ),
    ).toMatchObject({ stationName: "Prep", reason: "rule_default" });
  });

  it("routes work items via rules before legacy keyword routing", () => {
    const registry = listDefaultKdsStations();
    const rules = mergeKdsStationRoutingRules(DEFAULT_KDS_STATION_ROUTING_RULES);

    const friesOnMains = routeKdsWorkItemToStation(
      {
        id: "f1",
        title: "Truffle fries",
        station: null,
        status: "TO_PREP",
        priority: "NORMAL",
        quantity: 1,
        dueAtIso: null,
        createdAtIso: new Date().toISOString(),
        startedAtIso: null,
        productCategory: "MAINS",
      },
      registry,
      rules,
    );

    expect(friesOnMains.routedStation).toBe("Grill");
    expect(friesOnMains.routingReason).toBe("rule");

    const sidesFries = routeKdsWorkItemToStation(
      {
        id: "f2",
        title: "Truffle fries",
        station: null,
        status: "TO_PREP",
        priority: "NORMAL",
        quantity: 1,
        dueAtIso: null,
        createdAtIso: new Date().toISOString(),
        startedAtIso: null,
        productCategory: "SIDES",
      },
      registry,
      rules,
    );

    expect(sidesFries.routedStation).toBe("Fry");
    expect(sidesFries.routingReason).toBe("rule");
  });

  it("ships panel, page, action, and POS routing wiring", () => {
    expect(readFileSync(join(ROOT, KDS_STATION_ROUTING_RULES_PANEL_PATH), "utf8")).toContain(
      "KdsStationRoutingRulesPanel",
    );
    expect(
      readFileSync(join(ROOT, "app/dashboard/kitchen/routing-rules/page.tsx"), "utf8"),
    ).toContain("loadKdsStationRoutingRulesModel");
    expect(readFileSync(join(ROOT, "actions/kitchen/routing-rules.ts"), "utf8")).toContain(
      "toggleKdsRoutingRuleAction",
    );
    expect(
      readFileSync(join(ROOT, "services/pos/pos-kitchen-routing-service.ts"), "utf8"),
    ).toContain("resolveKdsStationForPosLine");
    expect(readFileSync(join(ROOT, KDS_STATION_ROUTING_RULES_SERVICE_PATH), "utf8")).toContain(
      "resolveKdsStationForPosLine",
    );
  });
});
