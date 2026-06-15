/**
 * Klaviyo live smoke summary — wiring audit + marketing automation proof (Era 84).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS,
} from "@/lib/integrations/klaviyo-live-smoke-era84-policy";

export const KLAVIYO_LIVE_SMOKE_SUMMARY_VERSION = KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID;

export type KlaviyoLiveSmokeEra84Overall = "PASSED" | "FAILED" | "SKIPPED";

export type KlaviyoLiveSmokeEra84ProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_api_key"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed";

export type KlaviyoLiveSmokeEra84Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type KlaviyoLiveSmokeEra84Summary = {
  version: typeof KLAVIYO_LIVE_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: KlaviyoLiveSmokeEra84Overall;
  proofStatus: KlaviyoLiveSmokeEra84ProofStatus;
  wiringCertPassed: boolean;
  liveSmokeOverall: KlaviyoLiveSmokeEra84Overall | null;
  missingEnvVars: string[];
  steps: KlaviyoLiveSmokeEra84Step[];
  honestyNote: string;
};

export function isPlaceholderKlaviyoApiKey(apiKey: string): boolean {
  const normalized = apiKey.trim().toLowerCase();
  return (
    normalized.includes("smoke-test") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized === "pk_test" ||
    normalized.endsWith(".local")
  );
}

export function auditKlaviyoLiveSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  for (const rel of KLAVIYO_LIVE_SMOKE_ERA84_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");
    if (rel === "services/integrations/klaviyo/segment-export.service.ts") {
      if (!src.includes("exportKlaviyoSegmentProfiles")) {
        failures.push("segment-export.service.ts missing exportKlaviyoSegmentProfiles");
      }
      if (!src.includes("listKlaviyoSegmentsForExport")) {
        failures.push("segment-export.service.ts missing listKlaviyoSegmentsForExport");
      }
    }
    if (rel === "services/integrations/klaviyo/campaign-triggers.service.ts") {
      if (!src.includes("triggerKlaviyoCampaignBatch")) {
        failures.push("campaign-triggers.service.ts missing triggerKlaviyoCampaignBatch");
      }
    }
    if (rel === "services/integrations/klaviyo/klaviyo-api.ts") {
      if (!src.includes("verifyKlaviyoApiKey")) {
        failures.push("klaviyo-api.ts missing verifyKlaviyoApiKey");
      }
      if (!src.includes("fetchKlaviyoSegments")) {
        failures.push("klaviyo-api.ts missing fetchKlaviyoSegments");
      }
    }
    if (rel === "scripts/smoke-klaviyo-live.ts") {
      if (!src.includes("segment_export_wiring")) {
        failures.push("smoke-klaviyo-live.ts missing segment_export_wiring step");
      }
      if (!src.includes("campaign_trigger_wiring")) {
        failures.push("smoke-klaviyo-live.ts missing campaign_trigger_wiring step");
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function resolveKlaviyoLiveSmokeEra84ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
  liveOverall: KlaviyoLiveSmokeEra84Overall | null;
  liveProofStatus?: string;
}): KlaviyoLiveSmokeEra84ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  if (input.liveProofStatus === "proof_skipped_missing_prerequisites") {
    return "proof_skipped_missing_prerequisites";
  }
  if (input.liveProofStatus === "proof_skipped_placeholder_api_key") {
    return "proof_skipped_placeholder_api_key";
  }
  if (input.liveOverall === "PASSED") return "proof_passed";
  if (input.liveOverall === "SKIPPED") return "proof_skipped_missing_prerequisites";
  if (input.liveOverall === "FAILED") return "proof_failed";
  return "proof_skipped_placeholder_api_key";
}

export function resolveKlaviyoLiveSmokeEra84Overall(
  proofStatus: KlaviyoLiveSmokeEra84ProofStatus,
): KlaviyoLiveSmokeEra84Overall {
  if (proofStatus === "proof_passed") return "PASSED";
  if (
    proofStatus === "proof_skipped_missing_prerequisites" ||
    proofStatus === "proof_skipped_placeholder_api_key"
  ) {
    return "SKIPPED";
  }
  return "FAILED";
}

export function buildKlaviyoLiveSmokeEra84Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  liveSmoke?: {
    overall: KlaviyoLiveSmokeEra84Overall;
    proofStatus: string;
    missingEnvVars: string[];
    steps: KlaviyoLiveSmokeEra84Step[];
  } | null;
  commitSha?: string | null;
  runAt?: Date;
}): KlaviyoLiveSmokeEra84Summary {
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const liveOverall = input.liveSmoke?.overall ?? null;
  const proofStatus = resolveKlaviyoLiveSmokeEra84ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
    liveOverall,
    liveProofStatus: input.liveSmoke?.proofStatus,
  });
  const overall = resolveKlaviyoLiveSmokeEra84Overall(proofStatus);

  const steps: KlaviyoLiveSmokeEra84Step[] = [
    {
      id: "wiring_audit",
      label: "Klaviyo → segment export → campaign trigger wiring",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 84 Klaviyo live smoke cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  if (input.liveSmoke) {
    steps.push({
      id: "live_api_segment_campaign",
      label: "Live API key → segment export → campaign trigger",
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
    version: KLAVIYO_LIVE_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    liveSmokeOverall: liveOverall,
    missingEnvVars: input.liveSmoke?.missingEnvVars ?? [],
    steps,
    honestyNote:
      "PASS requires live Klaviyo API key + segment list/export and campaign trigger wiring — campaign step dry-runs with zero recipients.",
  };
}

export function formatKlaviyoLiveSmokeEra84ReportLines(
  summary: KlaviyoLiveSmokeEra84Summary,
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
