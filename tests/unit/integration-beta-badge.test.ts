import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BETA_INTEGRATION_IDS,
  isBetaIntegration,
  isBetaIntegrationProvider,
} from "@/lib/integrations/integration-registry";

const ROOT = process.cwd();

const BETA_INTEGRATION_PAGES: Record<string, string> = {
  doordash: "app/dashboard/integrations/doordash/page.tsx",
  grubhub: "app/dashboard/integrations/grubhub/page.tsx",
  "uber-eats": "app/dashboard/integrations/uber-eats/page.tsx",
  quickbooks: "app/dashboard/integrations/quickbooks/page.tsx",
  xero: "app/dashboard/integrations/xero/page.tsx",
  "7shifts": "app/dashboard/integrations/7shifts/page.tsx",
  homebase: "app/dashboard/integrations/homebase/page.tsx",
  klaviyo: "app/dashboard/integrations/klaviyo/page.tsx",
  mailchimp: "app/dashboard/integrations/mailchimp/page.tsx",
  resy: "app/dashboard/integrations/resy/page.tsx",
  opentable: "app/dashboard/integrations/opentable/page.tsx",
  "uber-direct": "app/dashboard/integrations/uber-direct/page.tsx",
  square: "app/dashboard/integrations/square/page.tsx",
  toast: "app/dashboard/integrations/toast/page.tsx",
};

describe("integration beta badge", () => {
  it("tracks fourteen BETA registry integrations", () => {
    expect(BETA_INTEGRATION_IDS).toHaveLength(14);
    expect(BETA_INTEGRATION_IDS.sort()).toEqual([
      "7shifts",
      "doordash",
      "grubhub",
      "homebase",
      "klaviyo",
      "mailchimp",
      "opentable",
      "quickbooks",
      "resy",
      "square",
      "toast",
      "uber-direct",
      "uber-eats",
      "xero",
    ]);
    for (const id of BETA_INTEGRATION_IDS) {
      expect(isBetaIntegration(id)).toBe(true);
    }
    expect(isBetaIntegration("uber-direct")).toBe(true);
  });

  it("maps delivery provider keys to BETA integrations", () => {
    expect(isBetaIntegrationProvider("doordash")).toBe(true);
    expect(isBetaIntegrationProvider("grubhub")).toBe(true);
    expect(isBetaIntegrationProvider("uber-eats")).toBe(true);
    expect(isBetaIntegrationProvider("uber-direct")).toBe(true);
  });

  it("renders BetaBadge on all fourteen BETA integration pages", () => {
    for (const [id, rel] of Object.entries(BETA_INTEGRATION_PAGES)) {
      const path = join(ROOT, rel);
      expect(existsSync(path), id).toBe(true);
      const source = readFileSync(path, "utf8");
      expect(source, id).toContain("BetaBadge");
      expect(source, id).toContain("@/components/integrations/beta-badge");
    }
  });

  it("uses BetaBadge in extensions catalog and channel cards", () => {
    const catalog = readFileSync(
      join(ROOT, "components/dashboard/extensions/extensions-catalog-panel.tsx"),
      "utf8",
    );
    const channelCard = readFileSync(join(ROOT, "components/channels/channel-card.tsx"), "utf8");
    expect(catalog).toContain("BetaBadge");
    expect(channelCard).toContain("BetaBadge");
  });
});
