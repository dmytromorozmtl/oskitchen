import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { loadPlaywrightEnvForPlaywright } from "./e2e/load-playwright-env";

loadPlaywrightEnvForPlaywright();

const authStorage = join("e2e", ".auth", "user.json");
const authStorageAbs = join(process.cwd(), authStorage);
const staffAuthStorage = join("e2e", ".auth", "staff.json");
const pilotOwnerAuthStorage = join("e2e", ".auth", "pilot-owner.json");
const pilotStaffAuthStorage = join("e2e", ".auth", "pilot-staff.json");

const dashboardE2EEnabled =
  Boolean(process.env.E2E_LOGIN_EMAIL?.trim()) && Boolean(process.env.E2E_LOGIN_PASSWORD?.trim());

const staffE2EEnabled =
  Boolean(process.env.E2E_STAFF_EMAIL?.trim()) && Boolean(process.env.E2E_STAFF_PASSWORD?.trim());

const pilotE2EEnabled =
  Boolean(process.env.E2E_PILOT_EMAIL?.trim()) &&
  Boolean(process.env.E2E_PILOT_PASSWORD?.trim()) &&
  Boolean(process.env.PLAYWRIGHT_BASE_URL?.trim());

const pilotStaffE2EEnabled =
  pilotE2EEnabled &&
  Boolean(process.env.E2E_PILOT_STAFF_EMAIL?.trim()) &&
  Boolean(process.env.E2E_PILOT_STAFF_PASSWORD?.trim());

if (!dashboardE2EEnabled) {
  try {
    if (existsSync(authStorageAbs)) {
      unlinkSync(authStorageAbs);
    }
  } catch {
    // ignore
  }
}

const desktop = devices["Desktop Chrome"];

/** Dedicated port for visual regression (`next start`) — avoids clashing with `next dev` on 3000. */
const visualServerPort = process.env.PW_VISUAL_PORT ?? "3001";
const visualBaseURL = `http://127.0.0.1:${visualServerPort}`;

const runningVisualTests =
  process.argv.some((a) => a.includes("tests/visual")) ||
  process.argv.some((a) => a.includes("project=visual"));

const projects: Parameters<typeof defineConfig>[0]["projects"] = [];

if (dashboardE2EEnabled) {
  projects.push(
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },
    {
      name: "chromium-authed",
      dependencies: ["setup"],
      testMatch: [
        "**/dashboard-auth.spec.ts",
        "**/dashboard-rsc-regression.spec.ts",
        "**/dashboard-accessibility-axe.spec.ts",
        "**/pos-terminal-keyboard-navigation.spec.ts",
        "**/screen-reader-icon-buttons.spec.ts",
        "**/mobile-touch-target-44px.spec.ts",
        "**/pos-offline-mode.spec.ts",
        "**/workspace-post-not-null-smoke.spec.ts",
        "**/pos-checkout-flow.spec.ts",
        "**/pos-checkout-staging.spec.ts",
        "**/pos-offline-queue.spec.ts",
        "**/offline-mode-queue-sync.spec.ts",
        "**/kds-realtime-staging.spec.ts",
        "**/kds-staging.spec.ts",
        "**/qr-guest-order-kitchen.spec.ts",
        "**/qr-scan-guest-kitchen.spec.ts",
        "**/woocommerce-webhook-order-hub.spec.ts",
        "**/owner-briefing-blocker-resolve.spec.ts",
        "**/integration-health-recovery-playbook.spec.ts",
        "**/profit-dashboard-margin-alert.spec.ts",
        "**/rbac-matrix.spec.ts",
        "**/vendor-cabinet-cross-tenant.spec.ts",
        "**/platform-impersonation.spec.ts",
        "**/cross-tenant-isolation.spec.ts",
        "**/cross-tenant-isolation-staging.spec.ts",
        "**/stripe-terminal-payment.spec.ts",
        "**/stripe-terminal-staging.spec.ts",
        "**/cross-channel-inventory.spec.ts",
        "**/cross-channel-inventory-live-sync.spec.ts",
        "**/marketplace-checkout.spec.ts",
        "**/marketplace-checkout-fulfill-payout.spec.ts",
        "**/marketplace-catalog-checkout-vendor-order.spec.ts",
        "**/signup-quick-start-today.spec.ts",
        "**/storefront-checkout-kds.spec.ts",
        "**/pos-checkout-shift-close-report.spec.ts",
        "**/kds-bump-packing-route.spec.ts",
        "**/kds-bump-latency.spec.ts",
        "**/bill-splitting.spec.ts",
        "**/bill-splitting-e2e.spec.ts",
        "**/multi-location-enterprise.spec.ts",
        "**/multi-location-rollup-export-e2e.spec.ts",
        "**/delivery-order-ingest-latency.spec.ts",
        "**/refund-flow-e2e.spec.ts",
        "**/shift-report-accuracy-e2e.spec.ts",
        "**/beta-integrations-governance.spec.ts",
        "**/today-beta-env-footnote.spec.ts",
        "**/live-integration-dod-gates.spec.ts",
        "**/beta-env-readiness-rows.spec.ts",
        "**/beta-integrations-governance-capstone.spec.ts",
        "**/vendor-registration.spec.ts",
        "**/remediation-delivery-idor.spec.ts",
        "**/beta-export-streaming.spec.ts",
        "**/webhook-replay-authed.spec.ts",
      ],
      use: {
        ...desktop,
        storageState: authStorage,
      },
    },
    {
      name: "storefront-authed",
      dependencies: ["setup"],
      testMatch: [
        "**/storefront-builder-authed.spec.ts",
        "**/storefront-order-commerce-dashboard.spec.ts",
        "**/menu-item-media-authed.spec.ts",
        "**/sprint5-webhook-authed.spec.ts",
        "**/sprint5-experiment-lifecycle.spec.ts",
        "**/theme-experiment-publish-gates.spec.ts",
        "**/theme-experiment-publish-deny.spec.ts",
        "**/theme-experiment-ethics-review.spec.ts",
      ],
      use: {
        ...desktop,
        storageState: authStorage,
      },
    },
  );
}

if (staffE2EEnabled) {
  projects.push(
    {
      name: "setup-staff",
      testMatch: "**/auth-staff.setup.ts",
    },
    {
      name: "chromium-staff",
      dependencies: ["setup-staff"],
      testMatch: ["**/staff-order-visibility.spec.ts"],
      use: {
        ...desktop,
        storageState: staffAuthStorage,
      },
    },
  );
}

if (pilotE2EEnabled) {
  projects.push(
    {
      name: "pilot-setup",
      testMatch: "**/pilot-auth.setup.ts",
    },
    {
      name: "pilot-journey",
      dependencies: ["pilot-setup"],
      testDir: "./tests/e2e",
      testMatch: ["**/pilot-journey.spec.ts"],
      use: {
        ...desktop,
        storageState: pilotOwnerAuthStorage,
      },
    },
  );
}

if (pilotStaffE2EEnabled) {
  projects.push(
    {
      name: "pilot-staff-setup",
      testMatch: "**/pilot-staff-auth.setup.ts",
    },
    {
      name: "pilot-staff",
      dependencies: ["pilot-staff-setup"],
      testDir: "./tests/e2e",
      testMatch: ["**/pilot-journey-staff.spec.ts"],
      use: {
        ...desktop,
        storageState: pilotStaffAuthStorage,
      },
    },
  );
}

projects.push({
  name: "chromium",
  use: { ...desktop },
  testIgnore: [
    "**/auth.setup.ts",
    "**/pilot-auth.setup.ts",
    "**/pilot-staff-auth.setup.ts",
    "**/dashboard-auth.spec.ts",
    "**/dashboard-rsc-regression.spec.ts",
    "**/dashboard-accessibility-axe.spec.ts",
    "**/pos-terminal-keyboard-navigation.spec.ts",
    "**/screen-reader-icon-buttons.spec.ts",
    "**/mobile-touch-target-44px.spec.ts",
    "**/pos-offline-mode.spec.ts",
    "**/pos-checkout-flow.spec.ts",
    "**/pos-checkout-staging.spec.ts",
    "**/pos-checkout-shift-close-report.spec.ts",
    "**/kds-bump-packing-route.spec.ts",
    "**/kds-bump-latency.spec.ts",
    "**/pos-offline-queue.spec.ts",
    "**/offline-mode-queue-sync.spec.ts",
    "**/bill-splitting.spec.ts",
    "**/bill-splitting-e2e.spec.ts",
    "**/multi-location-enterprise.spec.ts",
    "**/multi-location-rollup-export-e2e.spec.ts",
    "**/delivery-order-ingest-latency.spec.ts",
    "**/refund-flow-e2e.spec.ts",
    "**/shift-report-accuracy-e2e.spec.ts",
    "**/storefront-builder-authed.spec.ts",
    "**/menu-item-media-authed.spec.ts",
    "**/sprint5-webhook-authed.spec.ts",
    "**/sprint5-experiment-lifecycle.spec.ts",
    "**/kds-realtime-staging.spec.ts",
    "**/kds-staging.spec.ts",
    "**/cross-tenant-isolation.spec.ts",
    "**/webhook-replay-authed.spec.ts",
  ],
});

const httpSmokeBaseURL =
  process.env.PLAYWRIGHT_BASE_URL?.trim() ||
  process.env.SMOKE_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  undefined;

projects.push({
  name: "ci-critical-paths",
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  testIgnore: ["**/pilot-journey*.spec.ts"],
  use: {
    ...desktop,
    ...(httpSmokeBaseURL ? { baseURL: httpSmokeBaseURL.replace(/\/$/, "") } : {}),
  },
});

projects.push({
  name: "visual",
  testDir: "./tests/visual",
  use: { ...desktop, baseURL: visualBaseURL },
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 150,
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
      caret: "hide",
    },
  },
});

export default defineConfig({
  testDir: "./e2e",
  ...(runningVisualTests
    ? {
        webServer: {
          command: `npm run start -- -p ${visualServerPort}`,
          url: visualBaseURL,
          reuseExistingServer: process.env.PW_REUSE_EXISTING_SERVER === "1",
          timeout: 120_000,
        },
      }
    : {}),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: process.env.PLAYWRIGHT_BASE_URL?.includes("os-kitchen.com") ? 90_000 : 30_000,
  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
      ]
    : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
  },
  projects,
});
