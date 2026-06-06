/**
 * Price Intelligence summary — Round 2 wiring audit (Era 193).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRICE_INTELLIGENCE_ERA193_CANONICAL_SUMMARY_ARTIFACT,
  PRICE_INTELLIGENCE_ERA193_CAPABILITIES,
  PRICE_INTELLIGENCE_ERA193_POLICY_ID,
  PRICE_INTELLIGENCE_ERA193_ROUTE,
} from "@/lib/marketplace/price-intelligence-era193-policy";
import { auditPriceIntelligenceSmokeWiring } from "@/lib/marketplace/price-intelligence-smoke-summary";

export const PRICE_INTELLIGENCE_ERA193_SMOKE_SUMMARY_VERSION = PRICE_INTELLIGENCE_ERA193_POLICY_ID;

export type PriceIntelligenceSmokeEra193Overall = "PASSED" | "FAILED" | "SKIPPED";

export type PriceIntelligenceSmokeEra193ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type PriceIntelligenceSmokeEra193Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type PriceIntelligenceSmokeEra193Summary = {
  version: typeof PRICE_INTELLIGENCE_ERA193_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: PriceIntelligenceSmokeEra193Overall;
  proofStatus: PriceIntelligenceSmokeEra193ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: PriceIntelligenceSmokeEra193Step[];
  honestyNote: string;
};

export function auditPriceIntelligenceSmokeEra193Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditPriceIntelligenceSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, PRICE_INTELLIGENCE_ERA193_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolvePriceIntelligenceSmokeEra193ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): PriceIntelligenceSmokeEra193ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildPriceIntelligenceSmokeEra193Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): PriceIntelligenceSmokeEra193Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolvePriceIntelligenceSmokeEra193ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: PriceIntelligenceSmokeEra193Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: PriceIntelligenceSmokeEra193Step[] = [
    {
      id: "wiring_audit",
      label: "Spend scan → cheapest supplier → switch recommendations → auto-switch",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 193 Price Intelligence cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era118)",
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
          ? "Canonical era118 smoke PASSED"
          : liveSmokeOverall
            ? `era118 artifact overall: ${liveSmokeOverall}`
            : "No era118 artifact — run npm run smoke:price-intelligence-era118",
    },
  ];

  return {
    version: PRICE_INTELLIGENCE_ERA193_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: PRICE_INTELLIGENCE_ERA193_ROUTE,
    capabilities: PRICE_INTELLIGENCE_ERA193_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires marketplace PO history and multiple vendor SKUs per category.",
  };
}

export function formatPriceIntelligenceSmokeEra193ReportLines(
  summary: PriceIntelligenceSmokeEra193Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era118): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
