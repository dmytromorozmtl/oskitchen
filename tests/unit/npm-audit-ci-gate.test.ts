import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("npm audit CI gate", () => {
  it("defines high-severity dependency audit script", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["audit:dependencies:high"]).toBe("npm audit --audit-level=high");
  });

  it("wires npm audit gate in CI and deploy-prod-gate workflows", () => {
    const ci = readFileSync(join(ROOT, ".github/workflows/ci.yml"), "utf8");
    const deployGate = readFileSync(join(ROOT, ".github/workflows/deploy-prod-gate.yml"), "utf8");

    for (const workflow of [ci, deployGate]) {
      expect(workflow).toContain("Dependency audit (high severity gate)");
      expect(workflow).toContain("npm run audit:dependencies:high");
    }

    const ciInstall = ci.indexOf("npm ci");
    const ciAudit = ci.indexOf("audit:dependencies:high");
    expect(ciInstall).toBeGreaterThanOrEqual(0);
    expect(ciAudit).toBeGreaterThan(ciInstall);

    const deployInstall = deployGate.indexOf("npm ci");
    const deployAudit = deployGate.indexOf("audit:dependencies:high");
    expect(deployInstall).toBeGreaterThanOrEqual(0);
    expect(deployAudit).toBeGreaterThan(deployInstall);
  });
});
