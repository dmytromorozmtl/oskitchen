import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SKIPPED_TESTS_AUDIT_P2_34_DOC,
  SKIPPED_TESTS_AUDIT_P2_34_ENTRIES,
  SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS,
  SKIPPED_TESTS_AUDIT_P2_34_INVENTORY,
  SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID,
  SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT,
  countSkippedTestsAuditP2_34ByDisposition,
} from "@/lib/qa/skipped-tests-audit-p2-34-policy";
import { scanSkippedTestPatterns } from "@/lib/qa/skipped-tests-inventory";

const CHROMIUM_AUTHED_GLOBS = [
  "**/verticals/*.spec.ts",
  "**/real-time-profit.spec.ts",
  "**/dynamic-pricing.spec.ts",
  "**/invoice-scanner.spec.ts",
  "**/loyalty-2.0.spec.ts",
  "**/gift-cards-system.spec.ts",
  "**/menu-templates.spec.ts",
  "**/instant-payouts.spec.ts",
  "**/qr-ordering.spec.ts",
  "**/handheld-ordering.spec.ts",
  "**/voice-ordering.spec.ts",
  "**/white-label-pwa.spec.ts",
  "**/referral-program.spec.ts",
] as const;

const CHROMIUM_AUTHED_SPECS = [
  "e2e/verticals/ghost-kitchen.spec.ts",
  "e2e/verticals/meal-prep.spec.ts",
  "e2e/verticals/cafe.spec.ts",
  "e2e/real-time-profit.spec.ts",
  "e2e/dynamic-pricing.spec.ts",
  "e2e/invoice-scanner.spec.ts",
  "e2e/loyalty-2.0.spec.ts",
  "e2e/gift-cards-system.spec.ts",
  "e2e/menu-templates.spec.ts",
  "e2e/instant-payouts.spec.ts",
  "e2e/qr-ordering.spec.ts",
  "e2e/handheld-ordering.spec.ts",
  "e2e/voice-ordering.spec.ts",
  "e2e/white-label-pwa.spec.ts",
  "e2e/referral-program.spec.ts",
] as const;

export type SkippedTestsAuditP2_34Summary = {
  policyId: typeof SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID;
  registryCount: number;
  fixedCount: number;
  keepGatedCount: number;
  deletedCount: number;
  inventoryHits: number;
  docPresent: boolean;
  playwrightWired: boolean;
  loginSkipRemoved: boolean;
  sessionCookieSkipRemoved: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditSkippedTestsP2_34(root = process.cwd()): SkippedTestsAuditP2_34Summary {
  const docPresent = existsSync(join(root, SKIPPED_TESTS_AUDIT_P2_34_DOC));
  const inventoryPresent = existsSync(join(root, SKIPPED_TESTS_AUDIT_P2_34_INVENTORY));

  const playwrightPath = join(root, "playwright.config.ts");
  const playwrightSource = existsSync(playwrightPath)
    ? readFileSync(playwrightPath, "utf8")
    : "";

  const playwrightWired = CHROMIUM_AUTHED_GLOBS.every((glob) =>
    playwrightSource.includes(glob),
  );

  let loginSkipRemoved = true;
  let sessionCookieSkipRemoved = true;

  for (const spec of CHROMIUM_AUTHED_SPECS) {
    const path = join(root, spec);
    if (!existsSync(path)) {
      loginSkipRemoved = false;
      sessionCookieSkipRemoved = false;
      continue;
    }
    const source = readFileSync(path, "utf8");
    if (source.includes("E2E_SESSION_COOKIE")) {
      sessionCookieSkipRemoved = false;
    }
    if (
      source.includes('test.skip(true, "Requires authenticated session")') ||
      source.includes('test.skip(true, "No authed session")') ||
      source.includes("skipIfLoginRedirect")
    ) {
      loginSkipRemoved = false;
    }
  }

  const registryCount = SKIPPED_TESTS_AUDIT_P2_34_ENTRIES.length;
  const fixedCount = countSkippedTestsAuditP2_34ByDisposition("fixed");
  const keepGatedCount = countSkippedTestsAuditP2_34ByDisposition("keep-gated");
  const deletedCount = countSkippedTestsAuditP2_34ByDisposition("deleted");
  const inventoryHits = inventoryPresent ? scanSkippedTestPatterns(root).length : 0;

  const passed =
    docPresent &&
    inventoryPresent &&
    registryCount === SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT &&
    fixedCount === SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT &&
    playwrightWired &&
    loginSkipRemoved &&
    sessionCookieSkipRemoved &&
    SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS.length === 4;

  return {
    policyId: SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID,
    registryCount,
    fixedCount,
    keepGatedCount,
    deletedCount,
    inventoryHits,
    docPresent,
    playwrightWired,
    loginSkipRemoved,
    sessionCookieSkipRemoved,
    flowStepCount: SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS.length,
    passed,
  };
}

export function formatSkippedTestsAuditP2_34Lines(
  summary: SkippedTestsAuditP2_34Summary,
): string[] {
  return [
    `Skipped tests audit (${summary.policyId})`,
    `Registry entries: ${summary.registryCount}/${SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT}`,
    `Fixed: ${summary.fixedCount} · keep-gated: ${summary.keepGatedCount} · deleted: ${summary.deletedCount}`,
    `Inventory scan hits (remaining skips): ${summary.inventoryHits}`,
    `Doc (${SKIPPED_TESTS_AUDIT_P2_34_DOC}): ${summary.docPresent ? "yes" : "no"}`,
    `Playwright chromium-authed wired: ${summary.playwrightWired ? "yes" : "no"}`,
    `Login redirect skips removed: ${summary.loginSkipRemoved ? "yes" : "no"}`,
    `E2E_SESSION_COOKIE skips removed: ${summary.sessionCookieSkipRemoved ? "yes" : "no"}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
