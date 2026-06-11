import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildBriefingFirstNarrative } from "@/lib/briefing/briefing-first-narrative";
import {
  auditBriefingFirstDesign,
  formatBriefingFirstDesignAuditLines,
} from "@/lib/design/briefing-first-design-audit";
import {
  BRIEFING_FIRST_DESIGN_AUDIT_SCRIPT,
  BRIEFING_FIRST_DESIGN_CI_WORKFLOW,
  BRIEFING_FIRST_DESIGN_NPM_SCRIPT,
  BRIEFING_FIRST_DESIGN_POLICY_ID,
  BRIEFING_FIRST_DESIGN_UNIT_TEST,
  BRIEFING_FIRST_NARRATIVE_EXAMPLE,
  BRIEFING_FIRST_NARRATIVE_MODULE,
} from "@/lib/design/briefing-first-design-policy";

const ROOT = process.cwd();

describe("briefing-first design (P1-65)", () => {
  it("locks policy id and example narrative format", () => {
    expect(BRIEFING_FIRST_DESIGN_POLICY_ID).toBe("briefing-first-design-p1-65-v1");
    expect(BRIEFING_FIRST_NARRATIVE_EXAMPLE).toBe(
      "Yesterday +12%. DoorDash orders. Next: menu mix.",
    );
  });

  it("builds three-segment narrative from briefing metrics", () => {
    const narrative = buildBriefingFirstNarrative({
      ordersToday: 42,
      revenueToday: 1200,
      revenueWeek: 7000,
      revenueYesterday: 1000,
      posTransactionsToday: 18,
      integrationHealth: {
        healthHref: "/dashboard/integration-health",
        overall: "healthy",
        headline: "All integrations healthy",
        healthyCount: 2,
        degradedCount: 0,
        downCount: 0,
        failedWebhookCount: 0,
        liveProofUrgentCount: 0,
        pendingLiveSmokeCount: 0,
        channelSmokeOverall: null,
        channelSmokeProofStatus: null,
        connections: [
          {
            id: "1",
            provider: "doordash",
            name: "DoorDash",
            status: "CONNECTED",
            lastSyncLabel: "just now",
            hasError: false,
          },
        ],
        liveProofRows: [],
        allClear: true,
      },
      nextActionTitle: "Review menu mix",
    });

    expect(narrative.performance).toBe("Yesterday +20%");
    expect(narrative.insight).toBe("DoorDash orders");
    expect(narrative.next).toBe("Review menu mix");
    expect(narrative.formatted).toBe(
      "Yesterday +20%. DoorDash orders. Next: Review menu mix.",
    );
  });

  it("ships narrative builder module", () => {
    const source = readFileSync(join(ROOT, BRIEFING_FIRST_NARRATIVE_MODULE), "utf8");
    expect(source).toContain("buildBriefingFirstNarrative");
    expect(source).toContain("Next:");
  });

  it("passes full briefing-first design audit", () => {
    const summary = auditBriefingFirstDesign(ROOT);
    expect(summary.heroModulePresent).toBe(true);
    expect(summary.narrativeModulePresent).toBe(true);
    expect(summary.narrativeBuilderWired).toBe(true);
    expect(summary.narrativeStripWired).toBe(true);
    expect(summary.narrativeTokensWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, BRIEFING_FIRST_DESIGN_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BRIEFING_FIRST_DESIGN_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BRIEFING_FIRST_DESIGN_NPM_SCRIPT]).toContain(
      "audit-briefing-first-design.ts",
    );
    expect(pkg.scripts?.["test:ci:briefing-first-design"]).toContain(
      BRIEFING_FIRST_DESIGN_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, BRIEFING_FIRST_DESIGN_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:briefing-first-design");
  });

  it("formats audit lines", () => {
    const summary = auditBriefingFirstDesign(ROOT);
    const lines = formatBriefingFirstDesignAuditLines(summary);
    expect(lines.some((line) => line.includes(BRIEFING_FIRST_DESIGN_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
