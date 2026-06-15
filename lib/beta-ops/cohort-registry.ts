import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { CohortKitchen, CohortKitchenStatus, CohortRegistry } from "@/lib/beta-ops/types";

export const DEFAULT_REGISTRY_PATH = join(process.cwd(), "docs", "artifacts", "BETA_COHORT_REGISTRY.json");

export function loadCohortRegistry(path = DEFAULT_REGISTRY_PATH): CohortRegistry | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as CohortRegistry;
  } catch {
    return null;
  }
}

export function saveCohortRegistry(registry: CohortRegistry, path = DEFAULT_REGISTRY_PATH): void {
  mkdirSync(dirname(path), { recursive: true });
  registry.updatedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(registry, null, 2), "utf8");
}

export function createRegistry(emails: string[], cohortName = "closed-beta-pilot"): CohortRegistry {
  const now = new Date().toISOString();
  return {
    version: 1,
    cohortName,
    createdAt: now,
    updatedAt: now,
    kitchens: emails.map((email) => ({
      email: email.trim().toLowerCase(),
      status: "pending" as CohortKitchenStatus,
    })),
  };
}

export function upsertKitchen(registry: CohortRegistry, kitchen: CohortKitchen): CohortRegistry {
  const email = kitchen.email.trim().toLowerCase();
  const idx = registry.kitchens.findIndex((k) => k.email === email);
  if (idx >= 0) registry.kitchens[idx] = { ...registry.kitchens[idx], ...kitchen, email };
  else registry.kitchens.push({ ...kitchen, email });
  return registry;
}

export function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}
