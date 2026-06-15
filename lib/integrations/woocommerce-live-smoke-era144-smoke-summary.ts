/**
 * WooCommerce LIVE smoke summary — wiring audit (Era 144).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA144_CAPABILITIES,
  WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID,
} from "@/lib/integrations/woocommerce-live-smoke-era144-policy";
import { auditWooCommerceLiveSmokeWiring } from "@/lib/integrations/woocommerce-live-smoke-summary";

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_SMOKE_SUMMARY_VERSION =
  WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID;

export type WooCommerceLiveSmokeEra144Overall = "PASSED" | "FAILED" | "SKIPPED";

export type WooCommerceLiveSmokeEra144ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type WooCommerceLiveSmokeEra144Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type WooCommerceLiveSmokeEra144Summary = {
  version: typeof WOOCOMMERCE_LIVE_SMOKE_ERA144_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: WooCommerceLiveSmokeEra144Overall;
  proofStatus: WooCommerceLiveSmokeEra144ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: WooCommerceLiveSmokeEra144Step[];
  honestyNote: string;
};

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, "artifacts/woocommerce-live-smoke-summary.json");
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function auditWooCommerceLiveSmokeEra144Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditWooCommerceLiveSmokeWiring(root);
}

export function resolveWooCommerceLiveSmokeEra144ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): WooCommerceLiveSmokeEra144ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildWooCommerceLiveSmokeEra144Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): WooCommerceLiveSmokeEra144Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveWooCommerceLiveSmokeEra144ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: WooCommerceLiveSmokeEra144Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: WooCommerceLiveSmokeEra144Step[] = [
    {
      id: "wiring_audit",
      label: "Woo REST → webhook → KDS → inventory wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 144 WooCommerce LIVE smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era71)",
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
            ? `era71 artifact overall: ${liveSmokeOverall} — run npm run smoke:woo-live with real store`
            : "No era71 artifact — run npm run smoke:woocommerce-live-era71",
    },
  ];

  return {
    version: WOOCOMMERCE_LIVE_SMOKE_ERA144_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: WOOCOMMERCE_LIVE_SMOKE_ERA144_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Woo → webhook → KDS → inventory wiring — live proof requires HTTPS dev store + DATABASE_URL.",
  };
}

export function formatWooCommerceLiveSmokeEra144ReportLines(
  summary: WooCommerceLiveSmokeEra144Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era71): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
