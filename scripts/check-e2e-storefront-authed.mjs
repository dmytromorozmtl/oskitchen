#!/usr/bin/env node
/** Guard for npm scripts that require the `storefront-authed` Playwright project. */
const email = process.env.E2E_LOGIN_EMAIL?.trim();
const password = process.env.E2E_LOGIN_PASSWORD?.trim();
if (!email || !password) {
  console.error(
    [
      "storefront-authed Playwright project requires dashboard credentials:",
      "  export E2E_LOGIN_EMAIL=owner@example.com",
      "  export E2E_LOGIN_PASSWORD=...",
      "",
      "Optional for lifecycle cookie test:",
      "  export E2E_STORE_SLUG=your-store-slug",
      "",
      "Load from .env if you use e2e/load-playwright-env (PLAYWRIGHT loads via playwright.config.ts).",
    ].join("\n"),
  );
  process.exit(1);
}
