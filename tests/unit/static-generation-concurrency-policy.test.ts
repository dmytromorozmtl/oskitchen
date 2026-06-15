import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT,
  resolveStaticGenerationMaxConcurrency,
  staticGenerationConcurrencyInvestigationSummary,
} from "@/lib/performance/static-generation-concurrency-policy";

const ROOT = process.cwd();

describe("staticGenerationMaxConcurrency policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to 1 on Vercel without env override", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_STATIC_GENERATION_MAX_CONCURRENCY", "");
    expect(resolveStaticGenerationMaxConcurrency()).toBe(
      STATIC_GENERATION_MAX_CONCURRENCY_VERCEL_DEFAULT,
    );
  });

  it("omits cap locally when env unset (Next.js default)", () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("NEXT_STATIC_GENERATION_MAX_CONCURRENCY", "");
    expect(resolveStaticGenerationMaxConcurrency()).toBeUndefined();
  });

  it("honors NEXT_STATIC_GENERATION_MAX_CONCURRENCY override", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("NEXT_STATIC_GENERATION_MAX_CONCURRENCY", "2");
    expect(resolveStaticGenerationMaxConcurrency()).toBe(2);
  });

  it("documents investigation outcome", () => {
    expect(staticGenerationConcurrencyInvestigationSummary()).toContain("OOM guard");
    expect(staticGenerationConcurrencyInvestigationSummary()).toContain(
      "NEXT_STATIC_GENERATION_MAX_CONCURRENCY",
    );
  });

  it("wires policy into next.config and vercel-build.sh", () => {
    const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    const vercelBuild = readFileSync(join(ROOT, "scripts/vercel-build.sh"), "utf8");

    expect(nextConfig).toContain("resolveStaticGenerationMaxConcurrency");
    expect(nextConfig).not.toMatch(/staticGenerationMaxConcurrency:\s*1,/);
    expect(vercelBuild).toContain('NEXT_STATIC_GENERATION_MAX_CONCURRENCY="1"');
  });
});
