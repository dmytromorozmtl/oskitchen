/**
 * Mutation access Era 14 recertification — Evolution Era 14 Cycle 3.
 *
 * Re-validates Era 4 consolidation + Era 11 recert after Era 13/14 operator work.
 * Documents scoped access helpers outside the mutation registry. No RBAC weakening
 * and no mass helper rewrite.
 */

import {
  DOMAIN_MUTATION_HELPERS,
  type DomainMutationHelperEntry,
} from "@/lib/permissions/domain-mutation-registry";
import { MUTATION_ACCESS_POLICY_ID } from "@/lib/permissions/mutation-access-policy";
import { MUTATION_ACCESS_ERA11_POLICY_ID } from "@/lib/permissions/mutation-access-era11-policy";
import { RBAC_WAVE4_ERA9_POLICY_ID } from "@/lib/security/rbac-wave4-era9-policy";

export const MUTATION_ACCESS_ERA14_POLICY_ID =
  "era14-mutation-access-consolidation-recert-v1" as const;

export const MUTATION_ACCESS_ERA14_EXTENDS_POLICIES = [
  MUTATION_ACCESS_POLICY_ID,
  MUTATION_ACCESS_ERA11_POLICY_ID,
  RBAC_WAVE4_ERA9_POLICY_ID,
] as const;

/**
 * Domain helpers that gate mutations or scoped writes but are intentionally **not**
 * listed in `DOMAIN_MUTATION_HELPERS` (separate narrative / platform bridge).
 */
export const MUTATION_ACCESS_ERA14_SCOPED_ACCESS_HELPERS = [
  {
    id: "order_create_spine",
    module: "lib/orders/order-create-access.ts",
    entrypoint: "requireOrderCreateAccess",
    reason:
      "Canonical order-creation spine; uses requireMutationPermission(orders.manage) with order-specific denial audits.",
  },
  {
    id: "support_triage",
    module: "lib/support/require-support-mutation-access.ts",
    entrypoint: "requireSupportTriageAccess",
    reason:
      "Platform support inbox uses canUseFullSupportInbox platform-role bridge — not workspace PermissionKey alone.",
  },
  {
    id: "import_center",
    module: "lib/import-center/require-import-center-actor.ts",
    entrypoint: "requireImportCenterCapability",
    reason: "Import center bundles import + reports permissions; kept separate from export registry row.",
  },
  {
    id: "global_search",
    module: "lib/search/require-global-search-actor.ts",
    entrypoint: "requireGlobalSearchActor",
    reason: "Read-scoped workspace search actor — not a sensitive mutation surface.",
  },
  {
    id: "growth_workspace",
    module: "lib/growth/require-growth-access.ts",
    entrypoint: "requireGrowthActor",
    reason: "Growth manage gate used by marketing surfaces; holiday-packages wave-4 action has inline guard.",
  },
] as const;

export const MUTATION_ACCESS_ERA14_AUDIT_CHECKLIST = [
  "New sensitive server mutations must call requireMutationPermission (or a registry domain helper that does).",
  "Add registry rows in lib/permissions/domain-mutation-registry.ts when introducing a reusable domain helper.",
  "Wave-4 logistics/demo/FOH helpers must keep logDomainMutationDenied on deny paths.",
  "Do not add tenant-only guards without canonical PermissionKey or a documented exception.",
  "Run npm run smoke:mutation-access before security/RBAC release reviews.",
] as const;

export const MUTATION_ACCESS_ERA14_OPS_DOC =
  "docs/mutation-access-consolidation-checklist.md" as const;

export const MUTATION_ACCESS_ERA14_SMOKE_SCRIPT =
  "scripts/smoke-mutation-access-consolidation.ts" as const;

export const MUTATION_ACCESS_ERA14_SMOKE_NPM_SCRIPT =
  "smoke:mutation-access" as const;

export const MUTATION_ACCESS_ERA14_CI_SCRIPTS = [
  "test:ci:mutation-access-era14",
  "test:ci:mutation-access-era14:cert",
] as const;

export const MUTATION_ACCESS_ERA14_UNIT_TESTS = [
  "tests/unit/mutation-access-era14-policy.test.ts",
  "tests/unit/mutation-access-era14-cert-live.test.ts",
] as const;

export const MUTATION_ACCESS_ERA14_CANONICAL_DOC_PATHS = [
  MUTATION_ACCESS_ERA14_OPS_DOC,
  "docs/rbac-permission-architecture.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const MUTATION_ACCESS_ERA14_CANONICAL_MARKERS = [
  MUTATION_ACCESS_ERA14_POLICY_ID,
  MUTATION_ACCESS_POLICY_ID,
  MUTATION_ACCESS_ERA11_POLICY_ID,
  "domain-mutation-registry",
  "logDomainMutationDenied",
] as const;

function isRegistryCanonicalBacking(
  entry: DomainMutationHelperEntry,
): entry is DomainMutationHelperEntry & {
  backing: { kind: "canonical" | "kitchen_or_production" };
} {
  return (
    entry.backing.kind === "canonical" || entry.backing.kind === "kitchen_or_production"
  );
}

/** Registry helpers (excluding core + documented exceptions) must delegate to requireMutationPermission. */
/** Registry helpers that delegate to another registry entrypoint instead of inlining requireMutationPermission. */
export const MUTATION_ACCESS_ERA14_REGISTRY_DELEGATES: Record<string, readonly string[]> = {
  channels_manage: ["requireIntegrationsActor"],
};

export function registryHelperDelegatesToCanonicalMutation(
  entry: DomainMutationHelperEntry,
  source: string,
): boolean {
  if (source.includes("requireMutationPermission")) return true;
  const markers = MUTATION_ACCESS_ERA14_REGISTRY_DELEGATES[entry.id];
  return markers?.some((marker) => source.includes(marker)) ?? false;
}

export function findRegistryHelpersMissingRequireMutationPermission(
  readSource: (relativeModule: string) => string,
): string[] {
  const gaps: string[] = [];
  for (const entry of DOMAIN_MUTATION_HELPERS) {
    if (entry.id === "core_mutation_permission") continue;
    if (entry.backing.kind === "documented_exception") continue;
    const source = readSource(entry.module);
    if (!registryHelperDelegatesToCanonicalMutation(entry, source)) {
      gaps.push(`${entry.id} (${entry.module})`);
    }
  }
  return gaps;
}

/**
 * Wave-4 `lib/*` registry helpers with auditsDenials must use shared denial logger.
 * Inline `actions/*` gates may use `recordAuditLog` directly (e.g. production calendar).
 */
export function findRegistryWave4DenialAuditGaps(
  readSource: (relativeModule: string) => string,
): string[] {
  const gaps: string[] = [];
  for (const entry of DOMAIN_MUTATION_HELPERS) {
    if (entry.era4Wave !== "wave4" || !entry.auditsDenials) continue;
    if (entry.backing.kind === "documented_exception") continue;
    if (!entry.module.startsWith("lib/")) continue;
    const source = readSource(entry.module);
    if (!source.includes("logDomainMutationDenied")) {
      gaps.push(`${entry.id} (${entry.module})`);
    }
  }
  return gaps;
}

/** Scoped helpers outside the registry must still anchor on requireMutationPermission when canonical. */
export function findScopedHelpersMissingRequireMutationPermission(
  readSource: (relativeModule: string) => string,
): string[] {
  const gaps: string[] = [];
  for (const helper of MUTATION_ACCESS_ERA14_SCOPED_ACCESS_HELPERS) {
    if (helper.id === "support_triage") continue;
    const source = readSource(helper.module);
    if (!source.includes("requireMutationPermission")) {
      gaps.push(`${helper.id} (${helper.module})`);
    }
  }
  return gaps;
}

export function registryHelperCount(): number {
  return DOMAIN_MUTATION_HELPERS.length;
}
