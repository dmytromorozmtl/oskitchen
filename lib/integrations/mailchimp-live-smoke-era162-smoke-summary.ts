/**
 * Mailchimp LIVE integration summary — wiring audit (Era 162).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_SUMMARY_ARTIFACT,
  MAILCHIMP_LIVE_SMOKE_ERA162_CAPABILITIES,
  MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID,
} from "@/lib/integrations/mailchimp-live-smoke-era162-policy";
import { auditMailchimpLiveSmokeWiring } from "@/lib/integrations/mailchimp-live-smoke-summary";

export const MAILCHIMP_LIVE_SMOKE_ERA162_SMOKE_SUMMARY_VERSION =
  MAILCHIMP_LIVE_SMOKE_ERA162_POLICY_ID;

export type MailchimpLiveSmokeEra162Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MailchimpLiveSmokeEra162ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MailchimpLiveSmokeEra162Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MailchimpLiveSmokeEra162Summary = {
  version: typeof MAILCHIMP_LIVE_SMOKE_ERA162_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MailchimpLiveSmokeEra162Overall;
  proofStatus: MailchimpLiveSmokeEra162ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: string | null;
  capabilities: readonly string[];
  steps: MailchimpLiveSmokeEra162Step[];
  honestyNote: string;
};

export function auditMailchimpLiveSmokeEra162Wiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  return auditMailchimpLiveSmokeWiring(root);
}

export function readCanonicalLiveSmokeOverall(root: string = process.cwd()): string | null {
  const path = join(root, MAILCHIMP_LIVE_SMOKE_ERA162_CANONICAL_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function resolveMailchimpLiveSmokeEra162ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): MailchimpLiveSmokeEra162ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildMailchimpLiveSmokeEra162Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): MailchimpLiveSmokeEra162Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveSmokeOverall = readCanonicalLiveSmokeOverall(root);

  const proofStatus = resolveMailchimpLiveSmokeEra162ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: MailchimpLiveSmokeEra162Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: MailchimpLiveSmokeEra162Step[] = [
    {
      id: "wiring_audit",
      label: "Mailchimp OAuth → email list → campaign automation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 162 Mailchimp LIVE integration cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
    {
      id: "live_smoke_artifact",
      label: "Canonical live smoke artifact (era85)",
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
          ? "Live OAuth path PASSED"
          : liveSmokeOverall
            ? `era85 artifact overall: ${liveSmokeOverall} — run npm run smoke:mailchimp-live with real token`
            : "No era85 artifact — run npm run smoke:mailchimp-live-era85",
    },
  ];

  return {
    version: MAILCHIMP_LIVE_SMOKE_ERA162_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall,
    capabilities: MAILCHIMP_LIVE_SMOKE_ERA162_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo Mailchimp OAuth → email list → campaign automation wiring — live proof requires OAuth token + DATABASE_URL.",
  };
}

export function formatMailchimpLiveSmokeEra162ReportLines(
  summary: MailchimpLiveSmokeEra162Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke (era85): ${summary.liveSmokeOverall ?? "not run"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
