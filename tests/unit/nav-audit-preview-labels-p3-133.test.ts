import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNavAuditPreviewLabelsPm,
  formatNavAuditPreviewLabelsPmAuditLines,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-audit";
import {
  computeNavPreviewLabelSnapshot,
  loadNavAuditPreviewLabelsBaseline,
  validateNavAuditPreviewLabelsBaseline,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-operations";
import {
  NAV_AUDIT_PREVIEW_LABELS_PM_CI_WORKFLOW,
  NAV_AUDIT_PREVIEW_LABELS_PM_DOC,
  NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT,
  NAV_AUDIT_PREVIEW_LABELS_PM_NPM_SCRIPT,
  NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID,
  NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT,
  NAV_AUDIT_PREVIEW_LABELS_PM_UNIT_TEST,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-policy";

const ROOT = process.cwd();

describe("Nav audit preview labels PM (P3-133)", () => {
  it("locks policy id and 40% → 0% target", () => {
    expect(NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID).toBe(
      "nav-audit-preview-labels-p3-133-v1",
    );
    expect(NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT).toBe(40);
    expect(NAV_AUDIT_PREVIEW_LABELS_PM_TARGET_PCT).toBe(0);
  });

  it("validates baseline artifact against live snapshot", () => {
    const baseline = loadNavAuditPreviewLabelsBaseline(ROOT);
    const liveSnapshot = computeNavPreviewLabelSnapshot(ROOT);
    const validation = validateNavAuditPreviewLabelsBaseline(baseline, liveSnapshot);

    expect(validation.valid).toBe(true);
    expect(validation.targetMet).toBe(true);
    expect(validation.snapshotMatchesLive).toBe(true);
    expect(liveSnapshot.unlabeledPreviewCount).toBe(0);
    expect(liveSnapshot.pctUnlabeledPreview).toBe(0);
    expect(liveSnapshot.previewLinkCount).toBeGreaterThan(0);
  });

  it("passes full nav preview labels PM audit", () => {
    const summary = auditNavAuditPreviewLabelsPm(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.baselineValid).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.historicalDocumented).toBe(true);
    expect(summary.liveAuditPassed).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_PM_DOC))).toBe(true);
    expect(existsSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_PM_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NAV_AUDIT_PREVIEW_LABELS_PM_NPM_SCRIPT]).toContain(
      "audit-nav-audit-preview-labels-p3-133.ts",
    );
    expect(pkg.scripts?.["test:ci:nav-audit-preview-labels-p3-133"]).toContain(
      NAV_AUDIT_PREVIEW_LABELS_PM_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_PM_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:nav-audit-preview-labels-p3-133");
  });

  it("formats audit lines", () => {
    const summary = auditNavAuditPreviewLabelsPm(ROOT);
    const lines = formatNavAuditPreviewLabelsPmAuditLines(summary);
    expect(lines.some((line) => line.includes(NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
