import type {
  MealPlan,
  MealPlanCycle,
  MealPlanSelection,
} from "@prisma/client";

import { parseAllergies, parseDietaryPreferences } from "@/lib/crm/customer-privacy";

export type MealPlanGenerationPreviewLine = {
  productId: string | null;
  menuId: string | null;
  title: string;
  quantity: number;
  servings: number;
  unitPrice: number | null;
  total: number | null;
  notes: string | null;
  locked: boolean;
  warnings: string[];
};

export type MealPlanGenerationPreview = {
  ok: boolean;
  cycleId: string;
  customerEmail: string;
  customerName: string | null;
  fulfillmentMode: MealPlan["fulfillmentMode"];
  pickupOrDeliveryDate: Date;
  lines: MealPlanGenerationPreviewLine[];
  subtotal: number;
  allergyWarnings: string[];
  blockingErrors: string[];
};

type ProductLike = {
  id: string;
  title: string;
  price: { toString(): string };
  allergens: string | null;
  active: boolean;
};

/**
 * Pure preview generator — no Prisma calls. The caller fetches the data and
 * passes it in. This makes the function easy to test and easy to reuse.
 */
export function buildMealPlanGenerationPreview(args: {
  plan: MealPlan;
  cycle: MealPlanCycle;
  selections: MealPlanSelection[];
  products: ProductLike[];
  customer: { email: string; name: string | null };
}): MealPlanGenerationPreview {
  const productById = new Map(args.products.map((p) => [p.id, p]));

  const customerAllergies = parseAllergies(args.plan.allergiesJson);
  const customerDietary = parseDietaryPreferences(args.plan.dietaryPreferencesJson);
  const allergyWarnings: string[] = [];
  const blockingErrors: string[] = [];

  const lines: MealPlanGenerationPreviewLine[] = args.selections.map((sel) => {
    const product = sel.productId ? productById.get(sel.productId) ?? null : null;
    const warnings: string[] = [];

    if (!product && sel.productId) {
      warnings.push("Selected product is missing or archived.");
      blockingErrors.push(`Selection "${sel.itemName ?? sel.id.slice(0, 8)}" points at a missing product.`);
    }
    if (product && !product.active) {
      warnings.push("Product is inactive.");
    }
    if (product?.allergens) {
      for (const allergen of customerAllergies) {
        if (product.allergens.toLowerCase().includes(allergen.toLowerCase())) {
          warnings.push(`Contains ${allergen}`);
          allergyWarnings.push(
            `Selection ${product.title} contains ${allergen} — confirm with customer.`,
          );
        }
      }
    }

    const unitPrice = product ? Number(product.price.toString()) : null;
    const total = unitPrice != null ? unitPrice * sel.quantity : null;

    return {
      productId: sel.productId,
      menuId: sel.menuId,
      title: product?.title ?? sel.itemName ?? "Untitled meal",
      quantity: sel.quantity,
      servings: sel.servings,
      unitPrice,
      total,
      notes: sel.notes,
      locked: sel.locked,
      warnings,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + (line.total ?? 0), 0);
  const pickupOrDeliveryDate = args.cycle.cycleStartDate;

  if (lines.length === 0) {
    blockingErrors.push("Cycle has no selections — add at least one meal before generating.");
  }
  if (lines.every((l) => l.productId == null)) {
    blockingErrors.push(
      "Cycle has selections but none reference a product — link each selection to a real menu item before generation.",
    );
  }

  return {
    ok: blockingErrors.length === 0,
    cycleId: args.cycle.id,
    customerEmail: args.customer.email,
    customerName: args.customer.name,
    fulfillmentMode: args.plan.fulfillmentMode,
    pickupOrDeliveryDate,
    lines,
    subtotal,
    allergyWarnings: dedupe(allergyWarnings).concat(
      customerDietary.length > 0 ? [`Dietary: ${customerDietary.join(", ")}`] : [],
    ),
    blockingErrors,
  };
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

/** Mirror the same structure for "what would the order notes look like?". */
export function buildOrderNotesFromPreview(preview: MealPlanGenerationPreview, plan: MealPlan): string {
  const header = `Generated from meal plan "${plan.name}" (cycle ${preview.cycleId.slice(0, 8)})`;
  const fulfillment = `Fulfillment: ${plan.fulfillmentMode}`;
  const allergy = preview.allergyWarnings.length > 0 ? `Allergy: ${preview.allergyWarnings.join("; ")}` : null;
  const planNotes = plan.notes && plan.notes.trim().length > 0 ? `Notes: ${plan.notes.trim()}` : null;
  return [header, fulfillment, allergy, planNotes].filter(Boolean).join("\n");
}
