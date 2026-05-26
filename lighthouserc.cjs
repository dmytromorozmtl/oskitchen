/** @type {import('@lhci/cli').Config} */
const slug = process.env.E2E_STORE_SLUG || process.env.E2E_STOREFRONT_SLUG || "demo";
const base = (process.env.PLAYWRIGHT_BASE_URL || process.env.LHCI_BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function parseListEnv(value, fallback) {
  const items = String(value || "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
}

const storefrontPaths = ["/menu", "/cart", "/checkout", "/account"];
const marketingPaths = parseListEnv(process.env.LHCI_MARKETING_PATHS, [
  "/",
  "/pricing",
  "/roi-calculator",
  "/solutions",
  "/compare",
]);
const solutionSlugs = parseListEnv(process.env.LHCI_SOLUTION_SLUGS, [
  "meal-prep",
  "restaurants",
]);
const compareSlugs = parseListEnv(process.env.LHCI_COMPARE_SLUGS, [
  "restaurant-pos",
  "meal-prep-software",
]);

const urls = [
  ...storefrontPaths.map((p) => `${base}/s/${slug}${p}`),
  ...marketingPaths.map((p) => `${base}${p}`),
  ...solutionSlugs.map((solutionSlug) => `${base}/solutions/${solutionSlug}`),
  ...compareSlugs.map((compareSlug) => `${base}/compare/${compareSlug}`),
];

/** Comma-separated full URLs or hostnames — e.g. hello-weekday.staging.example.com */
const vanityExtra = (process.env.LHCI_VANITY_HOSTS || process.env.LHCI_VANITY_HOST || "")
  .split(/[,\s]+/)
  .filter(Boolean);

for (const host of vanityExtra) {
  const origin = host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
  urls.push(`${origin}/menu`);
}

const uniqueUrls = [...new Set(urls)];

module.exports = {
  ci: {
    collect: {
      url: uniqueUrls,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --headless",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
