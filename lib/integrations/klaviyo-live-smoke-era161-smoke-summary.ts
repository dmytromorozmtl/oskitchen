/**
 * Klaviyo LIVE integration summary — wiring audit (Era 161).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_SUMMARY_ARTIFACT,
  KLAVIYO_LIVE_SMOKE_ERA161_CAPABILITIES,
  KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID,
} from "@/lib/integrations/klaviyo-live-smoke-era161-policy";
import { auditKlaviyoLiveSmokeWiring } from "@/lib/integrations/klaviyo-live-smoke-summary";

export const KLAVIYO_LIVE_SMOKE_ERA161_SMOKE_SUMMARY_VERSION = KLAVIYO_LIVE_SMOKE_ERA161_POLICY_ID;

export type KlaviyoLiveSmokeEra161Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KlaviyoLiveSmokeEra161ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KlaviyoLiveSmokeEra161Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KlaviyoLiveSmokeEra161Summary = {
  version: typeof KLAVIYO_LIVE_SMOKE_ERA161_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KlaviyoLiveSmokeEra161Overall;
  proofStatus: KlaviyoLiveSmokeEra161ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: KlaviyoLiveSmokeEra161Step[];
  honestyNote: string;
};

export function auditKlaviyoLiveSmokeEra161Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditKlaviyoLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, KLAVIYO_LIVE_SMOKE_ERA161_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveKlaviyoLiveSmokeEra161ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): KlaviyoLiveSmokeEra161ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildKlaviyoLiveSmokeEra161Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): KlaviyoLiveSmokeEra161Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveKlaviyoLiveSmokeEra161ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: KlaviyoLiveSmokeEra161Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: KlaviyoLiveSmokeEra161Step[] = [
    {
      id: "wiring_audit",
      label: "Klaviyo API key → campaign triggers → segment export wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 161 Klaviyo LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era84)",
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
          ? "Live API key path PASSED"
          : liveSmokeOverall
            ? `era84 artifact overall: ${liveSmokeOverall} — run npm run smoke:klaviyo-live with real API key`
            : "No era84 artifact — run npm run smoke:klaviyo-live-era84",
    },
  ];

  return {
    version: KLAVIYO_LIVE_SMOKE_ERA161_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: KLAVIYO_LIVE_SMOKE_ERA161_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Klaviyo API key → campaign triggers → segment export wiring — live proof requires private API key.",
  };
}

export function formatKlaviyoLiveSmokeEra161ReportLines(
  summary: KlaviyoLiveSmokeEra161Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era84): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
