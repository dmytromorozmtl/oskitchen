/**
 * Legacy ESLint entry for tooling that still reads .eslintrc.js.
 * Source of truth: eslint.config.mjs (flat config).
 *
 * Custom rule react/no-children-only-with-as-child is registered as
 * kitchenos/no-children-only-with-as-child (Next.js already owns the react plugin).
 */
module.exports = {
  root: true,
  ignorePatterns: ["scripts/**", "services/storefront/_experiments/**", "archive/cron-routes/**"],
  extends: ["next/core-web-vitals", "next/typescript"],
};
