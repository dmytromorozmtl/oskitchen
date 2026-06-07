/**
 * Absolute Final Task 74 — referral program for restaurateurs.
 *
 * @see docs/referral-program.md
 * @see app/dashboard/referrals/page.tsx
 * @see services/referral/referral-service.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

export {
  REFERRAL_PROGRAM_DOC,
  REFERRAL_PROGRAM_MIN_NPS,
  REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS,
  REFERRAL_PROGRAM_NPS_ARTIFACT,
  REFERRAL_PROGRAM_POLICY_ID,
  isReferralProgramGtmEnabled,
} from "@/lib/marketing/referral-program-policy";

import {
  REFERRAL_PROGRAM_DOC,
  REFERRAL_PROGRAM_MIN_NPS,
  REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS,
  REFERRAL_PROGRAM_NPS_ARTIFACT,
  REFERRAL_PROGRAM_POLICY_ID,
  isReferralProgramGtmEnabled,
} from "@/lib/marketing/referral-program-policy";

export const REFERRAL_PROGRAM_ABSOLUTE_FINAL_POLICY_ID =
  "referral-program-absolute-final-v1" as const;

export const REFERRAL_PROGRAM_ROUTE = "/dashboard/referrals" as const;

export const REFERRAL_PROGRAM_SETTINGS_ROUTE = "/dashboard/settings/referrals" as const;

export const REFERRAL_PROGRAM_PAGE_PATH = "app/dashboard/referrals/page.tsx" as const;

export const REFERRAL_PROGRAM_PANEL_PATH =
  "components/dashboard/referral-program-panel.tsx" as const;

export const REFERRAL_PROGRAM_SERVICE_PATH = "services/referral/referral-service.ts" as const;

export const REFERRAL_PROGRAM_SHORT_LINK_PATH = "app/r/[code]/route.ts" as const;

export const REFERRAL_PROGRAM_ICP_DOC = "docs/icp-definition-final.md" as const;

export const REFERRAL_PROGRAM_UPSTREAM_POLICY_ID = REFERRAL_PROGRAM_POLICY_ID;

export const REFERRAL_PROGRAM_REWARD_DAYS = 30 as const;

export const REFERRAL_PROGRAM_REQUIRED_SECTIONS = [
  "## GTM enable gate",
  "## How it works",
  "## Restaurateur program",
  "## Forbidden referral program claims",
  "## GTM launch checklist",
] as const;

export const REFERRAL_PROGRAM_HONESTY_MARKERS = [
  "BETA",
  "PRE-LAUNCH",
  "kitchen operators only",
  "not unlimited",
  "portfolio NPS",
] as const;

export const REFERRAL_PROGRAM_WIRING_PATHS = [
  REFERRAL_PROGRAM_DOC,
  REFERRAL_PROGRAM_ICP_DOC,
  REFERRAL_PROGRAM_PAGE_PATH,
  "app/dashboard/settings/referrals/page.tsx",
  REFERRAL_PROGRAM_PANEL_PATH,
  REFERRAL_PROGRAM_SERVICE_PATH,
  REFERRAL_PROGRAM_SHORT_LINK_PATH,
  "lib/marketing/referral-program-policy.ts",
  "lib/marketing/referral-program-absolute-final-policy.ts",
  "lib/marketing/referral-program-absolute-final-audit.ts",
  "tests/unit/referral-program-absolute-final.test.ts",
  "e2e/referral-program.spec.ts",
] as const;

export const REFERRAL_PROGRAM_UNIT_TEST =
  "tests/unit/referral-program-absolute-final.test.ts" as const;

export const REFERRAL_PROGRAM_CI_SCRIPTS = [
  "test:ci:referral-program",
  "test:ci:referral-program:cert",
] as const;

export type ReferralProgramGtmSnapshot = {
  npsScore: number | null;
  pilotsWithNps: number;
  gtmEnabled: boolean;
  gtmStatusLabel: "PRE-LAUNCH" | "ENABLED";
};

export function readReferralProgramGtmSnapshot(root = process.cwd()): ReferralProgramGtmSnapshot {
  try {
    const raw = readFileSync(join(root, REFERRAL_PROGRAM_NPS_ARTIFACT), "utf8");
    const parsed = JSON.parse(raw) as {
      npsScore?: number;
      pilotsSurveyed?: number;
      gtmEnabled?: boolean;
    };
    const npsScore = typeof parsed.npsScore === "number" ? parsed.npsScore : null;
    const pilotsWithNps =
      typeof parsed.pilotsSurveyed === "number" ? parsed.pilotsSurveyed : 0;
    const gtmEnabled =
      typeof parsed.gtmEnabled === "boolean"
        ? parsed.gtmEnabled
        : isReferralProgramGtmEnabled(npsScore, pilotsWithNps);

    return {
      npsScore,
      pilotsWithNps,
      gtmEnabled,
      gtmStatusLabel: gtmEnabled ? "ENABLED" : "PRE-LAUNCH",
    };
  } catch {
    return {
      npsScore: null,
      pilotsWithNps: 0,
      gtmEnabled: false,
      gtmStatusLabel: "PRE-LAUNCH",
    };
  }
}

export function formatReferralGtmGateSummary(snapshot: ReferralProgramGtmSnapshot): string {
  if (snapshot.gtmEnabled) {
    return `Public GTM enabled — portfolio NPS ${snapshot.npsScore} from ${snapshot.pilotsWithNps} pilots`;
  }
  const npsLabel = snapshot.npsScore == null ? "not captured" : String(snapshot.npsScore);
  return `Public GTM PRE-LAUNCH — need NPS ≥${REFERRAL_PROGRAM_MIN_NPS} from ≥${REFERRAL_PROGRAM_MIN_PILOTS_WITH_NPS} pilots (current: ${npsLabel}, ${snapshot.pilotsWithNps} surveyed)`;
}
