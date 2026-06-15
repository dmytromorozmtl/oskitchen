import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID,
} from "@/lib/pos/pos-customer-display-era99-policy";
import {
  POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA174_CAPABILITIES,
  POS_CUSTOMER_DISPLAY_ERA174_CHANNEL,
  POS_CUSTOMER_DISPLAY_ERA174_COMPONENT,
  POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA174_ROUTE,
  POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT,
  POS_CUSTOMER_DISPLAY_ERA174_WIRING_PATHS,
} from "@/lib/pos/pos-customer-display-era174-policy";
import {
  auditPosCustomerDisplaySmokeEra174Wiring,
  buildPosCustomerDisplaySmokeEra174Summary,
  resolvePosCustomerDisplaySmokeEra174ProofStatus,
} from "@/lib/pos/pos-customer-display-era174-smoke-summary";
import {
  POS_CUSTOMER_DISPLAY_COMPONENT,
  POS_CUSTOMER_DISPLAY_ROUTE,
} from "@/lib/pos/pos-desktop-shortcuts-policy";
import { POS_CUSTOMER_DISPLAY_CHANNEL } from "@/lib/pos/pos-multi-monitor";

const ROOT = process.cwd();

describe("pos customer display era174", () => {
  it("locks era174 policy and artifact path", () => {
    expect(POS_CUSTOMER_DISPLAY_ERA174_POLICY_ID).toBe("era174-pos-customer-display-v1");
    expect(POS_CUSTOMER_DISPLAY_ERA174_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-customer-display-era174-smoke-summary.json",
    );
    expect(POS_CUSTOMER_DISPLAY_ERA174_ROUTE).toBe("/dashboard/pos/terminal/customer-display");
    expect(POS_CUSTOMER_DISPLAY_ERA174_CHANNEL).toBe("kitchenos-pos-customer-display-v1");
    expect(POS_CUSTOMER_DISPLAY_ERA174_WIRING_PATHS).toHaveLength(6);
    expect(POS_CUSTOMER_DISPLAY_ERA174_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era174 with canonical Customer Display policy", () => {
    expect(POS_CUSTOMER_DISPLAY_ERA174_CANONICAL_POLICY_ID).toBe(
      POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID,
    );
    expect(POS_CUSTOMER_DISPLAY_ROUTE).toBe(POS_CUSTOMER_DISPLAY_ERA174_ROUTE);
    expect(POS_CUSTOMER_DISPLAY_COMPONENT).toBe(POS_CUSTOMER_DISPLAY_ERA174_COMPONENT);
    expect(POS_CUSTOMER_DISPLAY_CHANNEL).toBe(POS_CUSTOMER_DISPLAY_ERA174_CHANNEL);
  });

  it("audits in-repo Customer Display Round 2 wiring", () => {
    const audit = auditPosCustomerDisplaySmokeEra174Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_CUSTOMER_DISPLAY_ERA174_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes BroadcastChannel sync path in terminal and display client", () => {
    const terminal = readFileSync(
      join(ROOT, "components/dashboard/pos-terminal-client.tsx"),
      "utf8",
    );
    expect(terminal).toContain("publishPosCustomerDisplayState");
    expect(terminal).toContain("openPosCustomerDisplayWindow");
    expect(terminal).toContain("toggleCustomerDisplayWindow");

    const display = readFileSync(join(ROOT, "components/pos/customer-display.tsx"), "utf8");
    expect(display).toContain("CustomerDisplay");
    expect(display).toContain("pos-customer-display-total");

    const displayClient = readFileSync(
      join(ROOT, "components/pos/pos-customer-display-client.tsx"),
      "utf8",
    );
    expect(displayClient).toContain("subscribePosCustomerDisplayState");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosCustomerDisplaySmokeEra174ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosCustomerDisplaySmokeEra174ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosCustomerDisplaySmokeEra174Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.channel).toBe("kitchenos-pos-customer-display-v1");
    expect(summary.capabilities).toContain("second_screen");
    expect(summary.capabilities).toContain("f8_toggle");
  });
});
