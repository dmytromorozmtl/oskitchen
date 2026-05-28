import { NextResponse } from "next/server";

import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";
import { productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "products",
    "GET",
    "public_api_products_get",
  );
  if (isGuardError(guard)) return guard.response;

  const productWhere = await productListWhereForOwner(guard.userId);
  const products = await prisma.product.findMany({
    where: productWhere,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      price: true,
      active: true,
      preparedDate: true,
    },
  });

  return NextResponse.json({
    data: products.map((p) => ({
      ...p,
      price: p.price.toString(),
    })),
  });
}
