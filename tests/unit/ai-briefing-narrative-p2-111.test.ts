import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiBriefingNarrativeP2_111,
  formatAiBriefingNarrativeP2_111AuditLines,
} from "@/lib/ai/ai-briefing-narrative-p2-111-audit";
import { AI_BRIEFING_NARRATIVE_P2_111_SECTIONS } from "@/lib/ai/ai-briefing-narrative-p2-111-content";
import {
  AI_BRIEFING_NARRATIVE_DEMO_INPUT,
  buildAiBriefingNarrativeDemoReport,
  buildChannelMixSection,
  buildNextStepSection,
  buildYesterdaySection,
  composeBriefingNarrative,
  matchesCanonicalBriefingPattern,
} from "@/lib/ai/ai-briefing-narrative-p2-111-operations";
import {
  AI_BRIEFING_NARRATIVE_P2_111_CI_WORKFLOW,
  AI_BRIEFING_NARRATIVE_P2_111_DOC,
  AI_BRIEFING_NARRATIVE_P2_111_NPM_SCRIPT,
  AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
  AI_BRIEFING_NARRATIVE_P2_111_ROUTE,
  AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT,
  AI_BRIEFING_NARRATIVE_P2_111_UNIT_TEST,
} from "@/lib/ai/ai-briefing-narrative-p2-111-policy";

const ROOT = process.cwd();

describe("AI briefing narrative (P2-111)", () => {
  it("locks policy id, route, and three sections", () => {
    expect(AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID).toBe("ai-briefing-narrative-p2-111-v1");
    expect(AI_BRIEFING_NARRATIVE_P2_111_ROUTE).toBe("/dashboard/ai/briefing-narrative");
    expect(AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT).toBe(3);
    expect(AI_BRIEFING_NARRATIVE_P2_111_SECTIONS).toHaveLength(3);
  });

  it("passes full AI briefing narrative audit", () => {
    const summary = auditAiBriefingNarrativeP2_111(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyBriefingLinked).toBe(true);
    expect(summary.legacyBriefingLibLinked).toBe(true);
    expect(summary.legacyDraftsLinked).toBe(true);
    expect(summary.legacyCopilotLinked).toBe(true);
    expect(summary.sectionCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds yesterday, channel, and next step sections", () => {
    const yesterday = buildYesterdaySection({ orderDeltaPct: 12 });
    expect(yesterday.text).toContain("+12%");

    const channel = buildChannelMixSection({ channel: "DoorDash", channelDeltaPct: 18 });
    expect(channel.text).toContain("DoorDash");
    expect(channel.text).toContain("+18%");

    const next = buildNextStepSection({ action: "review menu mix" });
    expect(next.text).toContain("Next: review menu mix");
  });

  it("composes canonical briefing narrative", () => {
    const sections = [
      buildYesterdaySection({ orderDeltaPct: AI_BRIEFING_NARRATIVE_DEMO_INPUT.orderDeltaPct }),
      buildChannelMixSection({
        channel: AI_BRIEFING_NARRATIVE_DEMO_INPUT.channel,
        channelDeltaPct: AI_BRIEFING_NARRATIVE_DEMO_INPUT.channelDeltaPct,
      }),
      buildNextStepSection({
        action: AI_BRIEFING_NARRATIVE_DEMO_INPUT.nextAction,
        reason: AI_BRIEFING_NARRATIVE_DEMO_INPUT.nextReason,
      }),
    ];

    const narrative = composeBriefingNarrative(sections);
    expect(narrative).toContain("Yesterday +12%");
    expect(narrative).toContain("DoorDash");
    expect(narrative).toContain("Next:");
    expect(matchesCanonicalBriefingPattern(narrative)).toBe(true);
  });

  it("builds demo briefing narrative report", () => {
    const report = buildAiBriefingNarrativeDemoReport();
    expect(report.sectionCount).toBe(3);
    expect(report.sections).toHaveLength(3);
    expect(report.narrative.length).toBeGreaterThan(20);
    expect(matchesCanonicalBriefingPattern(report.narrative)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_BRIEFING_NARRATIVE_P2_111_NPM_SCRIPT]).toContain(
      "audit-ai-briefing-narrative-p2-111.ts",
    );
    expect(pkg.scripts["test:ci:ai-briefing-narrative-p2-111"]).toContain(
      AI_BRIEFING_NARRATIVE_P2_111_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AI_BRIEFING_NARRATIVE_P2_111_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_BRIEFING_NARRATIVE_P2_111_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_BRIEFING_NARRATIVE_P2_111_DOC))).toBe(true);
    expect(
      formatAiBriefingNarrativeP2_111AuditLines(auditAiBriefingNarrativeP2_111(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
