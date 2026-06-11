import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS,
  BUNDLE_ANALYSIS_LAZY_PANELS,
  BUNDLE_ANALYSIS_POLICY_ID,
  BUNDLE_ANALYSIS_TOP_CHUNK_COUNT,
  BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES,
} from "@/lib/performance/bundle-analysis-policy";

export type BundleChunkEntry = {
  id: string;
  sizeKb: number;
  packageHint: string | null;
};

export type BundleChunkAuditSummary = {
  policyId: typeof BUNDLE_ANALYSIS_POLICY_ID;
  topChunks: BundleChunkEntry[];
  codeSplitTargetsWired: number;
  codeSplitTargetsTotal: number;
  heavyPackages: readonly string[];
  passed: boolean;
};

const PACKAGE_HINTS: Array<{ pattern: RegExp; package: string }> = [
  { pattern: /recharts/i, package: "recharts" },
  { pattern: /jspdf/i, package: "jspdf" },
  { pattern: /sentry/i, package: "@sentry/nextjs" },
  { pattern: /supabase/i, package: "@supabase/supabase-js" },
  { pattern: /lucide/i, package: "lucide-react" },
];

function hintForChunk(id: string): string | null {
  for (const row of PACKAGE_HINTS) {
    if (row.pattern.test(id)) return row.package;
  }
  return null;
}

export function scanStaticChunks(root: string, limit = BUNDLE_ANALYSIS_TOP_CHUNK_COUNT): BundleChunkEntry[] {
  const chunksDir = join(root, ".next/static/chunks");
  if (!existsSync(chunksDir)) return [];

  const entries: BundleChunkEntry[] = [];
  for (const name of readdirSync(chunksDir)) {
    if (!name.endsWith(".js")) continue;
    const path = join(chunksDir, name);
    const sizeKb = Math.round(statSync(path).size / 1024);
    entries.push({
      id: name,
      sizeKb,
      packageHint: hintForChunk(name),
    });
  }

  return entries.sort((a, b) => b.sizeKb - a.sizeKb).slice(0, limit);
}

export function topPackagesFromWebpackStats(statsPath: string, limit = BUNDLE_ANALYSIS_TOP_CHUNK_COUNT): BundleChunkEntry[] {
  if (!existsSync(statsPath)) return [];

  const stats = JSON.parse(readFileSync(statsPath, "utf8")) as {
    modules?: Array<{ name?: string; identifier?: string; size?: number }>;
  };

  const sizes = new Map<string, number>();
  for (const mod of stats.modules ?? []) {
    const raw = mod.name ?? mod.identifier ?? "";
    const match = raw.match(/node_modules\/((?:@[^/]+\/[^/]+|[^/]+))/);
    if (!match?.[1]) continue;
    const pkg = match[1];
    sizes.set(pkg, (sizes.get(pkg) ?? 0) + (mod.size ?? 0));
  }

  return [...sizes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, bytes]) => ({
      id,
      sizeKb: Math.round(bytes / 1024),
      packageHint: id,
    }));
}

export function auditCodeSplitTargets(root: string): { wired: number; total: number } {
  const lazyPath = join(root, BUNDLE_ANALYSIS_LAZY_PANELS);
  if (!existsSync(lazyPath)) {
    return { wired: 0, total: BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS.length };
  }
  const lazySource = readFileSync(lazyPath, "utf8");
  let wired = 0;

  for (const target of BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS) {
    if (!lazySource.includes(target.lazyExport)) continue;
    const routePath = join(root, target.routeFile);
    if (!existsSync(routePath)) continue;
    const routeSource = readFileSync(routePath, "utf8");
    if (routeSource.includes(target.lazyExport)) {
      wired += 1;
    }
  }

  return { wired, total: BUNDLE_ANALYSIS_CODE_SPLIT_TARGETS.length };
}

export function auditBundleChunks(root = process.cwd()): BundleChunkAuditSummary {
  const fromStats = topPackagesFromWebpackStats(join(root, ".next/analyze/client.json"));
  const fromChunks = scanStaticChunks(root);
  const topChunks =
    fromStats.length > 0
      ? fromStats
      : fromChunks.length > 0
        ? fromChunks
        : BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES.map((pkg) => ({
            id: pkg,
            sizeKb: 0,
            packageHint: pkg,
          }));

  const split = auditCodeSplitTargets(root);
  const passed =
    split.wired === split.total &&
    existsSync(join(root, BUNDLE_ANALYSIS_LAZY_PANELS));

  return {
    policyId: BUNDLE_ANALYSIS_POLICY_ID,
    topChunks: topChunks.slice(0, BUNDLE_ANALYSIS_TOP_CHUNK_COUNT),
    codeSplitTargetsWired: split.wired,
    codeSplitTargetsTotal: split.total,
    heavyPackages: BUNDLE_ANALYSIS_TOP_HEAVY_PACKAGES,
    passed,
  };
}

export function formatBundleChunkAuditLines(summary: BundleChunkAuditSummary): string[] {
  const lines = [
    `Bundle chunk audit (${summary.policyId})`,
    `Code-split targets wired: ${summary.codeSplitTargetsWired}/${summary.codeSplitTargetsTotal}`,
    `Top ${BUNDLE_ANALYSIS_TOP_CHUNK_COUNT} heavy chunks/packages:`,
  ];

  for (const chunk of summary.topChunks) {
    const hint = chunk.packageHint ? ` (${chunk.packageHint})` : "";
    const size = chunk.sizeKb > 0 ? `${chunk.sizeKb} kB` : "pending build";
    lines.push(`  ${chunk.id}: ${size}${hint}`);
  }

  lines.push(`Passed: ${summary.passed ? "YES" : "NO"}`);
  return lines;
}
