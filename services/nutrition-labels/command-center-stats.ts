import type { Prisma } from "@prisma/client";

import { printedLabelListWhereForOwnerAnd } from "@/lib/scope/workspace-printed-label-scope";
import { productListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

async function activeProductWhere(userId: string): Promise<Prisma.ProductWhereInput> {
  return productListWhereForOwnerAnd(userId, { active: true });
}

export type LabelCommandCenterStats = {
  totalActiveProducts: number;
  missingNutritionProfile: number;
  missingAllergenProfile: number;
  missingIngredientDeclaration: number;
  nutritionNeedsReview: number;
  allergenNeedsReview: number;
  ingredientNeedsReview: number;
  nutritionVerified: number;
  allergenVerified: number;
  nutritionBlocked: number;
  allergenBlocked: number;
  ingredientBlocked: number;
  labelsQueued: number;
  labelsPrintedToday: number;
  expiredNutrition: number;
};

/** Profile rows scoped to active catalog products in the workspace (not raw owner userId). */
function profileOnActiveProductWhere(
  productWhere: Prisma.ProductWhereInput,
  extra?: Prisma.NutritionProfileWhereInput,
): Prisma.NutritionProfileWhereInput {
  return { product: productWhere, ...extra };
}

export async function getLabelCommandCenterStats(userId: string): Promise<LabelCommandCenterStats> {
  const base = await activeProductWhere(userId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalActiveProducts,
    missingNutritionProfile,
    missingAllergenProfile,
    missingIngredientDeclaration,
    nutritionNeedsReview,
    allergenNeedsReview,
    ingredientNeedsReview,
    nutritionVerified,
    allergenVerified,
    nutritionBlocked,
    allergenBlocked,
    ingredientBlocked,
    labelsQueued,
    labelsPrintedToday,
    expiredNutrition,
  ] = await Promise.all([
    prisma.product.count({ where: base }),
    prisma.product.count({ where: { ...base, nutritionProfile: null } }),
    prisma.product.count({ where: { ...base, allergenProfile: null } }),
    prisma.product.count({ where: { ...base, ingredientDeclaration: null } }),
    prisma.nutritionProfile.count({
      where: profileOnActiveProductWhere(base, {
        verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW"] },
      }),
    }),
    prisma.allergenProfile.count({
      where: {
        product: base,
        verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW"] },
      },
    }),
    prisma.ingredientDeclaration.count({
      where: {
        product: base,
        verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW"] },
      },
    }),
    prisma.nutritionProfile.count({
      where: profileOnActiveProductWhere(base, { verificationStatus: "VERIFIED" }),
    }),
    prisma.allergenProfile.count({
      where: { product: base, verificationStatus: "VERIFIED" },
    }),
    prisma.nutritionProfile.count({
      where: profileOnActiveProductWhere(base, { verificationStatus: "BLOCKED" }),
    }),
    prisma.allergenProfile.count({
      where: { product: base, verificationStatus: "BLOCKED" },
    }),
    prisma.ingredientDeclaration.count({
      where: { product: base, verificationStatus: "BLOCKED" },
    }),
    prisma.printedLabel.count({
      where: await printedLabelListWhereForOwnerAnd(userId, { status: "QUEUED" }),
    }),
    prisma.printedLabel.count({
      where: await printedLabelListWhereForOwnerAnd(userId, {
        status: "PRINTED",
        printedAt: { gte: startOfDay },
      }),
    }),
    prisma.nutritionProfile.count({
      where: profileOnActiveProductWhere(base, { verificationStatus: "EXPIRED" }),
    }),
  ]);

  return {
    totalActiveProducts,
    missingNutritionProfile,
    missingAllergenProfile,
    missingIngredientDeclaration,
    nutritionNeedsReview,
    allergenNeedsReview,
    ingredientNeedsReview,
    nutritionVerified,
    allergenVerified,
    nutritionBlocked,
    allergenBlocked,
    ingredientBlocked,
    labelsQueued,
    labelsPrintedToday,
    expiredNutrition,
  };
}

export async function listProductsNeedingReview(userId: string, take = 80) {
  const base = await activeProductWhere(userId);
  return prisma.product.findMany({
    where: {
      ...base,
      OR: [
        { nutritionProfile: { verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW", "EXPIRED"] } } },
        { nutritionProfile: null },
        { allergenProfile: { verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW", "EXPIRED"] } } },
        { allergenProfile: null },
        { ingredientDeclaration: { verificationStatus: { in: ["NOT_STARTED", "NEEDS_REVIEW", "EXPIRED"] } } },
        { ingredientDeclaration: null },
      ],
    },
    include: {
      nutritionProfile: true,
      allergenProfile: true,
      ingredientDeclaration: true,
      menu: { select: { title: true } },
    },
    orderBy: [{ menuId: "asc" }, { sortOrder: "asc" }],
    take,
  });
}
