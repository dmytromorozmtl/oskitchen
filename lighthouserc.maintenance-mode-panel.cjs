/**
 * Maintenance mode panel — Lighthouse perf budget (P2-53).
 * @see lib/performance/maintenance-mode-panel-perf-budget-policy.ts
 */
const base = (process.env.LHCI_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const paths = ["/dashboard/today", "/platform/implementations"];

/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      url: paths.map((p) => `${base}${p}`),
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--no-sandbox --headless",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "first-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 350 }],
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
