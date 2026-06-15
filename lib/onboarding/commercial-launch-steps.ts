/** Commercial launch onboarding milestones (shown alongside adaptive flow). */
export const COMMERCIAL_LAUNCH_STEPS = [
  "business_type",
  "location",
  "first_product",
  "menu",
  "taxes",
  "payment",
  "fulfillment",
  "storefront",
  "first_order",
  "invite_staff",
] as const;

export type CommercialLaunchStep = (typeof COMMERCIAL_LAUNCH_STEPS)[number];

export function commercialLaunchProgress(completedSteps: number): number {
  return Math.round((completedSteps / COMMERCIAL_LAUNCH_STEPS.length) * 100);
}
