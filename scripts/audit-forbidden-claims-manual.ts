#!/usr/bin/env npx tsx
/**
 * Regenerate artifacts/forbidden-claims-manual-audit.json from repo scan.
 * Usage: npx tsx scripts/audit-forbidden-claims-manual.ts [--write]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_DOC_PATHS,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID,
  FORBIDDEN_CLAIMS_MANUAL_AUDIT_SCAN_ROOTS,
  scanTextForForbiddenClaimMatches,
  summarizeForbiddenClaimsManualAudit,
  type ForbiddenClaimMatch,
} from "@/lib/governance/forbidden-claims-manual-audit-policy";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");

const SCAN_EXTENSIONS = /\.(tsx?|md|json)$/i;

const SKIP_PATH_FRAGMENTS = [
  "/node_modules/",
  "/artifacts/deploy-log",
  "/.next/",
  "openapi-manifest.json",
];

function shouldScanFile(relPath: string): boolean {
  const normalized = relPath.replace(/\\/g, "/");
  if (!SCAN_EXTENSIONS.test(normalized)) return false;
  return !SKIP_PATH_FRAGMENTS.some((frag) => normalized.includes(frag));
}

function walkDir(relDir: string, out: string[]): void {
  const full = join(ROOT, relDir);
  try {
    for (const entry of readdirSync(full, { withFileTypes: true })) {
      const rel = join(relDir, entry.name).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        walkDir(rel, out);
      } else if (entry.isFile() && shouldScanFile(rel)) {
        out.push(rel);
      }
    }
  } catch {
    /* missing root */
  }
}

const MAX_FILE_BYTES = 512_000;

function collectScanFiles(): string[] {
  const files: string[] = [...FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_DOC_PATHS];
  for (const root of FORBIDDEN_CLAIMS_MANUAL_AUDIT_SCAN_ROOTS) {
    const full = join(ROOT, root);
    try {
      const stat = statSync(full);
      if (stat.isFile() && shouldScanFile(root)) {
        files.push(root);
      } else if (stat.isDirectory()) {
        walkDir(root, files);
      }
    } catch {
      /* skip */
    }
  }
  return [...new Set(files)].sort();
}

function readScanFile(filePath: string): string | null {
  const full = join(ROOT, filePath);
  try {
    if (statSync(full).size > MAX_FILE_BYTES) return null;
    return readFileSync(full, "utf8");
  } catch {
    return null;
  }
}

function main(): void {
  const files = collectScanFiles();
  const allMatches: ForbiddenClaimMatch[] = [];

  for (const filePath of files) {
    const text = readScanFile(filePath);
    if (!text) continue;
    allMatches.push(...scanTextForForbiddenClaimMatches(text, filePath));
  }

  const summary = summarizeForbiddenClaimsManualAudit(allMatches);
  const realClaims = allMatches.filter((m) => m.classification === "real_claim");

  const byFile = new Map<string, number>();
  for (const m of allMatches) {
    byFile.set(m.filePath, (byFile.get(m.filePath) ?? 0) + 1);
  }
  const topFiles = [...byFile.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([filePath, count]) => ({ filePath, count }));

  const payload = {
    version: FORBIDDEN_CLAIMS_MANUAL_AUDIT_POLICY_ID,
    generatedAt: new Date().toISOString(),
    baselineReconciliation: FORBIDDEN_CLAIMS_MANUAL_AUDIT_BASELINE_RECONCILIATION,
    liveScan: summary,
    topFiles,
    realClaimSamples: realClaims.slice(0, 20),
    scannedFileCount: files.length,
  };

  console.log(
    `Forbidden claims manual audit: ${summary.totalMatches} matches — policy ${summary.policyDocCount}, negation ${summary.negationCount}, real ${summary.realClaimCount}`,
  );

  if (summary.realClaimCount > 0) {
    for (const sample of realClaims.slice(0, 10)) {
      console.warn(`  REAL ${sample.filePath}:${sample.line} [${sample.pattern}] ${sample.excerpt}`);
    }
  }

  if (WRITE) {
    writeFileSync(join(ROOT, FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT), `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Wrote ${FORBIDDEN_CLAIMS_MANUAL_AUDIT_ARTIFACT}`);
  }

  process.exit(summary.passed ? 0 : 1);
}

main();
