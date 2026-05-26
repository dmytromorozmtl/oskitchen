import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getAllergenDeclarationForRecipe } from "@/services/allergen/allergen-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const recipeId = request.nextUrl.searchParams.get("recipeId");
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }

  const decl = await getAllergenDeclarationForRecipe(dataUserId, recipeId);
  const text = [
    `Allergen Declaration: ${decl.productName}`,
    decl.containsStatement,
    decl.mayContainStatement,
  ].join("\n");

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename=allergen-${recipeId}.txt`,
    },
  });
}
