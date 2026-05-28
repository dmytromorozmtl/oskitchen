/**
 * Mutation registry linter — Evolution Era 16 Cycle 8.
 *
 * Static scan of `actions/` for sensitive server mutations missing canonical
 * governance. Prevents new action files from bypassing registry discipline.
 * Does NOT claim full RBAC coverage or replace wave-4 action RBAC tests.
 */

import { DOMAIN_MUTATION_HELPERS } from "@/lib/permissions/domain-mutation-registry";
import { MUTATION_ACCESS_DOCUMENTED_EXCEPTIONS } from "@/lib/permissions/mutation-access-policy";

export const MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID =
  "era16-mutation-registry-linter-v1" as const;

export const MUTATION_REGISTRY_LINTER_ERA16_DECISION_DATE = "2026-05-28" as const;

export const MUTATION_REGISTRY_LINTER_ERA16_EXTENDS_POLICIES = [
  "era4-mutation-access-consolidation-v1",
  "era14-mutation-access-consolidation-recert-v1",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_SCAN_ROOT = "actions" as const;

export const MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE =
  "lib/permissions/mutation-registry-linter.ts" as const;

export const MUTATION_REGISTRY_LINTER_ERA16_CERT_SCRIPT =
  "scripts/cert-mutation-registry-linter-era16.ts" as const;

export const MUTATION_REGISTRY_LINTER_ERA16_SUMMARY_ARTIFACT =
  "artifacts/mutation-registry-linter-summary.json" as const;

/** Prisma writes or explicit transactions mark a server action as mutation-sensitive. */
export const MUTATION_REGISTRY_LINTER_MUTATION_SIGNAL =
  /prisma\.\w+\.(create|update|delete|upsert|createMany|updateMany|deleteMany)\(|\$transaction\s*\(/;

/** Inline file marker — must reference a documented allowlist exception id. */
export const MUTATION_REGISTRY_LINTER_INLINE_MARKER =
  /mutation-registry-linter-allowlist:\s*([a-z0-9_]+)/i;

/** Registry entrypoints + platform/public guard patterns recognized as governance. */
export const MUTATION_REGISTRY_LINTER_GOVERNANCE_PATTERNS = [
  ...DOMAIN_MUTATION_HELPERS.map((h) => h.entrypoint),
  "logDomainMutationDenied",
  "requireWorkspacePermissionActor",
  "requireTenantActor",
  "requireSuperAdmin",
  "requirePlatformAccess",
  "assertBetaProgramAccess",
  "enforceStorefrontRateLimit",
  "consumeRateLimitToken",
] as const;

export type MutationRegistryLinterAllowlistEntry = {
  path: string;
  exceptionId: string;
  rationale: string;
};

/**
 * Explicit allowlist for action files that intentionally bypass workspace RBAC.
 * Every entry requires rationale — shrink over time by adding domain helpers.
 */
export const MUTATION_REGISTRY_LINTER_ALLOWLIST: readonly MutationRegistryLinterAllowlistEntry[] =
  [] as const;

export const MUTATION_REGISTRY_LINTER_DOCUMENTED_EXCEPTION_IDS = [
  ...MUTATION_ACCESS_DOCUMENTED_EXCEPTIONS.map((e) => e.id),
  ...MUTATION_REGISTRY_LINTER_ALLOWLIST.map((e) => e.exceptionId),
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_HONEST_SCOPE = {
  scansActionsTree: true,
  blocksNewUngovernedMutations: true,
  replacesRbacWaveTests: false,
  fullRegistryEnforcementOnLegacyFiles: false,
} as const;

export const MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_MARKERS = [
  MUTATION_REGISTRY_LINTER_ERA16_POLICY_ID,
  MUTATION_REGISTRY_LINTER_ERA16_LINTER_MODULE,
  "mutation-registry-linter",
  "mutation registry linter",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_FORBIDDEN_CLAIMS = [
  "full rbac coverage",
  "all mutations certified",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_CI_SCRIPTS = [
  "test:ci:mutation-registry-linter-era16",
  "test:ci:mutation-registry-linter-era16:cert",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_UNIT_TESTS = [
  "tests/unit/mutation-registry-linter.test.ts",
  "tests/unit/mutation-registry-linter-era16-policy.test.ts",
  "tests/unit/mutation-registry-linter-era16-cert-live.test.ts",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_CANONICAL_DOC_PATHS = [
  "docs/rbac-permission-architecture.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
] as const;

export const MUTATION_REGISTRY_LINTER_ERA16_REVIEW_SECTION =
  "Era 16 mutation registry linter (2026-05-28)" as const;
