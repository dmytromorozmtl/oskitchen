import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditStaticGenerationMaxConcurrencyP248,
  formatStaticGenerationMaxConcurrencyP248AuditLines,
} from "@/lib/performance/static-generation-max-concurrency-p2-48-audit";
import {
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CHECK_NPM_SCRIPT,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_NPM_SCRIPT,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_WORKFLOW,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DOC,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_WIRING_PATHS,
} from "@/lib/performance/static-generation-max-concurrency-p2-48-policy";
import {
  STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT,
  resolveStaticGenerationMaxConcurrency,
} from "@/lib/performance/static-generation-concurrency-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("staticGenerationMaxConcurrency review (P2-48)", () => {
  it("locks P2-48 policy and retain-vercel-1 decision", () => {
    expect(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID).toBe(
      "static-generation-max-concurrency-p2-48-v1",
    );
    expect(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION).toBe(
      "retain-vercel-1-local-uncapped",
    );
    expect(STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT).toBe(1);
  });

  it("passes full P2-48 audit — measured 957 pages, resolver wired, Vercel=1", () => {
    const summary = auditStaticGenerationMaxConcurrencyP248(ROOT);
    expect(summary.basePolicyWired).toBe(true);
    expect(summary.nextConfigUsesResolver).toBe(true);
    expect(summary.vercelBuildSetsConcurrency1).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.measuredAppPages).toBeGreaterThanOrEqual(900);
    expect(summary.passed).toBe(true);
  });

  it("base policy defaults Vercel to 1 and local to uncapped", () => {
    const prevVercel = process.env.VERCEL;
    const prevOverride = process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY;
    try {
      process.env.VERCEL = "1";
      delete process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY;
      expect(resolveStaticGenerationMaxConcurrency()).toBe(1);

      delete process.env.VERCEL;
      expect(resolveStaticGenerationMaxConcurrency()).toBeUndefined();

      process.env.VERCEL = "1";
      process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY = "2";
      expect(resolveStaticGenerationMaxConcurrency()).toBe(2);
    } finally {
      if (prevVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prevVercel;
      if (prevOverride === undefined) delete process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY;
      else process.env.NEXT_STATIC_GENERATION_MAX_CONCURRENCY = prevOverride;
    }
  });

  it("next.config uses resolver not hardcoded staticGenerationMaxConcurrency: 1", () => {
    const source = readSource(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG);
    expect(source).toContain("resolveStaticGenerationMaxConcurrency");
    expect(source).not.toMatch(/staticGenerationMaxConcurrency:\s*1,/);
  });

  it("vercel-build exports NEXT_STATIC_GENERATION_MAX_CONCURRENCY=1", () => {
    const source = readSource(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD);
    expect(source).toContain(`${STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV}="1"`);
    expect(source).toContain(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY);
  });

  it("P2-48 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of STATIC_GENERATION_MAX_CONCURRENCY_P2_48_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_NPM_SCRIPT}"`);

    const ci = readSource(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_WORKFLOW);
    expect(ci).toContain(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CHECK_NPM_SCRIPT);

    const doc = readSource(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DOC);
    expect(doc).toContain(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID);
    expect(doc).toContain(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION);

    const artifact = JSON.parse(readSource(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT));
    expect(artifact.policyId).toBe(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID);
    expect(artifact.vercelConcurrency).toBe(1);
    expect(artifact.measurements.appPages).toBeGreaterThanOrEqual(900);
  });

  it("formats audit lines", () => {
    const summary = auditStaticGenerationMaxConcurrencyP248(ROOT);
    const lines = formatStaticGenerationMaxConcurrencyP248AuditLines(summary);
    expect(lines.some((line) => line.includes(STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
