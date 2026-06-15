import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiConfidenceLabelsP2_107,
  formatAiConfidenceLabelsP2_107AuditLines,
} from "@/lib/ai/ai-confidence-labels-p2-107-audit";
import { AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES } from "@/lib/ai/ai-confidence-labels-p2-107-content";
import {
  buildAiConfidenceLabelRow,
  buildAiConfidenceLabelsDemoReport,
  buildNeedsApprovalLabel,
  buildSourceReference,
  classifyConfidenceTier,
  confidenceTierToBadgeVariant,
  AI_CONFIDENCE_LABELS_DEMO_INPUTS,
} from "@/lib/ai/ai-confidence-labels-p2-107-operations";
import {
  AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT,
  AI_CONFIDENCE_LABELS_P2_107_CI_WORKFLOW,
  AI_CONFIDENCE_LABELS_P2_107_DOC,
  AI_CONFIDENCE_LABELS_P2_107_NPM_SCRIPT,
  AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
  AI_CONFIDENCE_LABELS_P2_107_ROUTE,
  AI_CONFIDENCE_LABELS_P2_107_UNIT_TEST,
} from "@/lib/ai/ai-confidence-labels-p2-107-policy";

const ROOT = process.cwd();

describe("AI confidence labels (P2-107)", () => {
  it("locks policy id, route, and three capabilities", () => {
    expect(AI_CONFIDENCE_LABELS_P2_107_POLICY_ID).toBe("ai-confidence-labels-p2-107-v1");
    expect(AI_CONFIDENCE_LABELS_P2_107_ROUTE).toBe("/dashboard/ai/confidence-labels");
    expect(AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT).toBe(3);
    expect(AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES).toHaveLength(3);
  });

  it("passes full AI confidence labels audit", () => {
    const summary = auditAiConfidenceLabelsP2_107(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyScannerLinked).toBe(true);
    expect(summary.legacyHonestyLinked).toBe(true);
    expect(summary.legacyCopilotLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("classifies confidence tiers correctly", () => {
    expect(classifyConfidenceTier(0.95)).toBe("high");
    expect(classifyConfidenceTier(0.8)).toBe("medium");
    expect(classifyConfidenceTier(0.5)).toBe("low");
    expect(confidenceTierToBadgeVariant("high")).toBe("default");
    expect(confidenceTierToBadgeVariant("low")).toBe("destructive");
  });

  it("builds Needs approval label for low and action drafts", () => {
    expect(buildNeedsApprovalLabel({ tier: "low" }).needsApproval).toBe(true);
    expect(buildNeedsApprovalLabel({ tier: "low" }).label).toBe("Needs approval");
    expect(buildNeedsApprovalLabel({ tier: "high", isActionDraft: true }).needsApproval).toBe(true);
    expect(buildNeedsApprovalLabel({ tier: "high" }).needsApproval).toBe(false);
  });

  it("builds source references", () => {
    const source = buildSourceReference({
      sourceType: "invoice",
      sourceId: "inv-123",
      sourceLabel: "OCR scan result",
    });
    expect(source.reference).toBe("invoice:inv-123");
    expect(source.description).toBe("OCR scan result");
  });

  it("builds demo AI confidence labels report", () => {
    const report = buildAiConfidenceLabelsDemoReport();
    expect(report.labelCount).toBe(AI_CONFIDENCE_LABELS_DEMO_INPUTS.length);
    expect(report.highCount).toBeGreaterThan(0);
    expect(report.needsApprovalCount).toBeGreaterThan(0);
    expect(report.labels.every((l) => l.sourceReference.includes(":"))).toBe(true);
  });

  it("builds full label row with all fields", () => {
    const row = buildAiConfidenceLabelRow({
      id: "test",
      module: "Test",
      outputLabel: "Test output",
      confidenceScore: 0.55,
      sourceType: "product",
      sourceId: "prod-1",
      isActionDraft: true,
    });
    expect(row.tier).toBe("low");
    expect(row.needsApprovalLabel).toBe("Needs approval");
    expect(row.sourceReference).toBe("product:prod-1");
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_CONFIDENCE_LABELS_P2_107_NPM_SCRIPT]).toContain(
      "audit-ai-confidence-labels-p2-107.ts",
    );
    expect(pkg.scripts["test:ci:ai-confidence-labels-p2-107"]).toContain(
      AI_CONFIDENCE_LABELS_P2_107_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AI_CONFIDENCE_LABELS_P2_107_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_CONFIDENCE_LABELS_P2_107_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_CONFIDENCE_LABELS_P2_107_DOC))).toBe(true);
    expect(
      formatAiConfidenceLabelsP2_107AuditLines(auditAiConfidenceLabelsP2_107(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
