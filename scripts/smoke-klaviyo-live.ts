/**
 * Klaviyo live smoke — validate API key, segment export, campaign trigger wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

loadSmokeEnv();

import {
  KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID,
  KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT,
} from "@/lib/integrations/klaviyo-live-smoke-era84-policy";
import { isPlaceholderKlaviyoApiKey } from "@/lib/integrations/klaviyo-live-smoke-summary";
import { triggerKlaviyoCampaignBatch } from "@/services/integrations/klaviyo/campaign-triggers.service";
import { verifyKlaviyoApiKey } from "@/services/integrations/klaviyo/klaviyo-api";
import {
  exportKlaviyoSegmentProfiles,
  listKlaviyoSegmentsForExport,
} from "@/services/integrations/klaviyo/segment-export.service";

export const KLAVIYO_LIVE_SMOKE_ARTIFACT = KLAVIYO_LIVE_SMOKE_ERA84_SUMMARY_ARTIFACT;

export const KLAVIYO_LIVE_SMOKE_VERSION = KLAVIYO_LIVE_SMOKE_ERA84_POLICY_ID;

export type KlaviyoLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type KlaviyoLiveSmokeStep = {
  id: string;
  label: string;
  status: KlaviyoLiveSmokeStepStatus;
  detail?: string;
};

export type KlaviyoLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_api_key"
  | "proof_failed";

export type KlaviyoLiveSmokeSummary = {
  version: typeof KLAVIYO_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: KlaviyoLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: KlaviyoLiveSmokeStep[];
  segmentId: string | null;
  honestyNote: string;
};

export type KlaviyoLiveSmokeEnvInput = {
  apiKey: string | null;
  segmentId: string | null;
};

export function readKlaviyoLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): KlaviyoLiveSmokeEnvInput {
  return {
    apiKey: env.KLAVIYO_API_KEY?.trim() ?? null,
    segmentId: env.KLAVIYO_SEGMENT_ID?.trim() ?? null,
  };
}

export function listMissingKlaviyoLiveSmokeEnvVars(input: KlaviyoLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.apiKey) missing.push("KLAVIYO_API_KEY");
  return missing;
}

export function buildKlaviyoLiveSmokeSummary(input: {
  steps: KlaviyoLiveSmokeStep[];
  missingEnvVars: string[];
  segmentId?: string | null;
}): KlaviyoLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "klaviyo_api_key_verify" && step.status === "SKIPPED",
  );

  let overall: KlaviyoLiveSmokeSummary["overall"];
  let proofStatus: KlaviyoLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_api_key";
  } else if (failed) {
    overall = "FAILED";
    proofStatus = "proof_failed";
  } else if (skippedOnly) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else {
    overall = "PASSED";
    proofStatus = "proof_passed";
  }

  return {
    version: KLAVIYO_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    segmentId: input.segmentId ?? null,
    honestyNote:
      "PASS requires live Klaviyo API key + segment list/export and campaign trigger wiring — campaign step dry-runs with zero recipients.",
  };
}

export async function runKlaviyoLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<KlaviyoLiveSmokeSummary> {
  const input = readKlaviyoLiveSmokeEnv(env);
  const missingEnvVars = listMissingKlaviyoLiveSmokeEnvVars(input);
  const steps: KlaviyoLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildKlaviyoLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "KLAVIYO_API_KEY present",
  });

  const apiKey = input.apiKey!;
  const placeholderKey = isPlaceholderKlaviyoApiKey(apiKey);
  const verified = await verifyKlaviyoApiKey(apiKey);
  steps.push({
    id: "klaviyo_api_key_verify",
    label: "Klaviyo API key verification",
    status: verified.ok ? "PASSED" : placeholderKey ? "SKIPPED" : "FAILED",
    detail: verified.ok
      ? "Klaviyo API reachable."
      : placeholderKey
        ? `Placeholder key: ${verified.error}. Replace with live private API key in vault.`
        : verified.error,
  });
  if (!verified.ok) {
    return buildKlaviyoLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      segmentId: input.segmentId,
    });
  }

  const segments = await listKlaviyoSegmentsForExport();
  steps.push({
    id: "segment_list_wiring",
    label: "Segment list wiring",
    status: segments.ok ? "PASSED" : "FAILED",
    detail: segments.ok
      ? `Listed ${segments.segments.length} segment(s).`
      : segments.error,
  });
  if (!segments.ok) {
    return buildKlaviyoLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      segmentId: input.segmentId,
    });
  }

  const segmentId =
    input.segmentId ??
    (segments.segments.length > 0 ? segments.segments[0]?.id : null) ??
    null;

  if (segmentId) {
    const exported = await exportKlaviyoSegmentProfiles(segmentId, { limit: 50 });
    steps.push({
      id: "segment_export_wiring",
      label: "Segment export wiring",
      status: exported.ok ? "PASSED" : "FAILED",
      detail: exported.message,
    });
    if (!exported.ok) {
      return buildKlaviyoLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        segmentId,
      });
    }
  } else {
    steps.push({
      id: "segment_export_wiring",
      label: "Segment export wiring",
      status: "SKIPPED",
      detail: "No segments in account — list wiring verified.",
    });
  }

  const campaign = await triggerKlaviyoCampaignBatch({ flow: "welcome", emails: [] });
  steps.push({
    id: "campaign_trigger_wiring",
    label: "Campaign trigger wiring (dry-run)",
    status: campaign.message.includes("No recipient") ? "PASSED" : campaign.ok ? "PASSED" : "FAILED",
    detail: campaign.message.includes("No recipient")
      ? "Dry-run wiring verified — zero recipients, no live sends."
      : campaign.message,
  });

  return buildKlaviyoLiveSmokeSummary({
    steps,
    missingEnvVars: [],
    segmentId,
  });
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runKlaviyoLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), KLAVIYO_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${KLAVIYO_LIVE_SMOKE_ARTIFACT}\n`);
  }

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
