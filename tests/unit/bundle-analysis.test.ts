import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBundleChunks,
  auditCodeSplitTargets,
} from "@/lib/performance/bundle-chunk-audit";
import {
  BUNDLE_ANALYSIS_CHUNK_NPM_SCRIPT,
  BUNDLE_ANALYSIS_CI_WORKFLOW,
  BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_LAZY_PANELS,
  BUNDLE_ANALYSIS_POLICY_ID,
  BUNDLE_ANALYSIS_TOP_CHUNK_COUNT,
  BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES,
  BUNDLE_ANALYSIS_UNIT_TEST,
} from "@/lib/performance/bundle-analysis-policy";

const ROOT = process.cwd();

describe("bundle analysis (P1-39)", () => {
  it("locks policy id and top-5 heavy packages", () => {
    expect(BUNDLE_ANALYSIS_POLICY_ID).toBe("bundle-analysis-p1-39-v1");
    expect(BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES).toHaveLength(BUNDLE_ANALYSIS_TOP_CHUNK_COUNT);
    expect(BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS).toHaveLength(BUNDLE_ANALYSIS_TOP_CHUNK_COUNT);
  });

  it("wires lazy chart panels on all code-split targets", () => {
    expect(existsSync(join(ROOT, BUNDLE_ANALYSIS_LAZY_PANELS))).toBe(true);
    const split = auditCodeSplitTargets(ROOT);
    expect(split.wired).toBe(BUNDLE_ANALYSIS_TOP_CHUNK_COUNT);
    expect(split.total).toBe(BUNDLE_ANALYSIS_TOP_CHUNK_COUNT);
  });

  it("passes bundle chunk audit and registers npm + CI scripts", () => {
    const summary = auditBundleChunks(ROOT);
    expect(summary.passed).toBe(true);
    expect(summary.codeSplitTargetsWired).toBe(BUNDLE_ANALYSIS_TOP_CHUNK_COUNT);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BUNDLE_ANALYSIS_CHUNK_NPM_SCRIPT]).toContain("audit-bundle-chunks.ts");
    expect(pkg.scripts?.["test:ci:bundle-analysis"]).toContain(BUNDLE_ANALYSIS_UNIT_TEST);
    expect(pkg.scripts?.analyze).toContain("ANALYZE=true");

    const workflow = readFileSync(join(ROOT, BUNDLE_ANALYSIS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:bundle-chunks");

    const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    expect(nextConfig).toContain("@next/bundle-analyzer");
  });
});
