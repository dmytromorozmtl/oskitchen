import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID,
  DATA_MIGRATION_WIZARD_CLIENT_PATH,
  DATA_MIGRATION_WIZARD_ROUTE,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import { auditDataMigrationGtmScaleWiring } from "@/lib/marketing/data-migration-gtm-scale-audit";
import {
  DATA_MIGRATION_GTM_SCALE_DOC_PATH,
  DATA_MIGRATION_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/data-migration-gtm-scale-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 136 — PM marketing full scale for feature 91 data migration wizard */
const TASK = 136;
const FEATURE = 91;

describe(`PM marketing full scale — data migration wizard (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 136 → feature 91 data migration wizard", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("data-migration-wizard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(DATA_MIGRATION_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the data migration GTM playbook", () => {
    const doc = readFileSync(join(ROOT, DATA_MIGRATION_GTM_SCALE_DOC_PATH), "utf8");
    expect(docUsesPmGtmTokens(doc)).toBe(true);
    expect(doc).toContain("pm-gtm-hero-banner");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
    expect(doc).toContain(PM_GTM_DOC_DARK_MODE_MARKER);
    expect(PM_GTM_ABSOLUTE_FINAL_POLICY_ID).toBe(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("includes ICP, demo, objections, pricing, and CTA sections", () => {
    const doc = readFileSync(join(ROOT, DATA_MIGRATION_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with CSV export and manual review markers", () => {
    const doc = readFileSync(join(ROOT, DATA_MIGRATION_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of DATA_MIGRATION_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(DATA_MIGRATION_WIZARD_CLIENT_PATH);
  });

  it("links GTM playbook to migration route and feature policy", () => {
    const doc = readFileSync(join(ROOT, DATA_MIGRATION_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(DATA_MIGRATION_WIZARD_ROUTE);
    expect(doc).toContain("/dashboard/import-center");
    expect(doc).toContain("data-migration-gtm-scale-absolute-final-v1");
    expect(doc).toContain(DATA_MIGRATION_WIZARD_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-136 feature-91");
  });

  it("references upstream migration wizard client", () => {
    const client = readFileSync(join(ROOT, DATA_MIGRATION_WIZARD_CLIENT_PATH), "utf8");
    expect(client).toContain("CSV export");
    expect(client).toContain("not live API");
  });

  it("passes base data migration GTM wiring audit", () => {
    const wiring = auditDataMigrationGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 136 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-06-data-migration.test.ts",
    );
  });
});
