/**
 * P2-45 — Blueprint registry: sync Sentry status with production (ok:true, not blocked).
 *
 * @see docs/blueprint-registry-p2-45.md
 * @see artifacts/blueprint-registry.json
 */

export const BLUEPRINT_REGISTRY_P2_45_POLICY_ID = "blueprint-registry-p2-45-v1" as const;

export const BLUEPRINT_REGISTRY_P2_45_DOC = "docs/blueprint-registry-p2-45.md" as const;

export const BLUEPRINT_REGISTRY_P2_45_ARTIFACT = "artifacts/blueprint-registry.json" as const;

export const BLUEPRINT_REGISTRY_P2_45_AUDIT_MODULE =
  "lib/devops/blueprint-registry-p2-45-audit.ts" as const;

export const BLUEPRINT_REGISTRY_P2_45_CHECK_NPM_SCRIPT =
  "check:blueprint-registry-p2-45" as const;

export const BLUEPRINT_REGISTRY_P2_45_CI_NPM_SCRIPT =
  "test:ci:blueprint-registry-p2-45" as const;

export const BLUEPRINT_REGISTRY_P2_45_UNIT_TEST =
  "tests/unit/blueprint-registry-p2-45.test.ts" as const;

export const BLUEPRINT_REGISTRY_P2_45_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const BLUEPRINT_REGISTRY_P2_45_SENTRY_TASK_ID = "1-sentry-dsn-production" as const;

export const BLUEPRINT_REGISTRY_P2_45_PRODUCTION_HEALTH_URL =
  "https://os-kitchen.com/api/health" as const;

/** Registries that must agree Sentry is done — not blocked. */
export const BLUEPRINT_REGISTRY_P2_45_SYNC_TARGETS = [
  "artifacts/blueprint-registry.json",
  "artifacts/blueprint-tracker.json",
  "artifacts/sentry-p0-unblock-status.json",
  "artifacts/absolute-final-tracker.json",
] as const;

export const BLUEPRINT_REGISTRY_P2_45_WIRING_PATHS = [
  BLUEPRINT_REGISTRY_P2_45_DOC,
  BLUEPRINT_REGISTRY_P2_45_ARTIFACT,
  BLUEPRINT_REGISTRY_P2_45_AUDIT_MODULE,
  BLUEPRINT_REGISTRY_P2_45_UNIT_TEST,
  BLUEPRINT_REGISTRY_P2_45_CI_WORKFLOW,
  "app/api/health/route.ts",
  "artifacts/sentry-p0-unblock-status.json",
  "artifacts/blueprint-tracker.json",
] as const;

export type BlueprintRegistrySentryHealth = {
  ok: boolean;
  configured?: boolean;
  status: string;
};

export type BlueprintRegistryItem = {
  taskNumber?: number;
  department?: string;
  status: string;
  ok: boolean;
  healthCheck?: {
    sentryServer?: BlueprintRegistrySentryHealth;
    verifiedAt?: string;
  };
};

export type BlueprintRegistryArtifact = {
  version: string;
  policyId: typeof BLUEPRINT_REGISTRY_P2_45_POLICY_ID;
  items: Record<string, BlueprintRegistryItem>;
  blockedItems?: unknown[];
};

export function isBlueprintRegistrySentryLive(health: BlueprintRegistrySentryHealth): boolean {
  return health.ok === true && health.status === "live";
}
