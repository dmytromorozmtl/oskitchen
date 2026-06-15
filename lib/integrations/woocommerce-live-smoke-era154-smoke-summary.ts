/**
 * WooCommerce LIVE integration summary — wiring audit (Era 154).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_SUMMARY_ARTIFACT,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_CAPABILITIES,
  WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID,
} from "@/lib/integrations/woocommerce-live-smoke-era154-policy";
import { auditWooCommerceLiveSmokeWiring } from "@/lib/integrations/woocommerce-live-smoke-summary";

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_SMOKE_SUMMARY_VERSION =
  WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID;

export type WooCommerceLiveSmokeEra154Overall = "PASSED" | "FAILED" | "SKIPPED";

export type WooCommerceLiveSmokeEra154ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type WooCommerceLiveSmokeEra154Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type WooCommerceLiveSmokeEra154Summary = {
  version: typeof WOOCOMMERCE_LIVE_SMOKE_ERA154_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: WooCommerceLiveSmokeEra154Overall;
  proofStatus: WooCommerceLiveSmokeEra154ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: WooCommerceLiveSmokeEra154Step[];
  honestyNote: string;
};

export function auditWooCommerceLiveSmokeEra154Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditWooCommerceLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveWooCommerceLiveSmokeEra154ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): WooCommerceLiveSmokeEra154ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildWooCommerceLiveSmokeEra154Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): WooCommerceLiveSmokeEra154Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveWooCommerceLiveSmokeEra154ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: WooCommerceLiveSmokeEra154Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: WooCommerceLiveSmokeEra154Step[] = [
    {
      id: "wiring_audit",
      label: "Woo REST → webhook → canonical order → KDS → inventory wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 154 WooCommerce LIVE integration cert",
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
    version: WOOCOMMERCE_LIVE_SMOKE_ERA154_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: WOOCOMMERCE_LIVE_SMOKE_ERA154_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Woo REST → webhook → ExternalOrder → KDS → inventory wiring — live proof requires HTTPS dev store + DATABASE_URL.",
  };
}

export function formatWooCommerceLiveSmokeEra154ReportLines(
  summary: WooCommerceLiveSmokeEra154Summary,
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
