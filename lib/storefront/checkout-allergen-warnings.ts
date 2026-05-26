export type CheckoutAllergenWarning = {
  productId: string;
  productTitle: string;
  customerAllergen: string;
  productAllergens: string;
  severity: "high" | "medium";
};

function parseAllergenList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

/** Compare customer allergy profile to cart product allergen strings. */
export function detectCheckoutAllergenConflicts(params: {
  customerAllergies: unknown;
  cartProducts: { id: string; title: string; allergens: string | null }[];
}): CheckoutAllergenWarning[] {
  const customer = parseAllergenList(params.customerAllergies);
  if (!customer.length) return [];

  const warnings: CheckoutAllergenWarning[] = [];
  for (const p of params.cartProducts) {
    const productTags = parseAllergenList(p.allergens);
    if (!productTags.length) continue;
    for (const ca of customer) {
      const hit = productTags.some(
        (pt) => pt.includes(ca) || ca.includes(pt) || pt.split(/\s+/).includes(ca),
      );
      if (!hit) continue;
      warnings.push({
        productId: p.id,
        productTitle: p.title,
        customerAllergen: ca,
        productAllergens: p.allergens ?? productTags.join(", "),
        severity: "high",
      });
      break;
    }
  }
  return warnings;
}
