import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditAppMarketplaceThirdPartyWiring } from "@/lib/platform/app-marketplace-third-party-audit";
import {
  APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID,
  APP_MARKETPLACE_THIRD_PARTY_CI_SCRIPTS,
  APP_MARKETPLACE_THIRD_PARTY_ROUTE,
  APP_MARKETPLACE_THIRD_PARTY_UNIT_TEST,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";
import {
  APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS,
  APP_MARKETPLACE_THIRD_PARTY_PATH,
  APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE,
} from "@/lib/platform/app-marketplace-third-party-content";

const ROOT = process.cwd();

describe("App marketplace third-party extensions (Absolute Final Task 89)", () => {
  it("locks absolute final policy and /app-marketplace route", () => {
    expect(APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "app-marketplace-third-party-absolute-final-v1",
    );
    expect(APP_MARKETPLACE_THIRD_PARTY_ROUTE).toBe("/app-marketplace");
    expect(APP_MARKETPLACE_THIRD_PARTY_PATH).toBe("/app-marketplace");
    expect(APP_MARKETPLACE_THIRD_PARTY_REVENUE_SHARE.developerPercent).toBe(70);
  });

  it("ships eight third-party extensions with certified SI baseline", () => {
    expect(APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS).toHaveLength(8);
    expect(
      APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.filter((e) => e.kind === "certified_si"),
    ).toHaveLength(5);
    expect(APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.some((e) => e.maturity === "BETA")).toBe(true);
    expect(APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.some((e) => e.maturity === "ROADMAP")).toBe(true);
  });

  it("passes wiring audit", () => {
    const audit = auditAppMarketplaceThirdPartyWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of APP_MARKETPLACE_THIRD_PARTY_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(APP_MARKETPLACE_THIRD_PARTY_UNIT_TEST).toBe(
      "tests/unit/app-marketplace-third-party-absolute-final.test.ts",
    );
  });
});
