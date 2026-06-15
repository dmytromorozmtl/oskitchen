import { NextResponse } from "next/server";

import { guardPublicApiV1Resource, isGuardError, publicApiJson } from "@/lib/api-public/guard";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "inventory",
    "GET",
    "public_api_inventory_get",
  );
  if (isGuardError(guard)) return guard.response;

  const ingredients = await prisma.ingredient.findMany({
    where: { userId: guard.userId, active: true },
    take: 200,
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      parLevel: true,
      costPerUnit: true,
    },
  });

  return publicApiJson(guard, {
    data: ingredients.map((i) => ({
      ...i,
      currentStock: i.currentStock.toString(),
      parLevel: i.parLevel.toString(),
      costPerUnit: i.costPerUnit.toString(),
    })),
  });
}
