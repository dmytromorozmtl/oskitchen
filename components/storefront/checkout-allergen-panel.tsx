"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import {
  detectCheckoutAllergenConflicts,
  type CheckoutAllergenWarning,
} from "@/lib/storefront/checkout-allergen-warnings";
export function CheckoutAllergenPanel({
  products,
  cartProductIds,
  customerAllergiesJson,
}: {
  products: { id: string; title: string; allergens?: string | null }[];
  cartProductIds: string[];
  customerAllergiesJson?: unknown;
}) {
  const warnings = React.useMemo(() => {
    const inCart = products.filter((p) => cartProductIds.includes(p.id));
    return detectCheckoutAllergenConflicts({
      customerAllergies: customerAllergiesJson,
      cartProducts: inCart.map((p) => ({
        id: p.id,
        title: p.title,
        allergens: p.allergens ?? null,
      })),
    });
  }, [products, cartProductIds, customerAllergiesJson]);

  if (!warnings.length) return null;

  return (
    <div
      className="rounded-xl border border-amber-300/80 bg-amber-50/80 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40"
      role="alert"
    >
      <div className="flex items-start gap-2 font-medium text-amber-900 dark:text-amber-100">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Allergen conflict — review before placing order
      </div>
      <ul className="mt-2 space-y-1 text-amber-800 dark:text-amber-200">
        {warnings.map((w: CheckoutAllergenWarning) => (
          <li key={`${w.productId}-${w.customerAllergen}`}>
            <span className="font-medium">{w.productTitle}</span> may contain{" "}
            <span className="font-medium">{w.customerAllergen}</span> (listed: {w.productAllergens})
          </li>
        ))}
      </ul>
    </div>
  );
}
