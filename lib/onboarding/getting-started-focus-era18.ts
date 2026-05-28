import type { GettingStartedItem } from "@/services/onboarding/getting-started-status";

/** Pilot golden-path order — menu before channel before first order. */
export const GETTING_STARTED_STEP_PRIORITY = [
  "menu",
  "sso_pilot",
  "integration",
  "order",
  "pos",
  "staff",
  "storefront",
] as const;

export type GettingStartedStepId = (typeof GETTING_STARTED_STEP_PRIORITY)[number];

export const GETTING_STARTED_STEP_DETAIL: Record<GettingStartedStepId, string> = {
  menu: "Add at least one menu so POS, manual orders, and kitchen routing have items to sell.",
  sso_pilot:
    "Configure and activate Supabase SAML SSO for this pilot tenant — required when your plan includes enterprise SSO.",
  integration:
    "Connect WooCommerce or Shopify when pilot orders should flow from a sales channel — skip for POS-only pilots.",
  order: "Create a manual order or complete a test POS sale — this unlocks production and packing workflows.",
  pos: "Open the terminal and run a practice checkout so cashiers know the golden path.",
  staff: "Invite a manager or cashier so day-one shifts are not owner-only.",
  storefront: "Publish when you are ready for online ordering — optional for many pilots.",
};

export const GETTING_STARTED_STEP_CTA: Record<GettingStartedStepId, string> = {
  menu: "Create menu",
  sso_pilot: "Open SSO pilot setup",
  integration: "Connect sales channel",
  order: "Create first order",
  pos: "Open POS terminal",
  staff: "Invite team member",
  storefront: "Open storefront",
};

export function pickGettingStartedNextStep(
  items: readonly GettingStartedItem[],
): GettingStartedItem | null {
  const incomplete = items.filter((item) => !item.done);
  if (incomplete.length === 0) return null;

  for (const id of GETTING_STARTED_STEP_PRIORITY) {
    const match = incomplete.find((item) => item.id === id);
    if (match) return match;
  }

  return incomplete[0] ?? null;
}

export function gettingStartedStepDetail(item: GettingStartedItem): string {
  const id = item.id as GettingStartedStepId;
  return GETTING_STARTED_STEP_DETAIL[id] ?? "Complete this step to finish pilot setup.";
}

export function gettingStartedStepCta(item: GettingStartedItem): string {
  const id = item.id as GettingStartedStepId;
  return GETTING_STARTED_STEP_CTA[id] ?? "Continue";
}

export function shouldCollapseGettingStartedList(input: {
  showAllSteps: boolean;
  allDone: boolean;
}): boolean {
  return !input.showAllSteps && !input.allDone;
}
