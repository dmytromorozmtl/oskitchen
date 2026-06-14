import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD,
} from "@/lib/performance/static-generation-max-concurrency-p2-48-policy";
import { STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT } from "@/lib/performance/static-generation-concurrency-policy";

export type StaticGenerationMaxConcurrencyP248AuditSummary = {
  policyId: typeof STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID;
  decision: typeof STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION;
  basePolicyWired: boolean;
  nextConfigUsesResolver: boolean;
  vercelBuildSetsConcurrency1: boolean;
  artifactPresent: boolean;
  measuredAppPages: number | null;
  passed: boolean;
};

export function auditStaticGenerationMaxConcurrencyP248(
  root = process.cwd(),
): StaticGenerationMaxConcurrencyP248AuditSummary {
  const basePolicyPath = join(root, STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY);
  const nextConfigPath = join(root, STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG);
  const vercelBuildPath = join(root, STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD);
  const artifactPath = join(root, STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT);

  const basePolicyWired = existsSync(basePolicyPath);
  let nextConfigUsesResolver = false;
  if (existsSync(nextConfigPath)) {
    const nextConfig = readFileSync(nextConfigPath, "utf8");
    nextConfigUsesResolver =
      nextConfig.includes("resolveStaticGenerationMaxConcurrency") &&
      !nextConfig.match(/staticGenerationMaxConcurrency:\s*1,/);
  }

  let vercelBuildSetsConcurrency1 = false;
  if (existsSync(vercelBuildPath)) {
    const vercelBuild = readFileSync(vercelBuildPath, "utf8");
    vercelBuildSetsConcurrency1 =
      vercelBuild.includes(`${STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV}="1"`) ||
      vercelBuild.includes(`${STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV}='1'`);
  }

  let artifactPresent = false;
  let measuredAppPages: number | null = null;
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      decision?: string;
      vercelConcurrency?: number;
      measurements?: { appPages?: number };
    };
    artifactPresent =
      artifact.policyId === STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID &&
      artifact.decision === STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION &&
      artifact.vercelConcurrency === STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT;
    measuredAppPages = artifact.measurements?.appPages ?? null;
  }

  const passed =
    basePolicyWired &&
    nextConfigUsesResolver &&
    vercelBuildSetsConcurrency1 &&
    artifactPresent &&
    measuredAppPages != null &&
    measuredAppPages >= 900;

  return {
    policyId: STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID,
    decision: STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION,
    basePolicyWired,
    nextConfigUsesResolver,
    vercelBuildSetsConcurrency1,
    artifactPresent,
    measuredAppPages,
    passed,
  };
}

export function formatStaticGenerationMaxConcurrencyP248AuditLines(
  summary: StaticGenerationMaxConcurrencyP248AuditSummary,
): string[] {
  return [
    `staticGenerationMaxConcurrency review (${summary.policyId})`,
    `Decision: ${summary.decision}`,
    `Base policy wired: ${summary.basePolicyWired ? "yes" : "no"}`,
    `next.config resolver: ${summary.nextConfigUsesResolver ? "yes" : "no"}`,
    `vercel-build concurrency=1: ${summary.vercelBuildSetsConcurrency1 ? "yes" : "no"}`,
    `Measured app pages: ${summary.measuredAppPages ?? "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
