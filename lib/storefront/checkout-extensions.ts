import { z } from "zod";
export const checkoutExtensionsSchema = z.object({
  tipsEnabled: z.boolean().optional().default(false),
  tipPresetsPercent: z.array(z.number().min(0).max(100)).optional().default([10, 15, 20]),
  depositMode: z.enum(["off", "percent", "fixed"]).optional().default("off"),
  depositPercent: z.number().min(0).max(100).optional(),
  depositFixed: z.number().min(0).optional(),
});

export type CheckoutExtensions = z.infer<typeof checkoutExtensionsSchema>;

const DEFAULTS: CheckoutExtensions = {
  tipsEnabled: false,
  tipPresetsPercent: [10, 15, 20],
  depositMode: "off",
};

export function parseCheckoutExtensions(raw: unknown): CheckoutExtensions {
  const r = checkoutExtensionsSchema.safeParse(raw);
  return r.success ? r.data : DEFAULTS;
}

/** Read extensions from kitchen settings_center_json.storefront.checkoutExtensions if present. */
export function checkoutExtensionsFromKitchenSettings(settingsCenterJson: unknown): CheckoutExtensions {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return DEFAULTS;
  const o = settingsCenterJson as Record<string, unknown>;
  const sf = o.storefront;
  if (!sf || typeof sf !== "object") return DEFAULTS;
  const ext = (sf as Record<string, unknown>).checkoutExtensions;
  return parseCheckoutExtensions(ext);
}

export function computeTipAmount(subtotal: number, tipPercent: number | null): number {
  if (tipPercent == null || tipPercent <= 0) return 0;
  return Math.round(subtotal * (tipPercent / 100) * 100) / 100;
}

export function computeDepositAmount(
  subtotal: number,
  extensions: CheckoutExtensions,
): number {
  if (extensions.depositMode === "percent" && extensions.depositPercent != null) {
    return Math.round(subtotal * (extensions.depositPercent / 100) * 100) / 100;
  }
  if (extensions.depositMode === "fixed" && extensions.depositFixed != null) {
    return Math.min(subtotal, extensions.depositFixed);
  }
  return 0;
}
