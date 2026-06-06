/**
 * QuickBooks LIVE integration summary — wiring audit (Era 155).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_SUMMARY_ARTIFACT,
  QUICKBOOKS_LIVE_SMOKE_ERA155_CAPABILITIES,
  QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID,
} from "@/lib/integrations/quickbooks-live-smoke-era155-policy";
import { auditQuickBooksLiveSmokeWiring } from "@/lib/integrations/quickbooks-live-smoke-summary";

export const QUICKBOOKS_LIVE_SMOKE_ERA155_SMOKE_SUMMARY_VERSION =
  QUICKBOOKS_LIVE_SMOKE_ERA155_POLICY_ID;

export type QuickBooksLiveSmokeEra155Overall = "PASSED" | "FAILED" | "SKIPPED";

export type QuickBooksLiveSmokeEra155ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type QuickBooksLiveSmokeEra155Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type QuickBooksLiveSmokeEra155Summary = {
  version: typeof QUICKBOOKS_LIVE_SMOKE_ERA155_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: QuickBooksLiveSmokeEra155Overall;
  proofStatus: QuickBooksLiveSmokeEra155ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: QuickBooksLiveSmokeEra155Step[];
  honestyNote: string;
};

export function auditQuickBooksLiveSmokeEra155Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditQuickBooksLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, QUICKBOOKS_LIVE_SMOKE_ERA155_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveQuickBooksLiveSmokeEra155ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): QuickBooksLiveSmokeEra155ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildQuickBooksLiveSmokeEra155Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): QuickBooksLiveSmokeEra155Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveQuickBooksLiveSmokeEra155ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: QuickBooksLiveSmokeEra155Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: QuickBooksLiveSmokeEra155Step[] = [
    {
      id: "wiring_audit",
      label: "QuickBooks OAuth → chart of accounts → daily sales journal wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 155 QuickBooks LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era80)",
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
          ? "Live sandbox OAuth path PASSED"
          : liveSmokeOverall
            ? `era80 artifact overall: ${liveSmokeOverall} — run npm run smoke:quickbooks-live with real realm`
            : "No era80 artifact — run npm run smoke:quickbooks-live-era80",
    },
  ];

  return {
    version: QUICKBOOKS_LIVE_SMOKE_ERA155_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: QUICKBOOKS_LIVE_SMOKE_ERA155_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo QuickBooks OAuth → chart of accounts → daily journal wiring — live proof requires Intuit sandbox + DATABASE_URL.",
  };
}

export function formatQuickBooksLiveSmokeEra155ReportLines(
  summary: QuickBooksLiveSmokeEra155Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era80): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
