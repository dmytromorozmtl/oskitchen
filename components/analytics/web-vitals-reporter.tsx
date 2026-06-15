"use client";

import { useReportWebVitals } from "next/web-vitals";
import { usePathname } from "next/navigation";

import { captureProductEvent } from "@/lib/analytics/product-events";
import { isOperationalSurface } from "@/lib/navigation/operational-surface";

/**
 * Sends Core Web Vitals to PostHog when analytics consent + PostHog key are active.
 * Skipped on operational surfaces to avoid extra work on POS/KDS hot paths.
 */
export function WebVitalsReporter() {
  const pathname = usePathname();
  const skip = isOperationalSurface(pathname);

  useReportWebVitals((metric) => {
    if (skip) return;
    captureProductEvent("web_vitals", {
      metric_name: metric.name,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  });

  return null;
}
