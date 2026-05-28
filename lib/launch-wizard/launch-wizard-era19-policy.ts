/**
 * Restaurant Launch Wizard — Evolution Era 19 Workstream C Cycle 6.
 *
 * Eight-step software-first onboarding shell. Reuses workspace completion signals;
 * does not claim GO/NO-GO PASS or live channel proof without artifacts.
 */

export const LAUNCH_WIZARD_ERA19_POLICY_ID = "era19-launch-wizard-v1" as const;

export const LAUNCH_WIZARD_ROUTE = "/dashboard/launch-wizard" as const;

export const LAUNCH_WIZARD_STEP_IDS = [
  "business-profile",
  "menu-catalog",
  "storefront",
  "pos",
  "kds-production",
  "integrations",
  "go-live-proof",
  "pilot-readiness",
] as const;

export type LaunchWizardStepId = (typeof LAUNCH_WIZARD_STEP_IDS)[number];

export type LaunchWizardStepOwnerRole = "owner" | "manager" | "kitchen";

export type LaunchWizardStepDefinition = {
  id: LaunchWizardStepId;
  title: string;
  summary: string;
  ownerRole: LaunchWizardStepOwnerRole;
  workflowHref: string;
  evidenceSource: string;
};

export const LAUNCH_WIZARD_STEP_DEFINITIONS: readonly LaunchWizardStepDefinition[] = [
  {
    id: "business-profile",
    title: "Business profile",
    summary: "Company name, business type, timezone, and fulfillment basics.",
    ownerRole: "owner",
    workflowHref: "/dashboard/settings",
    evidenceSource: "KitchenSettings + ActivationState.businessSettingsCompleted",
  },
  {
    id: "menu-catalog",
    title: "Menu & catalog",
    summary: "Menus and sellable products for POS, storefront, and channels.",
    ownerRole: "owner",
    workflowHref: "/dashboard/menus/new",
    evidenceSource: "Menu count + product count + ActivationState.firstMenuCreated",
  },
  {
    id: "storefront",
    title: "Storefront",
    summary: "Published online ordering surface for pilot customers.",
    ownerRole: "owner",
    workflowHref: "/dashboard/storefront",
    evidenceSource: "StorefrontSettings published count",
  },
  {
    id: "pos",
    title: "POS",
    summary: "Register checkout path exercised at least once.",
    ownerRole: "manager",
    workflowHref: "/dashboard/pos/terminal",
    evidenceSource: "UsageEvent pos_first_use",
  },
  {
    id: "kds-production",
    title: "KDS & production",
    summary: "Kitchen display or production plan activity for fulfillment prep.",
    ownerRole: "kitchen",
    workflowHref: "/dashboard/production",
    evidenceSource: "ActivationState.firstProductionCompleted + production plan tasks",
  },
  {
    id: "integrations",
    title: "Integrations",
    summary: "Woo/Shopify pilot channel connected and wizard-complete.",
    ownerRole: "owner",
    workflowHref: "/dashboard/integration-health",
    evidenceSource: "IntegrationConnection + channel pilot live proof slices",
  },
  {
    id: "go-live-proof",
    title: "Go-live proof",
    summary: "Launch project validation and simulation evidence.",
    ownerRole: "owner",
    workflowHref: "/dashboard/go-live",
    evidenceSource: "Go-live workbench validation + simulation artifacts",
  },
  {
    id: "pilot-readiness",
    title: "Pilot readiness",
    summary: "Commercial gates, SSO, and channel proof before paid cutover.",
    ownerRole: "owner",
    workflowHref: "/dashboard/implementation",
    evidenceSource: "Implementation pilot readiness + commercial GO/NO-GO artifacts",
  },
];

export function launchWizardStepDefinition(
  id: LaunchWizardStepId,
): LaunchWizardStepDefinition {
  const row = LAUNCH_WIZARD_STEP_DEFINITIONS.find((step) => step.id === id);
  if (!row) {
    throw new Error(`Unknown launch wizard step: ${id}`);
  }
  return row;
}
