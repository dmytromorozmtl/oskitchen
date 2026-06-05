import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATION_IDS,
  LIVE_INTEGRATION_IDS,
  isBetaIntegration,
} from "@/lib/integrations/integration-registry";

const ROOT = process.cwd();

const BETA_INTEGRATION_PAGES: Record<string, string> = {
  "7shifts": "app/dashboard/integrations/7shifts/page.tsx",
  homebase: "app/dashboard/integrations/homebase/page.tsx",
  klaviyo: "app/dashboard/integrations/klaviyo/page.tsx",
  mailchimp: "app/dashboard/integrations/mailchimp/page.tsx",
  resy: "app/dashboard/integrations/resy/page.tsx",
  opentable: "app/dashboard/integrations/opentable/page.tsx",
  "uber-direct": "app/dashboard/integrations/uber-direct/page.tsx",
  square: "app/dashboard/integrations/square/page.tsx",
  toast: "app/dashboard/integrations/toast/page.tsx",
  clover: "app/dashboard/integrations/clover/page.tsx",
  lightspeed: "app/dashboard/integrations/lightspeed/page.tsx",
  "google-forms": "app/dashboard/integrations/google-forms/page.tsx",
  "email-orders": "app/dashboard/integrations/email-orders/page.tsx",
};

const LIVE_INTEGRATION_PAGES: Record<string, string> = {
  "uber-eats": "app/dashboard/integrations/uber-eats/page.tsx",
  doordash: "app/dashboard/integrations/doordash/page.tsx",
  skip: "app/dashboard/integrations/skip/page.tsx",
  grubhub: "app/dashboard/integrations/grubhub/page.tsx",
  shopify: "app/dashboard/integrations/shopify/page.tsx",
  woocommerce: "app/dashboard/integrations/woocommerce/page.tsx",
  quickbooks: "app/dashboard/integrations/quickbooks/page.tsx",
  xero: "app/dashboard/integrations/xero/page.tsx",
};

describe("integration beta badge", () => {
  it("tracks thirteen BETA registry integrations", () => {
    expect(BETA_INTEGRATION_IDS).toHaveLength(13);
    expect(isBetaIntegration("xero")).toBe(false);
  });

  it("tracks eight LIVE registry integrations", () => {
    expect(LIVE_INTEGRATION_IDS.sort()).toEqual([
      "doordash",
      "grubhub",
      "quickbooks",
      "shopify",
      "skip",
      "uber-eats",
      "woocommerce",
      "xero",
    ]);
  });

  it("renders BetaBadge on all thirteen BETA integration pages", () => {
    for (const [id, rel] of Object.entries(BETA_INTEGRATION_PAGES)) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      expect(source, id).toContain("BetaBadge");
    }
  });

  it("renders LiveBadge on LIVE integration pages", () => {
    for (const [id, rel] of Object.entries(LIVE_INTEGRATION_PAGES)) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      expect(source, id).toContain("LiveBadge");
      expect(source, id).not.toContain("BetaBadge");
    }
  });
});
