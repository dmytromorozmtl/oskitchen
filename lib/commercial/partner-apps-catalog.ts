import partnerAppsConfig from "@/config/commercial/partner-apps.json";

export const PARTNER_APPS_CONFIG_PATH = "config/commercial/partner-apps.json" as const;

export type ExtensionCategory =
  | "sales_channels"
  | "accounting"
  | "labor"
  | "marketing"
  | "operations"
  | "analytics"
  | "developer";

export type PartnerAppCertification = "certified_si" | "technology_alliance" | "referral";

export type PartnerAppConfigEntry = {
  id: string;
  name: string;
  publisher: string;
  category: ExtensionCategory;
  certification: PartnerAppCertification;
  status: "CERTIFIED" | "BETA";
  description: string;
  setupRoute: string | null;
  externalUrl: string | null;
  tags: string[];
  honestyNote?: string;
};

export type RoadmapExtensionConfigEntry = {
  id: string;
  name: string;
  publisher: string;
  category: ExtensionCategory;
  status: "ROADMAP";
  description: string;
  setupRoute: string | null;
  externalUrl: string | null;
  tags: string[];
  honestyNote?: string;
};

export type PartnerAppsConfig = {
  version: number;
  updatedAt: string;
  apps: PartnerAppConfigEntry[];
  roadmap: RoadmapExtensionConfigEntry[];
};

const ALLOWED_CATEGORIES: readonly ExtensionCategory[] = [
  "sales_channels",
  "accounting",
  "labor",
  "marketing",
  "operations",
  "analytics",
  "developer",
];

export function validatePartnerAppsConfig(config: PartnerAppsConfig): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const [index, app] of config.apps.entries()) {
    const prefix = `partner-apps.apps[${index}]`;
    if (!app.id?.trim()) errors.push(`${prefix}: missing id`);
    if (ids.has(app.id)) errors.push(`${prefix}: duplicate id ${app.id}`);
    ids.add(app.id);
    if (!app.name?.trim()) errors.push(`${prefix}: missing name`);
    if (!app.publisher?.trim()) errors.push(`${prefix}: missing publisher`);
    if (!ALLOWED_CATEGORIES.includes(app.category)) {
      errors.push(`${prefix}: invalid category ${app.category}`);
    }
    if (!app.description?.trim()) errors.push(`${prefix}: missing description`);
    if (!Array.isArray(app.tags) || app.tags.length === 0) {
      errors.push(`${prefix}: tags must be a non-empty array`);
    }
  }

  for (const [index, item] of config.roadmap.entries()) {
    const prefix = `partner-apps.roadmap[${index}]`;
    if (!item.id?.trim()) errors.push(`${prefix}: missing id`);
    if (ids.has(item.id)) errors.push(`${prefix}: duplicate id ${item.id}`);
    ids.add(item.id);
    if (item.status !== "ROADMAP") errors.push(`${prefix}: status must be ROADMAP`);
  }

  return errors;
}

export function loadPartnerAppsConfig(): PartnerAppsConfig {
  return partnerAppsConfig as PartnerAppsConfig;
}

export function listPartnerApps(): PartnerAppConfigEntry[] {
  return loadPartnerAppsConfig().apps;
}

export function listRoadmapExtensions(): RoadmapExtensionConfigEntry[] {
  return loadPartnerAppsConfig().roadmap;
}

export function extensionCategoryLabel(category: ExtensionCategory): string {
  const labels: Record<ExtensionCategory, string> = {
    sales_channels: "Sales channels",
    accounting: "Accounting & finance",
    labor: "Labor & payroll",
    marketing: "Marketing & CRM",
    operations: "Operations",
    analytics: "Analytics",
    developer: "Developer platform",
  };
  return labels[category];
}

export function certificationLabel(certification: PartnerAppCertification): string {
  const labels: Record<PartnerAppCertification, string> = {
    certified_si: "Certified SI",
    technology_alliance: "Technology alliance",
    referral: "Referral partner",
  };
  return labels[certification];
}
