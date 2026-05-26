"use client";

import { useReportWebVitals } from "next/web-vitals";

import { captureProductEvent } from "@/lib/analytics/product-events";

/**
 * Sends Core Web Vitals to PostHog when analytics consent + PostHog key are active.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    captureProductEvent("web_vitals", {
      metric_name: metric.name,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
    });
  });

  return null;
}
