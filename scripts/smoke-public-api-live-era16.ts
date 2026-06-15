/**
 * Era 16 public API live smoke orchestrator.
 *
 * Missing SMOKE_PUBLIC_API_KEY → SKIPPED WITH REASON (exit 0).
 * Real credential failure → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LEGACY_SMOKE_NPM,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT,
} from "../lib/api-public/public-api-partner-confidence-era16-policy";

type SmokeStep = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

type SmokeSummary = {
  version: typeof PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  steps: SmokeStep[];
};

function resolveOverall(steps: SmokeStep[]): SmokeSummary["overall"] {
  if (steps.some((step) => step.status === "FAILED")) return "FAILED";
  const actionable = steps.filter((step) => step.status !== "SKIPPED");
  if (actionable.length === 0) return "SKIPPED";
  if (actionable.every((step) => step.status === "PASSED")) return "PASSED";
  return "FAILED";
}

function formatLine(step: SmokeStep): string {
  if (step.status === "SKIPPED") {
    return `[SKIPPED WITH REASON] ${step.label}: ${step.reason ?? "skipped"}`;
  }
  if (step.status === "FAILED") {
    return `[FAILED] ${step.label}${step.reason ? `: ${step.reason}` : ""}`;
  }
  return `[PASSED] ${step.label}`;
}

function main() {
  const key = process.env.SMOKE_PUBLIC_API_KEY?.trim();
  const steps: SmokeStep[] = [];

  if (!key?.startsWith("kos_")) {
    steps.push({
      id: "live-tenant",
      label: "Live public API tenant isolation smoke",
      status: "SKIPPED",
      reason:
        "SMOKE_PUBLIC_API_KEY is not set — create a kos_ key in Dashboard → Developer for live proof.",
    });
  } else {
    const result = spawnSync("npm", ["run", PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LEGACY_SMOKE_NPM], {
      stdio: "inherit",
      env: process.env,
    });
    steps.push({
      id: "live-tenant",
      label: "Live public API tenant isolation smoke",
      status: result.status === 0 ? "PASSED" : "FAILED",
      reason: result.status === 0 ? undefined : `npm run ${PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LEGACY_SMOKE_NPM} exited ${result.status ?? 1}`,
    });
  }

  const summary: SmokeSummary = {
    version: PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
    runAt: new Date().toISOString(),
    overall: resolveOverall(steps),
    steps,
  };

  const artifactPath = join(process.cwd(), PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`\nPublic API live smoke (${PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID})\n`);
  for (const step of steps) {
    console.log(formatLine(step));
  }
  console.log(`\nOverall: ${summary.overall}`);
  console.log(`Summary artifact: ${PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
