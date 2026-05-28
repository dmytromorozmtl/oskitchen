import type { BusinessType, GoLiveLaunchStage } from "@prisma/client";

import { goLiveSsoPilotActionRoute } from "@/lib/go-live/go-live-sso-pilot-focus-era18";

export type ReadinessSignal = {
  /** Stable key for the signal. */
  key: string;
  /** Human label. */
  label: string;
  /** Stage this signal belongs to. */
  stage: GoLiveLaunchStage;
  /** Raw value (typed at the producer). */
  value: number | boolean | null;
  /** Whether the signal counts as satisfied. */
  satisfied: boolean;
  /** Whether the signal is a hard requirement for launch. */
  required: boolean;
  /** Weight (multiplied by satisfied to score). */
  weight: number;
  /** Optional CTA route. */
  actionRoute?: string | null;
  /** Optional reason text. */
  reason?: string | null;
};

export type ReadinessInputs = {
  hasBusinessProfile: boolean;
  hasFulfillmentRules: boolean;
  hasMenu: boolean;
  productCount: number;
  mappedProductCount: number;
  unmappedProductCount: number;
  customerCount: number;
  connectionsConnected: number;
  connectionsBroken: number;
  testOrderCount: number;
  productionRuns: number;
  packingTaskCount: number;
  packingValidatedCount: number;
  labelsPrinted: number;
  deliveryRoutes: number;
  staffActive: number;
  trainingCompletions: number;
  hasBilling: boolean;
  hasBackup: boolean;
  hasSupportContact: boolean;
  hasAnalytics: boolean;
  storefrontPublished: boolean;
  webhooksHealthy: boolean;
  approvalsCount: number;
  approvalsRequired: number;
  externalCertificationRequired?: boolean;
  externalTargetProviderCount?: number;
  externalCertifiedProviderCount?: number;
  externalMissingProviderCount?: number;
  externalMissingProviderLabels?: string[];
  placeholderIntegrationScopeCount?: number;
  placeholderIntegrationScopeLabels?: string[];
  /** Optional training+certification snapshot. Backfilled in services that read training data. */
  trainingProgramsActive?: number;
  trainingAssignmentsTotal?: number;
  trainingAssignmentsCompleted?: number;
  certificationsActive?: number;
  certificationsExpiringSoon?: number;
  /** Optional staff-workforce snapshot. Backfilled by services/staff/staff-readiness-service. */
  staffHasOwner?: boolean;
  staffHasManager?: boolean;
  staffKitchen?: number;
  staffPackers?: number;
  staffDrivers?: number;
  staffShiftsToday?: number;
  /** Optional billing snapshot. Backfilled by services/billing/billing-readiness-service. */
  billingStripeConfigured?: boolean;
  billingPlanActive?: boolean;
  billingHasCustomer?: boolean;
  billingMode?: string;
  billingTrialDaysRemaining?: number | null;
  /** Enterprise SSO pilot snapshot when ssoOidc entitlement exists. */
  ssoOidcEntitlementEnabled?: boolean;
  ssoPilotConfigured?: boolean;
  ssoPilotActive?: boolean;
};

/** Per-business-type weights applied multiplicatively to the base weight. */
const BUSINESS_WEIGHT_MULTIPLIERS: Record<BusinessType, Partial<Record<string, number>>> = {
  MEAL_PREP: { packing: 2, routes: 2, labels: 2, production: 1.5 },
  CATERING: { production: 1.5, billing: 1.5, routes: 1.5 },
  GHOST_KITCHEN: { integrations: 2, mapping: 2, brand: 1.5 },
  CLOUD_KITCHEN: { integrations: 2, mapping: 2 },
  MULTI_BRAND: { integrations: 1.5, mapping: 1.5, brand: 2 },
  BAKERY: { production: 1.5, packing: 1.5 },
  RESTAURANT: { kitchen: 1.5, storefront: 1.2 },
  CAFE: { storefront: 1.2 },
  BAR: { staffing: 1.5, kitchen: 1.2 },
  OTHER: {},
};

export const CATEGORY_OF_SIGNAL: Record<string, string> = {
  business_profile: "operations",
  fulfillment_rules: "operations",
  menu_setup: "catalog",
  products: "catalog",
  product_mapping: "mapping",
  customers: "crm",
  channels_connected: "integrations",
  channels_broken: "integrations",
  test_order: "kitchen",
  production_runs: "production",
  packing_tasks: "packing",
  packing_validated: "packing",
  labels: "packing",
  routes: "routes",
  staff_active: "staffing",
  training: "staffing",
  billing: "billing",
  backup: "operations",
  support_contact: "operations",
  analytics: "analytics",
  storefront_published: "storefront",
  webhooks_healthy: "integrations",
  external_integrations_certified: "integrations",
  sso_pilot_active: "staffing",
  approvals: "ownership",
  training_coverage: "staffing",
  certifications_active: "staffing",
  staff_owner_present: "staffing",
  staff_manager_present: "staffing",
  staff_kitchen_present: "staffing",
  staff_packing_present: "staffing",
  staff_drivers_present: "staffing",
  billing_stripe_configured: "billing",
  billing_plan_active: "billing",
  billing_customer_present: "billing",
};

export function buildReadinessSignals(inputs: ReadinessInputs): ReadinessSignal[] {
  return [
    {
      key: "business_profile",
      label: "Business profile filled",
      stage: "DISCOVERY",
      value: inputs.hasBusinessProfile,
      satisfied: inputs.hasBusinessProfile,
      required: true,
      weight: 3,
      actionRoute: "/dashboard/settings",
      reason: inputs.hasBusinessProfile ? null : "No business name set in KitchenSettings",
    },
    {
      key: "fulfillment_rules",
      label: "Fulfillment rules configured",
      stage: "DISCOVERY",
      value: inputs.hasFulfillmentRules,
      satisfied: inputs.hasFulfillmentRules,
      required: true,
      weight: 2,
      actionRoute: "/dashboard/storefront",
    },
    {
      key: "menu_setup",
      label: "Menu set up",
      stage: "CATALOG_SETUP",
      value: inputs.hasMenu,
      satisfied: inputs.hasMenu,
      required: true,
      weight: 4,
      actionRoute: "/dashboard/menus",
    },
    {
      key: "products",
      label: "Products in catalog",
      stage: "CATALOG_SETUP",
      value: inputs.productCount,
      satisfied: inputs.productCount > 0,
      required: true,
      weight: 4,
      actionRoute: "/dashboard/products",
    },
    {
      key: "product_mapping",
      label: "External products mapped",
      stage: "CATALOG_SETUP",
      value: inputs.unmappedProductCount,
      satisfied: inputs.unmappedProductCount === 0,
      required: inputs.connectionsConnected > 0,
      weight: 3,
      actionRoute: "/dashboard/product-mapping/unmapped",
      reason: inputs.unmappedProductCount > 0 ? `${inputs.unmappedProductCount} unmapped product(s)` : null,
    },
    {
      key: "customers",
      label: "Customers imported (optional)",
      stage: "DATA_MIGRATION",
      value: inputs.customerCount,
      satisfied: inputs.customerCount > 0,
      required: false,
      weight: 1,
      actionRoute: "/dashboard/import-center",
    },
    {
      key: "channels_connected",
      label: "Sales channel(s) connected",
      stage: "CHANNEL_INTEGRATIONS",
      value: inputs.connectionsConnected,
      satisfied: inputs.connectionsConnected > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/sales-channels",
    },
    {
      key: "channels_broken",
      label: "No broken channel connections",
      stage: "CHANNEL_INTEGRATIONS",
      value: inputs.connectionsBroken,
      satisfied: inputs.connectionsBroken === 0,
      required: false,
      weight: 3,
      actionRoute: "/dashboard/sales-channels",
      reason: inputs.connectionsBroken > 0 ? `${inputs.connectionsBroken} connection(s) in error state` : null,
    },
    {
      key: "test_order",
      label: "Test order created",
      stage: "PRODUCTION_VALIDATION",
      value: inputs.testOrderCount,
      satisfied: inputs.testOrderCount > 0,
      required: true,
      weight: 3,
      actionRoute: "/dashboard/orders/new",
    },
    {
      key: "production_runs",
      label: "Production run verified",
      stage: "PRODUCTION_VALIDATION",
      value: inputs.productionRuns,
      satisfied: inputs.productionRuns > 0,
      required: true,
      weight: 4,
      actionRoute: "/dashboard/production",
    },
    {
      key: "packing_tasks",
      label: "Packing tasks ready",
      stage: "PACKING_VALIDATION",
      value: inputs.packingTaskCount,
      satisfied: inputs.packingTaskCount > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/packing",
    },
    {
      key: "packing_validated",
      label: "Packing verification passed",
      stage: "PACKING_VALIDATION",
      value: inputs.packingValidatedCount,
      satisfied: inputs.packingValidatedCount > 0,
      required: false,
      weight: 3,
      actionRoute: "/dashboard/packing",
    },
    {
      key: "labels",
      label: "Labels printed for packing",
      stage: "PACKING_VALIDATION",
      value: inputs.labelsPrinted,
      satisfied: inputs.labelsPrinted > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/packing",
    },
    {
      key: "routes",
      label: "Delivery routes prepared",
      stage: "DELIVERY_VALIDATION",
      value: inputs.deliveryRoutes,
      satisfied: inputs.deliveryRoutes > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/delivery",
    },
    {
      key: "staff_active",
      label: "Staff accounts active",
      stage: "STAFF_TRAINING",
      value: inputs.staffActive,
      satisfied: inputs.staffActive > 0,
      required: true,
      weight: 3,
      actionRoute: "/dashboard/staff",
    },
    {
      key: "training",
      label: "Training completions logged",
      stage: "STAFF_TRAINING",
      value: inputs.trainingCompletions,
      satisfied: inputs.trainingCompletions > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/training",
    },
    {
      key: "billing",
      label: "Billing configured",
      stage: "FINANCIAL_VALIDATION",
      value: inputs.hasBilling,
      satisfied: inputs.hasBilling,
      required: true,
      weight: 4,
      actionRoute: "/dashboard/billing",
    },
    {
      key: "billing_stripe_configured",
      label: "Stripe keys + price IDs present",
      stage: "FINANCIAL_VALIDATION",
      value: Boolean(inputs.billingStripeConfigured),
      satisfied: Boolean(inputs.billingStripeConfigured) || inputs.billingMode === "INTERNAL_FREE" || inputs.billingMode === "ENTERPRISE_CONTRACT",
      required: false,
      weight: 3,
      reason:
        inputs.billingStripeConfigured
          ? "Stripe is configured."
          : inputs.billingMode === "INTERNAL_FREE" || inputs.billingMode === "ENTERPRISE_CONTRACT"
            ? "Workspace is on a non-Stripe billing mode."
            : "Add STRIPE_SECRET_KEY, webhook secret, and price IDs.",
      actionRoute: "/dashboard/billing/settings",
    },
    {
      key: "billing_plan_active",
      label: "Plan active or internal",
      stage: "FINANCIAL_VALIDATION",
      value: Boolean(inputs.billingPlanActive),
      satisfied: Boolean(inputs.billingPlanActive),
      required: true,
      weight: 3,
      reason: inputs.billingPlanActive ? "Subscription is active." : "Subscription is not active/trialing.",
      actionRoute: "/dashboard/billing",
    },
    {
      key: "billing_customer_present",
      label: "Stripe customer present",
      stage: "FINANCIAL_VALIDATION",
      value: Boolean(inputs.billingHasCustomer),
      satisfied: Boolean(inputs.billingHasCustomer) || inputs.billingMode !== "STRIPE",
      required: false,
      weight: 1,
      reason: inputs.billingHasCustomer ? "Customer linked." : "Run one checkout to create a Stripe customer.",
      actionRoute: "/dashboard/billing/payment-method",
    },
    {
      key: "backup",
      label: "Backup or export reviewed",
      stage: "FINANCIAL_VALIDATION",
      value: inputs.hasBackup,
      satisfied: inputs.hasBackup,
      required: false,
      weight: 1,
      actionRoute: "/dashboard/import-export",
    },
    {
      key: "support_contact",
      label: "Support contact confirmed",
      stage: "DISCOVERY",
      value: inputs.hasSupportContact,
      satisfied: inputs.hasSupportContact,
      required: false,
      weight: 1,
      actionRoute: "/help",
    },
    {
      key: "analytics",
      label: "Analytics events firing",
      stage: "FINANCIAL_VALIDATION",
      value: inputs.hasAnalytics,
      satisfied: inputs.hasAnalytics,
      required: false,
      weight: 1,
      actionRoute: "/dashboard/analytics",
    },
    {
      key: "storefront_published",
      label: "Storefront published",
      stage: "CATALOG_SETUP",
      value: inputs.storefrontPublished,
      satisfied: inputs.storefrontPublished,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/storefront",
    },
    {
      key: "webhooks_healthy",
      label: "Webhooks healthy",
      stage: "CHANNEL_INTEGRATIONS",
      value: inputs.webhooksHealthy,
      satisfied: inputs.webhooksHealthy,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/sales-channels",
    },
    {
      key: "external_integrations_certified",
      label: "External integrations certified",
      stage: "CHANNEL_INTEGRATIONS",
      value: inputs.externalCertifiedProviderCount ?? 0,
      satisfied:
        !inputs.externalCertificationRequired ||
        (inputs.externalMissingProviderCount ?? 0) === 0,
      required: Boolean(inputs.externalCertificationRequired),
      weight: 4,
      actionRoute: "/dashboard/integrations/health",
      reason:
        (inputs.externalMissingProviderCount ?? 0) > 0
          ? `Missing certification for ${(inputs.externalMissingProviderLabels ?? []).join(", ")}`
          : inputs.externalCertificationRequired
            ? "Live-capable external providers have health-check and sync/webhook evidence."
            : "No live-capable external integrations currently require certification.",
    },
    ...(inputs.ssoOidcEntitlementEnabled
      ? [
          {
            key: "sso_pilot_active",
            label: "Enterprise SSO pilot active",
            stage: "STAFF_TRAINING" as const,
            value: inputs.ssoPilotActive ?? false,
            satisfied: Boolean(inputs.ssoPilotActive),
            required: true,
            weight: 3,
            actionRoute: goLiveSsoPilotActionRoute(Boolean(inputs.ssoPilotConfigured)),
            reason:
              inputs.ssoPilotActive === false
                ? inputs.ssoPilotConfigured
                  ? "SSO pilot is configured but not activated."
                  : "SSO pilot IdP settings are not saved yet."
                : null,
          },
        ]
      : []),
    {
      key: "approvals",
      label: "Approvals captured",
      stage: "FULL_GO_LIVE",
      value: inputs.approvalsCount,
      satisfied:
        inputs.approvalsRequired === 0 || inputs.approvalsCount >= inputs.approvalsRequired,
      required: inputs.approvalsRequired > 0,
      weight: 3,
      actionRoute: "/dashboard/go-live/approvals",
      reason:
        inputs.approvalsRequired > inputs.approvalsCount
          ? `${inputs.approvalsRequired - inputs.approvalsCount} approval(s) outstanding`
          : null,
    },
    {
      key: "training_coverage",
      label: "Training assignments completed",
      stage: "STAFF_TRAINING",
      value: inputs.trainingAssignmentsCompleted ?? 0,
      satisfied:
        (inputs.trainingAssignmentsTotal ?? 0) === 0 ||
        (inputs.trainingAssignmentsCompleted ?? 0) >= (inputs.trainingAssignmentsTotal ?? 0),
      required: (inputs.trainingAssignmentsTotal ?? 0) > 0,
      weight: 3,
      actionRoute: "/dashboard/training/assignments",
      reason:
        (inputs.trainingAssignmentsTotal ?? 0) > 0 &&
        (inputs.trainingAssignmentsCompleted ?? 0) < (inputs.trainingAssignmentsTotal ?? 0)
          ? `${(inputs.trainingAssignmentsTotal ?? 0) - (inputs.trainingAssignmentsCompleted ?? 0)} assignment(s) outstanding`
          : null,
    },
    {
      key: "staff_owner_present",
      label: "Owner / admin on roster",
      stage: "STAFF_TRAINING",
      value: inputs.staffHasOwner ?? false,
      satisfied: inputs.staffHasOwner ?? (inputs.staffActive > 0),
      required: true,
      weight: 3,
      actionRoute: "/dashboard/staff/roster",
      reason: inputs.staffHasOwner === false ? "No owner/admin staff member assigned" : null,
    },
    {
      key: "staff_manager_present",
      label: "Manager on roster",
      stage: "STAFF_TRAINING",
      value: inputs.staffHasManager ?? false,
      satisfied: inputs.staffHasManager ?? (inputs.staffActive > 0),
      required: false,
      weight: 2,
      actionRoute: "/dashboard/staff/roster",
      reason: inputs.staffHasManager === false ? "Add a manager to delegate launch tasks" : null,
    },
    {
      key: "staff_kitchen_present",
      label: "Kitchen staff present",
      stage: "STAFF_TRAINING",
      value: inputs.staffKitchen ?? 0,
      satisfied: (inputs.staffKitchen ?? 0) > 0,
      required: false,
      weight: 2,
      actionRoute: "/dashboard/staff/roster",
      reason: (inputs.staffKitchen ?? 0) === 0 ? "No kitchen staff (lead/prep/line) on roster" : null,
    },
    {
      key: "staff_packing_present",
      label: "Packing staff present",
      stage: "STAFF_TRAINING",
      value: inputs.staffPackers ?? 0,
      satisfied: (inputs.staffPackers ?? 0) > 0,
      required: false,
      weight: 1,
      actionRoute: "/dashboard/staff/roster",
      reason: (inputs.staffPackers ?? 0) === 0 ? "No packing staff on roster" : null,
    },
    {
      key: "staff_drivers_present",
      label: "Drivers present (if delivery enabled)",
      stage: "STAFF_TRAINING",
      value: inputs.staffDrivers ?? 0,
      satisfied: (inputs.deliveryRoutes ?? 0) === 0 || (inputs.staffDrivers ?? 0) > 0,
      required: (inputs.deliveryRoutes ?? 0) > 0,
      weight: 2,
      actionRoute: "/dashboard/staff/drivers",
      reason:
        (inputs.deliveryRoutes ?? 0) > 0 && (inputs.staffDrivers ?? 0) === 0
          ? "Delivery routes exist but no driver staff are assigned"
          : null,
    },
    {
      key: "certifications_active",
      label: "Certifications active",
      stage: "STAFF_TRAINING",
      value: inputs.certificationsActive ?? 0,
      satisfied:
        (inputs.trainingProgramsActive ?? 0) === 0 || (inputs.certificationsActive ?? 0) > 0,
      required: (inputs.trainingProgramsActive ?? 0) > 0,
      weight: 2,
      actionRoute: "/dashboard/training/certifications",
      reason:
        (inputs.trainingProgramsActive ?? 0) > 0 && (inputs.certificationsActive ?? 0) === 0
          ? "No active certifications recorded for staff"
          : null,
    },
  ];
}

function categoryMultiplier(category: string, businessType: BusinessType | null): number {
  if (!businessType) return 1;
  const map = BUSINESS_WEIGHT_MULTIPLIERS[businessType] ?? {};
  return map[category] ?? 1;
}

export type ReadinessBreakdown = {
  score: number;
  totalWeight: number;
  achievedWeight: number;
  required: { satisfied: number; total: number; missing: ReadinessSignal[] };
  byCategory: Record<string, { satisfied: number; total: number; weight: number }>;
  signals: ReadinessSignal[];
};

export function calculateReadiness(
  inputs: ReadinessInputs,
  businessType: BusinessType | null,
): ReadinessBreakdown {
  const signals = buildReadinessSignals(inputs);
  let totalWeight = 0;
  let achievedWeight = 0;
  const required = { satisfied: 0, total: 0, missing: [] as ReadinessSignal[] };
  const byCategory: Record<string, { satisfied: number; total: number; weight: number }> = {};

  for (const signal of signals) {
    const category = CATEGORY_OF_SIGNAL[signal.key] ?? "other";
    const mult = categoryMultiplier(category, businessType);
    const effectiveWeight = Math.max(0, signal.weight) * mult;
    totalWeight += effectiveWeight;
    if (signal.satisfied) achievedWeight += effectiveWeight;
    if (signal.required) {
      required.total += 1;
      if (signal.satisfied) required.satisfied += 1;
      else required.missing.push(signal);
    }
    const slot = byCategory[category] ?? { satisfied: 0, total: 0, weight: 0 };
    slot.total += 1;
    slot.weight += effectiveWeight;
    if (signal.satisfied) slot.satisfied += 1;
    byCategory[category] = slot;
  }

  const score = totalWeight === 0 ? 0 : Math.round((achievedWeight / totalWeight) * 100);
  return { score, totalWeight, achievedWeight, required, byCategory, signals };
}
