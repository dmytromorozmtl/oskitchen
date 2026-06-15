import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditKitchenSlaTimers,
  formatKitchenSlaTimersAuditLines,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-audit";
import { KITCHEN_SLA_TIMERS_CAPABILITIES } from "@/lib/kitchen/kitchen-sla-timers-p2-92-content";
import {
  buildKitchenSlaReport,
  buildKitchenSlaTickets,
  computeAvgPrepTimeSeconds,
  detectKitchenSlaBottleneck,
  KITCHEN_SLA_GREEN_MAX_SECONDS,
  KITCHEN_SLA_YELLOW_MAX_SECONDS,
  resolveKitchenSlaTimerLevel,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-operations";
import {
  KITCHEN_SLA_TIMERS_CAPABILITY_COUNT,
  KITCHEN_SLA_TIMERS_CI_WORKFLOW,
  KITCHEN_SLA_TIMERS_DOC,
  KITCHEN_SLA_TIMERS_NPM_SCRIPT,
  KITCHEN_SLA_TIMERS_POLICY_ID,
  KITCHEN_SLA_TIMERS_ROUTE,
  KITCHEN_SLA_TIMERS_UNIT_TEST,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-policy";
import type { ProductionStationSnapshot } from "@/lib/kitchen/kds-production-view";

const ROOT = process.cwd();

const sampleStation = (overrides: Partial<ProductionStationSnapshot> = {}): ProductionStationSnapshot => ({
  station: "Grill",
  activeItems: 4,
  inProgressItems: 2,
  queuedItems: 2,
  overdueItems: 1,
  loadScore: 80,
  loadPercent: 80,
  estimatedClearMinutes: 12,
  avgWaitMinutes: 8,
  isBottleneck: true,
  items: [],
  ...overrides,
});

describe("Kitchen SLA timers (P2-92)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(KITCHEN_SLA_TIMERS_POLICY_ID).toBe("kitchen-sla-timers-p2-92-v1");
    expect(KITCHEN_SLA_TIMERS_ROUTE).toBe("/dashboard/kitchen/sla");
    expect(KITCHEN_SLA_TIMERS_CAPABILITY_COUNT).toBe(3);
    expect(KITCHEN_SLA_TIMERS_CAPABILITIES).toHaveLength(3);
  });

  it("passes full kitchen SLA timers audit", () => {
    const summary = auditKitchenSlaTimers(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyQueueClarityLinked).toBe(true);
    expect(summary.legacyProductionViewLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("resolves green, yellow, and red timer levels", () => {
    expect(resolveKitchenSlaTimerLevel(KITCHEN_SLA_GREEN_MAX_SECONDS - 1)).toBe("green");
    expect(resolveKitchenSlaTimerLevel(KITCHEN_SLA_GREEN_MAX_SECONDS)).toBe("yellow");
    expect(resolveKitchenSlaTimerLevel(KITCHEN_SLA_YELLOW_MAX_SECONDS)).toBe("red");
  });

  it("computes avg prep time for preparing tickets only", () => {
    const avg = computeAvgPrepTimeSeconds([
      { elapsedSeconds: 120, status: "PREPARING" },
      { elapsedSeconds: 180, status: "PREPARING" },
      { elapsedSeconds: 60, status: "READY" },
    ]);
    expect(avg).toBe(150);
  });

  it("detects bottleneck and builds SLA report", () => {
    const tickets = buildKitchenSlaTickets([
      {
        id: "order-1",
        status: "PREPARING",
        elapsedSeconds: 420,
        createdAt: "2026-06-09T12:00:00.000Z",
      },
      {
        id: "order-2",
        status: "READY",
        elapsedSeconds: 720,
        createdAt: "2026-06-09T11:00:00.000Z",
      },
    ]);

    expect(tickets[0]?.level).toBe("yellow");

    const bottleneck = detectKitchenSlaBottleneck([
      sampleStation(),
      sampleStation({ station: "Fry", loadPercent: 40, isBottleneck: false, overdueItems: 0 }),
    ]);
    expect(bottleneck?.station).toBe("Grill");

    const report = buildKitchenSlaReport(
      [
        {
          id: "order-1",
          status: "PREPARING",
          elapsedSeconds: 420,
          createdAt: "2026-06-09T12:00:00.000Z",
        },
      ],
      [sampleStation()],
    );
    expect(report.levelCounts.yellow).toBe(1);
    expect(report.bottleneck?.station).toBe("Grill");
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[KITCHEN_SLA_TIMERS_NPM_SCRIPT]).toContain("audit-kitchen-sla-timers.ts");
    expect(pkg.scripts["test:ci:kitchen-sla-timers"]).toContain(KITCHEN_SLA_TIMERS_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, KITCHEN_SLA_TIMERS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(KITCHEN_SLA_TIMERS_NPM_SCRIPT);

    expect(existsSync(join(ROOT, KITCHEN_SLA_TIMERS_DOC))).toBe(true);
    expect(formatKitchenSlaTimersAuditLines(auditKitchenSlaTimers(ROOT)).length).toBeGreaterThan(5);
  });
});
