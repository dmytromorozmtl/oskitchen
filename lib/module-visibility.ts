import type { BusinessType } from "@prisma/client";

import { getBusinessModeHiddenModuleKeys } from "@/lib/business-mode-registry";
import {
  MODULE_REGISTRY_ENTRIES,
  type ModuleKey as RegistryModuleKey,
} from "@/lib/modules/module-registry";

export type ModuleKey = RegistryModuleKey;

/** Stable keys for `KitchenModulePreference.moduleKey` — derived from the canonical registry. */
export const MODULE_KEYS = MODULE_REGISTRY_ENTRIES.map((e) => e.key) as readonly ModuleKey[];

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  pathPrefixes: readonly string[];
  tier: "core" | "menu" | "kitchen" | "inventory" | "customers" | "ops" | "insights" | "admin" | "internal";
  pathMatch?: "prefix" | "exact";
};

export const MODULE_REGISTRY: readonly ModuleDefinition[] = MODULE_REGISTRY_ENTRIES.map((e) => ({
  key: e.key,
  label: e.label,
  pathPrefixes: e.pathPrefixes as readonly string[],
  tier: e.tier,
  pathMatch: (e as { pathMatch?: "prefix" | "exact" }).pathMatch,
}));

type BlockRule = { prefix: string; exact: boolean };

function blockRulesForKeys(disabledKeys: ReadonlySet<ModuleKey>): BlockRule[] {
  const rules: BlockRule[] = [];
  for (const key of disabledKeys) {
    const def = MODULE_REGISTRY.find((d) => d.key === key);
    if (!def) continue;
    const exact = def.pathMatch === "exact";
    for (const pre of def.pathPrefixes) {
      rules.push({ prefix: pre, exact });
    }
  }
  rules.sort((a, b) => b.prefix.length - a.prefix.length);
  return rules;
}

function pathMatchesBlockRule(path: string, rule: BlockRule): boolean {
  if (rule.exact) return path === rule.prefix;
  return path === rule.prefix || path.startsWith(`${rule.prefix}/`);
}

/** Paths that must stay reachable even when modules are disabled (safety + recovery). */
export const MODULE_GATE_ALLOW_PREFIXES: readonly string[] = [
  "/dashboard/settings",
  "/dashboard/billing",
  "/dashboard/support",
  "/dashboard/error-recovery",
  "/dashboard/system-health",
];

export function pathAllowedByModuleGate(
  pathname: string,
  blockedPrefixes: readonly string[],
): boolean {
  const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (MODULE_GATE_ALLOW_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return true;
  }
  if (path.startsWith("/platform")) return true;
  const rules = blockRulesFromPrefixes(blockedPrefixes);
  for (const rule of rules) {
    if (pathMatchesBlockRule(path, rule)) return false;
  }
  return true;
}

/** Flat prefixes for client shell (exact rules encoded as `exact:pre`). */
export function getBlockedPathPrefixes(disabledKeys: ReadonlySet<ModuleKey>): string[] {
  return blockRulesForKeys(disabledKeys).map((r) => (r.exact ? `exact:${r.prefix}` : r.prefix));
}

function blockRulesFromPrefixes(flat: readonly string[]): BlockRule[] {
  const rules: BlockRule[] = [];
  for (const entry of flat) {
    if (entry.startsWith("exact:")) {
      rules.push({ prefix: entry.slice("exact:".length), exact: true });
    } else {
      rules.push({ prefix: entry, exact: false });
    }
  }
  rules.sort((a, b) => b.prefix.length - a.prefix.length);
  return rules;
}

export function navigationHrefDisabled(
  href: string,
  disabledKeys: ReadonlySet<ModuleKey>,
): boolean {
  if (disabledKeys.size === 0) return false;
  const rules = blockRulesForKeys(disabledKeys);
  const h = href.endsWith("/") && href.length > 1 ? href.slice(0, -1) : href;
  for (const rule of rules) {
    if (pathMatchesBlockRule(h, rule)) return true;
  }
  return false;
}

/** Modules disabled in the “recommended / focused” setup for a business type. */
export function getRecommendedDisabledModuleKeys(
  businessType: BusinessType | null | undefined,
): Set<ModuleKey> {
  return getBusinessModeHiddenModuleKeys(businessType);
}

export function moduleKeyFromRows(
  rows: { moduleKey: string; enabled: boolean }[],
): Set<ModuleKey> {
  const disabled = new Set<ModuleKey>();
  const valid = new Set<string>(MODULE_KEYS);
  for (const r of rows) {
    if (!valid.has(r.moduleKey)) continue;
    if (!r.enabled) disabled.add(r.moduleKey as ModuleKey);
  }
  return disabled;
}

export function definitionForKey(key: ModuleKey): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((d) => d.key === key);
}

/** Primary href per disabled module — for command palette / link guards. */
export function primaryHrefForModuleKey(key: ModuleKey): string | undefined {
  const def = MODULE_REGISTRY.find((d) => d.key === key);
  return def?.pathPrefixes[0];
}
