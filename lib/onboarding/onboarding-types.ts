/** Wizard screen identifiers — stable for URLs and persistence. */
export type OnboardingStepId =
  | "welcome"
  | "business_profile"
  | "operating_model"
  | "brands_locations"
  | "fulfillment"
  | "weekly_menu"
  | "menu_items"
  | "sales_channels"
  | "recommended_modules"
  | "finish";

/** How orders mainly enter the business — drives adaptive routing. */
export type OperatingModelId =
  | "WALK_IN_DAILY"
  | "PICKUP"
  | "DELIVERY"
  | "WEEKLY_PREORDERS"
  | "CATERING_QUOTES_EVENTS"
  | "BAKERY_CUSTOM_PREORDERS"
  | "STOREFRONT"
  | "SHOPIFY_WOO_MARKETPLACE"
  | "MANUAL_ONLY";

/** Sales / intake intents (not all map 1:1 to IntegrationProvider). */
export type OnboardingChannelIntent =
  | "manual"
  | "storefront"
  | "woocommerce"
  | "shopify"
  | "uber_eats"
  | "uber_direct"
  | "doordash_placeholder"
  | "csv_import"
  | "phone_email"
  | "catering_quotes"
  | "meal_plan_subscriptions";

export type OnboardingSetupTask = {
  id: string;
  title: string;
  href: string;
  priority: "high" | "medium" | "low";
};

export const ONBOARDING_ADAPTIVE_SCHEMA_VERSION = 2 as const;

/** Persisted in KitchenSettings.onboardingAdaptiveJson */
export type OnboardingAdaptiveState = {
  schemaVersion: typeof ONBOARDING_ADAPTIVE_SCHEMA_VERSION;
  welcomeSeenAt?: string;
  operatingModel?: OperatingModelId | null;
  locationsCount?: number;
  brandsCount?: number;
  /** Module keys toggled during recommended step (subset of ModuleKey strings). */
  selectedModuleKeys?: string[];
  /** Channel intents chosen on sales step. */
  selectedChannelIntents?: OnboardingChannelIntent[];
  completedStepIds?: OnboardingStepId[];
  skippedStepIds?: OnboardingStepId[];
  setupTasks?: OnboardingSetupTask[];
  /** True if user confirmed skip-setup from welcome. */
  skippedFromWelcome?: boolean;
};

export type OnboardingFlowStep = {
  id: OnboardingStepId;
  label: string;
  description: string;
  optional?: boolean;
  /** Shown in UI as “recommended for your business”. */
  recommended?: boolean;
};
