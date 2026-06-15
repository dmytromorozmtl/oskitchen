import type {
  OnboardingMenuTemplateId,
  QuickStartChannel,
  QuickStartRestaurantType,
} from "@/lib/onboarding/quick-start-types";

/** Auto onboarding — 5 questions shown in the chat wizard. */
export type AutoOnboardingCuisine =
  | "full_service"
  | "qsr"
  | "bakery"
  | "bar"
  | "ghost_kitchen"
  | "catering"
  | "food_truck"
  | "pizza"
  | "sushi"
  | "coffee_shop";

export type AutoOnboardingAnswers = {
  cuisine: AutoOnboardingCuisine;
  seatCount: number;
  delivers: boolean;
  averageOrderValue: number;
  specialRequirements: string;
  businessName: string;
};

export type AutoOnboardingSuggestedVendor = {
  id: string;
  name: string;
  category: string;
};

export type AutoOnboardingPlan = {
  version: "auto-onboarding-v1";
  confidenceScore: number;
  honestyLabel: "AI-assisted";
  restaurantType: QuickStartRestaurantType;
  menuTemplateId: OnboardingMenuTemplateId;
  channels: QuickStartChannel[];
  businessName: string;
  menuItemCount: number;
  menuTemplateTitle: string;
  kdsWorkflowLabel: string;
  taxRatePercent: number;
  priceAdjustmentNote: string | null;
  suggestedVendors: AutoOnboardingSuggestedVendor[];
  setupSteps: Array<{ id: string; label: string }>;
  summary: string;
};

export type AutoOnboardingApplyResult = {
  success: true;
  nextUrl: string;
  menuId: string;
  productCount: number;
};

export const AUTO_ONBOARDING_QUESTIONS = [
  {
    id: "cuisine",
    prompt: "What type of cuisine or concept best describes your restaurant?",
  },
  {
    id: "seats",
    prompt: "How many seats do you have (or expect at peak)?",
  },
  {
    id: "delivery",
    prompt: "Do you offer delivery or takeout to-go?",
  },
  {
    id: "aov",
    prompt: "What's your average order value (USD)?",
  },
  {
    id: "special",
    prompt: "Any special requirements? (dietary focus, alcohol, multi-location, etc.)",
  },
] as const;
