import { z } from "zod";
/** Markets — routing via ?market=, cookie, optional per-market menu and vanity slug. */
export const storefrontMarketSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  /** ISO country or region code for future catalog filtering */
  region: z.string().max(8).optional(),
  currency: z.string().length(3).optional(),
  enabled: z.boolean().optional().default(true),
  /** Vanity slug override — links switch to /s/{storeSlug}; subdomain column can mirror this */
  storeSlug: z.string().max(120).optional(),
  /** Subdomain label on NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN e.g. hello-weekday or weekday */
  hostSubdomain: z
    .string()
    .max(63)
    .regex(/^[a-z0-9-]+$/i)
    .optional(),
  /** When set, uses this menu instead of storefront default activeMenuId */
  activeMenuId: z.string().uuid().optional(),
  /** When set, only these product UUIDs appear (applied after menu filter) */
  productIds: z.array(z.string().uuid()).max(500).optional(),
  /** Optional banner shown when this market is active */
  bannerText: z.string().max(400).optional(),
  /** Linked Shopify Market gid — Phase 1 manual mapping only */
  shopifyMarketId: z.string().max(128).optional(),
  /** Optional Shopify catalog gid for Phase 2 price import */
  shopifyCatalogId: z.string().max(128).optional(),
  /** Optional Shopify price list gid for Phase 2 */
  shopifyPriceListId: z.string().max(128).optional(),
  /** How Shopify data flows for this market once Phase 2+ ships */
  syncMode: z.enum(["none", "import", "bidirectional"]).optional().default("none"),
});

export type StorefrontMarket = z.infer<typeof storefrontMarketSchema>;

const marketsArraySchema = z.array(storefrontMarketSchema);

export function parseStorefrontMarketsFromSettingsCenter(settingsCenterJson: unknown): StorefrontMarket[] {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") return [];
  const sf = (settingsCenterJson as Record<string, unknown>).storefront;
  if (!sf || typeof sf !== "object") return [];
  const raw = (sf as Record<string, unknown>).markets;
  const parsed = marketsArraySchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export function defaultPilotMarket(storeSlug: string, currency: string): StorefrontMarket {
  return {
    id: "default",
    name: "Primary",
    region: undefined,
    currency,
    enabled: true,
    storeSlug,
  };
}
