/**
 * POS cashier speed mode resolver — service-layer entry point.
 * Cashiers default to speed mode unless URL/search explicitly overrides.
 */
import { resolvePosCashierSpeedMode as resolveCore } from "@/lib/pos/pos-cashier-speed-mode-era19";

export type PosCashierSpeedRole = "owner" | "manager" | "cashier" | "kitchen";

export function resolvePosCashierSpeedMode(input: {
  role: PosCashierSpeedRole;
  override?: string | null;
}): boolean {
  if (input.role === "cashier" && input.override === undefined) {
    return true;
  }
  return resolveCore({
    persona: input.role,
    speedParam: input.override,
  });
}
