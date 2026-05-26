import { BusinessType } from "@prisma/client";

export type DemoVerticalSlug =
  | "meal-prep"
  | "catering"
  | "ghost-kitchen"
  | "bakery"
  | "restaurant"
  | "cafe"
  | "bar";

export const DEMO_VERTICAL_SLUGS: DemoVerticalSlug[] = [
  "meal-prep",
  "catering",
  "ghost-kitchen",
  "bakery",
  "restaurant",
  "cafe",
  "bar",
];

export function parseDemoVertical(input: unknown): DemoVerticalSlug {
  const s = String(input ?? "").trim();
  if (DEMO_VERTICAL_SLUGS.includes(s as DemoVerticalSlug)) {
    return s as DemoVerticalSlug;
  }
  return "meal-prep";
}

export type DemoWorkspacePreset = {
  slug: DemoVerticalSlug;
  /** Short positioning line for marketing/demo pages */
  tagline: string;
  businessName: string;
  businessType: BusinessType;
  menuWeekOneTitle: string;
  menuWeekTwoTitle: string;
  productTitles: string[];
};

export function getDemoWorkspacePreset(slug: DemoVerticalSlug): DemoWorkspacePreset {
  switch (slug) {
    case "catering":
      return {
        slug,
        tagline: "Corporate lunches, buffets, and scheduled drops — coordinated in one queue.",
        businessName: "Demo · OfficeBite Catering",
        businessType: BusinessType.CATERING,
        menuWeekOneTitle: "Demo · Midweek office slate",
        menuWeekTwoTitle: "Demo · Executive buffet week",
        productTitles: [
          "Sandwich & wrap platter (24)",
          "Mediterranean mezze board",
          "Coffee & pastry breakfast bundle",
          "BBQ pulled pork sliders tray",
          "Seasonal salad trio bowls",
          "Vegetarian grain bowl bar",
          "Charcuterie & cheese flight",
          "Kids finger-food combo",
          "Gluten-friendly boxed lunches",
          "Hot pasta buffet pan",
          "Chilled noodle salad tray",
          "Fruit & yogurt parfait bar",
          "House-made cookie assortment",
          "Sparkling & still water crate",
          "Chef-attended carving station add-on",
        ],
      };
    case "ghost-kitchen":
      return {
        slug,
        tagline: "Multiple virtual brands, one kitchen — funnel every delivery channel into prep.",
        businessName: "Demo · CloudKitchen Express",
        businessType: BusinessType.GHOST_KITCHEN,
        menuWeekOneTitle: "Demo · Brand lane · Week A",
        menuWeekTwoTitle: "Demo · Brand lane · Week B",
        productTitles: [
          "Smash burger combo",
          "Crispy chicken tenders bucket",
          "Loaded waffle fries",
          "Buffalo cauliflower bites",
          "Truffle mac bowl",
          "Korean BBQ rice plate",
          "Vegan chorizo taco kit",
          "Garlic parmesan wings (8)",
          "Caesar side salad",
          "Chocolate lava dessert",
          "Craft soda 4-pack",
          "Breakfast burrito roll",
          "Family feast bundle",
          "Late-night munch box",
          "Chef special ramen bowl",
        ],
      };
    case "bakery":
      return {
        slug,
        tagline: "Bake schedules, preorder windows, and pickup waves without spreadsheet chaos.",
        businessName: "Demo · SweetDrop Bakery",
        businessType: BusinessType.BAKERY,
        menuWeekOneTitle: "Demo · Oven schedule · wave 1",
        menuWeekTwoTitle: "Demo · Oven schedule · wave 2",
        productTitles: [
          "Country sourdough loaf",
          "Butter croissant (6-pack)",
          "Morning bun",
          "Chocolate babka half",
          "Seasonal fruit danish",
          "Savory spinach feta roll",
          "Cookie assortment tin",
          "Celebration cupcakes (12)",
          "Gluten-aware brownie box",
          "Artisan baguette pair",
          "Cinnamon roll tray",
          "Cold brew bottle",
          "Kids sprinkle loaf cake",
          "Protein oat bar batch",
          "Custom message sugar cookie set",
        ],
      };
    case "restaurant":
      return {
        slug,
        tagline: "Dine-in, takeout, and delivery in one queue with prep and costing close at hand.",
        businessName: "Demo · Bistro Verde",
        businessType: BusinessType.RESTAURANT,
        menuWeekOneTitle: "Demo · Dinner week A",
        menuWeekTwoTitle: "Demo · Dinner week B",
        productTitles: [
          "House burger & fries",
          "Caesar salad add chicken",
          "Margherita pizza",
          "Grilled salmon bowl",
          "Kids pasta marinara",
          "Soup of the day",
          "Steak frites",
          "Vegan grain bowl",
          "Iced tea pitcher",
          "Chocolate torte",
          "Seasonal risotto",
          "Charred broccoli side",
          "Garlic bread basket",
          "Espresso",
          "Chef tasting add-on",
        ],
      };
    case "cafe":
      return {
        slug,
        tagline: "Morning rush, daily specials, and preorder pickup without spreadsheet chaos.",
        businessName: "Demo · CornerCup Café",
        businessType: BusinessType.CAFE,
        menuWeekOneTitle: "Demo · Weekday specials",
        menuWeekTwoTitle: "Demo · Weekend brunch slate",
        productTitles: [
          "Oat milk latte",
          "Butter croissant",
          "Avocado toast",
          "Breakfast sandwich",
          "Cold brew growler",
          "Blueberry muffin",
          "Matcha latte",
          "Seasonal salad jar",
          "Turkey pesto panini",
          "Chai spice scone",
          "Kids hot cocoa",
          "Protein box",
          "Fruit cup",
          "Iced matcha",
          "Afternoon cookie pair",
        ],
      };
    case "bar":
      return {
        slug,
        tagline: "Drinks-led service with events, costing discipline, and responsible service copy you control.",
        businessName: "Demo · NorthBar Lounge",
        businessType: BusinessType.BAR,
        menuWeekOneTitle: "Demo · Cocktail list rotation",
        menuWeekTwoTitle: "Demo · Events & happy hour",
        productTitles: [
          "Old fashioned",
          "Margarita pitcher",
          "Seasonal spritz",
          "Local IPA draft",
          "Wine flight trio",
          "Zero-proof mule",
          "Bar snack mix",
          "Sliders trio",
          "Charcuterie board",
          "Espresso martini",
          "Whiskey tasting set",
          "Mocktail sampler",
          "Late-night fries",
          "Bottle service add-on",
          "Private room deposit",
        ],
      };
    case "meal-prep":
    default:
      return {
        slug: "meal-prep",
        tagline: "Weekly preorder cycles with clear prep dates for your kitchen and packing team.",
        businessName: "Demo · FitFresh Meals",
        businessType: BusinessType.MEAL_PREP,
        menuWeekOneTitle: "Demo · Week one menu",
        menuWeekTwoTitle: "Demo · Week two menu",
        productTitles: [
          "Thai basil chicken bowl",
          "Veggie tikka masala",
          "Salmon teriyaki",
          "Beef bulgogi bowl",
          "Caesar grilled chicken",
          "Quinoa harvest salad",
          "Turkey meatball marinara",
          "BBQ jackfruit sliders",
          "Garlic roasted broccoli",
          "Sweet potato mash",
          "House sourdough",
          "Brownie bites",
          "Cold brew growler",
          "Breakfast burrito pack",
          "Kids mac & cheese",
        ],
      };
  }
}

/** Industry marketing URLs use slightly different slugs; map to demo presets. */
export type SolutionPageSlug =
  | "meal-prep"
  | "catering"
  | "ghost-kitchens"
  | "bakeries"
  | "weekly-preorders"
  | "cloud-kitchens"
  | "corporate-lunch"
  | "cafes"
  | "multi-brand"
  | "restaurants"
  | "bars"
  | "fast-casual";

export const SOLUTION_PAGE_SLUGS: SolutionPageSlug[] = [
  "meal-prep",
  "catering",
  "restaurants",
  "bars",
  "cafes",
  "fast-casual",
  "ghost-kitchens",
  "bakeries",
  "weekly-preorders",
  "cloud-kitchens",
  "corporate-lunch",
  "multi-brand",
];

export function parseSolutionPageSlug(raw: string): SolutionPageSlug | null {
  if (SOLUTION_PAGE_SLUGS.includes(raw as SolutionPageSlug)) {
    return raw as SolutionPageSlug;
  }
  return null;
}

export function solutionSlugToDemoVertical(
  slug: SolutionPageSlug,
): DemoVerticalSlug {
  switch (slug) {
    case "ghost-kitchens":
    case "cloud-kitchens":
      return "ghost-kitchen";
    case "bakeries":
      return "bakery";
    case "weekly-preorders":
      return "meal-prep";
    case "corporate-lunch":
      return "catering";
    case "cafes":
      return "cafe";
    case "restaurants":
      return "restaurant";
    case "bars":
      return "bar";
    case "fast-casual":
      return "restaurant";
    case "multi-brand":
      return "ghost-kitchen";
    default:
      return slug;
  }
}
