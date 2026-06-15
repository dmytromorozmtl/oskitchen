import type { BusinessType } from "@prisma/client";

import {
  getBusinessModeModulePlan,
  resolveStrategicBusinessMode,
  STRATEGIC_BUSINESS_MODE_ALIASES,
  type StrategicBusinessModeAlias,
} from "@/lib/business-mode/business-mode-config";
import { getBusinessModeExperience } from "@/lib/business-mode-registry";

/** Persist UI/strategic aliases to valid Prisma `BusinessType` values (no enum migration). */
export function normalizeBusinessModeForPersistence(input: string | null | undefined): BusinessType {
  return resolveStrategicBusinessMode(input);
}

export function strategicAliasFromRawInput(input: string | null | undefined): StrategicBusinessModeAlias | null {
  const s = String(input ?? "").trim().toUpperCase();
  if (s in STRATEGIC_BUSINESS_MODE_ALIASES) return s as StrategicBusinessModeAlias;
  return null;
}

export function getBusinessModeDisplayLabel(
  persisted: BusinessType,
  declaredStrategic?: string | null,
): string {
  const alias = strategicAliasFromRawInput(declaredStrategic);
  if (alias === "COMMISSARY") return "Commissary";
  if (alias === "MANUAL_ONLY") return "Manual-only operations";
  return getBusinessModeExperience(persisted).label;
}

/** Returns the declared strategic alias when callers still have the original onboarding string. */
export function getBusinessModeAlias(declaredStrategic?: string | null): StrategicBusinessModeAlias | null {
  return strategicAliasFromRawInput(declaredStrategic);
}

export function getBusinessModeWorkflowProfile(persisted: BusinessType) {
  return {
    experience: getBusinessModeExperience(persisted),
    modulePlan: getBusinessModeModulePlan(persisted),
  };
}
