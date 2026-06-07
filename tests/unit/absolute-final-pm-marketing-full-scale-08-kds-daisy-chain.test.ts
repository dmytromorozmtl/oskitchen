import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID,
  KDS_DAISY_CHAIN_CONFIG_PANEL_PATH,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";
import { auditPmMarketingFullScaleSlot } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-audit";
import {
  getPmMarketingFullScaleSlot,
  PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-policy";
import { auditKdsDaisyChainGtmScaleWiring } from "@/lib/marketing/kds-daisy-chain-gtm-scale-audit";
import {
  KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH,
  KDS_DAISY_CHAIN_GTM_SCALE_HONESTY_MARKERS,
} from "@/lib/marketing/kds-daisy-chain-gtm-scale-absolute-final-policy";
import {
  docUsesPmGtmTokens,
  PM_GTM_ABSOLUTE_FINAL_POLICY_ID,
  PM_GTM_DOC_DARK_MODE_MARKER,
} from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 138 — PM marketing full scale for feature 93 KDS daisy-chain config */
const TASK = 138;
const FEATURE = 93;

describe(`PM marketing full scale — KDS daisy-chain config (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks PM marketing registry slot 138 → feature 93 KDS daisy-chain config", () => {
    expect(PM_MARKETING_FULL_SCALE_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-pm-marketing-full-scale-v1",
    );
    const slot = getPmMarketingFullScaleSlot(TASK);
    expect(slot?.featureKey).toBe("kds-daisy-chain-config");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetPath).toBe(KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH);
  });

  it("applies pm-gtm doc markers to the KDS daisy-chain GTM playbook", () => {
    const doc = readFileSync(join(ROOT, KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH), "utf8");
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
    const doc = readFileSync(join(ROOT, KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain("pm-gtm-icp-profile");
    expect(doc).toContain("pm-gtm-demo-hook");
    expect(doc).toContain("pm-gtm-objection-handling");
    expect(doc).toContain("pm-gtm-pricing-talk-track");
    expect(doc).toContain("pm-gtm-primary-cta");
    expect(doc).toContain("pm-gtm-honesty-guardrails");
  });

  it("shows honesty guardrails with NCR Aloha parity and bump handoff markers", () => {
    const doc = readFileSync(join(ROOT, KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH), "utf8");
    for (const marker of KDS_DAISY_CHAIN_GTM_SCALE_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
    expect(doc).toContain(KDS_DAISY_CHAIN_CONFIG_PANEL_PATH);
  });

  it("links GTM playbook to daisy-chain route and feature policy", () => {
    const doc = readFileSync(join(ROOT, KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH), "utf8");
    expect(doc).toContain(KDS_DAISY_CHAIN_CONFIG_ROUTE);
    expect(doc).toContain("/dashboard/kitchen/routing-rules");
    expect(doc).toContain("kds-daisy-chain-gtm-scale-absolute-final-v1");
    expect(doc).toContain(KDS_DAISY_CHAIN_CONFIG_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("task-138 feature-93");
  });

  it("references upstream KDS daisy-chain config panel", () => {
    const panel = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
    expect(panel).toContain("NCR Aloha parity");
    expect(panel).toContain("bump handoff");
  });

  it("passes base KDS daisy-chain GTM wiring audit", () => {
    const wiring = auditKdsDaisyChainGtmScaleWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes PM marketing slot 138 audit gate", () => {
    const audit = auditPmMarketingFullScaleSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.gtmTest).toBe(
      "tests/unit/absolute-final-pm-marketing-full-scale-08-kds-daisy-chain.test.ts",
    );
  });
});
