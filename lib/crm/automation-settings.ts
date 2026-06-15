import {
  CRM_AUTOMATION_FAVORITES_DEFAULT_DAYS,
  CRM_AUTOMATION_WIN_BACK_DEFAULT_DAYS,
} from "@/lib/crm/automation-policy";
import type { CrmAutomationConfig } from "@/lib/crm/automation-types";

export const DEFAULT_CRM_AUTOMATION_CONFIG: CrmAutomationConfig = {
  winBackEnabled: true,
  winBackInactiveDays: CRM_AUTOMATION_WIN_BACK_DEFAULT_DAYS,
  birthdayEnabled: true,
  favoritesEnabled: true,
  favoritesInactiveDays: CRM_AUTOMATION_FAVORITES_DEFAULT_DAYS,
  requireMarketingConsent: true,
};

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function parseCrmAutomationConfig(raw: unknown): CrmAutomationConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_CRM_AUTOMATION_CONFIG;
  const o = raw as Record<string, unknown>;
  return {
    winBackEnabled:
      typeof o.winBackEnabled === "boolean"
        ? o.winBackEnabled
        : DEFAULT_CRM_AUTOMATION_CONFIG.winBackEnabled,
    winBackInactiveDays: Math.max(
      7,
      Math.round(num(o.winBackInactiveDays, DEFAULT_CRM_AUTOMATION_CONFIG.winBackInactiveDays)),
    ),
    birthdayEnabled:
      typeof o.birthdayEnabled === "boolean"
        ? o.birthdayEnabled
        : DEFAULT_CRM_AUTOMATION_CONFIG.birthdayEnabled,
    favoritesEnabled:
      typeof o.favoritesEnabled === "boolean"
        ? o.favoritesEnabled
        : DEFAULT_CRM_AUTOMATION_CONFIG.favoritesEnabled,
    favoritesInactiveDays: Math.max(
      7,
      Math.round(num(o.favoritesInactiveDays, DEFAULT_CRM_AUTOMATION_CONFIG.favoritesInactiveDays)),
    ),
    requireMarketingConsent:
      typeof o.requireMarketingConsent === "boolean"
        ? o.requireMarketingConsent
        : DEFAULT_CRM_AUTOMATION_CONFIG.requireMarketingConsent,
  };
}

export function crmAutomationFromSettingsCenter(settingsCenterJson: unknown): CrmAutomationConfig {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return DEFAULT_CRM_AUTOMATION_CONFIG;
  }
  const crm = (settingsCenterJson as Record<string, unknown>).crm;
  if (!crm || typeof crm !== "object") return DEFAULT_CRM_AUTOMATION_CONFIG;
  return parseCrmAutomationConfig((crm as Record<string, unknown>).automation);
}

export function mergeCrmAutomationIntoSettingsCenter(
  settingsCenterJson: unknown,
  config: CrmAutomationConfig,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  const crm =
    base.crm && typeof base.crm === "object" ? { ...(base.crm as Record<string, unknown>) } : {};
  crm.automation = config;
  base.crm = crm;
  return base;
}
