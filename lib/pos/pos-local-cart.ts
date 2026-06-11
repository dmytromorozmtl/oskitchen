/**
 * Blueprint P2-88 — sessionStorage cart persistence for POS terminal.
 */

import { POS_OFFLINE_MODE_V1_POLICY_ID } from "@/lib/pos/pos-offline-mode-v1-policy";

export const POS_LOCAL_CART_STORAGE_KEY = "kitchenos-pos-local-cart-v1" as const;
export const POS_LOCAL_CART_POLICY_ID = POS_OFFLINE_MODE_V1_POLICY_ID;

export type PosLocalCartLine = {
  productId?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
};

export type PosLocalCartSnapshot = {
  registerId: string;
  cart: PosLocalCartLine[];
  updatedAt: string;
};

function storageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function posLocalCartKey(registerId: string): string {
  return `${POS_LOCAL_CART_STORAGE_KEY}:${registerId}`;
}

export function savePosLocalCart(registerId: string, cart: PosLocalCartLine[]): void {
  if (!storageAvailable() || !registerId) return;
  const snapshot: PosLocalCartSnapshot = {
    registerId,
    cart,
    updatedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(posLocalCartKey(registerId), JSON.stringify(snapshot));
}

export function loadPosLocalCart(registerId: string): PosLocalCartSnapshot | null {
  if (!storageAvailable() || !registerId) return null;
  const raw = sessionStorage.getItem(posLocalCartKey(registerId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PosLocalCartSnapshot;
    if (parsed.registerId !== registerId || !Array.isArray(parsed.cart)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPosLocalCart(registerId: string): void {
  if (!storageAvailable() || !registerId) return;
  sessionStorage.removeItem(posLocalCartKey(registerId));
}
