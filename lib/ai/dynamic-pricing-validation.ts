/**
 * Dynamic pricing validation — production safety before menu price changes.
 * @see lib/ai/dynamic-pricing-builders.ts
 */

import {
  changePercent,
  DYNAMIC_PRICING_MAX_ADJUST_PERCENT,
  DYNAMIC_PRICING_MIN_ADJUST_PERCENT,
  roundPrice,
} from "@/lib/ai/dynamic-pricing-builders";

export const DYNAMIC_PRICING_VALIDATION_POLICY_ID = "dynamic-pricing-validation-v1" as const;

export const DYNAMIC_PRICING_MIN_PRICE = 0.5 as const;
export const DYNAMIC_PRICING_MAX_AB_LIFT_PERCENT = 12 as const;
export const DYNAMIC_PRICING_MIN_ORDER_LINES = 50 as const;

export type DynamicPricingValidationCode =
  | "ok"
  | "invalid_current"
  | "below_floor"
  | "above_max"
  | "below_min"
  | "stale_suggestion"
  | "ab_lift_too_high"
  | "ab_lift_negative";

export type DynamicPricingValidationResult =
  | {
      ok: true;
      normalizedPrice: number;
      changePercent: number;
    }
  | {
      ok: false;
      code: Exclude<DynamicPricingValidationCode, "ok">;
      message: string;
    };

export type DynamicPricingReadiness = {
  orderLinesInLookback: number;
  qualified: boolean;
  headline: string;
  detail: string;
};

export function assessDynamicPricingReadiness(orderLinesInLookback: number): DynamicPricingReadiness {
  const qualified = orderLinesInLookback >= DYNAMIC_PRICING_MIN_ORDER_LINES;
  return {
    orderLinesInLookback,
    qualified,
    headline: qualified
      ? "Order history qualified for demand signals"
      : "Limited order history — suggestions use time/weather heuristics only",
    detail: qualified
      ? `${orderLinesInLookback} order lines in 14-day lookback (need ${DYNAMIC_PRICING_MIN_ORDER_LINES}+ for demand-weighted pricing).`
      : `${orderLinesInLookback} order lines in lookback — need ${DYNAMIC_PRICING_MIN_ORDER_LINES}+ before demand signals are reliable.`,
  };
}

/** Validate a proposed menu price against hard adjustment bounds. */
export function validateDynamicPricingPrice(input: {
  currentPrice: number;
  proposedPrice: number;
}): DynamicPricingValidationResult {
  const currentPrice = roundPrice(input.currentPrice);
  const proposedPrice = roundPrice(input.proposedPrice);

  if (currentPrice <= 0) {
    return {
      ok: false,
      code: "invalid_current",
      message: "Current menu price must be greater than zero.",
    };
  }

  if (proposedPrice < DYNAMIC_PRICING_MIN_PRICE) {
    return {
      ok: false,
      code: "below_floor",
      message: `Price must be at least $${DYNAMIC_PRICING_MIN_PRICE.toFixed(2)}.`,
    };
  }

  const pct = changePercent(currentPrice, proposedPrice);

  if (pct > DYNAMIC_PRICING_MAX_ADJUST_PERCENT) {
    return {
      ok: false,
      code: "above_max",
      message: `Increase capped at +${DYNAMIC_PRICING_MAX_ADJUST_PERCENT}% (requested +${pct}%).`,
    };
  }

  if (pct < DYNAMIC_PRICING_MIN_ADJUST_PERCENT) {
    return {
      ok: false,
      code: "below_min",
      message: `Decrease capped at ${DYNAMIC_PRICING_MIN_ADJUST_PERCENT}% (requested ${pct}%).`,
    };
  }

  return { ok: true, normalizedPrice: proposedPrice, changePercent: pct };
}

/** Reject client tampering — applied price must match freshly computed suggestion. */
export function validateDynamicPricingSuggestionIntegrity(input: {
  currentPrice: number;
  clientSuggestedPrice: number;
  serverSuggestedPrice: number;
}): DynamicPricingValidationResult {
  const bounds = validateDynamicPricingPrice({
    currentPrice: input.currentPrice,
    proposedPrice: input.clientSuggestedPrice,
  });
  if (!bounds.ok) return bounds;

  if (Math.abs(input.clientSuggestedPrice - input.serverSuggestedPrice) > 0.01) {
    return {
      ok: false,
      code: "stale_suggestion",
      message: "Suggestion changed — refresh the dashboard before applying.",
    };
  }

  return bounds;
}

export function validateDynamicPricingAbLift(liftPercent: number): DynamicPricingValidationResult {
  if (liftPercent < 0) {
    return {
      ok: false,
      code: "ab_lift_negative",
      message: "A/B variant lift must be zero or positive.",
    };
  }
  if (liftPercent > DYNAMIC_PRICING_MAX_AB_LIFT_PERCENT) {
    return {
      ok: false,
      code: "ab_lift_too_high",
      message: `A/B lift capped at +${DYNAMIC_PRICING_MAX_AB_LIFT_PERCENT}% (requested +${liftPercent}%).`,
    };
  }
  return {
    ok: true,
    normalizedPrice: liftPercent,
    changePercent: liftPercent,
  };
}

export function assertDynamicPricingValidation(
  result: DynamicPricingValidationResult,
): asserts result is Extract<DynamicPricingValidationResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(result.message);
  }
}
