import type {
  MealPlanFrequency,
  MealPlanFulfillmentMode,
  MealPlanType,
} from "@prisma/client";

/**
 * Built-in starter templates. The Templates page adds them in one click.
 * `defaultItemsJson` is a list of placeholder line names — operators tie them
 * to real products from the wizard.
 */
export type BuiltInMealPlanTemplate = {
  key: string;
  name: string;
  type: MealPlanType;
  description: string;
  mealsPerCycle: number;
  servingsPerMeal: number;
  frequency: MealPlanFrequency;
  fulfillmentDefault: MealPlanFulfillmentMode;
  defaultItems: string[];
  dietaryPreset: string[];
};

export const BUILT_IN_MEAL_PLAN_TEMPLATES: readonly BuiltInMealPlanTemplate[] = [
  {
    key: "individual-5",
    name: "5 Meals Weekly Individual",
    type: "INDIVIDUAL",
    description: "Solo subscriber — five meals per week, single serving each.",
    mealsPerCycle: 5,
    servingsPerMeal: 1,
    frequency: "WEEKLY",
    fulfillmentDefault: "PICKUP",
    defaultItems: ["Protein bowl", "Salad", "Soup", "Stir fry", "Pasta"],
    dietaryPreset: [],
  },
  {
    key: "family-dinner",
    name: "Family Dinner Bundle",
    type: "FAMILY",
    description: "Weekly family box — four servings per meal, three meals per week.",
    mealsPerCycle: 3,
    servingsPerMeal: 4,
    frequency: "WEEKLY",
    fulfillmentDefault: "DELIVERY",
    defaultItems: ["Family entrée", "Family side", "Family dessert"],
    dietaryPreset: [],
  },
  {
    key: "corporate-lunch",
    name: "Corporate Lunch Rotation",
    type: "CORPORATE_LUNCH",
    description: "Weekly office lunch rotation for 10 people.",
    mealsPerCycle: 1,
    servingsPerMeal: 10,
    frequency: "WEEKLY",
    fulfillmentDefault: "DELIVERY",
    defaultItems: ["Lunch entrée", "Side", "Salad"],
    dietaryPreset: ["vegetarian-option"],
  },
  {
    key: "fitness-plan",
    name: "Fitness Meal Plan",
    type: "FITNESS_PLAN",
    description: "High-protein meal plan with macros.",
    mealsPerCycle: 7,
    servingsPerMeal: 1,
    frequency: "WEEKLY",
    fulfillmentDefault: "PICKUP",
    defaultItems: ["Protein bowl", "Macro-balanced lunch", "Macro-balanced dinner"],
    dietaryPreset: ["high-protein"],
  },
  {
    key: "senior-meals",
    name: "Senior Meal Support",
    type: "SENIOR_MEALS",
    description: "Senior delivery — soft, low-sodium, dietitian-aware.",
    mealsPerCycle: 5,
    servingsPerMeal: 1,
    frequency: "WEEKLY",
    fulfillmentDefault: "DELIVERY",
    defaultItems: ["Comfort entrée", "Soup", "Side", "Dessert"],
    dietaryPreset: ["low-sodium", "soft-texture"],
  },
  {
    key: "bakery-weekly-box",
    name: "Bakery Weekly Box",
    type: "INDIVIDUAL",
    description: "Pastry and bread mix delivered weekly.",
    mealsPerCycle: 1,
    servingsPerMeal: 1,
    frequency: "WEEKLY",
    fulfillmentDefault: "PICKUP",
    defaultItems: ["Pastry assortment", "Bread loaf", "Sweet treat"],
    dietaryPreset: [],
  },
  {
    key: "cafe-office-breakfast",
    name: "Café Office Breakfast",
    type: "OFFICE_ROTATION",
    description: "Weekly breakfast drop for an office.",
    mealsPerCycle: 1,
    servingsPerMeal: 8,
    frequency: "WEEKLY",
    fulfillmentDefault: "DELIVERY",
    defaultItems: ["Pastry tray", "Yogurt + granola", "Fresh fruit"],
    dietaryPreset: ["vegetarian-option"],
  },
  {
    key: "custom",
    name: "Custom Plan",
    type: "CUSTOM",
    description: "Blank slate — pick everything in the wizard.",
    mealsPerCycle: 0,
    servingsPerMeal: 1,
    frequency: "WEEKLY",
    fulfillmentDefault: "PICKUP",
    defaultItems: [],
    dietaryPreset: [],
  },
];
