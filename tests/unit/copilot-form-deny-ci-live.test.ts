import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { COPILOT_FORM_DENY_POLICY_ID } from "@/lib/ai/copilot-form-mutation";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("copilot form deny CI certification (live repo)", () => {
  it("locks era5 copilot form deny policy module", () => {
    expect(COPILOT_FORM_DENY_POLICY_ID).toBe("era5-copilot-form-deny-v1");
    const actions = readFileSync(join(ROOT, "actions/copilot.ts"), "utf8");
    expect(actions).toContain("assertCopilotFormGate");
    expect(actions).not.toMatch(/if \(!gate\.ok\) return;/);
  });

  it("wires copilot form deny tests in rbac-wave4 bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:rbac-wave4"]).toContain("copilot-form-deny.test.ts");
    expect(scripts["test:ci:rbac-wave4"]).toContain("copilot-form-deny-ci-live.test.ts");
  });
});
