/**
 * AI Inventory Manager summary — Round 2 wiring audit (Era 182).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_INVENTORY_MANAGER_ERA182_CANONICAL_SUMMARY_ARTIFACT,
  AI_INVENTORY_MANAGER_ERA182_CAPABILITIES,
  AI_INVENTORY_MANAGER_ERA182_POLICY_ID,
  AI_INVENTORY_MANAGER_ERA182_ROUTE,
} from "@/lib/ai/inventory-manager-era182-policy";
import { auditAiInventoryManagerSmokeWiring } from "@/lib/ai/inventory-manager-smoke-summary";

export const AI_INVENTORY_MANAGER_ERA182_SMOKE_SUMMARY_VERSION =
  AI_INVENTORY_MANAGER_ERA182_POLICY_ID;

export type AiInventoryManagerSmokeEra182Overall = "PASSED" | "FAILED" | "SKIPPED";

export type AiInventoryManagerSmokeEra182ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type AiInventoryManagerSmokeEra182Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type AiInventoryManagerSmokeEra182Summary = {
  version: typeof AI_INVENTORY_MANAGER_ERA182_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: AiInventoryManagerSmokeEra182Overall;
  proofStatus: AiInventoryManagerSmokeEra182ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  route: string;
  capabilities: readonly string[];
  steps: AiInventoryManagerSmokeEra182Step[];
  honestyNote: string;
};

export function auditAiInventoryManagerSmokeEra182Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditAiInventoryManagerSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, AI_INVENTORY_MANAGER_ERA182_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveAiInventoryManagerSmokeEra182ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): AiInventoryManagerSmokeEra182ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildAiInventoryManagerSmokeEra182Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): AiInventoryManagerSmokeEra182Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveAiInventoryManagerSmokeEra182ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: AiInventoryManagerSmokeEra182Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: AiInventoryManagerSmokeEra182Step[] = [
    {
      id: "wiring_audit",
      label: "Waste + theft + shrinkage signals → daily brief → dashboard",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 182 AI Inventory Manager cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era107)",
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
          ? "Canonical era107 smoke PASSED"
          : liveSmokeOverall
            ? `era107 artifact overall: ${liveSmokeOverall}`
            : "No era107 artifact — run npm run smoke:ai-inventory-manager-era107",
    },
  ];

  return {
    version: AI_INVENTORY_MANAGER_ERA182_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    route: AI_INVENTORY_MANAGER_ERA182_ROUTE,
    capabilities: AI_INVENTORY_MANAGER_ERA182_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring — live proof requires workspace with waste logs, theft alerts, and completed inventory counts.",
  };
}

export function formatAiInventoryManagerSmokeEra182ReportLines(
  summary: AiInventoryManagerSmokeEra182Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era107): ${summary.liveSmokeOverall ?? "not run"}`,
    `Route: ${summary.route}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
