import { prisma } from "@/lib/prisma";

function parseAllergenList(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === "string");
}

export async function getAllergenDeclarationForRecipe(userId: string, recipeId: string) {
  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, userId },
    include: {
      product: {
        select: {
          title: true,
          allergens: true,
          allergenProfile: true,
        },
      },
      ingredients: {
        include: { ingredient: { select: { name: true } } },
      },
    },
  });
  if (!recipe) throw new Error("Recipe not found");

  const allergens = new Set<string>();
  if (recipe.product.allergenProfile) {
    for (const a of parseAllergenList(recipe.product.allergenProfile.containsJson)) {
      allergens.add(a);
    }
  }
  if (recipe.product.allergens) {
    for (const part of recipe.product.allergens.split(/[,;]/)) {
      const t = part.trim();
      if (t) allergens.add(t);
    }
  }

  const list = Array.from(allergens).sort();
  return {
    recipeName: recipe.name,
    productName: recipe.product.title,
    allergens: list,
    containsStatement: list.length ? `Contains: ${list.join(", ")}` : "No declared allergens",
    mayContainStatement:
      "May contain traces of other allergens due to shared preparation areas.",
  };
}

export async function getAllergenWarningForOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              title: true,
              allergens: true,
              allergenProfile: { select: { containsJson: true } },
            },
          },
        },
      },
      kitchenCustomer: { select: { name: true, allergiesJson: true } },
    },
  });
  if (!order) throw new Error("Order not found");

  const orderAllergens = new Set<string>();
  for (const item of order.orderItems) {
    if (!item.product) continue;
    if (item.product.allergenProfile) {
      for (const a of parseAllergenList(item.product.allergenProfile.containsJson)) {
        orderAllergens.add(a);
      }
    }
    if (item.product.allergens) {
      for (const part of item.product.allergens.split(/[,;]/)) {
        const t = part.trim();
        if (t) orderAllergens.add(t);
      }
    }
  }

  const customerAllergies = parseAllergenList(order.kitchenCustomer?.allergiesJson);
  const conflicts = customerAllergies.filter((a) => orderAllergens.has(a));

  return {
    orderId,
    customerName: order.customerName,
    customerAllergies,
    orderAllergens: Array.from(orderAllergens).sort(),
    hasConflicts: conflicts.length > 0,
    conflicts,
    warning:
      conflicts.length > 0
        ? `ALLERGEN ALERT: ${conflicts.join(", ")} detected in this order`
        : "No allergen conflicts detected",
  };
}

export async function listMenuAllergenSummary(userId: string) {
  const products = await prisma.product.findMany({
    where: { menu: { userId }, active: true },
    select: {
      id: true,
      title: true,
      allergens: true,
      allergenProfile: { select: { containsJson: true, verificationStatus: true } },
      recipe: { select: { id: true, name: true } },
    },
    orderBy: { title: "asc" },
    take: 200,
  });

  return products.map((p) => {
    const fromProfile = p.allergenProfile
      ? parseAllergenList(p.allergenProfile.containsJson)
      : [];
    const fromText = p.allergens
      ? p.allergens.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
      : [];
    const allergens = Array.from(new Set([...fromProfile, ...fromText])).sort();
    return {
      productId: p.id,
      productName: p.title,
      recipeId: p.recipe?.id ?? null,
      allergens,
      verificationStatus: p.allergenProfile?.verificationStatus ?? "NOT_STARTED",
    };
  });
}
