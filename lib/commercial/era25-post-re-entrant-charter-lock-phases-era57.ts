/**
 * Era25 post-re-entrant operator charter lock — freeze mutable era25 env after honest re-entrant.
 * Policy: era57-era25-post-re-entrant-charter-lock-phases-v1
 */
import { ERA25_LINEAR_CONVERGENCE_SURFACE_ENV_KEYS } from "@/lib/commercial/sustained-product-evolution-re-entrant-phases-era56";

export const ERA25_POST_REENTRANT_CHARTER_LOCK_ERA57_PHASES_POLICY_ID =
  "era57-era25-post-re-entrant-charter-lock-phases-v1" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_DOC =
  "docs/next-step-era25-post-re-entrant-charter-lock-phase-ag-product-2026-05-28.md" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_PLATFORM_ANCHOR =
  "#era25-post-re-entrant-charter-lock" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_TRACKED_ENV_KEYS = [
  "ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_ATTESTED",
  "ERA25_POST_REENTRANT_CHARTER_LOCK_ERA25_REPORT_REVIEWED",
] as const;

/** Env keys that must not mutate after honest charter lock — linear + charter + terminus chain. */
export const ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS = [
  ...ERA25_LINEAR_CONVERGENCE_SURFACE_ENV_KEYS,
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED",
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED",
  "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_ATTESTED",
  "PURE_OPERATIONAL_MODE_TERMINUS_ERA25_REPORT_REVIEWED",
  "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED",
  "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED",
  "ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_ATTESTED",
  "ERA25_CHARTER_EXIT_OUTSIDE_LINEAR_PATH_REPORT_REVIEWED",
  "ERA25_FIRST_CHARTER_SLICE_READINESS_ATTESTED",
  "ERA25_FIRST_CHARTER_SLICE_READINESS_REPORT_REVIEWED",
  "ERA25_ENGINEERING_GATES_REQUIRE_SIGNED_CHARTER_ATTESTED",
  "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ATTESTED",
  "ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_REVIEWED",
] as const;

export function detectEra25PostReentrantCharterLockStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_POST_REENTRANT_CHARTER_LOCK_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25FrozenEnvMutationAfterCharterLock(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_FROZEN_AFTER_CHARTER_LOCK_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const ERA25_POST_REENTRANT_CHARTER_LOCK_BACKLOG_ID =
  "KOS-E25-012-POST-REENTRANT-CHARTER-LOCK" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_GUARDRAILS: readonly string[] = [
  "Never attest charter lock before sustained product evolution re-entrant integrity is honest",
  "Never mutate era25 linear convergence or charter attest env keys after lock baseline is recorded",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:governance-bundles after charter lock baseline sync",
  "Never re-open era25 convergence Launch Wizard / briefing strips — pure operational mode suppression remains",
] as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-era25-post-re-entrant-charter-lock-integrity",
  "ops:validate-sustained-product-evolution-re-entrant-integrity",
  "ops:validate-era25-commercial-pilot-convergence-train-closure-integrity",
  "test:ci:governance-bundles",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
