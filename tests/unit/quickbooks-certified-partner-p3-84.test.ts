import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditQuickBooksCertifiedPartnerP384,
  formatQuickBooksCertifiedPartnerP384AuditLines,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-audit";
import {
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS,
  taglineWithinQuickBooksLimit,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-content";
import {
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_STATUS,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APP_NAME,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARTIFACT,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CHECK_NPM_SCRIPT,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CI_WORKFLOW,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_TARGET_SUBMIT,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UNIT_TEST,
  QUICKBOOKS_CERTIFIED_PARTNER_P3_84_WIRING_PATHS,
} from "@/lib/marketing/quickbooks-certified-partner-p3-84-policy";

const ROOT = process.cwd();

describe("QuickBooks certified partner program (P3-84)", () => {
  it("locks policy id, app name, and tagline within 80 chars", () => {
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID).toBe(
      "quickbooks-certified-partner-p3-84-v1",
    );
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APP_NAME).toBe("OS Kitchen Sales Sync");
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_STATUS).toBe(
      "APPLICATION_PREP_NOT_CERTIFIED",
    );
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_TARGET_SUBMIT).toBe("2026-07-15");
    expect(
      taglineWithinQuickBooksLimit(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_LISTING_COPY.tagline),
    ).toBe(true);
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_REQUIRED_ASSETS.length).toBeGreaterThanOrEqual(4);
    expect(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_APPLICATION_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(
      7,
    );
  });

  it("passes full P3-84 QuickBooks certified partner audit", () => {
    const summary = auditQuickBooksCertifiedPartnerP384(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.integrationDocLinked).toBe(true);
    expect(summary.assetsDefined).toBe(true);
    expect(summary.copyArtifactsWired).toBe(true);
    expect(summary.copyValid).toBe(true);
    expect(summary.scopesDefined).toBe(true);
    expect(summary.endpointsDefined).toBe(true);
    expect(summary.checklistComplete).toBe(true);
    expect(summary.upstreamProofsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-84 wiring paths, CI gate, and artifact", () => {
    for (const path of QUICKBOOKS_CERTIFIED_PARTNER_P3_84_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CHECK_NPM_SCRIPT]).toContain(
      QUICKBOOKS_CERTIFIED_PARTNER_P3_84_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CI_WORKFLOW), "utf8");
    expect(ci).toContain(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID);
    expect(artifact.status).toBe("APPLICATION_PREP_NOT_CERTIFIED");
    expect(artifact.intuitEndorsementClaimed).toBe(false);

    const doc = readFileSync(join(ROOT, QUICKBOOKS_CERTIFIED_PARTNER_P3_84_DOC), "utf8");
    expect(doc).toContain(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditQuickBooksCertifiedPartnerP384(ROOT);
    const lines = formatQuickBooksCertifiedPartnerP384AuditLines(summary);
    expect(lines.some((line) => line.includes(QUICKBOOKS_CERTIFIED_PARTNER_P3_84_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
