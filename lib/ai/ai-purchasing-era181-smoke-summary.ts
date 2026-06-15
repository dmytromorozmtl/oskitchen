/**
 * AI Purchasing Manager summary — Round 2 wiring audit (Era 181).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_PURCHASING_ERA181_CANONICAL_SUMMARY_ARTIFACT,
  AI_PURCHASING_ERA181_CAPABILITIES,
  AI_PURCHASING_ERA181_POLICY_ID,
  AI_PURCHASING_ERA181_ROUTE,
} from "@/lib/ai/ai-purchasing-era181-policy";
import { auditAiPurchasingSmokeWiring } from "@/lib/ai/ai-purchasing-smoke-summary";

export const AI_PURCHASING_ERA181_SMOKE_SUMMARY_VERSION = AI_PURCHASING_ERA181_POLICY_ID;

export type AiPurchasingSmokeEra181Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiPurchasingSmokeEra181ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiPurchasingSmokeEra181Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiPurchasingSmokeEra181Summary = {
  version: typeof AI_PURCHASING_ERA181_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiPurchasingSmokeEra181Overall;
  proofStatus: AiPurchasingSmokeEra181ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: AiPurchasingSmokeEra181Step[];
  honestyNote: string;
};

export function auditAiPurchasingSmokeEra181Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAiPurchasingSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, AI_PURCHASING_ERA181_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAiPurchasingSmokeEra181ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiPurchasingSmokeEra181ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiPurchasingSmokeEra181Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AiPurchasingSmokeEra181Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAiPurchasingSmokeEra181ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiPurchasingSmokeEra181Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiPurchasingSmokeEra181Step[] = [
    {
      id: "wiring_audit",
      label: "Shortage prediction → price optimization → alternative supplier → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 181 AI Purchasing Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era106)",
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
          ? "Canonical era106 smoke PASSED"
          : liveSmokeOverall
            ? `era106 artifact overall: ${liveSmokeOverall}`
            : "No era106 artifact — run npm run smoke:ai-purchasing-era106",
    },
  ];

  return {
    version: AI_PURCHASING_ERA181_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: AI_PURCHASING_ERA181_ROUTE,
    capabilities: AI_PURCHASING_ERA181_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with ingredients, supplier catalog, and demand data.",
  };
}

export function formatAiPurchasingSmokeEra181ReportLines(
  summary: AiPurchasingSmokeEra181Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era106): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
