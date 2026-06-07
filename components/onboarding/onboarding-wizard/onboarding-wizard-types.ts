import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { BusinessType } from "@prisma/client";

import type { BuiltOnboardingFlow } from "@/lib/onboarding/onboarding-flow-builder";
import type { OnboardingStepId, OperatingModelId } from "@/lib/onboarding/onboarding-types";

export type OnboardingWizardDefaults = {
  businessName: string;
  businessType: BusinessType | null;
  country: string;
  timezone: string;
  currency: string;
  locale: "en" | "fr";
  pickupAddress: string;
  deliveryEnabled: boolean;
  deliveryRadiusKm: string;
  orderCutoffTime: string;
  pickupWindows: string;
  kitchenWorkflowDefault: string;
  locationsCount: number;
  brandsCount: number;
};

export type OnboardingRunFn = <T>(
  fn: () => Promise<{ ok?: boolean; error?: string; menuId?: string; redirectTo?: string } & T>,
  advanceLocal: boolean,
  successMessage?: string,
  options?: { advanceTimeoutMs?: number },
) => Promise<void>;

export type OnboardingWizardProps = {
  flow: BuiltOnboardingFlow;
  initialStepIndex: number;
  defaults: OnboardingWizardDefaults;
  initialOperatingModel: OperatingModelId | null;
};

export type OnboardingStepIndicatorProps = {
  steps: BuiltOnboardingFlow["steps"];
  currentStepIndex: number;
  launchProgressPercent: number;
  onStepClick: (index: number) => void;
};

export type OnboardingStepNavigationProps = {
  stepIndex: number;
  pending: boolean;
  onBack: () => void;
};

export type OnboardingStepContentProps = {
  currentStepId: OnboardingStepId;
  pending: boolean;
  defaults: OnboardingWizardDefaults;
  browserTz: string | null;
  menuId: string | null;
  workflowDefault: string;
  resolvedOperatingDefault: OperatingModelId;
  flowBusinessType: BusinessType | null;
  setFlowBusinessType: (value: BusinessType | null) => void;
  setFlowOperatingModel: (value: OperatingModelId | null) => void;
  appendHidden: (fd: FormData) => void;
  run: OnboardingRunFn;
  handleSkip: (stepId: OnboardingStepId) => void;
  router: AppRouterInstance;
};

export const OPERATING_MODEL_COPY: {
  id: OperatingModelId;
  title: string;
  description: string;
}[] = [
  { id: "WALK_IN_DAILY", title: "Walk-in / daily service", description: "Day-of tickets, line service, and prep lists." },
  { id: "PICKUP", title: "Pickup orders", description: "Scheduled or same-day pickup windows." },
  { id: "DELIVERY", title: "Delivery orders", description: "Couriers, radius, and dispatch." },
  { id: "WEEKLY_PREORDERS", title: "Weekly preorders", description: "Publish a cycle, cutoff, then produce in batch." },
  { id: "CATERING_QUOTES_EVENTS", title: "Catering quotes & events", description: "Quotes, deposits, and event execution." },
  { id: "BAKERY_CUSTOM_PREORDERS", title: "Bakery preorders", description: "Batch days, labels, and pickup slots." },
  { id: "STOREFRONT", title: "Native OS Kitchen storefront", description: "Public web ordering — connect later in Storefront." },
  { id: "SHOPIFY_WOO_MARKETPLACE", title: "Shopify / WooCommerce / marketplaces", description: "Sync channels — credentials after setup." },
  { id: "MANUAL_ONLY", title: "Manual internal orders only", description: "Start in OS Kitchen; wire channels when ready." },
];
