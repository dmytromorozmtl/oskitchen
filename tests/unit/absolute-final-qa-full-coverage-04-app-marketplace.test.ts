import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditAppMarketplaceThirdPartyWiring } from "@/lib/platform/app-marketplace-third-party-audit";
import {
  APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS,
  APP_MARKETPLACE_THIRD_PARTY_ROUTE,
  APP_MARKETPLACE_THIRD_PARTY_UPSTREAM_POLICIES,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";
import {
  APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE,
  APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE,
  appMarketplaceThirdPartyKindLabel,
  getAppMarketplaceThirdPartyExtension,
} from "@/lib/platform/app-marketplace-third-party-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 104 — QA full coverage for feature 89 app marketplace 3rd party */
const TASK = 104;
const FEATURE = 89;

describe(`QA full coverage — app marketplace 3rd party (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 104 → feature 89 app marketplace", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("app-marketplace-third-party");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/app-marketplace-third-party-absolute-final.test.ts");
    expect(APP_MARKETPLACE_THIRD_PARTY_UPSTREAM_POLICIES).toContain("partner-apps-catalog-v1");
  });

  it("ships eight extensions with distinct ids and install paths", () => {
    expect(APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS).toHaveLength(8);
    const ids = APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.map((e) => e.id);
    expect(new Set(ids).size).toBe(8);
    for (const ext of APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS) {
      expect(ext.installPath.startsWith("/")).toBe(true);
      expect(ext.honestyNote.length).toBeGreaterThan(10);
    }
  });

  it("balances certified SI, developer, and roadmap maturity labels", () => {
    const certified = APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.filter((e) => e.kind === "certified_si");
    const beta = APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.filter((e) => e.maturity === "BETA");
    const roadmap = APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.filter((e) => e.maturity === "ROADMAP");
    expect(certified).toHaveLength(5);
    expect(beta.length).toBeGreaterThanOrEqual(2);
    expect(roadmap).toHaveLength(1);
    expect(appMarketplaceThirdPartyKindLabel("oauth_app")).toBe("OAuth app");
    expect(appMarketplaceThirdPartyKindLabel("embed")).toBe("Embedded UI");
  });

  it("locks 70/30 revenue share and resolves extensions by id", () => {
    expect(APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE.developerPercent).toBe(70);
    expect(APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE.platformPercent).toBe(30);
    expect(getAppMarketplaceThirdPartyExtension("partner-slack-ops-alerts")?.name).toBe(
      "Slack ops alerts",
    );
    expect(getAppMarketplaceThirdPartyExtension("missing-id")).toBeUndefined();
  });

  it("documents honesty markers — BETA, ROADMAP, platform review, not self-serve", () => {
    const content = readFileSync(
      join(ROOT, "lib/platform/app-marketplace-third-party-content.ts"),
      "utf8",
    );
    const component = readFileSync(
      join(ROOT, "components/marketing/app-marketplace-third-party.tsx"),
      "utf8",
    );
    const combined = `${content}\n${component}\n${APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE}`;
    for (const marker of APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS) {
      expect(combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase())).toBe(
        true,
      );
    }
    expect(APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE).toContain("Illustrative");
    expect(content).toContain(APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID);
  });

  it("wires marketing page, extensions strip, and partner-apps baseline", () => {
    const page = readFileSync(join(ROOT, "app/app-marketplace/page.tsx"), "utf8");
    const extensions = readFileSync(
      join(ROOT, "app/dashboard/integrations/extensions/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/extensions/app-marketplace-third-party-strip.tsx"),
      "utf8",
    );
    const partnerConfig = readFileSync(join(ROOT, "config/commercial/partner-apps.json"), "utf8");

    expect(page).toContain("AppMarketplaceThirdParty");
    expect(extensions).toContain("AppMarketplaceThirdPartyStrip");
    expect(strip).toContain(APP_MARKETPLACE_THIRD_PARTY_ROUTE);
    expect(partnerConfig).toContain("partner-slack-ops-alerts");
  });

  it("renders extension rows with dynamic data-testid pattern", () => {
    const component = readFileSync(
      join(ROOT, "components/marketing/app-marketplace-third-party.tsx"),
      "utf8",
    );
    expect(component).toContain('data-testid="app-marketplace-third-party"');
    expect(component).toContain("app-marketplace-extension-${ext.id}");
    expect(component).toContain("APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.map");
  });

  it("passes base wiring audit and QA slot 104 audit gate", () => {
    const wiring = auditAppMarketplaceThirdPartyWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-04-app-marketplace.test.ts",
    );
  });
});
