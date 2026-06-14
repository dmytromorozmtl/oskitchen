import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DEMO_P1_28_GUEST_CREDENTIALS,
  DEMO_P1_28_LIVE_INTEGRATION_PROOFS,
  isDemoP128LiveChannel,
} from "@/lib/marketing/demo-interactive-sandbox-p1-28-content";
import {
  DEMO_INTERACTIVE_SANDBOX_P1_28_ARTIFACT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CHECK_NPM_SCRIPT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CI_NPM_SCRIPT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CI_WORKFLOW,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_COMPONENT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID,
  DEMO_INTERACTIVE_SANDBOX_P1_28_LIVE_CHANNEL_IDS,
  DEMO_INTERACTIVE_SANDBOX_P1_28_PAGE,
  DEMO_INTERACTIVE_SANDBOX_P1_28_POLICY_ID,
  DEMO_INTERACTIVE_SANDBOX_P1_28_SANDBOX_COMPONENT,
  DEMO_INTERACTIVE_SANDBOX_P1_28_WIRING_PATHS,
} from "@/lib/marketing/demo-interactive-sandbox-p1-28-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Demo page interactive sandbox (P1-28)", () => {
  it("locks P1-28 policy and LIVE integration channel ids", () => {
    expect(DEMO_INTERACTIVE_SANDBOX_P1_28_POLICY_ID).toBe("demo-interactive-sandbox-p1-28-v1");
    expect(DEMO_INTERACTIVE_SANDBOX_P1_28_LIVE_CHANNEL_IDS).toEqual([
      "shopify",
      "woocommerce",
      "storefront",
      "pos",
    ]);
    expect(DEMO_P1_28_LIVE_INTEGRATION_PROOFS).toHaveLength(4);
    expect(isDemoP128LiveChannel("shopify")).toBe(true);
    expect(isDemoP128LiveChannel("doordash")).toBe(false);
  });

  it("guest credentials include email pattern and session hours", () => {
    expect(DEMO_P1_28_GUEST_CREDENTIALS.emailPattern).toContain("@demo.os-kitchen.app");
    expect(DEMO_P1_28_GUEST_CREDENTIALS.sessionHours).toBe(2);
  });

  it("demo page wires credentials panel before interactive sandbox", () => {
    const page = readSource(DEMO_INTERACTIVE_SANDBOX_P1_28_PAGE);
    expect(page).toContain("DemoTestCredentialsPanel");
    expect(page).toContain("DemoInteractiveSandboxWorkspace");
    const credIdx = page.indexOf("DemoTestCredentialsPanel");
    const sandboxIdx = page.indexOf("DemoInteractiveSandboxWorkspace");
    expect(credIdx).toBeGreaterThan(-1);
    expect(sandboxIdx).toBeGreaterThan(credIdx);
  });

  it("credentials panel exposes test id and LIVE integration badges", () => {
    const component = readSource(DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_COMPONENT);
    expect(component).toContain("export function DemoTestCredentialsPanel");
    expect(component).toContain(DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID);
    expect(component).toContain("demo-live-integration-${proof.channelId}");
    expect(component).toContain("DemoLaunchButton");
  });

  it("sandbox component shows LIVE badges from P1-28 content", () => {
    const sandbox = readSource(DEMO_INTERACTIVE_SANDBOX_P1_28_SANDBOX_COMPONENT);
    expect(sandbox).toContain("getDemoP128LiveProof");
    expect(sandbox).toContain("LIVE proof:");
  });

  it("P1-28 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of DEMO_INTERACTIVE_SANDBOX_P1_28_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${DEMO_INTERACTIVE_SANDBOX_P1_28_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${DEMO_INTERACTIVE_SANDBOX_P1_28_CI_NPM_SCRIPT}"`);

    const ci = readSource(DEMO_INTERACTIVE_SANDBOX_P1_28_CI_WORKFLOW);
    expect(ci).toContain(DEMO_INTERACTIVE_SANDBOX_P1_28_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readSource(DEMO_INTERACTIVE_SANDBOX_P1_28_ARTIFACT));
    expect(artifact.policyId).toBe(DEMO_INTERACTIVE_SANDBOX_P1_28_POLICY_ID);
    expect(artifact.credentialsTestId).toBe(DEMO_INTERACTIVE_SANDBOX_P1_28_CREDENTIALS_TEST_ID);
  });
});
