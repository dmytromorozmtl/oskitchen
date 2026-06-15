import {
  CAFE_MODE_P3_143_MAX_SCREENS,
  CAFE_MODE_P3_143_SCREEN_IDS,
  type CafeModeP3_143ScreenId,
} from "@/lib/pos/cafe-mode-p3-143-policy";

export type CafeModeScreenDefinition = {
  id: CafeModeP3_143ScreenId;
  label: string;
  testId: string;
  description: string;
};

export const CAFE_MODE_P3_143_SCREENS: readonly CafeModeScreenDefinition[] = [
  {
    id: "menu",
    label: "Menu",
    testId: "cafe-mode-screen-menu",
    description: "Product grid and quick-order buttons for counter cafés.",
  },
  {
    id: "cart",
    label: "Cart",
    testId: "cafe-mode-screen-cart",
    description: "Line items, quantities, and subtotal before modifiers.",
  },
  {
    id: "modifiers",
    label: "Modifiers",
    testId: "cafe-mode-screen-modifiers",
    description: "Milk/size modifiers for the active line — roadmap for full modifier groups.",
  },
  {
    id: "payment",
    label: "Payment",
    testId: "cafe-mode-screen-payment",
    description: "Cash or card checkout — Stripe Terminal BETA when connected.",
  },
  {
    id: "receipt",
    label: "Receipt",
    testId: "cafe-mode-screen-receipt",
    description: "Order confirmation and new-sale CTA.",
  },
] as const;

export function assertCafeModeScreenCount(): boolean {
  return (
    CAFE_MODE_P3_143_SCREENS.length === CAFE_MODE_P3_143_MAX_SCREENS &&
    CAFE_MODE_P3_143_SCREENS.length === CAFE_MODE_P3_143_SCREEN_IDS.length
  );
}

export function cafeModeScreenTestId(screenId: CafeModeP3_143ScreenId): string {
  return `cafe-mode-screen-${screenId}`;
}
