import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function RecipeYieldPage() {
  const { dataUserId } = await getTenantActor();
  const recipes = await prisma.recipe.findMany({
    where: { userId: dataUserId, active: true },
    include: {
      product: { select: { title: true } },
      ingredients: {
        include: { ingredient: { select: { name: true } } },
        take: 8,
      },
    },
    take: 40,
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold">Yield management</h1>
      <p className="text-sm text-muted-foreground">
        Recipe ingredient waste % drives theoretical cost (trim, shrinkage, prep loss). Edit in recipe
        builder.
      </p>

      {recipes.map((r) => (
        <Card key={r.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {r.name}{" "}
              <span className="font-normal text-muted-foreground">({r.product.title})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {r.ingredients.map((ri) => (
              <div key={ri.id} className="flex justify-between">
                <span>{ri.ingredient.name}</span>
                <span className="text-muted-foreground">
                  Waste {Number(ri.wastePercent)}% · Yield {Math.max(0, 100 - Number(ri.wastePercent))}%
                </span>
              </div>
            ))}
            <Link href={`/dashboard/costing/items`} className="text-xs text-primary underline mt-2 inline-block">
              Open costing →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
