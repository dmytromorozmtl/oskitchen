import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  A11Y_VOICEOVER_KDS_MODULE,
  A11Y_VOICEOVER_LIVE_REGION_MODULE,
  A11Y_VOICEOVER_POS_CART_MODULE,
  A11Y_VOICEOVER_POS_PAYMENT_MODULE,
  A11Y_VOICEOVER_SWEEP_POLICY_ID,
  A11Y_VOICEOVER_SWEEP_SURFACES,
  A11Y_VOICEOVER_SWEEP_WIRED_MODULES,
  A11Y_VOICEOVER_TODAY_MODULE,
  KDS_VOICEOVER_LIVE_REGION_TEST_ID,
  KDS_VOICEOVER_SHELL_ARIA_LABEL,
  POS_VOICEOVER_CART_REGION_LABEL,
  POS_VOICEOVER_PAYMENT_REGION_LABEL,
  TODAY_VOICEOVER_PAGE_TITLE_ID,
  TODAY_VOICEOVER_SR_HINT_TEST_ID,
} from "@/lib/design/a11y-voiceover-sweep-policy";

export type A11yVoiceoverSweepAuditSummary = {
  policyId: typeof A11Y_VOICEOVER_SWEEP_POLICY_ID;
  liveRegionModulePresent: boolean;
  todayWired: boolean;
  posCartWired: boolean;
  posPaymentWired: boolean;
  kdsWired: boolean;
  passed: boolean;
};

export function auditA11yVoiceoverSweep(root = process.cwd()): A11yVoiceoverSweepAuditSummary {
  const liveRegionPath = join(root, A11Y_VOICEOVER_LIVE_REGION_MODULE);
  const todayPath = join(root, A11Y_VOICEOVER_TODAY_MODULE);
  const posCartPath = join(root, A11Y_VOICEOVER_POS_CART_MODULE);
  const posPaymentPath = join(root, A11Y_VOICEOVER_POS_PAYMENT_MODULE);
  const kdsPath = join(root, A11Y_VOICEOVER_KDS_MODULE);

  const liveRegionModulePresent = existsSync(liveRegionPath);
  let todayWired = false;
  let posCartWired = false;
  let posPaymentWired = false;
  let kdsWired = false;

  if (existsSync(todayPath)) {
    const source = readFileSync(todayPath, "utf8");
    todayWired =
      source.includes("TODAY_VOICEOVER_PAGE_TITLE_ID") &&
      source.includes("TODAY_VOICEOVER_SR_HINT_TEST_ID") &&
      source.includes("aria-labelledby");
  }

  if (existsSync(posCartPath)) {
    const source = readFileSync(posCartPath, "utf8");
    posCartWired = source.includes("POS_VOICEOVER_CART_REGION_LABEL");
  }

  if (existsSync(posPaymentPath)) {
    const source = readFileSync(posPaymentPath, "utf8");
    posPaymentWired = source.includes("POS_VOICEOVER_PAYMENT_REGION_LABEL");
  }

  if (existsSync(kdsPath)) {
    const source = readFileSync(kdsPath, "utf8");
    kdsWired =
      source.includes("VoiceoverLiveRegion") &&
      source.includes("KDS_VOICEOVER_SHELL_ARIA_LABEL") &&
      source.includes("KDS_VOICEOVER_LIVE_REGION_TEST_ID");
  }

  const passed =
    liveRegionModulePresent &&
    todayWired &&
    posCartWired &&
    posPaymentWired &&
    kdsWired &&
    A11Y_VOICEOVER_SWEEP_WIRED_MODULES.length === 5 &&
    A11Y_VOICEOVER_SWEEP_SURFACES.length === 3 &&
    TODAY_VOICEOVER_PAGE_TITLE_ID === "today-page-title" &&
    KDS_VOICEOVER_LIVE_REGION_TEST_ID === "kds-voiceover-live-region" &&
    POS_VOICEOVER_CART_REGION_LABEL.length > 0 &&
    POS_VOICEOVER_PAYMENT_REGION_LABEL.length > 0 &&
    KDS_VOICEOVER_SHELL_ARIA_LABEL.length > 0 &&
    TODAY_VOICEOVER_SR_HINT_TEST_ID === "today-voiceover-nav-hint";

  return {
    policyId: A11Y_VOICEOVER_SWEEP_POLICY_ID,
    liveRegionModulePresent,
    todayWired,
    posCartWired,
    posPaymentWired,
    kdsWired,
    passed,
  };
}

export function formatA11yVoiceoverSweepAuditLines(
  summary: A11yVoiceoverSweepAuditSummary,
): string[] {
  return [
    `A11y VoiceOver sweep audit (${summary.policyId})`,
    `Live region module: ${summary.liveRegionModulePresent ? "present" : "missing"} (${A11Y_VOICEOVER_LIVE_REGION_MODULE})`,
    `Today (${TODAY_VOICEOVER_PAGE_TITLE_ID}): ${summary.todayWired ? "yes" : "no"}`,
    `POS cart (${POS_VOICEOVER_CART_REGION_LABEL.slice(0, 24)}…): ${summary.posCartWired ? "yes" : "no"}`,
    `POS payment: ${summary.posPaymentWired ? "yes" : "no"}`,
    `KDS (${KDS_VOICEOVER_LIVE_REGION_TEST_ID}): ${summary.kdsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
