/**
 * Era 20 first paid pilot package — segment ICP + module scope helpers.
 */

import {
  ERA20_FIRST_PAID_PILOT_PACKAGE_EXCLUDED_MODULES,
  ERA20_FIRST_PAID_PILOT_PACKAGE_ICP_SEGMENTS,
  ERA20_FIRST_PAID_PILOT_PACKAGE_INCLUDED_MODULES,
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER,
} from "@/lib/commercial/era20-first-paid-pilot-package-policy";
import { PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS } from "@/lib/commercial/pilot-icp-contract-era17-policy";

export type Era20PilotIcpSegment = (typeof ERA20_FIRST_PAID_PILOT_PACKAGE_ICP_SEGMENTS)[number];

export type Era20PilotPackageModuleId =
  (typeof ERA20_FIRST_PAID_PILOT_PACKAGE_INCLUDED_MODULES)[number];

export type Era20PilotExcludedModuleId =
  (typeof ERA20_FIRST_PAID_PILOT_PACKAGE_EXCLUDED_MODULES)[number];

export type Era20PilotSegmentProfile = {
  segment: Era20PilotIcpSegment;
  label: string;
  fitNotes: string;
  typicalChannels: readonly string[];
  launchWizardPriority: readonly string[];
};

export const ERA20_PILOT_SEGMENT_PROFILES: readonly Era20PilotSegmentProfile[] = [
  {
    segment: "cafe",
    label: "Café / bakery",
    fitNotes: "Storefront + light POS; KDS optional for prep",
    typicalChannels: ["storefront", "pos_software"],
    launchWizardPriority: ["menu", "storefront", "pos", "kds_optional"],
  },
  {
    segment: "ghost_kitchen",
    label: "Ghost kitchen / delivery-first",
    fitNotes: "Order hub + KDS + packing; Woo/Shopify optional",
    typicalChannels: ["order_hub", "kds", "packing", "woocommerce_or_shopify"],
    launchWizardPriority: ["menu", "kds", "packing", "channel_optional"],
  },
  {
    segment: "meal_prep",
    label: "Meal prep / commissary",
    fitNotes: "Production calendar + packing + storefront subscriptions",
    typicalChannels: ["production", "packing", "storefront"],
    launchWizardPriority: ["menu", "production", "storefront", "packing"],
  },
  {
    segment: "catering",
    label: "Catering / events",
    fitNotes: "Order hub + quotes beta; qualified claims only",
    typicalChannels: ["order_hub", "catering_quotes_beta"],
    launchWizardPriority: ["menu", "order_hub", "crm"],
  },
  {
    segment: "small_fast_casual",
    label: "Small fast casual",
    fitNotes: "POS + KDS + order hub; table service still preview",
    typicalChannels: ["pos_software", "kds", "order_hub"],
    launchWizardPriority: ["menu", "pos", "kds", "packing"],
  },
] as const;

export function getEra20PilotSegmentProfile(
  segment: Era20PilotIcpSegment,
): Era20PilotSegmentProfile | undefined {
  return ERA20_PILOT_SEGMENT_PROFILES.find((profile) => profile.segment === segment);
}

export function isEra20PilotModuleIncluded(
  moduleId: Era20PilotPackageModuleId,
): boolean {
  return (ERA20_FIRST_PAID_PILOT_PACKAGE_INCLUDED_MODULES as readonly string[]).includes(
    moduleId,
  );
}

export function isEra20PilotModuleExcluded(
  moduleId: Era20PilotExcludedModuleId,
): boolean {
  return (ERA20_FIRST_PAID_PILOT_PACKAGE_EXCLUDED_MODULES as readonly string[]).includes(
    moduleId,
  );
}

/** Maps disqualifiers from era17 ICP contract for runbook cross-links. */
export function era20PilotDisqualifiers(): readonly string[] {
  return PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS;
}

export type Era20ProspectPlaceholder = {
  policyId: typeof ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID;
  prospectName: string;
  disclaimer: typeof ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER;
  satisfiesCustomerGate: false;
};

export function buildEra20ProspectPlaceholder(
  prospectName: string | null | undefined,
): Era20ProspectPlaceholder | null {
  const trimmed = prospectName?.trim();
  if (!trimmed) return null;
  return {
    policyId: ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
    prospectName: trimmed,
    disclaimer: ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER,
    satisfiesCustomerGate: false,
  };
}

export const ERA20_PILOT_ONBOARDING_ROUTES = {
  launchWizard: "/dashboard/launch-wizard",
  todayBriefing: "/dashboard/today",
  integrationHealth: "/dashboard/integration-health",
  goLive: "/dashboard/go-live",
  orderHub: "/dashboard/order-hub",
} as const;
