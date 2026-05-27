import { NextRequest, NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { getAllergenDeclarationForRecipe } from "@/services/allergen/allergen-service";

export async function GET(request: NextRequest) {
  const recipeId = request.nextUrl.searchParams.get("recipeId");
  if (!recipeId) {
    return NextResponse.json({ error: "recipeId required" }, { status: 400 });
  }

  const access = await requireReportExportActor({
    operation: "export:allergen-sheet",
    metadata: { recipeId },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const decl = await getAllergenDeclarationForRecipe(access.actor.dataUserId, recipeId);
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
