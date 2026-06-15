import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiActionDraftsP2_106,
  formatAiActionDraftsP2_106AuditLines,
} from "@/lib/ai/ai-action-drafts-p2-106-audit";
import { AI_ACTION_DRAFTS_P2_106_CAPABILITIES } from "@/lib/ai/ai-action-drafts-p2-106-content";
import {
  buildAiActionDraftRows,
  buildAiActionDraftsDemoReport,
  buildAiActionDraftTemplates,
  categorizeDraftRow,
  splitDraftsByCategory,
  AI_ACTION_DRAFTS_DEMO_ROWS,
} from "@/lib/ai/ai-action-drafts-p2-106-operations";
import {
  AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT,
  AI_ACTION_DRAFTS_P2_106_CI_WORKFLOW,
  AI_ACTION_DRAFTS_P2_106_DOC,
  AI_ACTION_DRAFTS_P2_106_DRAFT_TYPE_COUNT,
  AI_ACTION_DRAFTS_P2_106_NPM_SCRIPT,
  AI_ACTION_DRAFTS_P2_106_POLICY_ID,
  AI_ACTION_DRAFTS_P2_106_ROUTE,
  AI_ACTION_DRAFTS_P2_106_UNIT_TEST,
} from "@/lib/ai/ai-action-drafts-p2-106-policy";

const ROOT = process.cwd();

describe("AI action drafts (P2-106)", () => {
  it("locks policy id, route, five draft types, and three capabilities", () => {
    expect(AI_ACTION_DRAFTS_P2_106_POLICY_ID).toBe("ai-action-drafts-p2-106-v1");
    expect(AI_ACTION_DRAFTS_P2_106_ROUTE).toBe("/dashboard/ai/action-drafts");
    expect(AI_ACTION_DRAFTS_P2_106_DRAFT_TYPE_COUNT).toBe(5);
    expect(AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT).toBe(3);
    expect(AI_ACTION_DRAFTS_P2_106_CAPABILITIES).toHaveLength(3);
  });

  it("passes full AI action drafts audit", () => {
    const summary = auditAiActionDraftsP2_106(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCopilotLinked).toBe(true);
    expect(summary.legacyDraftsPageLinked).toBe(true);
    expect(summary.legacyCoPilotLinked).toBe(true);
    expect(summary.draftTypeCountCorrect).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("defines five AI action draft templates", () => {
    const templates = buildAiActionDraftTemplates();
    expect(templates).toHaveLength(5);
    expect(templates.map((t) => t.label)).toEqual([
      "Create PO",
      "Draft schedule",
      "Flag low margin",
      "Commission spike",
      "Daily briefing",
    ]);
  });

  it("categorizes drafts into three capability groups", () => {
    const rows = buildAiActionDraftRows([...AI_ACTION_DRAFTS_DEMO_ROWS]);
    const split = splitDraftsByCategory(rows);
    expect(split.purchasingScheduleDrafts.length).toBe(2);
    expect(split.marginCommissionDrafts.length).toBe(2);
    expect(split.dailyBriefingDrafts.length).toBe(1);
    expect(categorizeDraftRow("create_po")).toBe("purchasing_schedule");
    expect(categorizeDraftRow("commission_spike")).toBe("margin_commission");
    expect(categorizeDraftRow("daily_briefing")).toBe("daily_briefing");
  });

  it("builds demo AI action drafts report", () => {
    const report = buildAiActionDraftsDemoReport();
    expect(report.draftTypeCount).toBe(5);
    expect(report.purchasingScheduleCount).toBe(2);
    expect(report.marginCommissionCount).toBe(2);
    expect(report.dailyBriefingCount).toBe(1);
    expect(report.pendingApprovalCount).toBeGreaterThan(0);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_ACTION_DRAFTS_P2_106_NPM_SCRIPT]).toContain(
      "audit-ai-action-drafts-p2-106.ts",
    );
    expect(pkg.scripts["test:ci:ai-action-drafts-p2-106"]).toContain(
      AI_ACTION_DRAFTS_P2_106_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AI_ACTION_DRAFTS_P2_106_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_ACTION_DRAFTS_P2_106_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_ACTION_DRAFTS_P2_106_DOC))).toBe(true);
    expect(
      formatAiActionDraftsP2_106AuditLines(auditAiActionDraftsP2_106(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
