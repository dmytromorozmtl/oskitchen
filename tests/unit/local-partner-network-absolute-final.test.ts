import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditLocalPartnerNetworkWiring } from "@/lib/partners/local-partner-network-audit";
import {
  isLocalPartnerNetworkPublicEnabled,
  LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID,
  LOCAL_PARTNER_NETWORK_CI_SCRIPTS,
  LOCAL_PARTNER_NETWORK_DOC,
  LOCAL_PARTNER_NETWORK_HONESTY_MARKERS,
  LOCAL_PARTNER_NETWORK_MIN_SIGNED_FOR_PUBLIC,
  LOCAL_PARTNER_NETWORK_ONBOARDING_STEPS,
  LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS,
  LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS,
  LOCAL_PARTNER_NETWORK_TIERS,
  LOCAL_PARTNER_NETWORK_UNIT_TEST,
  localPartnerTierForReferrals,
} from "@/lib/partners/local-partner-network-absolute-final-policy";

const ROOT = process.cwd();

describe("Local partner network onboarding (Absolute Final Task 75)", () => {
  it("locks absolute final policy with five segments and seven onboarding steps", () => {
    expect(LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "local-partner-network-absolute-final-v1",
    );
    expect(LOCAL_PARTNER_NETWORK_DOC).toBe("docs/local-partner-network-onboarding.md");
    expect(LOCAL_PARTNER_NETWORK_PARTNER_SEGMENTS).toHaveLength(5);
    expect(LOCAL_PARTNER_NETWORK_ONBOARDING_STEPS).toEqual([
      "O1",
      "O2",
      "O3",
      "O4",
      "O5",
      "O6",
      "O7",
    ]);
    expect(LOCAL_PARTNER_NETWORK_TIERS).toEqual(["Explorer", "Active", "Premier"]);
    expect(LOCAL_PARTNER_NETWORK_MIN_SIGNED_FOR_PUBLIC).toBe(3);
  });

  it("maps referral counts to partner tiers", () => {
    expect(localPartnerTierForReferrals(0)).toBe("Explorer");
    expect(localPartnerTierForReferrals(1)).toBe("Active");
    expect(localPartnerTierForReferrals(3)).toBe("Premier");
  });

  it("enables public network only after LOI, acks, and pilot proof", () => {
    expect(
      isLocalPartnerNetworkPublicEnabled({
        signedLois: 0,
        signedPartnerAcks: 3,
        referredPilotsWeek4Plus: 1,
      }),
    ).toBe(false);
    expect(
      isLocalPartnerNetworkPublicEnabled({
        signedLois: 1,
        signedPartnerAcks: 3,
        referredPilotsWeek4Plus: 1,
      }),
    ).toBe(true);
  });

  it("documents onboarding with honesty markers", () => {
    const doc = readFileSync(join(ROOT, LOCAL_PARTNER_NETWORK_DOC), "utf8");
    expect(doc).toContain(LOCAL_PARTNER_NETWORK_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("## Onboarding checklist");
    for (const marker of LOCAL_PARTNER_NETWORK_HONESTY_MARKERS) {
      expect(doc).toContain(marker);
    }
  });

  it("passes wiring audit", () => {
    const audit = auditLocalPartnerNetworkWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.sectionCount).toBe(LOCAL_PARTNER_NETWORK_REQUIRED_SECTIONS.length);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of LOCAL_PARTNER_NETWORK_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(LOCAL_PARTNER_NETWORK_UNIT_TEST).toBe(
      "tests/unit/local-partner-network-absolute-final.test.ts",
    );
  });
});
