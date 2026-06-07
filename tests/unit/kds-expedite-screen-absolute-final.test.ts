import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKdsExpediteScreenWiring } from "@/lib/kitchen/kds-expedite-screen-audit";
import {
  buildKdsExpediteQueue,
  KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
  KDS_EXPEDITE_SCREEN_CI_SCRIPTS,
  KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX,
  KDS_EXPEDITE_SCREEN_POLISH_PILLARS,
  KDS_EXPEDITE_SCREEN_ROUTE,
  KDS_EXPEDITE_SCREEN_UNIT_TEST,
  pickKdsExpediteHeroTicket,
  summarizeKdsExpediteScreen,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import { buildKdsRushModeSnapshot } from "@/lib/kitchen/kds-rush-mode";
import type { KdsPriorityLaneItem, KdsPriorityTicket } from "@/lib/kitchen/kds-priority-lane-era19";

const ROOT = process.cwd();

function laneItem(id: string, rank: number): KdsPriorityLaneItem {
  return {
    order: {
      id,
      status: "PREPARING",
      elapsedSeconds: 900,
      customerName: `Guest ${id}`,
    } as KdsPriorityTicket,
    score: 900,
    reasons: ["overdue_prep"],
    lane: "prep",
    rank,
    ticketNumber: `#${id.slice(0, 4)}`,
    elapsedLabel: "15:00",
    href: `/dashboard/kitchen#ticket-${id}`,
  };
}

describe("KDS expedite screen (Absolute Final Task 94)", () => {
  it("locks absolute final policy and /dashboard/kitchen/expedite route", () => {
    expect(KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-expedite-screen-absolute-final-v1",
    );
    expect(KDS_EXPEDITE_SCREEN_ROUTE).toBe("/dashboard/kitchen/expedite");
    expect(KDS_EXPEDITE_SCREEN_POLISH_PILLARS).toHaveLength(5);
    expect(KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX).toBe(44);
  });

  it("picks hero ticket and builds queue without duplicate", () => {
    const routes = [laneItem("a", 1), laneItem("b", 2), laneItem("c", 3)];
    const hero = pickKdsExpediteHeroTicket(routes);
    expect(hero?.order.id).toBe("a");
    const queue = buildKdsExpediteQueue(routes, hero);
    expect(queue).toHaveLength(2);
    expect(queue.every((item) => item.order.id !== "a")).toBe(true);
  });

  it("summarizes rush snapshot counts", () => {
    const orders: KdsPriorityTicket[] = Array.from({ length: 8 }, (_, i) => ({
      id: `o-${i}`,
      status: "PREPARING",
      elapsedSeconds: 1200,
      createdAt: new Date().toISOString(),
    }));
    const rush = buildKdsRushModeSnapshot(orders);
    const summary = summarizeKdsExpediteScreen(rush);
    expect(summary.activeCount).toBe(8);
    expect(summary.overdueCount).toBeGreaterThan(0);
  });

  it("passes wiring audit", () => {
    const audit = auditKdsExpediteScreenWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of KDS_EXPEDITE_SCREEN_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(KDS_EXPEDITE_SCREEN_UNIT_TEST).toBe(
      "tests/unit/kds-expedite-screen-absolute-final.test.ts",
    );
  });
});
