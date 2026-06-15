/**
 * AI Marketing Manager summary — Round 2 wiring audit (Era 185).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_MARKETING_MANAGER_ERA185_CANONICAL_SUMMARY_ARTIFACT,
  AI_MARKETING_MANAGER_ERA185_CAPABILITIES,
  AI_MARKETING_MANAGER_ERA185_POLICY_ID,
  AI_MARKETING_MANAGER_ERA185_ROUTE,
} from "@/lib/ai/marketing-manager-era185-policy";
import { auditAiMarketingManagerSmokeWiring } from "@/lib/ai/marketing-manager-smoke-summary";

export const AI_MARKETING_MANAGER_ERA185_SMOKE_SUMMARY_VERSION =
  AI_MARKETING_MANAGER_ERA185_POLICY_ID;

export type AiMarketingManagerSmokeEra185Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiMarketingManagerSmokeEra185ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiMarketingManagerSmokeEra185Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiMarketingManagerSmokeEra185Summary = {
  version: typeof AI_MARKETING_MANAGER_ERA185_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiMarketingManagerSmokeEra185Overall;
  proofStatus: AiMarketingManagerSmokeEra185ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: AiMarketingManagerSmokeEra185Step[];
  honestyNote: string;
};

export function auditAiMarketingManagerSmokeEra185Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAiMarketingManagerSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, AI_MARKETING_MANAGER_ERA185_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAiMarketingManagerSmokeEra185ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiMarketingManagerSmokeEra185ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiMarketingManagerSmokeEra185Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AiMarketingManagerSmokeEra185Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAiMarketingManagerSmokeEra185ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiMarketingManagerSmokeEra185Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiMarketingManagerSmokeEra185Step[] = [
    {
      id: "wiring_audit",
      label: "Auto campaigns + weather promos → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 185 AI Marketing Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era110)",
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
          ? "Canonical era110 smoke PASSED"
          : liveSmokeOverall
            ? `era110 artifact overall: ${liveSmokeOverall}`
            : "No era110 artifact — run npm run smoke:ai-marketing-manager-era110",
    },
  ];

  return {
    version: AI_MARKETING_MANAGER_ERA185_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: AI_MARKETING_MANAGER_ERA185_ROUTE,
    capabilities: AI_MARKETING_MANAGER_ERA185_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with marketing consent, Klaviyo, and order history.",
  };
}

export function formatAiMarketingManagerSmokeEra185ReportLines(
  summary: AiMarketingManagerSmokeEra185Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era110): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
