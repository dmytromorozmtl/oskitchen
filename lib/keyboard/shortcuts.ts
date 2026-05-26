/** POS cashier keyboard shortcuts (counter terminals). */
export type PosShortcutAction =
  | "focus_product_search"
  | "add_first_product"
  | "payment_cash"
  | "complete_sale"
  | "cancel";

export const POS_SHORTCUTS: ReadonlyArray<{
  key: string;
  action: PosShortcutAction;
  label: string;
}> = [
  { key: "F1", action: "focus_product_search", label: "Search product" },
  { key: "F2", action: "add_first_product", label: "Add first match to cart" },
  { key: "F3", action: "payment_cash", label: "Cash payment" },
  { key: "F4", action: "complete_sale", label: "Complete sale" },
  { key: "Escape", action: "cancel", label: "Clear cart" },
];

export function matchPosShortcut(event: KeyboardEvent): PosShortcutAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  const hit = POS_SHORTCUTS.find((s) => s.key === event.key);
  return hit?.action ?? null;
}
