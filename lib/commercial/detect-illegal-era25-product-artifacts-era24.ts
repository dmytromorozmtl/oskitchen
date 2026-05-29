/**
 * Detects era25 product engineering artifacts before charter gates open.
 * Process slices (era24-managed) are allowed; product era25 libs are forbidden until gates open.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type IllegalEra25ProductArtifact = {
  path: string;
  reason: string;
};

/** era24 process files that may reference era25 in name — not product engineering. */
export const ALLOWED_ERA25_PROCESS_COMMERCIAL_FILES: readonly string[] = [
  "era25-charter-exit-outside-linear-path-phases-era24.ts",
  "era25-charter-exit-post-terminus-guard-orchestrator-era24.ts",
  "era25-charter-exit-ui-era24.ts",
  "era25-charter-exit-outside-linear-path-era24-policy.ts",
  "evaluate-era25-charter-exit-outside-linear-path.ts",
  "era25-first-charter-slice-readiness-phases-era24.ts",
  "era25-first-charter-slice-readiness-post-charter-exit-orchestrator-era24.ts",
  "era25-first-charter-slice-readiness-ui-era24.ts",
  "era25-first-charter-slice-readiness-era24-policy.ts",
  "evaluate-era25-first-charter-slice-readiness.ts",
  "validate-era25-charter-doc-sections-era24.ts",
  "era25-engineering-gates-require-signed-charter-phases-era24.ts",
  "era25-engineering-gates-post-readiness-orchestrator-era24.ts",
  "era25-engineering-gates-ui-era24.ts",
  "era25-engineering-gates-require-signed-charter-era24-policy.ts",
  "evaluate-era25-engineering-gates-require-signed-charter.ts",
  "detect-illegal-era25-product-artifacts-era24.ts",
] as const;

const PRODUCT_ERA25_FILE_PATTERNS: readonly RegExp[] = [
  /-phases-era25\.ts$/,
  /-ui-era25\.ts$/,
  /-era25-policy\.ts$/,
  /-post-.+-orchestrator-era25\.ts$/,
  /-orchestrator-era25\.ts$/,
];

const ALLOWED_ERA25_PROCESS_OPS_SCRIPTS: readonly string[] = [
  "validate-era25-charter-exit-outside-linear-path.ts",
  "run-era25-charter-exit-post-terminus-guard-orchestrator.ts",
  "sync-era25-charter-exit-outside-linear-path-report.ts",
  "validate-era25-first-charter-slice-readiness.ts",
  "run-era25-first-charter-slice-readiness-post-charter-exit-orchestrator.ts",
  "sync-era25-first-charter-slice-readiness-report.ts",
  "validate-era25-engineering-gates-require-signed-charter.ts",
  "run-era25-engineering-gates-post-readiness-orchestrator.ts",
  "sync-era25-engineering-gates-require-signed-charter-report.ts",
] as const;

const ILLEGAL_ERA25_OPS_PATTERN = /^validate-.+-era25\.ts$|^run-.+-era25\.ts$/;

function isAllowedCommercialFile(name: string): boolean {
  return (ALLOWED_ERA25_PROCESS_COMMERCIAL_FILES as readonly string[]).includes(name);
}

function isIllegalCommercialFile(name: string): boolean {
  if (!name.endsWith(".ts")) return false;
  if (!name.includes("era25")) return false;
  if (isAllowedCommercialFile(name)) return false;
  return PRODUCT_ERA25_FILE_PATTERNS.some((pattern) => pattern.test(name));
}

export function discoverIllegalEra25ProductArtifacts(
  root: string = process.cwd(),
): readonly IllegalEra25ProductArtifact[] {
  const violations: IllegalEra25ProductArtifact[] = [];
  const commercialDir = join(root, "lib/commercial");

  if (existsSync(commercialDir)) {
    for (const name of readdirSync(commercialDir)) {
      if (isIllegalCommercialFile(name)) {
        violations.push({
          path: `lib/commercial/${name}`,
          reason: "era25 product lib before charter gates open",
        });
      }
    }
  }

  const opsDir = join(root, "scripts/ops");
  if (existsSync(opsDir)) {
    for (const name of readdirSync(opsDir)) {
      if (!(ALLOWED_ERA25_PROCESS_OPS_SCRIPTS as readonly string[]).includes(name)) {
        if (ILLEGAL_ERA25_OPS_PATTERN.test(name)) {
          violations.push({
            path: `scripts/ops/${name}`,
            reason: "era25 product ops script before charter gates open",
          });
        }
      }
    }
  }

  const step18Doc = join(root, "docs/next-step-18-linear-path-permanently-closed-2026-05-28.md");
  if (existsSync(step18Doc)) {
    violations.push({
      path: "docs/next-step-18-linear-path-permanently-closed-2026-05-28.md",
      reason: "Step 18+ linear doc forbidden",
    });
  }

  return violations;
}
