import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditReferralProgramAbsoluteFinalWiring } from "@/lib/marketing/referral-program-absolute-final-audit";
import {
  formatReferralGtmGateSummary,
  readReferralProgramGtmSnapshot,
  REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID,
  REFERRAL_PROGRAM_CI_SCRIPTS,
  REFERRAL_PROGRAM_DOC,
  REFERRAL_PROGRAM_HONESTY_MARKERS,
  REFERRAL_PROGRAM_REQUIRED_SECTIONS,
  REFERRAL_PROGRAM_REWARD_DAYS,
  REFERRAL_PROGRAM_ROUTE,
  REFERRAL_PROGRAM_SETTINGS_ROUTE,
  REFERRAL_PROGRAM_UNIT_TEST,
  REFERRAL_PROGRAM_UPSTREAM_POLICY_ID,
} from "@/lib/marketing/referral-program-absolute-final-policy";
import {
  calculatePortfolioNps,
  getReferralGtmTierByRefereeCount,
  isReferralProgramGtmEnabled,
} from "@/lib/marketing/referral-program-policy";
import { buildReferralPublicUrl } from "@/services/referral/referral-service";

const ROOT = process.cwd();

describe("Referral program for restaurateurs (Absolute Final Task 74)", () => {
  it("locks absolute final policy with upstream MKT-32 and routes", () => {
    expect(REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "referral-program-absolute-final-v1",
    );
    expect(REFERRAL_PROGRAM_UPSTREAM_POLICY_ID).toBe("referral-program-mkt32-v1");
    expect(REFERRAL_PROGRAM_ROUTE).toBe("/dashboard/referrals");
    expect(REFERRAL_PROGRAM_SETTINGS_ROUTE).toBe("/dashboard/settings/referrals");
    expect(REFERRAL_PROGRAM_REWARD_DAYS).toBe(30);
    expect(REFERRAL_PROGRAM_REQUIRED_SECTIONS).toHaveLength(5);
  });

  it("builds public referral short links", () => {
    expect(buildReferralPublicUrl("R-ABC123")).toContain("/r/R-ABC123");
  });

  it("defaults GTM snapshot to PRE-LAUNCH without NPS artifact", () => {
    const snapshot = readReferralProgramGtmSnapshot(ROOT);
    expect(snapshot.gtmEnabled).toBe(false);
    expect(snapshot.gtmStatusLabel).toBe("PRE-LAUNCH");
    expect(formatReferralGtmGateSummary(snapshot)).toContain("PRE-LAUNCH");
  });

  it("enables GTM at portfolio NPS ≥40 with ≥3 pilots", () => {
    expect(isReferralProgramGtmEnabled(40, 3)).toBe(true);
    expect(calculatePortfolioNps(2, 0, 3)).toBe(67);
  });

  it("maps referrer milestones to GTM tiers", () => {
    expect(getReferralGtmTierByRefereeCount(1)).toBe("Starter");
    expect(getReferralGtmTierByRefereeCount(5)).toBe("Champion");
  });

  it("documents restaurateur program with honesty markers", () => {
    const doc = readFileSync(join(ROOT, REFERRAL_PROGRAM_DOC), "utf8");
    expect(doc).toContain(REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("## Restaurateur program");
    for (const marker of REFERRAL_PROGRAM_HONESTY_MARKERS) {
      expect(doc.toLowerCase()).toContain(marker.toLowerCase());
    }
  });

  it("passes absolute final wiring audit", () => {
    const audit = auditReferralProgramAbsoluteFinalWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.sectionCount).toBe(REFERRAL_PROGRAM_REQUIRED_SECTIONS.length);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of REFERRAL_PROGRAM_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(REFERRAL_PROGRAM_UNIT_TEST).toBe(
      "tests/unit/referral-program-absolute-final.test.ts",
    );
  });
});
