/**
 * Mailchimp live smoke summary — wiring audit + email marketing proof (Era 85).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS,
} from "@/lib/integrations/mailchimp-live-smoke-era85-policy";

export const MAILCHIMP_LIVE_SMOKE_SUMMARY_VERSION = MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID;

export type MailchimpLiveSmokeEra85Overall = "PASSED" | "FAILED" | "SKIPPED";

export type MailchimpLiveSmokeEra85ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type MailchimpLiveSmokeEra85Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type MailchimpLiveSmokeEra85Summary = {
  version: typeof MAILCHIMP_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: MailchimpLiveSmokeEra85Overall;
  proofStatus: MailchimpLiveSmokeEra85ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: MailchimpLiveSmokeEra85Overall | null;
  missingEnvVars: string[];
  steps: MailchimpLiveSmokeEra85Step[];
  honestyNote: string;
};

export function isPlaceholderMailchimpAccessToken(accessToken: string): boolean {
  const normalized = accessToken.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.endsWith(".local")
  );
}

export function auditMailchimpLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of MAILCHIMP_LIVE_SMOKE_ERA85_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/mailchimp/list-sync.service.ts") {
      if (!src.includes("syncCustomersToMailchimpList")) {
        failures.push("list-sync.service.ts missing syncCustomersToMailchimpList");
      }
    }
    if (rel === "services/integrations/mailchimp/campaign-automation.service.ts") {
      if (!src.includes("triggerMailchimpCampaignAutomation")) {
        failures.push("campaign-automation.service.ts missing triggerMailchimpCampaignAutomation");
      }
      if (!src.includes("listMailchimpCampaignAutomations")) {
        failures.push("campaign-automation.service.ts missing listMailchimpCampaignAutomations");
      }
    }
    if (rel === "services/integrations/mailchimp/mailchimp-api.ts") {
      if (!src.includes("fetchMailchimpOAuthMetadata")) {
        failures.push("mailchimp-api.ts missing fetchMailchimpOAuthMetadata");
      }
      if (!src.includes("fetchMailchimpLists")) {
        failures.push("mailchimp-api.ts missing fetchMailchimpLists");
      }
      if (!src.includes("fetchMailchimpAutomations")) {
        failures.push("mailchimp-api.ts missing fetchMailchimpAutomations");
      }
    }
    if (rel === "scripts/smoke-mailchimp-live.ts") {
      if (!src.includes("email_list_wiring")) {
        failures.push("smoke-mailchimp-live.ts missing email_list_wiring step");
      }
      if (!src.includes("campaign_automation_wiring")) {
        failures.push("smoke-mailchimp-live.ts missing campaign_automation_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveMailchimpLiveSmokeEra85ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: MailchimpLiveSmokeEra85Overall | null;
  liveProofStatus?: string;
}): MailchimpLiveSmokeEra85ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_token") {
    return "proof_skipped_placeholder_token";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_token";
}

export function resolveMailchimpLiveSmokeEra85Overall(
  proofStatus: MailchimpLiveSmokeEra85ProofStatus,
): MailchimpLiveSmokeEra85Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_token"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildMailchimpLiveSmokeEra85Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: MailchimpLiveSmokeEra85Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: MailchimpLiveSmokeEra85Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): MailchimpLiveSmokeEra85Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveMailchimpLiveSmokeEra85ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveMailchimpLiveSmokeEra85Overall(proofStatus);

  const steps: MailchimpLiveSmokeEra85Step[] = [
    {
      id: "wiring_audit",
      label: "Mailchimp → email list → campaign automation wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 85 Mailchimp live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_oauth_list_automation",
      label: "Live OAuth → email list → campaign automation",
      status:
        input.liveSmoke.overall === "PASSED"
          ? "PASSED"
          : input.liveSmoke.overall === "SKIPPED"
            ? "SKIPPED"
            : "FAILED",
      reason:
        input.liveSmoke.steps.find((s) => s.status === "FAILED")?.reason ??
        input.liveSmoke.steps.find((s) => s.status === "SKIPPED")?.reason,
    });
  }

  return {
    version: MAILCHIMP_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Mailchimp OAuth + audience list and automation list wiring — automation trigger is list-only dry-run.",
  };
}

export function formatMailchimpLiveSmokeEra85ReportLines(
  summary: MailchimpLiveSmokeEra85Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Live smoke: ${summary.liveSmokeOverall ?? "not run"}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
