/** POS cashier keyboard shortcuts (counter terminals). */

export type PosShortcutAction =
  | "focus_product_search"
  | "add_first_product"
  | "payment_cash"
  | "payment_card"
  | "complete_sale"
  | "cancel"
  | "focus_customer_search"
  | "toggle_customer_display"
  | "show_shortcuts_help"
  | "increment_last_line"
  | "decrement_last_line"
  | "toggle_discount_panel"
  | "quick_add_1"
  | "quick_add_2"
  | "quick_add_3"
  | "quick_add_4"
  | "quick_add_5"
  | "quick_add_6"
  | "quick_add_7"
  | "quick_add_8"
  | "quick_add_9";

export type PosShortcutDefinition = {
  key: string;
  action: PosShortcutAction;
  label: string;
  group: "navigation" | "cart" | "payment" | "display";
};

export const POS_SHORTCUTS: ReadonlyArray<PosShortcutDefinition> = [
  { key: "F1", action: "focus_product_search", label: "Focus product search", group: "navigation" },
  { key: "F2", action: "add_first_product", label: "Add first visible product", group: "cart" },
  { key: "F3", action: "payment_cash", label: "Cash payment", group: "payment" },
  { key: "F4", action: "complete_sale", label: "Complete sale", group: "payment" },
  { key: "F5", action: "payment_card", label: "Card / terminal payment", group: "payment" },
  { key: "F6", action: "toggle_discount_panel", label: "Open discount panel", group: "payment" },
  { key: "F7", action: "focus_customer_search", label: "Focus customer search", group: "navigation" },
  { key: "F8", action: "toggle_customer_display", label: "Toggle customer display window", group: "display" },
  { key: "F9", action: "show_shortcuts_help", label: "Show keyboard shortcuts", group: "display" },
  { key: "Escape", action: "cancel", label: "Clear cart", group: "cart" },
  { key: "+", action: "increment_last_line", label: "Increase last line quantity", group: "cart" },
  { key: "=", action: "increment_last_line", label: "Increase last line quantity", group: "cart" },
  { key: "-", action: "decrement_last_line", label: "Decrease last line quantity", group: "cart" },
  { key: "1", action: "quick_add_1", label: "Quick add product #1", group: "cart" },
  { key: "2", action: "quick_add_2", label: "Quick add product #2", group: "cart" },
  { key: "3", action: "quick_add_3", label: "Quick add product #3", group: "cart" },
  { key: "4", action: "quick_add_4", label: "Quick add product #4", group: "cart" },
  { key: "5", action: "quick_add_5", label: "Quick add product #5", group: "cart" },
  { key: "6", action: "quick_add_6", label: "Quick add product #6", group: "cart" },
  { key: "7", action: "quick_add_7", label: "Quick add product #7", group: "cart" },
  { key: "8", action: "quick_add_8", label: "Quick add product #8", group: "cart" },
  { key: "9", action: "quick_add_9", label: "Quick add product #9", group: "cart" },
  { key: "?", action: "show_shortcuts_help", label: "Show keyboard shortcuts", group: "display" },
];

const QUICK_ADD_ACTIONS: PosShortcutAction[] = [
  "quick_add_1",
  "quick_add_2",
  "quick_add_3",
  "quick_add_4",
  "quick_add_5",
  "quick_add_6",
  "quick_add_7",
  "quick_add_8",
  "quick_add_9",
];

export function isPosShortcutEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;
  const element = target as { tagName?: string; isContentEditable?: boolean };
  const tag = element.tagName?.toUpperCase();
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || Boolean(element.isContentEditable);
}

export function matchPosShortcut(event: KeyboardEvent): PosShortcutAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;

  const key = event.key === "?" && event.shiftKey ? "?" : event.key;
  const hit = POS_SHORTCUTS.find((shortcut) => shortcut.key === key);
  if (!hit) return null;

  if (QUICK_ADD_ACTIONS.includes(hit.action) && isPosShortcutEditableTarget(event.target)) {
    return null;
  }

  if (
    (hit.action === "increment_last_line" ||
      hit.action === "decrement_last_line" ||
      hit.action === "cancel") &&
    isPosShortcutEditableTarget(event.target)
  ) {
    return null;
  }

  return hit.action;
}

export function quickAddIndexFromAction(action: PosShortcutAction): number | null {
  const match = action.match(/^quick_add_(\d)$/);
  if (!match) return null;
  return Number.parseInt(match[1] ?? "", 10);
}

export function posShortcutGroups(): Array<{
  group: PosShortcutDefinition["group"];
  shortcuts: PosShortcutDefinition[];
}> {
  const groups: PosShortcutDefinition["group"][] = ["navigation", "cart", "payment", "display"];
  return groups.map((group) => ({
    group,
    shortcuts: POS_SHORTCUTS.filter(
      (shortcut, index, list) =>
        shortcut.group === group &&
        list.findIndex((row) => row.key === shortcut.key && row.action === shortcut.action) === index,
    ),
  }));
}
