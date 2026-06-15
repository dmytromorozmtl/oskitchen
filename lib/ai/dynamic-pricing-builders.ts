import { createHash } from "crypto";

import type {
  DynamicPricingSignal,
  DynamicPricingWeather,
} from "@/lib/ai/dynamic-pricing-types";

export const DYNAMIC_PRICING_MAX_ADJUST_PERCENT = 12;
export const DYNAMIC_PRICING_MIN_ADJUST_PERCENT = -8;

export function roundPrice(n: number): number {
  return Math.round(n * 100) / 100;
}

export function clampMultiplier(multiplier: number, min = 0.92, max = 1.12): number {
  return Math.min(max, Math.max(min, multiplier));
}

/** Lunch (11–14) and dinner (17–21) peaks in local hour. */
export function timeOfDayMultiplier(localHour: number): { multiplier: number; label: string } {
  if (localHour >= 11 && localHour < 14) {
    return { multiplier: 1.06, label: "Lunch rush" };
  }
  if (localHour >= 17 && localHour < 21) {
    return { multiplier: 1.08, label: "Dinner rush" };
  }
  if (localHour >= 6 && localHour < 10) {
    return { multiplier: 0.97, label: "Morning slow period" };
  }
  if (localHour >= 21 || localHour < 6) {
    return { multiplier: 0.95, label: "Late-night soft demand" };
  }
  return { multiplier: 1, label: "Mid-day baseline" };
}

export function weatherMultiplier(weather: DynamicPricingWeather): { multiplier: number; label: string } {
  switch (weather) {
    case "rain":
      return { multiplier: 1.04, label: "Rain — delivery & comfort food lift" };
    case "heat":
      return { multiplier: 1.03, label: "Heat wave — cold drinks & salads" };
    case "cold":
      return { multiplier: 1.02, label: "Cold snap — hot bowls & soups" };
    default:
      return { multiplier: 1, label: "Clear weather baseline" };
  }
}

/** Deterministic local “event” from calendar (weekend, month-end, holidays). */
export function localEventMultiplier(date: Date): { multiplier: number; label: string; detail: string } | null {
  const day = date.getDay();
  const dom = date.getDate();
  const month = date.getMonth() + 1;

  if (day === 5 || day === 6) {
    return { multiplier: 1.05, label: "Weekend dining", detail: "Fri–Sat demand uplift" };
  }
  if (dom >= 28) {
    return { multiplier: 1.02, label: "Month-end payroll", detail: "Higher dine-out intent" };
  }
  if (month === 12 && dom >= 15) {
    return { multiplier: 1.07, label: "Holiday season", detail: "Dec 15–31 festive demand" };
  }
  if (month === 2 && dom === 14) {
    return { multiplier: 1.06, label: "Valentine's Day", detail: "Prix fixe & dessert lift" };
  }
  return null;
}

export function demandMultiplierForProduct(input: {
  productOrderCount: number;
  avgOrdersPerProduct: number;
}): { multiplier: number; label: string } | null {
  const avg = Math.max(1, input.avgOrdersPerProduct);
  const ratio = input.productOrderCount / avg;
  if (ratio >= 1.5) {
    return { multiplier: 1.05, label: "High velocity item" };
  }
  if (ratio <= 0.4 && input.productOrderCount > 0) {
    return { multiplier: 0.96, label: "Slow mover — stimulate demand" };
  }
  return null;
}

export function combineMultipliers(multipliers: number[]): number {
  if (multipliers.length === 0) return 1;
  const product = multipliers.reduce((a, b) => a * b, 1);
  return clampMultiplier(product);
}

export function computeSuggestedPrice(basePrice: number, combinedMultiplier: number): number {
  const raw = basePrice * combinedMultiplier;
  const capped =
    basePrice *
    Math.min(
      1 + DYNAMIC_PRICING_MAX_ADJUST_PERCENT / 100,
      Math.max(1 + DYNAMIC_PRICING_MIN_ADJUST_PERCENT / 100, combinedMultiplier),
    );
  return roundPrice(Math.max(0.5, raw === capped ? raw : capped));
}

export function changePercent(current: number, suggested: number): number {
  if (current <= 0) return 0;
  return roundPrice(((suggested - current) / current) * 100);
}

export function inferWeatherFromDate(date: Date): DynamicPricingWeather {
  const month = date.getMonth();
  const dom = date.getDate();
  if (month >= 5 && month <= 8 && dom % 3 === 0) return "heat";
  if (month >= 11 || month <= 1) return "cold";
  if (dom % 5 === 0) return "rain";
  return "clear";
}

export function buildSignals(input: {
  localHour: number;
  weather: DynamicPricingWeather;
  date: Date;
  productOrderCount: number;
  avgOrdersPerProduct: number;
}): DynamicPricingSignal[] {
  const signals: DynamicPricingSignal[] = [];
  const tod = timeOfDayMultiplier(input.localHour);
  signals.push({
    kind: "time_of_day",
    label: tod.label,
    multiplier: tod.multiplier,
    detail: `Local hour ${input.localHour}:00`,
  });

  const wx = weatherMultiplier(input.weather);
  if (wx.multiplier !== 1) {
    signals.push({
      kind: "weather",
      label: wx.label,
      multiplier: wx.multiplier,
      detail: `Weather mode: ${input.weather}`,
    });
  }

  const evt = localEventMultiplier(input.date);
  if (evt) {
    signals.push({
      kind: "local_event",
      label: evt.label,
      multiplier: evt.multiplier,
      detail: evt.detail,
    });
  }

  const demand = demandMultiplierForProduct({
    productOrderCount: input.productOrderCount,
    avgOrdersPerProduct: input.avgOrdersPerProduct,
  });
  if (demand) {
    signals.push({
      kind: "demand",
      label: demand.label,
      multiplier: demand.multiplier,
      detail: `${input.productOrderCount} orders in lookback window`,
    });
  }

  return signals;
}

export function suggestionConfidence(changePct: number, signalCount: number): "low" | "medium" | "high" {
  const abs = Math.abs(changePct);
  if (signalCount >= 3 && abs >= 4) return "high";
  if (signalCount >= 2 && abs >= 2) return "medium";
  return "low";
}

export function buildAbTestId(productId: string, startedAtIso: string): string {
  return createHash("sha256").update(`${productId}:${startedAtIso}`).digest("hex").slice(0, 12);
}

export function abVariantPrice(controlPrice: number, liftPercent: number): number {
  return roundPrice(controlPrice * (1 + liftPercent / 100));
}
