import { NextResponse } from "next/server";

import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";
import { publicApiRecipeCreateSchema } from "@/lib/api-public/schemas";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "recipes",
    "GET",
    "public_api_recipes_get",
  );
  if (isGuardError(guard)) return guard.response;

  const recipes = await prisma.recipe.findMany({
    where: { userId: guard.userId, active: true },
    take: 100,
    select: {
      id: true,
      name: true,
      productId: true,
      yieldQuantity: true,
      yieldUnit: true,
    },
  });

  return NextResponse.json({
    data: recipes.map((r) => ({
      ...r,
      yieldQuantity: r.yieldQuantity.toString(),
    })),
  });
}

export async function POST(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "recipes",
    "POST",
    "public_api_recipes_post",
  );
  if (isGuardError(guard)) return guard.response;

  const body = await request.json().catch(() => null);
  const parsed = publicApiRecipeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      userId: guard.userId,
      productId: parsed.data.productId,
      name: parsed.data.name,
      yieldQuantity: parsed.data.yieldQuantity ?? 1,
      yieldUnit: parsed.data.yieldUnit ?? "each",
    },
  });

  return NextResponse.json({ data: recipe }, { status: 201 });
}
