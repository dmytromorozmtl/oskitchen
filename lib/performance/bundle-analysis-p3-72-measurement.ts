import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditBundleChunks,
  auditCodeSplitTargets,
} from "@/lib/performance/bundle-chunk-audit";
import {
  BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_LAZY_PANELS,
  BUNDLE_ANALYSIS_TOP_CHUNK_COUNT,
} from "@/lib/performance/bundle-analysis-policy";
import {
  BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID,
  BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT,
  BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS,
} from "@/lib/performance/bundle-analysis-p3-72-policy";

export type BundleAnalysisWave2Validation = {
  wired: number;
  total: number;
};

export type BundleAnalysisContractValidation = {
  passed: boolean;
  wave1Wired: boolean;
  wave2Wired: boolean;
  upstreamAuditOk: boolean;
  bundleAnalyzerWired: boolean;
  failures: string[];
};

export function auditBundleAnalysisWave2Targets(root = process.cwd()): BundleAnalysisWave2Validation {
  const lazyPath = join(root, BUNDLE_ANALYSIS_LAZY_PANELS);
  if (!existsSync(lazyPath)) {
    return { wired: 0, total: BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT };
  }

  const lazySource = readFileSync(lazyPath, "utf8");
  let wired = 0;

  for (const target of BUNDLE_ANALYSIS_P3_72_WAVE_2_TARGETS) {
    if (!lazySource.includes(target.lazyExport)) continue;
    const routePath = join(root, target.routeFile);
    if (!existsSync(routePath)) continue;
    const routeSource = readFileSync(routePath, "utf8");
    if (routeSource.includes(target.lazyExport)) {
      wired += 1;
    }
  }

  return { wired, total: BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT };
}

export function validateBundleAnalysisContract(
  root = process.cwd(),
): BundleAnalysisContractValidation {
  const failures: string[] = [];

  const wave1 = auditCodeSplitTargets(root);
  const wave1Wired = wave1.wired === BUNDLE_ANALYSIS_TOP_CHUNK_COUNT;
  if (!wave1Wired) {
    failures.push(`wave 1 code-split wired ${wave1.wired}/${BUNDLE_ANALYSIS_TOP_CHUNK_COUNT}`);
  }

  const wave2 = auditBundleAnalysisWave2Targets(root);
  const wave2Wired = wave2.wired === BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT;
  if (!wave2Wired) {
    failures.push(`wave 2 code-split wired ${wave2.wired}/${BUNDLE_ANALYSIS_P3_72_WAVE_2_COUNT}`);
  }

  const upstream = auditBundleChunks(root);
  const upstreamAuditOk =
    upstream.passed && upstream.policyId === BUNDLE_ANALYSIS_P3_72_UPSTREAM_POLICY_ID;
  if (!upstreamAuditOk) {
    failures.push("upstream bundle chunk audit failed");
  }

  let bundleAnalyzerWired = false;
  const nextConfigPath = join(root, "next.config.ts");
  if (!existsSync(nextConfigPath)) {
    failures.push("missing next.config.ts");
  } else {
    const nextConfig = readFileSync(nextConfigPath, "utf8");
    bundleAnalyzerWired = nextConfig.includes("@next/bundle-analyzer");
    if (!bundleAnalyzerWired) {
      failures.push("next.config.ts missing @next/bundle-analyzer");
    }
  }

  if (BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS.length !== BUNDLE_ANALYSIS_TOP_CHUNK_COUNT) {
    failures.push("upstream wave 1 target count drift");
  }

  return {
    passed: failures.length === 0,
    wave1Wired,
    wave2Wired,
    upstreamAuditOk,
    bundleAnalyzerWired,
    failures,
  };
}
