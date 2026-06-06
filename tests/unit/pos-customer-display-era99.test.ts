import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_CUSTOMER_DISPLAY_ERA99_CHANNEL,
  POS_CUSTOMER_DISPLAY_ERA99_COMPONENT,
  POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID,
  POS_CUSTOMER_DISPLAY_ERA99_ROUTE,
  POS_CUSTOMER_DISPLAY_ERA99_SUMMARY_ARTIFACT,
  POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS,
} from "@/lib/pos/pos-customer-display-era99-policy";
import {
  auditPosCustomerDisplaySmokeWiring,
  buildPosCustomerDisplaySmokeEra99Summary,
  resolvePosCustomerDisplaySmokeEra99ProofStatus,
} from "@/lib/pos/pos-customer-display-smoke-summary";
import {
  POS_CUSTOMER_DISPLAY_COMPONENT,
  POS_CUSTOMER_DISPLAY_ROUTE,
} from "@/lib/pos/pos-desktop-shortcuts-policy";
import { POS_CUSTOMER_DISPLAY_CHANNEL } from "@/lib/pos/pos-multi-monitor";

const ROOT = process.cwd();

describe("pos customer display era99", () => {
  it("locks era99 policy and artifact path", () => {
    expect(POS_CUSTOMER_DISPLAY_ERA99_POLICY_ID).toBe("era99-pos-customer-display-v1");
    expect(POS_CUSTOMER_DISPLAY_ERA99_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-customer-display-smoke-summary.json",
    );
    expect(POS_CUSTOMER_DISPLAY_ERA99_ROUTE).toBe("/dashboard/pos/terminal/customer-display");
    expect(POS_CUSTOMER_DISPLAY_ERA99_CHANNEL).toBe("kitchenos-pos-customer-display-v1");
  });

  it("aligns era99 constants with canonical desktop POS modules", () => {
    expect(POS_CUSTOMER_DISPLAY_ROUTE).toBe(POS_CUSTOMER_DISPLAY_ERA99_ROUTE);
    expect(POS_CUSTOMER_DISPLAY_COMPONENT).toBe(POS_CUSTOMER_DISPLAY_ERA99_COMPONENT);
    expect(POS_CUSTOMER_DISPLAY_CHANNEL).toBe(POS_CUSTOMER_DISPLAY_ERA99_CHANNEL);
  });

  it("audits in-repo Customer Display wiring", () => {
    const audit = auditPosCustomerDisplaySmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_CUSTOMER_DISPLAY_ERA99_WIRING_PATHS) {
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

    const displayClient = readFileSync(
      join(ROOT, "components/pos/pos-customer-display-client.tsx"),
      "utf8",
    );
    expect(displayClient).toContain("subscribePosCustomerDisplayState");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosCustomerDisplaySmokeEra99ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosCustomerDisplaySmokeEra99ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosCustomerDisplaySmokeEra99Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.channel).toBe("kitchenos-pos-customer-display-v1");
  });
});
