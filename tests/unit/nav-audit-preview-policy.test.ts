import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNavPreviewBadgeCoverage,
  listNavAuditPreviewSidebarLinks,
  NAV_AUDIT_PREVIEW_POLICY_ID,
  NAV_AUDIT_PREVIEW_UI_MODULES,
} from "@/lib/navigation/nav-audit-preview-policy";
import {
  isNavAuditSuppressedHref,
  NAV_AUDIT_SUPPRESSED_PREFIXES,
} from "@/lib/navigation/nav-audit-suppressed-prefixes";
import { shouldShowNavLinkByMaturity } from "@/lib/navigation/nav-maturity-governance";

const ROOT = process.cwd();

describe("nav audit preview policy (P1-24)", () => {
  it("locks policy id and suppressed prefixes", () => {
    expect(NAV_AUDIT_PREVIEW_POLICY_ID).toBe("nav-audit-preview-p1-24-v1");
    expect(NAV_AUDIT_SUPPRESSED_PREFIXES).toContain("/dashboard/qr-codes");
    expect(NAV_AUDIT_SUPPRESSED_PREFIXES).not.toContain("/dashboard/customers/loyalty");
    expect(NAV_AUDIT_SUPPRESSED_PREFIXES).toContain("/dashboard/settings/hardware");
  });

  it("suppresses hardware and QR from expanded tenant nav", () => {
    const ctx = {
      fullNavAccess: false,
      navScopeAll: true,
      gtmSurfaceAccess: false,
    } as const;

    for (const prefix of NAV_AUDIT_SUPPRESSED_PREFIXES) {
      expect(isNavAuditSuppressedHref(prefix)).toBe(true);
      expect(shouldShowNavLinkByMaturity(prefix, ctx)).toBe(false);
    }
  });

  it("labels every expanded preview sidebar link", () => {
    const audit = auditNavPreviewBadgeCoverage();
    expect(audit.previewSidebarLinkCount).toBeGreaterThan(5);
    expect(audit.unlabeledPreviewHrefs).toEqual([]);
    expect(audit.suppressedHiddenInExpandedNav).toBe(true);
    expect(audit.passed).toBe(true);
  });

  it("keeps non-suppressed preview modules visible when navScopeAll", () => {
    const links = listNavAuditPreviewSidebarLinks();
    expect(links.some((l) => l.href === "/dashboard/copilot")).toBe(true);
    expect(links.some((l) => l.href === "/dashboard/customers/loyalty")).toBe(false);
    expect(links.some((l) => l.href === "/dashboard/gift-cards")).toBe(true);
  });

  it.each(NAV_AUDIT_PREVIEW_UI_MODULES)("UI module %s wires preview badges", (modulePath) => {
    const source = readFileSync(join(ROOT, modulePath), "utf8");
    if (modulePath === "components/ui/badge.tsx") {
      expect(source).toContain("preview:");
    } else if (modulePath === "components/ui/beta-badge.tsx") {
      expect(source).toContain('variant="preview"');
      expect(source).toContain('variant="beta"');
    } else {
      expect(source).toContain("navMaturityBadgeForHref");
      expect(source).toContain("NavMaturityBadge");
    }
  });
});
