import type { KitchenSettings, Subscription } from "@prisma/client";

import type { SettingsCenterPayload } from "./settings-defaults";

export type HealthCheck = {
  key: string;
  label: string;
  weight: number;
  passed: boolean;
  hint?: string;
};

export type SectionHealth = {
  /** Settings section key. */
  section:
    | "workspace"
    | "branding"
    | "operations"
    | "orders"
    | "production"
    | "packing"
    | "delivery"
    | "crm"
    | "storefront"
    | "notifications"
    | "integrations"
    | "billing"
    | "security"
    | "compliance"
    | "ai";
  label: string;
  score: number;
  checks: HealthCheck[];
};

export type ExternalHealthContext = {
  notificationProviderConfigured: boolean;
  stripeConfigured: boolean;
  hasActiveStorefrontTheme: boolean;
  hasNotificationRules: boolean;
  hasCustomDomain: boolean;
  hasIntegrationConnections: boolean;
  has2FA: boolean;
};

function scoreFromChecks(checks: HealthCheck[]): number {
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  if (total === 0) return 0;
  const gained = checks.reduce((sum, c) => sum + (c.passed ? c.weight : 0), 0);
  return Math.round((gained / total) * 100);
}

export function computeSettingsHealth(
  ks: KitchenSettings | null,
  payload: SettingsCenterPayload,
  subscription: Pick<Subscription, "plan" | "status"> | null,
  ext: ExternalHealthContext,
): SectionHealth[] {
  const sections: SectionHealth[] = [];

  // Workspace identity
  {
    const id = payload.workspaceIdentity;
    const checks: HealthCheck[] = [
      { key: "legal_name", label: "Legal name", weight: 2, passed: Boolean(id.legalName ?? ks?.businessName) },
      { key: "currency", label: "Currency", weight: 1, passed: Boolean(ks?.currency) },
      { key: "timezone", label: "Timezone", weight: 1, passed: Boolean(ks?.timezone) },
      { key: "support_email", label: "Support email", weight: 1, passed: Boolean(id.supportEmail) },
      { key: "tax_id", label: "Tax ID", weight: 1, passed: Boolean(id.taxIds.gst || id.taxIds.qst || id.taxIds.vat) },
      { key: "hours", label: "Business hours", weight: 1, passed: Object.values(payload.businessHours).some((h) => !h.closed && h.open && h.close) },
    ];
    sections.push({ section: "workspace", label: "Workspace", score: scoreFromChecks(checks), checks });
  }

  // Branding
  {
    const checks: HealthCheck[] = [
      { key: "logo", label: "Logo uploaded", weight: 2, passed: Boolean(ks?.logoUrl) },
      { key: "color", label: "Brand color", weight: 1, passed: Boolean(ks?.brandColorHex) },
      { key: "theme", label: "Storefront theme", weight: 1, passed: Boolean(ks?.storefrontThemeKey) },
      { key: "footer", label: "Email footer", weight: 1, passed: Boolean(ks?.emailFooterBranding) },
    ];
    sections.push({ section: "branding", label: "Branding", score: scoreFromChecks(checks), checks });
  }

  // Operations
  {
    const op = payload.operations;
    const checks: HealthCheck[] = [
      { key: "prep_lead", label: "Prep lead time set", weight: 1, passed: op.prepLeadHours > 0 },
      { key: "cutoff", label: "Production cutoff set", weight: 1, passed: op.productionCutoffMinutesBeforeFulfillment > 0 },
      { key: "stations", label: "Stations configured", weight: 1, passed: op.stations.length > 0 },
      { key: "qc", label: "QC policy configured", weight: 1, passed: typeof op.qcRequiredForPacking === "boolean" },
    ];
    sections.push({ section: "operations", label: "Operations", score: scoreFromChecks(checks), checks });
  }

  // Orders
  {
    const o = payload.orders;
    const checks: HealthCheck[] = [
      { key: "payment_modes", label: "Payment modes configured", weight: 2, passed: o.allowedPaymentModes.length > 0 },
      { key: "cancellation", label: "Cancellation window set", weight: 1, passed: o.cancellationWindowHours >= 0 },
      { key: "escalation", label: "Escalation minutes set", weight: 1, passed: o.delayedOrderEscalationMinutes > 0 },
    ];
    sections.push({ section: "orders", label: "Orders", score: scoreFromChecks(checks), checks });
  }

  // Production
  {
    const p = payload.production;
    const checks: HealthCheck[] = [
      { key: "shifts", label: "Shifts defined", weight: 2, passed: p.shifts.length > 0 },
      { key: "sla", label: "Production SLA", weight: 1, passed: p.productionSLAMinutes > 0 },
      { key: "batch", label: "Batch sizing mode", weight: 1, passed: Boolean(p.batchSizingMode) },
    ];
    sections.push({ section: "production", label: "Production", score: scoreFromChecks(checks), checks });
  }

  // Packing
  {
    const pk = payload.packing;
    const checks: HealthCheck[] = [
      { key: "stages", label: "Stages configured", weight: 1, passed: pk.stages.length > 0 },
      { key: "labels", label: "Label template", weight: 1, passed: Boolean(pk.labelTemplate) },
      { key: "qc", label: "QC policy", weight: 1, passed: typeof pk.qcRequired === "boolean" },
    ];
    sections.push({ section: "packing", label: "Packing", score: scoreFromChecks(checks), checks });
  }

  // Delivery
  {
    const d = payload.delivery;
    const checks: HealthCheck[] = [
      { key: "enabled", label: "Delivery decision made", weight: 1, passed: typeof d.enabled === "boolean" },
      { key: "radius", label: "Delivery radius", weight: 1, passed: d.enabled ? d.deliveryRadiusKm > 0 : true },
      { key: "fees", label: "Delivery fees set", weight: 1, passed: d.enabled ? d.baseFee >= 0 && d.perKmFee >= 0 : true },
    ];
    sections.push({ section: "delivery", label: "Delivery", score: scoreFromChecks(checks), checks });
  }

  // CRM
  {
    const c = payload.crm;
    const checks: HealthCheck[] = [
      { key: "vip", label: "VIP thresholds", weight: 1, passed: c.vipLifetimeSpend > 0 || c.vipOrderCount > 0 },
      { key: "tags", label: "Customer tags", weight: 1, passed: c.customerTags.length > 0 },
      { key: "loyalty", label: "Loyalty mode chosen", weight: 1, passed: Boolean(c.loyaltyMode) },
    ];
    sections.push({ section: "crm", label: "CRM", score: scoreFromChecks(checks), checks });
  }

  // Storefront
  {
    const checks: HealthCheck[] = [
      { key: "theme", label: "Theme selected", weight: 1, passed: ext.hasActiveStorefrontTheme },
      { key: "domain", label: "Custom domain", weight: 1, passed: ext.hasCustomDomain },
    ];
    sections.push({ section: "storefront", label: "Storefront", score: scoreFromChecks(checks), checks });
  }

  // Notifications
  {
    const checks: HealthCheck[] = [
      { key: "provider", label: "Email provider", weight: 2, passed: ext.notificationProviderConfigured },
      { key: "rules", label: "At least 1 rule installed", weight: 1, passed: ext.hasNotificationRules },
    ];
    sections.push({ section: "notifications", label: "Notifications", score: scoreFromChecks(checks), checks });
  }

  // Integrations
  {
    const checks: HealthCheck[] = [
      { key: "any", label: "Integration connected", weight: 1, passed: ext.hasIntegrationConnections },
      { key: "stripe", label: "Stripe ready", weight: 1, passed: ext.stripeConfigured },
    ];
    sections.push({ section: "integrations", label: "Integrations", score: scoreFromChecks(checks), checks });
  }

  // Billing
  {
    const checks: HealthCheck[] = [
      { key: "plan", label: "Subscription plan set", weight: 1, passed: Boolean(subscription?.plan) },
      { key: "active", label: "Subscription active", weight: 1, passed: subscription?.status === "ACTIVE" || subscription?.status === "TRIALING" },
    ];
    sections.push({ section: "billing", label: "Billing", score: scoreFromChecks(checks), checks });
  }

  // Security
  {
    const checks: HealthCheck[] = [
      { key: "two_fa", label: "Two-factor enabled", weight: 2, passed: ext.has2FA },
    ];
    sections.push({ section: "security", label: "Security", score: scoreFromChecks(checks), checks });
  }

  // Compliance
  {
    const c = payload.compliance;
    const checks: HealthCheck[] = [
      { key: "privacy", label: "Privacy policy URL", weight: 1, passed: Boolean(c.privacyPolicyUrl) },
      { key: "retention", label: "Data retention configured", weight: 1, passed: c.dataRetentionDays > 0 },
      { key: "allergen", label: "Allergen disclaimer", weight: 1, passed: Boolean(c.allergenDisclaimer) },
    ];
    sections.push({ section: "compliance", label: "Compliance", score: scoreFromChecks(checks), checks });
  }

  // AI
  {
    const a = payload.ai;
    const checks: HealthCheck[] = [
      { key: "cap", label: "Daily token cap", weight: 1, passed: a.tokenCapPerDay > 0 },
      { key: "preset", label: "Has prompt preset", weight: 1, passed: a.promptPresets.length > 0 },
    ];
    sections.push({ section: "ai", label: "AI", score: scoreFromChecks(checks), checks });
  }

  return sections;
}

export function overallReadiness(sections: SectionHealth[]): number {
  if (sections.length === 0) return 0;
  const sum = sections.reduce((acc, s) => acc + s.score, 0);
  return Math.round(sum / sections.length);
}

export function readinessTone(score: number): "danger" | "warning" | "ready" {
  if (score < 50) return "danger";
  if (score < 80) return "warning";
  return "ready";
}
