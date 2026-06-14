import type { ShelfItemDetection } from "@/lib/inventory/inventory-photo-count-types";

export type ShelfCountExpectedItem = {
  label: string;
  quantity: number;
};

export type InventoryAiPhotoCountScenario = {
  id: string;
  label: string;
  shelfLabel: string;
  detections: readonly ShelfItemDetection[];
  expectedItems: readonly ShelfCountExpectedItem[];
};

function det(label: string, quantity: number, confidence = 0.92): ShelfItemDetection {
  return { label, quantity, confidence };
}

/** 15 shelf-photo scenarios with ground-truth expected counts (P2-63). */
export const INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIOS: readonly InventoryAiPhotoCountScenario[] =
  [
    {
      id: "walk-in-produce",
      label: "Walk-in produce shelf",
      shelfLabel: "Walk-in cooler — produce",
      detections: [det("Tomatoes", 12), det("Red onions", 8), det("Bell peppers", 6)],
      expectedItems: [
        { label: "Tomatoes", quantity: 12 },
        { label: "Red onions", quantity: 8 },
        { label: "Bell peppers", quantity: 6 },
      ],
    },
    {
      id: "protein-tray",
      label: "Protein tray count",
      shelfLabel: "Walk-in — proteins",
      detections: [det("Chicken breast", 6), det("Ground beef", 4), det("Salmon fillet", 3)],
      expectedItems: [
        { label: "Chicken breast", quantity: 6 },
        { label: "Ground beef", quantity: 4 },
        { label: "Salmon fillet", quantity: 3 },
      ],
    },
    {
      id: "dry-storage-grains",
      label: "Dry storage grains",
      shelfLabel: "Dry storage — grains",
      detections: [det("All-purpose flour", 4), det("Jasmine rice", 10), det("Pasta penne", 7)],
      expectedItems: [
        { label: "All-purpose flour", quantity: 4 },
        { label: "Jasmine rice", quantity: 10 },
        { label: "Pasta penne", quantity: 7 },
      ],
    },
    {
      id: "dairy-case",
      label: "Dairy case",
      shelfLabel: "Walk-in — dairy",
      detections: [det("Whole milk", 5), det("Heavy cream", 3), det("Shredded mozzarella", 8)],
      expectedItems: [
        { label: "Whole milk", quantity: 5 },
        { label: "Heavy cream", quantity: 3 },
        { label: "Shredded mozzarella", quantity: 8 },
      ],
    },
    {
      id: "prep-station-veg",
      label: "Prep station vegetables",
      shelfLabel: "Prep line — mise en place",
      detections: [det("Diced onions", 2), det("Minced garlic", 1), det("Chopped cilantro", 1)],
      expectedItems: [
        { label: "Diced onions", quantity: 2 },
        { label: "Minced garlic", quantity: 1 },
        { label: "Chopped cilantro", quantity: 1 },
      ],
    },
    {
      id: "freezer-portions",
      label: "Freezer portion bags",
      shelfLabel: "Freezer — portions",
      detections: [det("Portioned chicken", 20), det("Portioned rice", 15)],
      expectedItems: [
        { label: "Portioned chicken", quantity: 20 },
        { label: "Portioned rice", quantity: 15 },
      ],
    },
    {
      id: "beverage-shelf",
      label: "Beverage backbar",
      shelfLabel: "Bar — beverages",
      detections: [det("Sparkling water", 24), det("Oat milk", 6), det("Cold brew concentrate", 2)],
      expectedItems: [
        { label: "Sparkling water", quantity: 24 },
        { label: "Oat milk", quantity: 6 },
        { label: "Cold brew concentrate", quantity: 2 },
      ],
    },
    {
      id: "spice-rack",
      label: "Spice rack",
      shelfLabel: "Dry storage — spices",
      detections: [det("Kosher salt", 3), det("Black pepper", 2), det("Smoked paprika", 1)],
      expectedItems: [
        { label: "Kosher salt", quantity: 3 },
        { label: "Black pepper", quantity: 2 },
        { label: "Smoked paprika", quantity: 1 },
      ],
    },
    {
      id: "bakery-shelf",
      label: "Bakery shelf",
      shelfLabel: "Bakery — finished goods",
      detections: [det("Sourdough loaves", 9), det("Croissants", 14)],
      expectedItems: [
        { label: "Sourdough loaves", quantity: 9 },
        { label: "Croissants", quantity: 14 },
      ],
    },
    {
      id: "commissary-sauce",
      label: "Commissary sauce bins",
      shelfLabel: "Commissary — sauces",
      detections: [det("Marinara sauce", 5), det("Alfredo sauce", 4), det("Pesto", 2)],
      expectedItems: [
        { label: "Marinara sauce", quantity: 5 },
        { label: "Alfredo sauce", quantity: 4 },
        { label: "Pesto", quantity: 2 },
      ],
    },
    {
      id: "meal-prep-containers",
      label: "Meal prep containers",
      shelfLabel: "Meal prep — finished",
      detections: [det("Keto bowl", 18), det("Vegan bowl", 12), det("Family tray", 6)],
      expectedItems: [
        { label: "Keto bowl", quantity: 18 },
        { label: "Vegan bowl", quantity: 12 },
        { label: "Family tray", quantity: 6 },
      ],
    },
    {
      id: "ghost-kitchen-dry",
      label: "Ghost kitchen dry goods",
      shelfLabel: "Ghost kitchen — dry",
      detections: [det("Burger buns", 30), det("Tortilla wraps", 25), det("Fry oil jugs", 2)],
      expectedItems: [
        { label: "Burger buns", quantity: 30 },
        { label: "Tortilla wraps", quantity: 25 },
        { label: "Fry oil jugs", quantity: 2 },
      ],
    },
    {
      id: "single-item-shelf",
      label: "Single SKU shelf",
      shelfLabel: "Walk-in — eggs",
      detections: [det("Large eggs", 15)],
      expectedItems: [{ label: "Large eggs", quantity: 15 }],
    },
    {
      id: "fuzzy-label-match",
      label: "Fuzzy label normalization",
      shelfLabel: "Prep — proteins",
      detections: [det("chicken breast", 8), det("CHICKEN THIGH", 5)],
      expectedItems: [
        { label: "Chicken breast", quantity: 8 },
        { label: "Chicken thigh", quantity: 5 },
      ],
    },
    {
      id: "multi-zone-stress",
      label: "Multi-zone stress test",
      shelfLabel: "Full walk-in audit",
      detections: [
        det("Tomatoes", 10),
        det("Lettuce heads", 6),
        det("Avocados", 4),
        det("Limes", 20),
        det("Cilantro bunches", 3),
      ],
      expectedItems: [
        { label: "Tomatoes", quantity: 10 },
        { label: "Lettuce heads", quantity: 6 },
        { label: "Avocados", quantity: 4 },
        { label: "Limes", quantity: 20 },
        { label: "Cilantro bunches", quantity: 3 },
      ],
    },
  ] as const;

export function buildInventoryAiPhotoCountCorpusP263(): InventoryAiPhotoCountScenario[] {
  return [...INVENTORY_AI_PHOTO_COUNT_P2_63_SCENARIOS];
}
