import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SELF_SERVE_ONBOARDING_P1_30_ACTION,
  SELF_SERVE_ONBOARDING_P1_30_ARTIFACT,
  SELF_SERVE_ONBOARDING_P1_30_CHECK_NPM_SCRIPT,
  SELF_SERVE_ONBOARDING_P1_30_CI_NPM_SCRIPT,
  SELF_SERVE_ONBOARDING_P1_30_CI_WORKFLOW,
  SELF_SERVE_ONBOARDING_P1_30_DOC,
  SELF_SERVE_ONBOARDING_P1_30_FLOW_STEPS,
  SELF_SERVE_ONBOARDING_P1_30_INTEGRATIONS_TEST_ID,
  SELF_SERVE_ONBOARDING_P1_30_POLICY_ID,
  SELF_SERVE_ONBOARDING_P1_30_SIGNUP_ACTION,
  SELF_SERVE_ONBOARDING_P1_30_SIGNUP_REDIRECT,
  SELF_SERVE_ONBOARDING_P1_30_WIZARD,
  SELF_SERVE_ONBOARDING_P1_30_WIRING_PATHS,
} from "@/lib/onboarding/self-serve-onboarding-p1-30-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Self-serve onboarding (P1-30)", () => {
  it("locks P1-30 policy and registration → integrations → first order flow", () => {
    expect(SELF_SERVE_ONBOARDING_P1_30_POLICY_ID).toBe("self-serve-onboarding-p1-30-v1");
    expect(SELF_SERVE_ONBOARDING_P1_30_FLOW_STEPS).toEqual([
      "registration",
      "menu",
      "integrations",
      "first-order",
    ]);
    expect(SELF_SERVE_ONBOARDING_P1_30_SIGNUP_REDIRECT).toBe("/dashboard/quick-start");
  });

  it("wizard exposes four steps with integrations channel picker", () => {
    const wizard = readSource(SELF_SERVE_ONBOARDING_P1_30_WIZARD);
    expect(wizard).toContain('"profile", "menu", "integrations", "order"');
    expect(wizard).toContain("QUICK_START_CHANNEL_OPTIONS");
    expect(wizard).toContain(`data-testid="${SELF_SERVE_ONBOARDING_P1_30_INTEGRATIONS_TEST_ID}"`);
    expect(wizard).toContain("/dashboard/sales-channels");
    expect(wizard).toContain("/dashboard/integration-health");
    expect(wizard).not.toContain("No vault keys or integrations required");
  });

  it("quick-start actions accept channels from UI instead of hardcoded default", () => {
    const action = readSource(SELF_SERVE_ONBOARDING_P1_30_ACTION);
    expect(action).toContain("channels:");
    expect(action).toContain('z.array(channelSchema)');
    expect(action).not.toContain('const DEFAULT_CHANNELS: QuickStartChannel[] = ["pos"]');
    expect(action).toContain("parsed.data.channels");
  });

  it("signup redirects new users to quick start", () => {
    const auth = readSource(SELF_SERVE_ONBOARDING_P1_30_SIGNUP_ACTION);
    expect(auth).toContain('redirectTo: safeInternalNextPath(redirect, "/dashboard/quick-start")');
  });

  it("P1-30 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of SELF_SERVE_ONBOARDING_P1_30_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${SELF_SERVE_ONBOARDING_P1_30_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${SELF_SERVE_ONBOARDING_P1_30_CI_NPM_SCRIPT}"`);

    const ci = readSource(SELF_SERVE_ONBOARDING_P1_30_CI_WORKFLOW);
    expect(ci).toContain(SELF_SERVE_ONBOARDING_P1_30_CHECK_NPM_SCRIPT);

    const doc = readSource(SELF_SERVE_ONBOARDING_P1_30_DOC);
    expect(doc).toContain(SELF_SERVE_ONBOARDING_P1_30_POLICY_ID);

    const artifact = JSON.parse(readSource(SELF_SERVE_ONBOARDING_P1_30_ARTIFACT));
    expect(artifact.policyId).toBe(SELF_SERVE_ONBOARDING_P1_30_POLICY_ID);
    expect(artifact.wizardSteps).toEqual(["profile", "menu", "integrations", "order"]);
  });
});
