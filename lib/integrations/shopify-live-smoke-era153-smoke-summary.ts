/**
 * Shopify LIVE integration summary — wiring audit (Era 153).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SHOPIFY_LIVE_SMOKE_ERA153_CANONICAL_SUMMARY_ARTIFACT,
  SHOPIFY_LIVE_SMOKE_ERA153_CAPABILITIES,
  SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID,
} from "@/lib/integrations/shopify-live-smoke-era153-policy";
import { auditShopifyLiveSmokeWiring } from "@/lib/integrations/shopify-live-smoke-summary";

export const SHOPIFY_LIVE_SMOKE_ERA153_SMOKE_SUMMARY_VERSION =
  SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID;

export type ShopifyLiveSmokeEra153Overall = "PASSED" | "FAILED" | "SKIPPED";

export type ShopifyLiveSmokeEra153ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type ShopifyLiveSmokeEra153Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type ShopifyLiveSmokeEra153Summary = {
  version: typeof SHOPIFY_LIVE_SMOKE_ERA153_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: ShopifyLiveSmokeEra153Overall;
  proofStatus: ShopifyLiveSmokeEra153ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: ShopifyLiveSmokeEra153Step[];
  honestyNote: string;
};

export function auditShopifyLiveSmokeEra153Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditShopifyLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, SHOPIFY_LIVE_SMOKE_ERA153_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveShopifyLiveSmokeEra153ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): ShopifyLiveSmokeEra153ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildShopifyLiveSmokeEra153Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): ShopifyLiveSmokeEra153Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveShopifyLiveSmokeEra153ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: ShopifyLiveSmokeEra153Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: ShopifyLiveSmokeEra153Step[] = [
    {
      id: "wiring_audit",
      label: "Shopify Admin API → webhook → KDS → inventory wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 153 Shopify LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era72)",
      status:
        liveSmokeOverall === "PASSED"
          ? "PASSED"
          : liveSmokeOverall === "SKIPPED"
            ? "SKIPPED"
            : liveSmokeOverall === "FAILED"
              ? "FAILED"
              : "SKIPPED",
      reason:
        liveSmokeOverall === "PASSED"
          ? "Live dev store path PASSED"
          : liveSmokeOverall
            ? `era72 artifact overall: ${liveSmokeOverall} — run npm run smoke:shopify-live with real store`
            : "No era72 artifact — run npm run smoke:shopify-live-era72",
    },
  ];

  return {
    version: SHOPIFY_LIVE_SMOKE_ERA153_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: SHOPIFY_LIVE_SMOKE_ERA153_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Shopify → webhook → KDS → inventory wiring — live proof requires dev store + DATABASE_URL.",
  };
}

export function formatShopifyLiveSmokeEra153ReportLines(
  summary: ShopifyLiveSmokeEra153Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era72): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
