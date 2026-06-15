import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  MUTATION_REGISTRY_LINTER_ALLOWLIST,
  MUTATION_REGISTRY_LINTER_DOCUMENTED_EXCEPTION_IDS,
  MUTATION_REGISTRY_LINTER_GOVERNANCE_PATTERNS,
  MUTATION_REGISTRY_LINTER_INLINE_MARKER,
  MUTATION_REGISTRY_LINTER_MUTATION_SIGNAL,
  MUTATION_REGISTRY_LINTER_ERA16_SCAN_ROOT,
} from "@/lib/permissions/mutation-registry-linter-era16-policy";

export type MutationRegistryLinterViolation = {
  path: string;
  reason: string;
};

export type MutationRegistryLinterScannedFile = {
  path: string;
  sensitive: boolean;
  governed: boolean;
  allowlistExceptionId: string | null;
  governanceHits: string[];
};

export type MutationRegistryLinterScanResult = {
  ok: boolean;
  scannedFiles: number;
  sensitiveFiles: number;
  governedFiles: number;
  allowlistedFiles: number;
  violations: MutationRegistryLinterViolation[];
  files: MutationRegistryLinterScannedFile[];
};

const ALLOWLIST_BY_PATH = new Map(
  MUTATION_REGISTRY_LINTER_ALLOWLIST.map((entry) => [entry.path, entry]),
);

const DOCUMENTED_EXCEPTION_IDS = new Set<string>(
  MUTATION_REGISTRY_LINTER_DOCUMENTED_EXCEPTION_IDS,
);

function collectActionTsFiles(rootDir: string): string[] {
  const root = join(rootDir, MUTATION_REGISTRY_LINTER_ERA16_SCAN_ROOT);
  const output: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        if (entry === "node_modules" || entry === ".next") continue;
        walk(fullPath);
        continue;
      }
      if (stats.isFile() && entry.endsWith(".ts")) {
        output.push(relative(rootDir, fullPath).split("\\").join("/"));
      }
    }
  }

  walk(root);
  return output.sort();
}

function isServerActionFile(content: string): boolean {
  return content.includes('"use server"') || content.includes("'use server'");
}

export function isSensitiveMutationAction(content: string): boolean {
  if (!isServerActionFile(content)) return false;
  return MUTATION_REGISTRY_LINTER_MUTATION_SIGNAL.test(content);
}

function findGovernanceHits(content: string): string[] {
  const hits: string[] = [];
  for (const pattern of MUTATION_REGISTRY_LINTER_GOVERNANCE_PATTERNS) {
    if (content.includes(pattern)) hits.push(pattern);
  }
  if (/require[A-Z][a-zA-Z]+(?:Mutation|Actor|Access)\s*\(/.test(content)) {
    hits.push("require*Mutation|Actor|Access");
  }
  return hits;
}

function resolveInlineAllowlistExceptionId(content: string): string | null {
  const match = content.match(MUTATION_REGISTRY_LINTER_INLINE_MARKER);
  if (!match?.[1]) return null;
  const exceptionId = match[1].toLowerCase();
  if (!DOCUMENTED_EXCEPTION_IDS.has(exceptionId)) return null;
  return exceptionId;
}

export function resolveMutationRegistryAllowlist(path: string, content: string): string | null {
  const allowlistEntry = ALLOWLIST_BY_PATH.get(path);
  if (allowlistEntry) return allowlistEntry.exceptionId;
  return resolveInlineAllowlistExceptionId(content);
}

export function hasMutationRegistryGovernance(path: string, content: string): boolean {
  if (resolveMutationRegistryAllowlist(path, content)) return true;
  return findGovernanceHits(content).length > 0;
}

export function scanMutationRegistryCompliance(rootDir = process.cwd()): MutationRegistryLinterScanResult {
  const files: MutationRegistryLinterScannedFile[] = [];
  const violations: MutationRegistryLinterViolation[] = [];

  for (const path of collectActionTsFiles(rootDir)) {
    const content = readFileSync(join(rootDir, path), "utf8");
    const sensitive = isSensitiveMutationAction(content);
    const governanceHits = findGovernanceHits(content);
    const allowlistExceptionId = resolveMutationRegistryAllowlist(path, content);
    const governed = !sensitive || hasMutationRegistryGovernance(path, content);

    files.push({
      path,
      sensitive,
      governed,
      allowlistExceptionId,
      governanceHits,
    });

    if (sensitive && !governed) {
      violations.push({
        path,
        reason:
          "Sensitive server action (Prisma write or $transaction) missing requireMutationPermission, domain actor helper, documented allowlist marker, or public/platform guard.",
      });
    }
  }

  const sensitiveFiles = files.filter((f) => f.sensitive);
  const governedFiles = sensitiveFiles.filter((f) => f.governed);
  const allowlistedFiles = sensitiveFiles.filter((f) => f.allowlistExceptionId);

  return {
    ok: violations.length === 0,
    scannedFiles: files.length,
    sensitiveFiles: sensitiveFiles.length,
    governedFiles: governedFiles.length,
    allowlistedFiles: allowlistedFiles.length,
    violations,
    files,
  };
}

export function buildMutationRegistryLinterSummary(
  policyId: string,
  scan: MutationRegistryLinterScanResult,
) {
  return {
    policyId,
    generatedAt: new Date().toISOString(),
    ok: scan.ok,
    scannedFiles: scan.scannedFiles,
    sensitiveFiles: scan.sensitiveFiles,
    governedFiles: scan.governedFiles,
    allowlistedFiles: scan.allowlistedFiles,
    violationCount: scan.violations.length,
    violations: scan.violations,
    allowlistEntries: MUTATION_REGISTRY_LINTER_ALLOWLIST.map((entry) => ({
      path: entry.path,
      exceptionId: entry.exceptionId,
      rationale: entry.rationale,
    })),
  };
}
