/** Marketing pages — PR/local perf regression (see docs/monitoring.md). */
const base = (process.env.LHCI_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const paths = ["/", "/pricing", "/shopify", "/login"];

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
        "categories:performance": ["error", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.8 }],
        "categories:best-practices": ["error", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.8 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
