import { KDS_PRODUCTION_VIEW_POLICY_ID } from "@/lib/kitchen/kds-production-view-policy";

export const KDS_MULTI_STATION_POLICY_ID = "kds-multi-station-v1" as const;

export const KDS_MULTI_STATION_MIN_STATIONS = 10 as const;

export const KDS_MULTI_STATION_EXTENDS_POLICIES = [KDS_PRODUCTION_VIEW_POLICY_ID] as const;

/** Canonical food-type buckets used for routing. */
export const KDS_FOOD_TYPES = [
  "grill",
  "fry",
  "saute",
  "pizza",
  "cold",
  "bakery",
  "dessert",
  "bar",
  "expo",
  "prep",
  "sushi",
  "wok",
] as const;

export type KdsFoodType = (typeof KDS_FOOD_TYPES)[number];

export type KdsStationDefinition = {
  id: string;
  name: string;
  foodType: KdsFoodType;
  keywords: readonly string[];
  sortOrder: number;
};

/** Twelve default KDS stations — grill through expo for full-line routing. */
export const DEFAULT_KDS_STATIONS: readonly KdsStationDefinition[] = [
  { id: "grill", name: "Grill", foodType: "grill", keywords: ["burger", "steak", "chicken", "rib", "bbq"], sortOrder: 1 },
  { id: "fry", name: "Fry", foodType: "fry", keywords: ["fries", "wing", "fried", "tempura", "nugget"], sortOrder: 2 },
  { id: "saute", name: "Sauté", foodType: "saute", keywords: ["pasta", "risotto", "sauce", "stir"], sortOrder: 3 },
  { id: "pizza", name: "Pizza", foodType: "pizza", keywords: ["pizza", "flatbread", "calzone"], sortOrder: 4 },
  { id: "cold", name: "Salad & Cold", foodType: "cold", keywords: ["salad", "ceviche", "poke", "cold"], sortOrder: 5 },
  { id: "bakery", name: "Bakery", foodType: "bakery", keywords: ["bread", "bun", "croissant", "pastry", "muffin"], sortOrder: 6 },
  { id: "dessert", name: "Dessert", foodType: "dessert", keywords: ["dessert", "cake", "ice cream", "cookie", "sweet"], sortOrder: 7 },
  { id: "bar", name: "Bar & Beverage", foodType: "bar", keywords: ["coffee", "latte", "cocktail", "soda", "juice", "beer", "wine"], sortOrder: 8 },
  { id: "sushi", name: "Sushi", foodType: "sushi", keywords: ["sushi", "sashimi", "maki", "nigiri"], sortOrder: 9 },
  { id: "wok", name: "Wok & Noodles", foodType: "wok", keywords: ["wok", "noodle", "ramen", "pho", "rice bowl", "fried rice"], sortOrder: 10 },
  { id: "prep", name: "Prep", foodType: "prep", keywords: ["prep", "mise", "chop", "portion"], sortOrder: 11 },
  { id: "expo", name: "Expo", foodType: "expo", keywords: ["expo", "plating", "assembly", "handoff"], sortOrder: 12 },
] as const;

/** Product category → default food type when title keywords do not match. */
export const KDS_CATEGORY_FOOD_TYPE_MAP: Record<string, KdsFoodType> = {
  MAINS: "grill",
  SIDES: "fry",
  BAKERY: "bakery",
  BEVERAGES: "bar",
  BREAKFAST: "grill",
  DESSERTS: "dessert",
  SNACKS: "fry",
  BAR: "bar",
  OTHER: "prep",
};
