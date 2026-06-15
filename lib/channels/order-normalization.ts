/**
 * Channel-layer view of normalized orders.
 * Persistence uses {@link NormalizedKitchenOrder} in `lib/order-normalization.ts`.
 */

export type {
  NormalizedKitchenOrder,
  NormalizedLineItem,
} from "@/lib/order-normalization";

export {
  normalizeTitleForMatch,
  pickBestProductMatch,
} from "@/lib/order-normalization";

/** Extended view for diagnostics UI — optional string provider for non-Prisma channels. */
export type NormalizedOrderEnvelope = {
  providerKey: string;
  normalized: import("@/lib/order-normalization").NormalizedKitchenOrder;
};
