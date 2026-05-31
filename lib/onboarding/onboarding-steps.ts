import type { OnboardingFlowStep, OnboardingStepId } from "./onboarding-types";

const META: Record<OnboardingStepId, Omit<OnboardingFlowStep, "id">> = {
  welcome: {
    label: "Welcome",
    description: "Quick orientation — your answers tailor the next screens.",
    optional: true,
  },
  business_profile: {
    label: "Business profile",
    description: "Legal / customer-facing basics and how you identify in OS Kitchen.",
  },
  operating_model: {
    label: "Operating model",
    description: "How orders mainly reach your kitchen — this routes the rest of setup.",
    recommended: true,
  },
  brands_locations: {
    label: "Brands & scale",
    description: "Rough footprint for routing and modules — you’ll add real brands in the dashboard.",
    optional: true,
  },
  fulfillment: {
    label: "Fulfillment",
    description: "Pickup and delivery expectations for customers.",
    optional: true,
  },
  weekly_menu: {
    label: "Weekly menu",
    description: "Preorder cycle dates — skip if you run day-of service instead.",
    optional: true,
  },
  menu_items: {
    label: "Menu items",
    description: "Seed a few dishes or skip and build in Menu items later.",
    optional: true,
  },
  sales_channels: {
    label: "Sales channels",
    description: "Where orders may originate — connect credentials after setup.",
    recommended: true,
  },
  recommended_modules: {
    label: "Recommended modules",
    description: "Turn on what matches your operation — everything stays editable in Settings.",
    optional: true,
  },
  finish: {
    label: "Finish",
    description: "Summary and your best next screen inside OS Kitchen.",
  },
};

export function describeOnboardingStep(id: OnboardingStepId): OnboardingFlowStep {
  const m = META[id];
  return { id, ...m };
}

export function describeOnboardingSteps(ids: readonly OnboardingStepId[]): OnboardingFlowStep[] {
  return ids.map((id) => describeOnboardingStep(id));
}
