import type { MenuTemplate, QuickStartRestaurantType } from "@/lib/onboarding/quick-start-types";

export const MENU_TEMPLATES: Record<QuickStartRestaurantType, MenuTemplate> = {
  full_service: {
    id: "full_service",
    title: "Full service restaurant",
    description: "Appetizers, mains, desserts, and drinks for dine-in.",
    businessType: "RESTAURANT",
    operatingModel: "WALK_IN_DAILY",
    menuTitle: "Dining room menu",
    categories: ["SNACKS", "MAINS", "DESSERTS", "BEVERAGES"],
    items: [
      { name: "Soup of the day", price: 9, category: "SNACKS", description: "Chef's daily soup." },
      { name: "Caesar salad", price: 12, category: "SNACKS" },
      { name: "Grilled chicken", price: 18, category: "MAINS" },
      { name: "Pasta Alfredo", price: 16, category: "MAINS" },
      { name: "Tiramisu", price: 9, category: "DESSERTS" },
      { name: "House wine (glass)", price: 8, category: "BEVERAGES" },
    ],
  },
  qsr: {
    id: "qsr",
    title: "Quick service",
    description: "Burgers, sides, and combo-friendly items.",
    businessType: "CAFE",
    operatingModel: "WALK_IN_DAILY",
    menuTitle: "Counter menu",
    categories: ["MAINS", "SIDES", "BEVERAGES"],
    items: [
      { name: "Classic burger", price: 11.5, category: "MAINS" },
      { name: "Crispy chicken sandwich", price: 10.5, category: "MAINS" },
      { name: "Fries", price: 4, category: "SIDES" },
      { name: "Fountain drink", price: 2.5, category: "BEVERAGES" },
      { name: "Combo meal", price: 14, category: "MAINS", description: "Burger, fries, drink." },
    ],
  },
  bakery: {
    id: "bakery",
    title: "Bakery & pastry",
    description: "Bread, pastries, coffee, and sandwiches.",
    businessType: "BAKERY",
    operatingModel: "BAKERY_CUSTOM_PREORDERS",
    menuTitle: "Bakery case",
    categories: ["BAKERY", "BEVERAGES", "MAINS"],
    items: [
      { name: "Croissant", price: 4.5, category: "BAKERY" },
      { name: "Sourdough loaf", price: 7, category: "BAKERY" },
      { name: "Latte", price: 5, category: "BEVERAGES" },
      { name: "Chocolate cake slice", price: 8, category: "BAKERY" },
      { name: "Ham & cheese sandwich", price: 11, category: "MAINS" },
    ],
  },
  bar: {
    id: "bar",
    title: "Bar & lounge",
    description: "Cocktails, beer, wine, and bar snacks.",
    businessType: "BAR",
    operatingModel: "WALK_IN_DAILY",
    menuTitle: "Bar menu",
    categories: ["BAR", "SNACKS", "MAINS"],
    items: [
      { name: "House lager", price: 7, category: "BAR" },
      { name: "Margarita", price: 12, category: "BAR" },
      { name: "Old fashioned", price: 14, category: "BAR" },
      { name: "Nachos", price: 13, category: "SNACKS" },
      { name: "Sliders (3)", price: 15, category: "MAINS" },
    ],
  },
  ghost_kitchen: {
    id: "ghost_kitchen",
    title: "Ghost kitchen",
    description: "Delivery-optimized bowls and sides.",
    businessType: "GHOST_KITCHEN",
    operatingModel: "SHOPIFY_WOO_MARKETPLACE",
    menuTitle: "Delivery menu",
    categories: ["MAINS", "SIDES", "BEVERAGES"],
    items: [
      { name: "Chicken bowl", price: 12, category: "MAINS" },
      { name: "Veggie bowl", price: 11, category: "MAINS" },
      { name: "Garlic noodles", price: 10, category: "MAINS" },
      { name: "Side salad", price: 5, category: "SIDES" },
      { name: "Iced tea", price: 3, category: "BEVERAGES" },
    ],
  },
  catering: {
    id: "catering",
    title: "Catering",
    description: "Packages and per-person mains.",
    businessType: "CATERING",
    operatingModel: "CATERING_QUOTES_EVENTS",
    menuTitle: "Catering packages",
    categories: ["MAINS", "SIDES", "DESSERTS"],
    items: [
      { name: "Buffet package (per person)", price: 28, category: "MAINS" },
      { name: "Sandwich platter", price: 65, category: "MAINS" },
      { name: "Garden salad tray", price: 35, category: "SIDES" },
      { name: "Cookie dozen", price: 24, category: "DESSERTS" },
    ],
  },
  food_truck: {
    id: "food_truck",
    title: "Food truck",
    description: "Handheld tacos and quick bites.",
    businessType: "OTHER",
    operatingModel: "WALK_IN_DAILY",
    menuTitle: "Truck menu",
    categories: ["MAINS", "SIDES", "BEVERAGES"],
    items: [
      { name: "Street taco (2)", price: 8, category: "MAINS" },
      { name: "Loaded fries", price: 9, category: "SIDES" },
      { name: "Burrito bowl", price: 11, category: "MAINS" },
      { name: "Agua fresca", price: 4, category: "BEVERAGES" },
    ],
  },
};

export function getMenuTemplate(type: QuickStartRestaurantType): MenuTemplate {
  return MENU_TEMPLATES[type];
}

export function listMenuTemplates(): MenuTemplate[] {
  return Object.values(MENU_TEMPLATES);
}
