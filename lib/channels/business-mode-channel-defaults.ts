import { BusinessType } from "@prisma/client";

import type { ChannelHandoffSettings } from "@/lib/channels/channel-handoff";

/** Suggested defaults only — persisted settings always win. */
export function suggestedChannelHandoffForBusinessType(
  businessType: BusinessType | null | undefined,
): Partial<ChannelHandoffSettings> {
  switch (businessType) {
    case BusinessType.MEAL_PREP:
      return {
        autoSendValidOrdersToOrderHub: false,
        requireManualReview: {
          unmatchedProduct: true,
          missingFulfillment: true,
          cateringOrEvent: true,
          addressInvalid: true,
          paymentUnpaid: true,
          highValueOrderMinTotal: 250,
        },
      };
    case BusinessType.CATERING:
      return {
        autoSendToProduction: false,
        requireManualReview: { cateringOrEvent: true, unmatchedProduct: true },
      };
    case BusinessType.BAKERY:
      return { requireManualReview: { missingFulfillment: true, unmatchedProduct: true } };
    case BusinessType.RESTAURANT:
    case BusinessType.CAFE:
      return {
        autoSendValidOrdersToOrderHub: true,
        requireManualReview: { unmatchedProduct: true, paymentUnpaid: true },
      };
    case BusinessType.BAR:
      return { requireManualReview: { cateringOrEvent: true, addressInvalid: true } };
    case BusinessType.GHOST_KITCHEN:
    case BusinessType.CLOUD_KITCHEN:
      return {
        autoSendValidOrdersToOrderHub: true,
        requireManualReview: { unmatchedProduct: true },
      };
    default:
      return {};
  }
}
