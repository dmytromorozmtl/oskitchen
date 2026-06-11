import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNavAuditPreviewLabels,
  formatNavAuditPreviewLabelsAuditLines,
} from "@/lib/design/nav-audit-preview-labels-audit";
import {
  NAV_AUDIT_BETA_BADGE_VARIANT,
  NAV_AUDIT_PREVIEW_BADGE_VARIANT,
  NAV_AUDIT_PREVIEW_LABELS_AUDIT_SCRIPT,
  NAV_AUDIT_PREVIEW_LABELS_CI_WORKFLOW,
  NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS,
  NAV_AUDIT_PREVIEW_LABELS_NPM_SCRIPT,
  NAV_AUDIT_PREVIEW_LABELS_POLICY_ID,
  NAV_AUDIT_PREVIEW_LABELS_UI_MODULES,
  NAV_AUDIT_PREVIEW_LABELS_UNIT_TEST,
  listNavAuditBetaSidebarLinks,
} from "@/lib/design/nav-audit-preview-labels-policy";
import { navMaturityBadgeForHref } from "@/lib/navigation/nav-maturity-governance";

const ROOT = process.cwd();

describe("nav audit preview labels (P1-56)", () => {
  it("locks policy id and badge variants", () => {
    expect(NAV_AUDIT_PREVIEW_LABELS_POLICY_ID).toBe("nav-audit-preview-labels-p1-56-v1");
    expect(NAV_AUDIT_PREVIEW_BADGE_VARIANT).toBe("preview");
    expect(NAV_AUDIT_BETA_BADGE_VARIANT).toBe("beta");
    expect(NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS).toBeGreaterThanOrEqual(2);
  });

  it("labels BETA integration preview links with Beta badge", () => {
    const betaLinks = listNavAuditBetaSidebarLinks();
    expect(betaLinks.length).toBeGreaterThanOrEqual(NAV_AUDIT_PREVIEW_LABELS_MIN_BETA_LINKS);
    expect(betaLinks.some((l) => l.href === "/dashboard/integrations/doordash")).toBe(true);

    for (const link of betaLinks) {
      expect(navMaturityBadgeForHref(link.href)).toBe("Beta");
      expect(link.matrixRef).toMatch(/BETA/i);
    }
  });

  it("passes full nav preview labels audit", () => {
    const summary = auditNavAuditPreviewLabels(ROOT);
    expect(summary.badgePreviewVariant).toBe(true);
    expect(summary.badgeBetaVariant).toBe(true);
    expect(summary.previewBadgeUsesVariant).toBe(true);
    expect(summary.betaBadgeUsesVariant).toBe(true);
    expect(summary.navMaturityBadgePreview).toBe(true);
    expect(summary.navMaturityBadgeBeta).toBe(true);
    expect(summary.unlabeledBetaHrefs).toEqual([]);
    expect(summary.previewCoveragePassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it.each(NAV_AUDIT_PREVIEW_LABELS_UI_MODULES)("UI module %s exists", (modulePath) => {
    expect(existsSync(join(ROOT, modulePath))).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NAV_AUDIT_PREVIEW_LABELS_NPM_SCRIPT]).toContain(
      "audit-nav-audit-preview-labels.ts",
    );
    expect(pkg.scripts?.["test:ci:nav-audit-preview-labels"]).toContain(
      NAV_AUDIT_PREVIEW_LABELS_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, NAV_AUDIT_PREVIEW_LABELS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:nav-audit-preview-labels");
  });

  it("formats audit lines", () => {
    const summary = auditNavAuditPreviewLabels(ROOT);
    const lines = formatNavAuditPreviewLabelsAuditLines(summary);
    expect(lines.some((line) => line.includes(NAV_AUDIT_PREVIEW_LABELS_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
