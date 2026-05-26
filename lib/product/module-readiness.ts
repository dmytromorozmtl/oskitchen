import readinessConfig from "@/config/product/module-readiness.json";
import {
  MODULE_REGISTRY_ENTRIES,
  type ModuleKey,
} from "@/lib/modules/module-registry";

export type ProductModuleReadinessStatus =
  | "GA"
  | "BETA"
  | "PILOT_ONLY"
  | "INTERNAL"
  | "HIDDEN";

type ProductModuleReadinessRow = {
  id: string;
  label: string;
  status: ProductModuleReadinessStatus;
  defaultEnabledFor: string[];
  notes: string;
};

type ModuleReadinessMatch = {
  id: string;
  label: string;
  status: ProductModuleReadinessStatus;
  notes: string;
};

const rows = readinessConfig.modules as ProductModuleReadinessRow[];

const registryKeyToReadinessId: Partial<Record<ModuleKey, string>> = {
  storefront: "storefront",
  pos_terminal: "pos",
  production: "production",
  packing: "packing",
  routes: "routes",
  customers: "crm",
  billing: "billing",
  analytics: "analytics",
  copilot: "copilot",
  food_safety: "food_safety",
  purchasing: "purchasing",
  training: "training",
  nutrition_labels: "nutrition_labels",
};

const explicitRouteOverrides: Array<{
  path: string;
  exact?: boolean;
  readinessId: string;
}> = [
  { path: "/dashboard/settings/white-label", exact: false, readinessId: "white_label" },
  { path: "/dashboard/accounting", exact: false, readinessId: "accounting" },
];

function normalizePath(path: string): string {
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

function matchPath(pathname: string, candidate: string, exact = false): boolean {
  const path = normalizePath(pathname);
  const target = normalizePath(candidate);
  if (exact) return path === target;
  return path === target || path.startsWith(`${target}/`);
}

function rowById(id: string): ProductModuleReadinessRow | null {
  return rows.find((row) => row.id === id) ?? null;
}

function rowByModuleKey(key: ModuleKey): ProductModuleReadinessRow | null {
  const readinessId = registryKeyToReadinessId[key];
  if (!readinessId) return null;
  return rowById(readinessId);
}

export function getModuleReadinessByModuleKey(
  key: ModuleKey,
): ModuleReadinessMatch | null {
  const row = rowByModuleKey(key);
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    status: row.status,
    notes: row.notes,
  };
}

export function getModuleReadinessForPath(
  pathname: string,
): ModuleReadinessMatch | null {
  for (const override of explicitRouteOverrides) {
    if (matchPath(pathname, override.path, override.exact)) {
      const row = rowById(override.readinessId);
      if (!row) return null;
      return {
        id: row.id,
        label: row.label,
        status: row.status,
        notes: row.notes,
      };
    }
  }

  for (const entry of MODULE_REGISTRY_ENTRIES) {
    if (
      !entry.pathPrefixes.some((prefix) =>
        matchPath(
          pathname,
          prefix,
          "pathMatch" in entry && entry.pathMatch === "exact",
        ),
      )
    ) {
      continue;
    }
    const row = rowByModuleKey(entry.key);
    if (!row) return null;
    return {
      id: row.id,
      label: row.label,
      status: row.status,
      notes: row.notes,
    };
  }

  return null;
}

export function moduleReadinessBadgeLabel(
  status: ProductModuleReadinessStatus,
): string | null {
  if (status === "GA") return null;
  if (status === "BETA") return "Beta";
  if (status === "PILOT_ONLY") return "Pilot";
  if (status === "INTERNAL") return "Internal";
  if (status === "HIDDEN") return "Hidden";
  return null;
}

export function listPilotOnlyReadinessIds(): string[] {
  return rows
    .filter((row) => row.status === "PILOT_ONLY")
    .map((row) => row.id)
    .sort();
}

export function listPilotOnlyReadinessOptions(): Array<{
  id: string;
  label: string;
  notes: string;
}> {
  return rows
    .filter((row) => row.status === "PILOT_ONLY")
    .map((row) => ({
      id: row.id,
      label: row.label,
      notes: row.notes,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function moduleReadinessRequiresEnrollment(
  status: ProductModuleReadinessStatus,
): boolean {
  return status === "PILOT_ONLY";
}

export function readinessDefaultsToDisabled(
  status: ProductModuleReadinessStatus,
): boolean {
  return status === "PILOT_ONLY" || status === "HIDDEN";
}

export function getReadinessDefaultDisabledModuleKeys(
  enrolledReadinessIds: Iterable<string> = [],
): Set<ModuleKey> {
  const disabled = new Set<ModuleKey>();
  const enrolled = new Set(enrolledReadinessIds);
  for (const entry of MODULE_REGISTRY_ENTRIES) {
    const readiness = rowByModuleKey(entry.key);
    if (!readiness) continue;
    if (
      moduleReadinessRequiresEnrollment(readiness.status) &&
      enrolled.has(readiness.id)
    ) {
      continue;
    }
    if (readinessDefaultsToDisabled(readiness.status)) {
      disabled.add(entry.key);
    }
  }
  return disabled;
}

export function effectiveDisabledModuleKeysFromRows(
  rows: { moduleKey: string; enabled: boolean }[],
  enrolledReadinessIds: Iterable<string> = [],
): Set<ModuleKey> {
  const enrolled = new Set(enrolledReadinessIds);
  const disabled = getReadinessDefaultDisabledModuleKeys(enrolled);
  const validKeys = new Set<string>(MODULE_REGISTRY_ENTRIES.map((entry) => entry.key));

  for (const row of rows) {
    if (!validKeys.has(row.moduleKey)) continue;
    const key = row.moduleKey as ModuleKey;
    const readiness = rowByModuleKey(key);
    if (row.enabled) {
      if (
        readiness &&
        moduleReadinessRequiresEnrollment(readiness.status) &&
        !enrolled.has(readiness.id)
      ) {
        disabled.add(key);
        continue;
      }
      disabled.delete(key);
    } else {
      disabled.add(key);
    }
  }

  return disabled;
}
