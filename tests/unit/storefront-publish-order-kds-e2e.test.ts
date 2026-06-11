import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditStorefrontPublishOrderKdsE2E } from "@/lib/qa/storefront-publish-order-kds-e2e-audit";
import {
  KDS_KITCHEN_PATH,
  STOREFRONT_ADMIN_PATH,
  STOREFRONT_PUBLISH_ORDER_KDS_AUDIT_SCRIPT,
  STOREFRONT_PUBLISH_ORDER_KDS_CI_WORKFLOW,
  STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID,
  STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC,
  STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS,
  STOREFRONT_PUBLISH_ORDER_KDS_NPM_SCRIPT,
  STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST,
  defaultStorefrontE2ESlug,
  hasStorefrontPublishOrderKdsCredentials,
  isStorefrontPublishOrderKdsE2EEnabled,
  isStorefrontPublishOrderKdsKdsGateEnabled,
  storefrontCatalogApiPath,
  storefrontMenuPath,
} from "@/lib/qa/storefront-publish-order-kds-e2e-policy";
import { isKdsEligibleOrderStatus } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

const ROOT = process.cwd();

describe("Storefront publish → order → KDS E2E (P1-47)", () => {
  it("locks policy id and storefront flow routes", () => {
    expect(STOREFRONT_PUBLISH_ORDER_KDS_E2E_POLICY_ID).toBe(
      "storefront-publish-order-kds-e2e-v1",
    );
    expect(STOREFRONT_ADMIN_PATH).toBe("/dashboard/storefront");
    expect(KDS_KITCHEN_PATH).toBe("/dashboard/kitchen");
    expect(STOREFRONT_PUBLISH_ORDER_KDS_FLOW_STEPS).toHaveLength(4);
  });

  it("builds public menu and catalog API paths", () => {
    const slug = defaultStorefrontE2ESlug();
    expect(storefrontMenuPath(slug)).toBe(`/s/${slug}/menu`);
    expect(storefrontCatalogApiPath(slug)).toContain(encodeURIComponent(slug));
  });

  it("treats CONFIRMED orders as KDS-eligible", () => {
    expect(isKdsEligibleOrderStatus("CONFIRMED")).toBe(true);
    expect(isKdsEligibleOrderStatus("COMPLETED")).toBe(false);
  });

  it("audits E2E spec, flow helper, and storefront admin UI wiring", () => {
    const summary = auditStorefrontPublishOrderKdsE2E(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.storefrontAdminUiWired).toBe(true);
    expect(summary.checkoutKdsHelpersWired).toBe(true);
    expect(summary.storefrontAdminPagePresent).toBe(true);
    expect(summary.kitchenPagePresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, STOREFRONT_PUBLISH_ORDER_KDS_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, STOREFRONT_PUBLISH_ORDER_KDS_E2E_SPEC))).toBe(true);
    expect(existsSync(join(ROOT, STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[STOREFRONT_PUBLISH_ORDER_KDS_NPM_SCRIPT]).toContain(
      "audit-storefront-publish-order-kds-e2e.ts",
    );
    expect(pkg.scripts?.["test:ci:storefront-publish-order-kds-e2e"]).toContain(
      STOREFRONT_PUBLISH_ORDER_KDS_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, STOREFRONT_PUBLISH_ORDER_KDS_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:storefront-publish-order-kds-e2e");
  });

  it("E2E gate requires E2E_STOREFRONT_PUBLISH_E2E flag", () => {
    const original = process.env.E2E_STOREFRONT_PUBLISH_E2E;
    delete process.env.E2E_STOREFRONT_PUBLISH_E2E;
    expect(isStorefrontPublishOrderKdsE2EEnabled()).toBe(false);
    process.env.E2E_STOREFRONT_PUBLISH_E2E = "true";
    expect(isStorefrontPublishOrderKdsE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_STOREFRONT_PUBLISH_E2E = original;
    else delete process.env.E2E_STOREFRONT_PUBLISH_E2E;
  });

  it("KDS gate requires production or ENABLE_KDS_V1_CERTIFIED", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalKds = process.env.ENABLE_KDS_V1_CERTIFIED;
    process.env.NODE_ENV = "development";
    delete process.env.ENABLE_KDS_V1_CERTIFIED;
    expect(isStorefrontPublishOrderKdsKdsGateEnabled()).toBe(false);
    process.env.ENABLE_KDS_V1_CERTIFIED = "true";
    expect(isStorefrontPublishOrderKdsKdsGateEnabled()).toBe(true);
    if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv;
    else delete process.env.NODE_ENV;
    if (originalKds !== undefined) process.env.ENABLE_KDS_V1_CERTIFIED = originalKds;
    else delete process.env.ENABLE_KDS_V1_CERTIFIED;
  });

  it("credentials gate is false without E2E env", () => {
    const originalEmail = process.env.E2E_LOGIN_EMAIL;
    const originalPassword = process.env.E2E_LOGIN_PASSWORD;
    delete process.env.E2E_LOGIN_EMAIL;
    delete process.env.E2E_LOGIN_PASSWORD;
    expect(hasStorefrontPublishOrderKdsCredentials()).toBe(false);
    if (originalEmail !== undefined) process.env.E2E_LOGIN_EMAIL = originalEmail;
    if (originalPassword !== undefined) process.env.E2E_LOGIN_PASSWORD = originalPassword;
  });
});
