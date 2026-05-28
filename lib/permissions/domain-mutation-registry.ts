import type { PermissionKey } from "@/lib/permissions/permissions";

import { MUTATION_ACCESS_DOCUMENTED_EXCEPTIONS } from "@/lib/permissions/mutation-access-policy";

export type DomainMutationBacking =
  | { kind: "canonical"; permissions: readonly PermissionKey[] }
  | { kind: "kitchen_or_production"; permissions: readonly PermissionKey[] }
  | { kind: "documented_exception"; exceptionId: string };

export type DomainMutationHelperEntry = {
  id: string;
  domain: string;
  module: string;
  entrypoint: string;
  backing: DomainMutationBacking;
  auditsDenials: boolean;
  era4Wave?: "wave4";
};

/** Canonical registry of domain-level mutation gates (server-side source of truth). */
export const DOMAIN_MUTATION_HELPERS: readonly DomainMutationHelperEntry[] = [
  {
    id: "core_mutation_permission",
    domain: "platform",
    module: "lib/permissions/mutation-access.ts",
    entrypoint: "requireMutationPermission",
    backing: { kind: "canonical", permissions: [] },
    auditsDenials: false,
  },
  {
    id: "routes_delivery",
    domain: "logistics",
    module: "lib/routes/require-route-mutation.ts",
    entrypoint: "requireRouteMutation",
    backing: { kind: "canonical", permissions: ["routes.manage"] },
    auditsDenials: true,
    era4Wave: "wave4",
  },
  {
    id: "demo_workspace",
    domain: "demo",
    module: "lib/demo/require-demo-mutation.ts",
    entrypoint: "requireDemoWorkspaceMutation",
    backing: { kind: "canonical", permissions: ["templates.manage"] },
    auditsDenials: true,
    era4Wave: "wave4",
  },
  {
    id: "restaurant_tables",
    domain: "foh_preview",
    module: "lib/restaurant/require-restaurant-table-mutation.ts",
    entrypoint: "requireRestaurantTableMutation",
    backing: { kind: "canonical", permissions: ["pos.access"] },
    auditsDenials: true,
    era4Wave: "wave4",
  },
  {
    id: "crm_customers",
    domain: "crm",
    module: "lib/crm/require-crm-mutation.ts",
    entrypoint: "requireCrmMutation",
    backing: { kind: "canonical", permissions: ["customers.manage"] },
    auditsDenials: true,
  },
  {
    id: "crm_rewards",
    domain: "crm",
    module: "lib/crm/require-rewards-mutation.ts",
    entrypoint: "requireRewardsMutation",
    backing: { kind: "canonical", permissions: ["loyalty.manage", "giftcards.manage"] },
    auditsDenials: true,
  },
  {
    id: "kitchen_daily",
    domain: "kitchen",
    module: "lib/kitchen/require-kitchen-mutation-access.ts",
    entrypoint: "requireKitchenMutationAccess",
    backing: {
      kind: "kitchen_or_production",
      permissions: ["kitchen.view", "kitchen.bump", "kitchen.recall", "production.manage"],
    },
    auditsDenials: false,
  },
  {
    id: "storefront_manage",
    domain: "storefront",
    module: "lib/storefront/require-storefront-actor.ts",
    entrypoint: "requireStorefrontManageActor",
    backing: { kind: "canonical", permissions: ["storefront.manage"] },
    auditsDenials: true,
  },
  {
    id: "integrations_manage",
    domain: "integrations",
    module: "lib/integrations/require-integrations-actor.ts",
    entrypoint: "requireIntegrationsActor",
    backing: { kind: "canonical", permissions: ["integrations.manage"] },
    auditsDenials: true,
  },
  {
    id: "channels_manage",
    domain: "channels",
    module: "lib/channels/require-channel-manage-actor.ts",
    entrypoint: "requireChannelManageActor",
    backing: { kind: "canonical", permissions: ["integrations.manage"] },
    auditsDenials: true,
  },
  {
    id: "billing_actor",
    domain: "billing",
    module: "lib/billing/require-billing-actor.ts",
    entrypoint: "requireBillingActor",
    backing: { kind: "canonical", permissions: ["billing.manage"] },
    auditsDenials: true,
  },
  {
    id: "import_export",
    domain: "data_ops",
    module: "lib/import-export/require-export-actor.ts",
    entrypoint: "requireExportActor",
    backing: { kind: "canonical", permissions: ["reports.read.financial"] },
    auditsDenials: true,
  },
  {
    id: "audit_center",
    domain: "audit",
    module: "lib/audit/require-audit-center-mutation-access.ts",
    entrypoint: "requireAuditExportAccess",
    backing: { kind: "canonical", permissions: ["audit.export"] },
    auditsDenials: true,
  },
  {
    id: "settings_center",
    domain: "settings",
    module: "lib/settings/require-settings-center-mutation.ts",
    entrypoint: "requireSettingsCenterMutation",
    backing: { kind: "canonical", permissions: ["workspace.settings"] },
    auditsDenials: true,
  },
  {
    id: "meal_plans",
    domain: "meal_plans",
    module: "lib/meal-plans/require-meal-plan-mutation.ts",
    entrypoint: "requireMealPlanMutation",
    backing: { kind: "canonical", permissions: ["production.manage"] },
    auditsDenials: false,
  },
  {
    id: "copilot",
    domain: "ai",
    module: "lib/ai/require-copilot-mutation.ts",
    entrypoint: "requireCopilotMutation",
    backing: { kind: "documented_exception", exceptionId: "copilot_capability_matrix" },
    auditsDenials: true,
    era4Wave: "wave4",
  },
  {
    id: "feedback_submit",
    domain: "feedback",
    module: "lib/feedback/require-app-feedback-submit.ts",
    entrypoint: "requireAppFeedbackSubmit",
    backing: { kind: "documented_exception", exceptionId: "feedback_session_only" },
    auditsDenials: true,
    era4Wave: "wave4",
  },
] as const;

export const DOMAIN_MUTATION_WAVE4_HELPER_IDS = DOMAIN_MUTATION_HELPERS.filter(
  (h) => h.era4Wave === "wave4",
).map((h) => h.id);

export function getDocumentedMutationException(exceptionId: string) {
  return MUTATION_ACCESS_DOCUMENTED_EXCEPTIONS.find((e) => e.id === exceptionId);
}

export function getDomainMutationHelper(id: string): DomainMutationHelperEntry | undefined {
  return DOMAIN_MUTATION_HELPERS.find((h) => h.id === id);
}
