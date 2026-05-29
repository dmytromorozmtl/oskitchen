import {
  POS_CASHIER_SPEED_MODE_ALL_CATEGORY,
  POS_CASHIER_SPEED_MODE_ROUTE,
  POS_CASHIER_SPEED_MODE_ERA19_POLICY_ID,
} from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

export const POS_CASHIER_SPEED_MODE_AGGREGATOR_ERA19_POLICY_ID =
  "era19-pos-cashier-speed-mode-aggregator-v1" as const;

export type PosCashierSpeedProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  barcode: string | null;
};

export function posCashierSpeedModeFromSearchParam(value?: string | null): boolean {
  return value === "1" || value === "true";
}

/** Cashiers default to speed mode unless URL explicitly sets speed=0/false. */
export function resolvePosCashierSpeedMode(input: {
  speedParam?: string | null;
  persona: "owner" | "manager" | "cashier" | "kitchen";
}): boolean {
  const raw = input.speedParam?.trim();
  if (raw === "0" || raw === "false") return false;
  if (raw != null && raw !== "") {
    return posCashierSpeedModeFromSearchParam(raw);
  }
  return input.persona === "cashier";
}

export function posCashierSpeedModeToggleHref(currentSpeed: boolean): string {
  return currentSpeed ? POS_CASHIER_SPEED_MODE_ROUTE : `${POS_CASHIER_SPEED_MODE_ROUTE}?speed=1`;
}

export function posCashierSpeedModeLabel(active: boolean): string {
  return active ? "Standard layout" : "Speed mode";
}

export function posCashierSpeedModeHeadline(active: boolean): string {
  return active
    ? "Speed mode — category pills, dense grid, checkout-first panels."
    : "Standard layout — full customer, loyalty, and discount controls.";
}

export function buildPosProductCategories(
  products: readonly { category: string }[],
): string[] {
  const categories = new Set<string>();
  for (const product of products) {
    const label = product.category?.trim() || "Uncategorized";
    categories.add(label);
  }
  return [POS_CASHIER_SPEED_MODE_ALL_CATEGORY, ...Array.from(categories).sort()];
}

export function normalizePosProductCategory(category: string): string {
  return category?.trim() || "Uncategorized";
}

export function filterPosProductsForCashierSpeed<T extends PosCashierSpeedProduct>(input: {
  products: readonly T[];
  query: string;
  category: string;
}): T[] {
  let list = input.products;
  if (input.category !== POS_CASHIER_SPEED_MODE_ALL_CATEGORY) {
    list = list.filter(
      (product) => normalizePosProductCategory(product.category) === input.category,
    );
  }

  const q = input.query.trim().toLowerCase();
  if (!q) return [...list];

  return list.filter(
    (product) =>
      product.title.toLowerCase().includes(q) ||
      (product.barcode && product.barcode.toLowerCase() === q) ||
      product.id.toLowerCase().includes(q),
  );
}

export function posCashierSpeedProductGridClass(speedMode: boolean): string {
  return speedMode
    ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4";
}

export function posCashierSpeedProductTileClass(speedMode: boolean): string {
  return speedMode ? "min-h-[96px] p-3" : "min-h-[120px] p-4";
}

export function shouldShowPosTerminalSecondaryPanels(speedMode: boolean): boolean {
  return !speedMode;
}

export function posCashierSpeedModePolicySnapshot(active: boolean): {
  policyId: typeof POS_CASHIER_SPEED_MODE_ERA19_POLICY_ID;
  active: boolean;
  headline: string;
} {
  return {
    policyId: POS_CASHIER_SPEED_MODE_ERA19_POLICY_ID,
    active,
    headline: posCashierSpeedModeHeadline(active),
  };
}
