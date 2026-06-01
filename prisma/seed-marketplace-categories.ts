import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { prisma } from "../lib/prisma";

export type MarketplaceCategorySeed = {
  name: string;
  slug: string;
  children: readonly string[];
};

export const HORECA_CATEGORIES: readonly MarketplaceCategorySeed[] = [
  {
    name: "Packaging & Disposables",
    slug: "packaging-disposables",
    children: [
      "Cups & Lids",
      "Containers",
      "Bags",
      "Straws",
      "Napkins",
      "Gloves",
      "Food Film",
      "Foil",
      "Parchment Paper",
    ],
  },
  {
    name: "Cleaning & Sanitation",
    slug: "cleaning-sanitation",
    children: [
      "Detergents",
      "Disinfectants",
      "Degreasers",
      "Dishwasher Chemicals",
      "Rinse Aids",
      "Hand Sanitizer",
    ],
  },
  {
    name: "Kitchenware & Tools",
    slug: "kitchenware-tools",
    children: ["Plates", "Pots & Pans", "Knives", "GN Containers", "Thermoses", "Dispensers"],
  },
  {
    name: "Equipment",
    slug: "equipment",
    children: [
      "Dishwashers",
      "Refrigerators",
      "Ovens",
      "Fryers",
      "Mixers",
      "Slicers",
      "Coffee Machines",
      "Hoods",
    ],
  },
  {
    name: "Dry Goods & Ingredients",
    slug: "dry-goods",
    children: ["Spices", "Oils", "Vinegars", "Canned Goods", "Coffee & Tea", "Sugar & Flour"],
  },
  {
    name: "Services",
    slug: "services",
    children: [
      "Equipment Repair",
      "Pest Control",
      "Waste Removal",
      "Knife Sharpening",
      "Cleaning",
      "Ventilation",
    ],
  },
  {
    name: "Uniforms & Workwear",
    slug: "uniforms",
    children: ["Aprons", "Chef Hats", "Gloves", "Non-Slip Shoes", "Masks"],
  },
  {
    name: "Training & Certification",
    slug: "training",
    children: ["HACCP Courses", "Food Safety", "Health Certificates", "Staff Training"],
  },
] as const;

export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function childCategorySlug(parentSlug: string, childName: string): string {
  return `${parentSlug}-${slugifyCategoryName(childName)}`;
}

export async function seedMarketplaceCategories(): Promise<{
  parents: number;
  children: number;
}> {
  let parentCount = 0;
  let childCount = 0;

  for (const [parentIndex, category] of HORECA_CATEGORIES.entries()) {
    const parent = await prisma.marketplaceProductCategory.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        level: 1,
        sortOrder: parentIndex,
      },
      update: {
        name: category.name,
        level: 1,
        sortOrder: parentIndex,
        parentId: null,
      },
    });
    parentCount += 1;

    for (const [childIndex, childName] of category.children.entries()) {
      const childSlug = childCategorySlug(category.slug, childName);
      await prisma.marketplaceProductCategory.upsert({
        where: { slug: childSlug },
        create: {
          name: childName,
          slug: childSlug,
          parentId: parent.id,
          level: 2,
          sortOrder: childIndex,
        },
        update: {
          name: childName,
          parentId: parent.id,
          level: 2,
          sortOrder: childIndex,
        },
      });
      childCount += 1;
    }
  }

  return { parents: parentCount, children: childCount };
}

async function main() {
  const result = await seedMarketplaceCategories();
  console.log(
    `Marketplace categories seeded: ${result.parents} parents, ${result.children} children (${result.parents + result.children} total).`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed marketplace categories:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
