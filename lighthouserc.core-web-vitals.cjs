/**
 * Absolute Final Task 50 — Lighthouse CI Core Web Vitals gate.
 * @see lib/performance/lighthouse-core-web-vitals-policy.ts
 */
const base = (process.env.LHCI_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const paths = ["/", "/pricing", "/login", "/shopify"];

/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      url: paths.map((p) => `${base}${p}`),
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --headless",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
