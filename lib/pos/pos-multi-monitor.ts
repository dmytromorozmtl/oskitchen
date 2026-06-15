/**
 * Multi-monitor customer display — second screen via popup window + BroadcastChannel.
 */

import { POS_CUSTOMER_DISPLAY_ROUTE } from "@/lib/pos/pos-desktop-shortcuts-policy";

export const POS_CUSTOMER_DISPLAY_CHANNEL = "kitchenos-pos-customer-display-v1" as const;

export const POS_CUSTOMER_DISPLAY_WINDOW_NAME = "kitchenos-pos-customer-display" as const;

export type PosCustomerDisplayLine = {
  title: string;
  quantity: number;
  lineTotal: number;
};

export type PosCustomerDisplayState = {
  registerName: string;
  lines: PosCustomerDisplayLine[];
  subtotal: number;
  discount: number;
  total: number;
  paymentLabel: string;
  updatedAtIso: string;
};

export function screenLooksExtended(screen: Screen): boolean {
  const extended = (screen as Screen & { isExtended?: boolean }).isExtended;
  if (typeof extended === "boolean") return extended;
  return screen.availWidth >= 2560 || screen.width >= 2560;
}

/** Window features string — places popup on the right edge (typical second monitor). */
export function resolveCustomerDisplayWindowFeatures(screen: Screen = window.screen): string {
  const width = 1024;
  const height = Math.min(768, screen.availHeight);
  const left = screenLooksExtended(screen)
    ? screen.availWidth
    : Math.max(0, screen.availWidth - width);
  return [
    "popup",
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    "top=0",
    "menubar=no",
    "toolbar=no",
    "location=no",
    "status=no",
  ].join(",");
}

export function openPosCustomerDisplayWindow(
  screen: Screen = typeof window === "undefined" ? ({} as Screen) : window.screen,
): Window | null {
  if (typeof window === "undefined") return null;
  const existing = window.open("", POS_CUSTOMER_DISPLAY_WINDOW_NAME);
  if (existing && !existing.closed && existing.location.pathname.endsWith("/customer-display")) {
    existing.focus();
    return existing;
  }
  return window.open(
    POS_CUSTOMER_DISPLAY_ROUTE,
    POS_CUSTOMER_DISPLAY_WINDOW_NAME,
    resolveCustomerDisplayWindowFeatures(screen),
  );
}

export function publishPosCustomerDisplayState(state: PosCustomerDisplayState): void {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(POS_CUSTOMER_DISPLAY_CHANNEL);
  channel.postMessage(state);
  channel.close();
}

export function subscribePosCustomerDisplayState(
  onState: (state: PosCustomerDisplayState) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") return () => undefined;
  const channel = new BroadcastChannel(POS_CUSTOMER_DISPLAY_CHANNEL);
  channel.onmessage = (event: MessageEvent<PosCustomerDisplayState>) => {
    if (event.data && typeof event.data.total === "number") onState(event.data);
  };
  return () => channel.close();
}
