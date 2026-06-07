import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditKdsExpediteScreenWiring } from "@/lib/kitchen/kds-expedite-screen-audit";
import {
  buildKdsExpediteQueue,
  KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID,
  KDS_EXPEDITE_SCREEN_HONESTY_MARKERS,
  KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX,
  KDS_EXPEDITE_SCREEN_POLISH_PILLARS,
  KDS_EXPEDITE_SCREEN_ROUTE,
  pickKdsExpediteHeroTicket,
  summarizeKdsExpediteScreen,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import type { KdsPriorityLaneItem } from "@/lib/kitchen/kds-priority-lane-era19";
import { buildKdsRushModeSnapshot } from "@/lib/kitchen/kds-rush-mode";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 109 — QA full coverage for feature 94 expedite screen polish */
const TASK = 109;
const FEATURE = 94;

function laneItem(id: string, rank: number): KdsPriorityLaneItem {
  return {
    order: {
      id,
      status: "PREPARING",
      elapsedSeconds: 900,
      customerName: `Guest ${id}`,
    },
    score: 900,
    reasons: ["overdue_prep"],
    lane: "prep",
    rank,
    ticketNumber: `#${id.slice(0, 4)}`,
    elapsedLabel: "15:00",
    href: `/dashboard/kitchen#ticket-${id}`,
  };
}

describe(`QA full coverage — expedite screen polish (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 109 → feature 94 expedite screen polish", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("kds-expedite-screen");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/kds-expedite-screen-absolute-final.test.ts");
    expect(KDS_EXPEDITE_SCREEN_POLISH_PILLARS).toHaveLength(5);
    expect(KDS_EXPEDITE_SCREEN_ROUTE).toBe("/dashboard/kitchen/expedite");
    expect(KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX).toBe(44);
  });

  it("picks hero ticket from priority routes and builds queue without duplicate", () => {
    const routes = [laneItem("a", 1), laneItem("b", 2), laneItem("c", 3)];
    const hero = pickKdsExpediteHeroTicket(routes);
    expect(hero?.order.id).toBe("a");
    expect(buildKdsExpediteQueue(routes, hero)).toHaveLength(2);
    expect(buildKdsExpediteQueue(routes, hero).every((item) => item.order.id !== "a")).toBe(true);
    expect(buildKdsExpediteQueue([], null)).toEqual([]);
    expect(buildKdsExpediteQueue(routes, null)).toHaveLength(3);
  });

  it("summarizes rush snapshot counts for active and overdue tickets", () => {
    const orders = Array.from({ length: 8 }, (_, i) => ({
      id: `o-${i}`,
      status: "PREPARING" as const,
      elapsedSeconds: 1200,
      createdAt: new Date().toISOString(),
    }));
    const rush = buildKdsRushModeSnapshot(orders);
    const summary = summarizeKdsExpediteScreen(rush);
    expect(summary.activeCount).toBe(8);
    expect(summary.overdueCount).toBeGreaterThan(0);
    expect(rush.priorityRoutes.length).toBeGreaterThan(0);
  });

  it("documents honesty markers — BETA, not rush-hour certified, priority routing", () => {
    const component = readFileSync(
      join(ROOT, "components/kitchen/kds-expedite-screen.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/expedite/page.tsx"), "utf8");
    const combined = `${component}\n${page}`;

    for (const marker of KDS_EXPEDITE_SCREEN_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires expedite UI — hero card, queue grid, RushMode, 44px touch targets, dark mode", () => {
    const component = readFileSync(
      join(ROOT, "components/kitchen/kds-expedite-screen.tsx"),
      "utf8",
    );

    expect(component).toContain('data-testid="kds-expedite-screen"');
    expect(component).toContain('data-testid="kds-expedite-hero"');
    expect(component).toContain('data-testid="kds-expedite-queue"');
    expect(component).toContain('data-testid="kds-expedite-hero-empty"');
    expect(component).toContain("RushMode");
    expect(component).toContain("KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX");
    expect(component).toContain("min-h-[44px]");
    expect(component).toContain("landscape:");
    expect(component).toContain("dark:");
    expect(component).toContain("formatKdsPriorityReasonLabel");
  });

  it("wires expedite page with kitchen.view permission and expo back-link", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/kitchen/expedite/page.tsx"), "utf8");
    const expoPage = readFileSync(join(ROOT, "app/dashboard/kitchen/expo/page.tsx"), "utf8");
    const service = readFileSync(
      join(ROOT, "services/kitchen/kds-expedite-screen-service.ts"),
      "utf8",
    );

    expect(page).toContain("KdsExpediteScreen");
    expect(page).toContain("kitchen.view");
    expect(page).toContain("loadKdsExpediteScreenModel");
    expect(page).toContain("/dashboard/kitchen/expo");
    expect(expoPage).toContain("/dashboard/kitchen/expedite");
    expect(service).toContain("buildKdsRushModeSnapshot");
    expect(service).toContain("pickKdsExpediteHeroTicket");
    expect(service).toContain("getDailyKdsOrders");
  });

  it("covers polish pillars — hero, rush banner, queue, touch targets, tablet landscape", () => {
    const component = readFileSync(
      join(ROOT, "components/kitchen/kds-expedite-screen.tsx"),
      "utf8",
    );
    const pillarMarkers: Record<(typeof KDS_EXPEDITE_SCREEN_POLISH_PILLARS)[number], string> = {
      hero_expedite_ticket: "kds-expedite-hero",
      rush_level_banner: "RushMode",
      priority_expedite_queue: "kds-expedite-queue",
      large_touch_targets: "min-h-[44px]",
      dark_mode_tablet_landscape: "landscape:",
    };

    for (const pillar of KDS_EXPEDITE_SCREEN_POLISH_PILLARS) {
      expect(component).toContain(pillarMarkers[pillar]);
    }
  });

  it("passes base wiring audit and QA slot 109 audit gate", () => {
    const wiring = auditKdsExpediteScreenWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-09-kds-expedite.test.ts",
    );
    expect(KDS_EXPEDITE_SCREEN_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "kds-expedite-screen-absolute-final-v1",
    );
  });
});
