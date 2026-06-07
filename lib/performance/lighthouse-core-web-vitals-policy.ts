/**
 * Absolute Final Task 50 — Lighthouse CI Core Web Vitals gate.
 */

export const LIGHTHOUSE_CORE_WEB_VITALS_POLICY_ID =
  "lighthouse-core-web-vitals-absolute-final-v1" as const;

/** First Contentful Paint — max 2s (2000 ms). */
export const LIGHTHOUSE_CWV_FCP_MAX_MS = 2000 as const;

/** Largest Contentful Paint — max 3.5s (3500 ms). */
export const LIGHTHOUSE_CWV_LCP_MAX_MS = 3500 as const;

/** Cumulative Layout Shift — max 0.1. */
export const LIGHTHOUSE_CWV_CLS_MAX = 0.1 as const;

export const LIGHTHOUSE_CWV_CONFIG_PATH = "lighthouserc.core-web-vitals.cjs" as const;

export const LIGHTHOUSE_CWV_WORKFLOW_PATH = ".github/workflows/lighthouse.yml" as const;

/** Revenue-critical marketing paths audited in Lighthouse CI. */
export const LIGHTHOUSE_CWV_PATHS = ["/", "/pricing", "/login", "/shopify"] as const;

export const LIGHTHOUSE_CWV_CI_SCRIPTS = [
  "test:ci:lighthouse-core-web-vitals",
  "lighthouse:core-web-vitals",
] as const;

export type CoreWebVitalsMetrics = {
  fcpMs: number;
  lcpMs: number;
  cls: number;
};

export type CoreWebVitalsViolation = {
  metric: "fcp" | "lcp" | "cls";
  value: number;
  max: number;
  message: string;
};

export function evaluateCoreWebVitals(
  metrics: CoreWebVitalsMetrics,
): CoreWebVitalsViolation[] {
  const violations: CoreWebVitalsViolation[] = [];

  if (metrics.fcpMs > LIGHTHOUSE_CWV_FCP_MAX_MS) {
    violations.push({
      metric: "fcp",
      value: metrics.fcpMs,
      max: LIGHTHOUSE_CWV_FCP_MAX_MS,
      message: `FCP ${metrics.fcpMs}ms exceeds ${LIGHTHOUSE_CWV_FCP_MAX_MS}ms`,
    });
  }
  if (metrics.lcpMs > LIGHTHOUSE_CWV_LCP_MAX_MS) {
    violations.push({
      metric: "lcp",
      value: metrics.lcpMs,
      max: LIGHTHOUSE_CWV_LCP_MAX_MS,
      message: `LCP ${metrics.lcpMs}ms exceeds ${LIGHTHOUSE_CWV_LCP_MAX_MS}ms`,
    });
  }
  if (metrics.cls > LIGHTHOUSE_CWV_CLS_MAX) {
    violations.push({
      metric: "cls",
      value: metrics.cls,
      max: LIGHTHOUSE_CWV_CLS_MAX,
      message: `CLS ${metrics.cls} exceeds ${LIGHTHOUSE_CWV_CLS_MAX}`,
    });
  }

  return violations;
}

export function coreWebVitalsPass(metrics: CoreWebVitalsMetrics): boolean {
  return evaluateCoreWebVitals(metrics).length === 0;
}

export const LIGHTHOUSE_CWV_LHCI_ASSERTIONS = {
  "first-contentful-paint": ["error", { maxNumericValue: LIGHTHOUSE_CWV_FCP_MAX_MS }],
  "largest-contentful-paint": ["error", { maxNumericValue: LIGHTHOUSE_CWV_LCP_MAX_MS }],
  "cumulative-layout-shift": ["error", { maxNumericValue: LIGHTHOUSE_CWV_CLS_MAX }],
} as const;
