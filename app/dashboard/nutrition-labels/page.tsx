import { prisma } from "@/lib/prisma";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { nutritionLabelsPageTitle } from "@/lib/nutrition/nutrition-label-terminology";
import { NutritionLabelPreview } from "@/components/dashboard/nutrition-label-preview";
import {
  NutritionLabelCommandCenter,
  type NutritionLabelNeedRow,
} from "@/components/dashboard/nutrition-label-command-center";
import { getLabelCommandCenterStats, listProductsNeedingReview } from "@/services/nutrition-labels/command-center-stats";

export const dynamic = "force-dynamic";

export default async function NutritionLabelsPage() {
  const { dataUserId } = await getTenantActor();
  const [kitchen, storefront, stats, needs] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: {
        businessType: true,
        blockPackingWithoutVerifiedAllergen: true,
        blockPackingWithoutVerifiedNutrition: true,
      },
    }),
    prisma.storefrontSettings.findFirst({
      where: { userId: dataUserId },
      orderBy: { updatedAt: "desc" },
      select: {
        publicShowNutritionWhenUnverified: true,
        publicShowAllergensWhenUnverified: true,
        publicShowIngredientsWhenUnverified: true,
      },
    }),
    getLabelCommandCenterStats(dataUserId),
    listProductsNeedingReview(dataUserId, 60),
  ]);

  const pageTitle = nutritionLabelsPageTitle(kitchen?.businessType);

  const needsRows: NutritionLabelNeedRow[] = needs.map((p) => ({
    id: p.id,
    title: p.title,
    menuTitle: p.menu.title,
    nutrition: p.nutritionProfile ? p.nutritionProfile.verificationStatus : "missing",
    allergen: p.allergenProfile ? p.allergenProfile.verificationStatus : "missing",
    ingredient: p.ingredientDeclaration ? p.ingredientDeclaration.verificationStatus : "missing",
  }));

  return (
    <div className="space-y-4">
      {needsRows.length > 0 ? (
        <div className="rounded-xl border p-4 space-y-2">
          <p className="text-sm font-medium">Label printing (FDA / EU)</p>
          {needsRows.slice(0, 5).map((p) => (
            <NutritionLabelPreview key={p.id} productId={p.id} productTitle={p.title} />
          ))}
        </div>
      ) : null}
    <NutritionLabelCommandCenter
      pageTitle={pageTitle}
      stats={stats}
      needsReview={needsRows}
      kitchenBlockAllergen={kitchen?.blockPackingWithoutVerifiedAllergen ?? false}
      kitchenBlockNutrition={kitchen?.blockPackingWithoutVerifiedNutrition ?? false}
      storefrontNutritionUnverified={storefront?.publicShowNutritionWhenUnverified ?? false}
      storefrontAllergenUnverified={storefront?.publicShowAllergensWhenUnverified ?? false}
      storefrontIngredientUnverified={storefront?.publicShowIngredientsWhenUnverified ?? false}
    />
    </div>
  );
}
