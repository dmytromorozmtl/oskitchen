import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditOwnYourChannelUpsellWiring } from "@/lib/marketing/own-your-channel-upsell-audit";
import {
  OWN_YOUR_CHANNEL_UPSELL_PATH,
  OWN_YOUR_CHANNEL_UPSELL_STEPS,
} from "@/lib/marketing/own-your-channel-upsell-content";
import {
  OWN_YOUR_CHANNEL_UPSELL_ABSOLUTE_FINAL_POLICY_ID,
  OWN_YOUR_CHANNEL_UPSELL_CI_SCRIPTS,
  OWN_YOUR_CHANNEL_UPSELL_ROUTE,
  OWN_YOUR_CHANNEL_UPSELL_UNIT_TEST,
} from "@/lib/marketing/own-your-channel-upsell-absolute-final-policy";

const ROOT = process.cwd();

describe("Own your channel upsell flow (Absolute Final Task 82)", () => {
  it("locks absolute final policy and upsell route", () => {
    expect(OWN_YOUR_CHANNEL_UPSELL_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "own-your-channel-upsell-absolute-final-v1",
    );
    expect(OWN_YOUR_CHANNEL_UPSELL_ROUTE).toBe("/own-your-channel");
    expect(OWN_YOUR_CHANNEL_UPSELL_PATH).toBe("/own-your-channel");
  });

  it("defines three-step assess → compare → launch flow", () => {
    expect(OWN_YOUR_CHANNEL_UPSELL_STEPS.map((s) => s.id)).toEqual([
      "assess",
      "compare",
      "launch",
    ]);
    expect(OWN_YOUR_CHANNEL_UPSELL_STEPS[1]?.primaryCta.href).toBe("/commission-comparison");
    expect(OWN_YOUR_CHANNEL_UPSELL_STEPS[2]?.primaryCta.href).toBe("/dashboard/storefront");
  });

  it("passes wiring audit", () => {
    const audit = auditOwnYourChannelUpsellWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of OWN_YOUR_CHANNEL_UPSELL_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(OWN_YOUR_CHANNEL_UPSELL_UNIT_TEST).toBe(
      "tests/unit/own-your-channel-upsell-absolute-final.test.ts",
    );
  });
});
