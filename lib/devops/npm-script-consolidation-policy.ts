/**
 * Blueprint P1-16 — npm script consolidation (1900+ → <200 via archive + routers).
 *
 * @see docs/npm-script-trim-rfc.md
 * @see config/npm-scripts/archive-v1.json
 */

export const NPM_SCRIPT_CONSOLIDATION_POLICY_ID = "npm-script-consolidation-p1-16-v1" as const;

export const NPM_SCRIPT_CONSOLIDATION_MAX_SCRIPTS = 200 as const;

export const NPM_SCRIPT_ARCHIVE_PATH = "config/npm-scripts/archive-v1.json" as const;

export const NPM_SCRIPT_ESSENTIAL_PATH = "config/npm-scripts/essential-manifest-v1.json" as const;

export const NPM_SCRIPT_SURFACE_ARTIFACT = "artifacts/npm-script-surface-audit.json" as const;

export const NPM_SCRIPT_CONSOLIDATION_SUMMARY_ARTIFACT =
  "artifacts/npm-script-consolidation-summary.json" as const;

export const NPM_SCRIPT_ROUTER_SCRIPT = "scripts/npm-script-router.ts" as const;

export const NPM_SCRIPT_CONSOLIDATE_SCRIPT = "scripts/consolidate-npm-scripts.ts" as const;

export const NPM_SCRIPT_AUDIT_SCRIPT = "scripts/audit-npm-script-surface.ts" as const;

export const NPM_SCRIPT_CONSOLIDATION_UNIT_TEST =
  "tests/unit/npm-script-consolidation.test.ts" as const;

export const NPM_SCRIPT_CONSOLIDATION_NPM_SCRIPT = "test:ci:npm-script-consolidation" as const;

/** Prefixes moved to archive; invoke via `npm run <prefix> -- <rest>`. */
export const NPM_SCRIPT_ROUTER_PREFIXES = [
  "test:ci",
  "ops",
  "smoke",
  "audit",
  "workspace",
  "storefront",
  "beta",
  "staging",
  "pilot",
  "verify",
  "validate",
  "cert",
] as const;

export type NpmScriptRouterPrefix = (typeof NPM_SCRIPT_ROUTER_PREFIXES)[number];

export function resolveArchivedScriptKey(
  routerPrefix: string,
  rest: string,
): string {
  const trimmed = rest.trim();
  if (!trimmed) return routerPrefix;
  return `${routerPrefix}:${trimmed}`;
}

export function findRouterPrefixForScript(scriptName: string): NpmScriptRouterPrefix | null {
  for (const prefix of NPM_SCRIPT_ROUTER_PREFIXES) {
    if (scriptName === prefix || scriptName.startsWith(`${prefix}:`)) {
      return prefix;
    }
  }
  return null;
}
