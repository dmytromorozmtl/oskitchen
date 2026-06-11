import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBetaPreviewBadgeSystem,
  formatBetaPreviewBadgeSystemAuditLines,
} from "@/lib/design/beta-preview-badge-system-audit";
import {
  BETA_BADGE_COLOR_TOKEN,
  BETA_BADGE_LABEL,
  BETA_BADGE_VARIANT,
  BETA_PREVIEW_BADGE_SYSTEM_AUDIT_SCRIPT,
  BETA_PREVIEW_BADGE_SYSTEM_CI_WORKFLOW,
  BETA_PREVIEW_BADGE_SYSTEM_NPM_SCRIPT,
  BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID,
  BETA_PREVIEW_BADGE_SYSTEM_UNIT_TEST,
  COMING_SOON_BADGE_COLOR_TOKEN,
  COMING_SOON_BADGE_LABEL,
  COMING_SOON_BADGE_VARIANT,
  NEW_BADGE_COLOR_TOKEN,
  NEW_BADGE_LABEL,
  NEW_BADGE_VARIANT,
} from "@/lib/design/beta-preview-badge-system-policy";

const ROOT = process.cwd();

describe("BETA/preview badge system (P1-69)", () => {
  it("locks policy id and three maturity badge variants", () => {
    expect(BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID).toBe("beta-preview-badge-system-p1-69-v1");
    expect(BETA_BADGE_VARIANT).toBe("beta");
    expect(COMING_SOON_BADGE_VARIANT).toBe("comingSoon");
    expect(NEW_BADGE_VARIANT).toBe("new");
    expect(BETA_BADGE_LABEL).toBe("BETA");
    expect(COMING_SOON_BADGE_LABEL).toBe("Coming soon");
    expect(NEW_BADGE_LABEL).toBe("NEW");
  });

  it("ships amber, gray, and teal color tokens in badge variants", () => {
    const source = readFileSync(join(ROOT, "components/ui/badge.tsx"), "utf8");
    expect(source).toContain(BETA_BADGE_COLOR_TOKEN);
    expect(source).toContain(COMING_SOON_BADGE_COLOR_TOKEN);
    expect(source).toContain(NEW_BADGE_COLOR_TOKEN);
    expect(source).toContain(`${COMING_SOON_BADGE_VARIANT}:`);
    expect(source).toContain(`${NEW_BADGE_VARIANT}:`);
  });

  it("ships BetaBadge, ComingSoonBadge, and NewBadge components", () => {
    const source = readFileSync(join(ROOT, "components/ui/beta-badge.tsx"), "utf8");
    expect(source).toContain("BetaBadge");
    expect(source).toContain("ComingSoonBadge");
    expect(source).toContain("NewBadge");
    expect(source).toContain("MATURITY_BADGE_BASE_CLASS");
  });

  it("passes full BETA/preview badge system audit", () => {
    const summary = auditBetaPreviewBadgeSystem(ROOT);
    expect(summary.badgeVariantsPresent).toBe(true);
    expect(summary.betaBadgeWired).toBe(true);
    expect(summary.comingSoonBadgeWired).toBe(true);
    expect(summary.newBadgeWired).toBe(true);
    expect(summary.maturityBadgeBaseWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, BETA_PREVIEW_BADGE_SYSTEM_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, BETA_PREVIEW_BADGE_SYSTEM_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BETA_PREVIEW_BADGE_SYSTEM_NPM_SCRIPT]).toContain(
      "audit-beta-preview-badge-system.ts",
    );
    expect(pkg.scripts?.["test:ci:beta-preview-badge-system"]).toContain(
      BETA_PREVIEW_BADGE_SYSTEM_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, BETA_PREVIEW_BADGE_SYSTEM_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:beta-preview-badge-system");
  });

  it("formats audit lines", () => {
    const summary = auditBetaPreviewBadgeSystem(ROOT);
    const lines = formatBetaPreviewBadgeSystemAuditLines(summary);
    expect(lines.some((line) => line.includes(BETA_PREVIEW_BADGE_SYSTEM_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
