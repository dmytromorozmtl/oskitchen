import type { Prisma } from "@prisma/client";

/** Persisted on `KitchenSettings.channelHandoffJson`. */
export type ChannelHandoffSettings = {
  autoSendValidOrdersToOrderHub?: boolean;
  autoSendToProduction?: boolean;
  requireManualReview?: {
    unmatchedProduct?: boolean;
    missingFulfillment?: boolean;
    /** Minimum order total (same currency unit as `Order.total`) to force review. */
    highValueOrderMinTotal?: number | null;
    cateringOrEvent?: boolean;
    addressInvalid?: boolean;
    paymentUnpaid?: boolean;
  };
  defaultPreparedDateRule?: "next_open_day" | "as_provided" | "manual";
  defaultProductionStage?: string | null;
  defaultPackingRequired?: boolean;
  defaultLabelRequired?: boolean;
};

export const DEFAULT_CHANNEL_HANDOFF: ChannelHandoffSettings = {
  autoSendValidOrdersToOrderHub: true,
  autoSendToProduction: false,
  requireManualReview: {
    unmatchedProduct: true,
    missingFulfillment: true,
    highValueOrderMinTotal: 300,
    cateringOrEvent: true,
    addressInvalid: true,
    paymentUnpaid: true,
  },
  defaultPreparedDateRule: "as_provided",
  defaultProductionStage: null,
  defaultPackingRequired: true,
  defaultLabelRequired: false,
};

export function parseChannelHandoffJson(raw: unknown): ChannelHandoffSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_CHANNEL_HANDOFF };
  }
  return { ...DEFAULT_CHANNEL_HANDOFF, ...(raw as ChannelHandoffSettings) };
}

export function mergeHandoffUpdate(
  current: unknown,
  patch: ChannelHandoffSettings,
): Prisma.InputJsonValue {
  const base = parseChannelHandoffJson(current);
  return { ...base, ...patch } as Prisma.InputJsonValue;
}
