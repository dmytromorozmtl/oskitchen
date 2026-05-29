/**
 * Linear chain terminus guard — Step 17 FORBIDDEN enforcement (era24).
 * Not a path step · guards catalog integrity and forbidden doc chain.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

import { COMMERCIAL_PILOT_PATH_STEP_CATALOG } from "@/lib/commercial/commercial-pilot-path-step-catalog-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC } from "@/lib/commercial/linear-path-permanently-closed-phases-era24";

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID =
  "era24-linear-chain-terminus-guard-v1" as const;

export const LINEAR_CHAIN_STEP17_FORBIDDEN_DOC =
  "docs/next-step-17-forbidden-linear-chain-terminus-2026-05-28.md" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_REPORT_PATH =
  "artifacts/linear-chain-terminus-guard-report.md" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_PLATFORM_ANCHOR =
  "#linear-chain-step17-forbidden" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_TRACKED_ENV_KEYS = [
  "LINEAR_CHAIN_TERMINUS_GUARD_STEP17_FORBIDDEN_ATTESTED",
  "LINEAR_CHAIN_TERMINUS_GUARD_REPORT_REVIEWED",
] as const;

export function detectLinearChainTerminusGuardStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return LINEAR_CHAIN_TERMINUS_GUARD_TRACKED_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const LINEAR_CHAIN_MAX_STEP = 16 as const;

export const LINEAR_CHAIN_FORBIDDEN_PROPOSALS: readonly string[] = [
  "Add Step 17 to COMMERCIAL_PILOT_PATH_STEP_CATALOG",
  "Add docs/next-step-18-*.md to the linear chain",
  "Add era25+ panels without explicit era charter",
  "Re-open era21 gate chain for steady-state customers",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_FOREVER_COMMANDS: readonly string[] = [
  "test:ci:commercial-pilot-runbook:cert",
  "ops:validate-linear-chain-terminus-guard",
  "ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator",
  "ops:validate-linear-path-permanently-closed",
  "ops:sync-linear-chain-terminus-guard-report",
] as const;

export type LinearChainTerminusGuardViolation = {
  id: string;
  detail: string;
};

export function evaluateLinearChainTerminusGuard(
  root: string = process.cwd(),
): {
  guardPassed: boolean;
  step17Forbidden: boolean;
  maxLinearStep: number;
  catalogStepCount: number;
  forbiddenDocPresent: boolean;
  step16DocPresent: boolean;
  step18DocPresent: boolean;
  violations: LinearChainTerminusGuardViolation[];
} {
  const violations: LinearChainTerminusGuardViolation[] = [];
  const catalogStepCount = COMMERCIAL_PILOT_PATH_STEP_CATALOG.length;
  const maxCatalogStep = Math.max(...COMMERCIAL_PILOT_PATH_STEP_CATALOG.map((step) => step.step));
  const step17InCatalog = COMMERCIAL_PILOT_PATH_STEP_CATALOG.some((step) => step.step >= 17);

  if (catalogStepCount !== LINEAR_CHAIN_MAX_STEP) {
    violations.push({
      id: "catalog_step_count",
      detail: `Expected ${LINEAR_CHAIN_MAX_STEP} catalog steps, found ${catalogStepCount}`,
    });
  }
  if (maxCatalogStep !== LINEAR_CHAIN_MAX_STEP) {
    violations.push({
      id: "catalog_max_step",
      detail: `Expected max step ${LINEAR_CHAIN_MAX_STEP}, found ${maxCatalogStep}`,
    });
  }
  if (step17InCatalog) {
    violations.push({
      id: "step17_in_catalog",
      detail: "Step 17+ must not appear in COMMERCIAL_PILOT_PATH_STEP_CATALOG",
    });
  }

  const forbiddenDocPresent = existsSync(join(root, LINEAR_CHAIN_STEP17_FORBIDDEN_DOC));
  const step16DocPresent = existsSync(join(root, LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC));
  const step18DocPresent = existsSync(join(root, "docs/next-step-18-linear-path-permanently-closed-2026-05-28.md"));

  if (!forbiddenDocPresent) {
    violations.push({
      id: "forbidden_doc_missing",
      detail: `Missing ${LINEAR_CHAIN_STEP17_FORBIDDEN_DOC}`,
    });
  }
  if (!step16DocPresent) {
    violations.push({
      id: "step16_doc_missing",
      detail: `Missing ${LINEAR_PATH_PERMANENTLY_CLOSED_STEP16_DOC}`,
    });
  }
  if (step18DocPresent) {
    violations.push({
      id: "step18_doc_forbidden",
      detail: "docs/next-step-18-* must not exist in linear chain",
    });
  }

  return {
    guardPassed: violations.length === 0,
    step17Forbidden: true,
    maxLinearStep: LINEAR_CHAIN_MAX_STEP,
    catalogStepCount,
    forbiddenDocPresent,
    step16DocPresent,
    step18DocPresent,
    violations,
  };
}
