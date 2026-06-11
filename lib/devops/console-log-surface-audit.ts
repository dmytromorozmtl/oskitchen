import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  CONSOLE_LOG_SWEEP_LIB_ALLOWLIST,
  CONSOLE_LOG_SWEEP_POLICY_ID,
  CONSOLE_LOG_SWEEP_RUNTIME_DIRS,
  CONSOLE_LOG_SWEEP_SUMMARY_ARTIFACT,
  CONSOLE_LOG_SWEEP_TOP_50_COUNT,
  CONSOLE_LOG_SWEEP_TOP_50_FILES,
} from "@/lib/devops/console-log-sweep-policy";

const CONSOLE_PATTERN = /console\.(log|debug|info)\(/g;

export type ConsoleLogTierCounts = {
  runtime: number;
  library: number;
  top50Remaining: number;
  scripts: number;
  tests: number;
  total: number;
};

export type ConsoleLogSurfaceSummary = {
  policyId: typeof CONSOLE_LOG_SWEEP_POLICY_ID;
  generatedAt: string;
  counts: ConsoleLogTierCounts;
  runtimeHits: string[];
  libraryHits: string[];
  top50Failures: string[];
  top50Migrated: number;
  passed: boolean;
};

function walkTsFiles(dir: string, root: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".vercel") continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      walkTsFiles(abs, root, out);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    out.push(abs.slice(root.length + 1).replace(/\\/g, "/"));
  }
}

function countConsoleCalls(source: string): number {
  return [...source.matchAll(CONSOLE_PATTERN)].length;
}

function scanFiles(files: readonly string[], root: string): { count: number; hits: string[] } {
  let count = 0;
  const hits: string[] = [];
  for (const rel of files) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    const n = countConsoleCalls(readFileSync(path, "utf8"));
    if (n > 0) {
      count += n;
      hits.push(`${rel}:${n}`);
    }
  }
  return { count, hits };
}

export function auditConsoleLogSurface(root = process.cwd()): ConsoleLogSurfaceSummary {
  const runtimeFiles: string[] = [];
  for (const dir of CONSOLE_LOG_SWEEP_RUNTIME_DIRS) {
    walkTsFiles(join(root, dir), root, runtimeFiles);
  }

  const libFiles: string[] = [];
  walkTsFiles(join(root, "lib"), root, libFiles);
  const libScanned = libFiles.filter(
    (file) => !CONSOLE_LOG_SWEEP_LIB_ALLOWLIST.includes(file as (typeof CONSOLE_LOG_SWEEP_LIB_ALLOWLIST)[number]),
  );

  const scriptFiles: string[] = [];
  walkTsFiles(join(root, "scripts"), root, scriptFiles);

  const testFiles: string[] = [];
  walkTsFiles(join(root, "tests"), root, testFiles);
  walkTsFiles(join(root, "e2e"), root, testFiles);

  const runtime = scanFiles(runtimeFiles, root);
  const library = scanFiles(libScanned, root);
  const top50 = scanFiles(CONSOLE_LOG_SWEEP_TOP_50_FILES, root);
  const scripts = scanFiles(scriptFiles, root);
  const tests = scanFiles(testFiles, root);

  const total =
    runtime.count + library.count + scripts.count + tests.count;

  const passed =
    runtime.count === 0 &&
    library.count === 0 &&
    top50.count === 0;

  return {
    policyId: CONSOLE_LOG_SWEEP_POLICY_ID,
    generatedAt: new Date().toISOString(),
    counts: {
      runtime: runtime.count,
      library: library.count,
      top50Remaining: top50.count,
      scripts: scripts.count,
      tests: tests.count,
      total,
    },
    runtimeHits: runtime.hits,
    libraryHits: library.hits,
    top50Failures: top50.hits,
    top50Migrated: CONSOLE_LOG_SWEEP_TOP_50_COUNT - top50.hits.length,
    passed,
  };
}

export function writeConsoleLogSurfaceSummary(
  summary: ConsoleLogSurfaceSummary,
  root = process.cwd(),
): void {
  const path = join(root, CONSOLE_LOG_SWEEP_SUMMARY_ARTIFACT);
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

export function formatConsoleLogSurfaceLines(summary: ConsoleLogSurfaceSummary): string[] {
  return [
    `Console.log surface audit (${summary.policyId})`,
    `Runtime (app/components/actions/services): ${summary.counts.runtime}`,
    `Library (excl. allowlist): ${summary.counts.library}`,
    `Top-50 migrated scripts remaining: ${summary.counts.top50Remaining}`,
    `Scripts total: ${summary.counts.scripts}`,
    `Tests/e2e total: ${summary.counts.tests}`,
    `Repo total: ${summary.counts.total}`,
    `Top-50 migrated: ${summary.top50Migrated}/${CONSOLE_LOG_SWEEP_TOP_50_COUNT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
