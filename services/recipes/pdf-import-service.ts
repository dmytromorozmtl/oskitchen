import { prisma } from "@/lib/prisma";
import { ingredientListWhereForOwner, productListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type PdfRecipeLine = {
  ingredientName: string;
  quantity: number;
  unit: string;
};

export type PdfImportResult = {
  recipeName: string;
  yieldQuantity: number;
  yieldUnit: string;
  lines: PdfRecipeLine[];
  subRecipes: { name: string; quantity: number; unit: string }[];
};

const QTY_RE = /^([\d./]+)\s*([a-zA-Z]+)?\s+(.+)$/;

/** Parse plain-text extracted from a recipe PDF (line-based heuristic). */
export function parseRecipePdfText(text: string): PdfImportResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const recipeName = lines[0] ?? "Imported recipe";
  const parsed: PdfRecipeLine[] = [];
  const subRecipes: PdfImportResult["subRecipes"] = [];

  for (const line of lines.slice(1)) {
    if (/^sub[- ]?recipe:/i.test(line)) {
      const body = line.replace(/^sub[- ]?recipe:\s*/i, "");
      const m = body.match(QTY_RE);
      if (m) {
        subRecipes.push({
          name: m[3]!.trim(),
          quantity: parseFraction(m[1]!),
          unit: m[2]?.trim() || "each",
        });
      }
      continue;
    }
    const m = line.match(QTY_RE);
    if (m) {
      parsed.push({
        quantity: parseFraction(m[1]!),
        unit: m[2]?.trim() || "each",
        ingredientName: m[3]!.trim(),
      });
    }
  }

  return {
    recipeName,
    yieldQuantity: 1,
    yieldUnit: "batch",
    lines: parsed,
    subRecipes,
  };
}

function parseFraction(raw: string): number {
  if (raw.includes("/")) {
    const [a, b] = raw.split("/").map(Number);
    if (b && !Number.isNaN(a) && !Number.isNaN(b) && b !== 0) return a / b;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Apply parsed PDF lines to a recipe + optional sub-recipe links. */
export async function applyPdfImportToRecipe(params: {
  userId: string;
  productId: string;
  parsed: PdfImportResult;
}) {
  const productWhere = await productListWhereForOwner(params.userId);
  const product = await prisma.product.findFirst({
    where: { id: params.productId, ...productWhere },
    select: { id: true, title: true },
  });
  if (!product) throw new Error("Product not found");

  const recipe = await prisma.recipe.upsert({
    where: { productId: params.productId },
    create: {
      userId: params.userId,
      productId: params.productId,
      name: params.parsed.recipeName || product.title,
      yieldQuantity: params.parsed.yieldQuantity,
      yieldUnit: params.parsed.yieldUnit,
    },
    update: {
      name: params.parsed.recipeName || product.title,
      yieldQuantity: params.parsed.yieldQuantity,
      yieldUnit: params.parsed.yieldUnit,
      version: { increment: 1 },
    },
  });

  for (const line of params.parsed.lines) {
    const ingredientScope = await ingredientListWhereForOwner(params.userId);
    const ing = await prisma.ingredient.findFirst({
      where: {
        AND: [ingredientScope, { name: { equals: line.ingredientName, mode: "insensitive" } }],
      },
      select: { id: true },
    });
    if (!ing) continue;
    const existing = await prisma.recipeIngredient.findFirst({
      where: { recipeId: recipe.id, ingredientId: ing.id },
    });
    if (existing) {
      await prisma.recipeIngredient.update({
        where: { id: existing.id },
        data: { quantity: line.quantity, unit: line.unit },
      });
    } else {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ing.id,
          quantity: line.quantity,
          unit: line.unit,
        },
      });
    }
  }

  for (const sub of params.parsed.subRecipes) {
    const subProduct = await prisma.product.findFirst({
      where: { ...productWhere, title: { equals: sub.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (!subProduct) continue;
    const subRecipe = await prisma.recipe.findUnique({
      where: { productId: subProduct.id },
      select: { id: true },
    });
    if (!subRecipe) continue;
    await prisma.recipeSubRecipe.upsert({
      where: { recipeId_subRecipeId: { recipeId: recipe.id, subRecipeId: subRecipe.id } },
      create: {
        recipeId: recipe.id,
        subRecipeId: subRecipe.id,
        quantity: sub.quantity,
        unit: sub.unit,
      },
      update: { quantity: sub.quantity, unit: sub.unit },
    });
  }

  return recipe;
}
