import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import {
  renderNutritionLabelPdfPlaceholder,
  type LabelFormat,
} from "@/services/nutrition/label-format-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const productId = request.nextUrl.searchParams.get("productId");
  const format = (request.nextUrl.searchParams.get("format") ?? "FDA") as LabelFormat;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, menu: { userId: dataUserId } },
    include: {
      nutritionProfile: true,
      ingredientDeclaration: true,
      allergenProfile: true,
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allergens = Array.isArray(product.allergenProfile?.containsJson)
    ? (product.allergenProfile!.containsJson as string[])
    : [];

  const pdf = renderNutritionLabelPdfPlaceholder(format, {
    productName: product.title,
    calories: product.nutritionProfile?.calories ?? null,
    protein: product.nutritionProfile?.protein ? Number(product.nutritionProfile.protein) : null,
    carbs: product.nutritionProfile?.carbs ? Number(product.nutritionProfile.carbs) : null,
    fat: product.nutritionProfile?.fat ? Number(product.nutritionProfile.fat) : null,
    fiber: product.nutritionProfile?.fiber ? Number(product.nutritionProfile.fiber) : null,
    ingredientsText: product.ingredientDeclaration?.ingredientsText,
    allergens,
  });

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${format.toLowerCase()}-label-${productId}.pdf`,
    },
  });
}
