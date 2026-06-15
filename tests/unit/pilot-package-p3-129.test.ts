import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPilotPackage,
  formatPilotPackageAuditLines,
} from "@/lib/pm/pilot-package-p3-129-audit";
import {
  loadPilotPackageV1,
  validatePilotPackageV1,
} from "@/lib/pm/pilot-package-p3-129-operations";
import {
  PILOT_PACKAGE_CI_WORKFLOW,
  PILOT_PACKAGE_CORE_MODULE_COUNT,
  PILOT_PACKAGE_DOC,
  PILOT_PACKAGE_LIVE_INTEGRATION_COUNT,
  PILOT_PACKAGE_NPM_SCRIPT,
  PILOT_PACKAGE_POLICY_ID,
  PILOT_PACKAGE_UNIT_TEST,
} from "@/lib/pm/pilot-package-p3-129-policy";

const ROOT = process.cwd();

describe("Pilot package v1 (P3-129)", () => {
  it("locks policy id and scoped module counts", () => {
    expect(PILOT_PACKAGE_POLICY_ID).toBe("pilot-package-p3-129-v1");
    expect(PILOT_PACKAGE_CORE_MODULE_COUNT).toBe(4);
    expect(PILOT_PACKAGE_LIVE_INTEGRATION_COUNT).toBe(3);
  });

  it("validates pilot package artifact", () => {
    const pilotPackage = loadPilotPackageV1(ROOT);
    const validation = validatePilotPackageV1(pilotPackage);
    expect(validation.valid).toBe(true);
    expect(validation.coreModulesMatch).toBe(true);
    expect(validation.integrationsLiveInRegistry).toBe(true);
    expect(pilotPackage.goldenPath).toContain("/dashboard/kitchen");
  });

  it("passes full pilot package audit", () => {
    const summary = auditPilotPackage(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.artifactValid).toBe(true);
    expect(summary.routesWired).toBe(true);
    expect(summary.registryWired).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, PILOT_PACKAGE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PILOT_PACKAGE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PILOT_PACKAGE_NPM_SCRIPT]).toContain("audit-pilot-package-p3-129.ts");
    expect(pkg.scripts?.["test:ci:pilot-package-p3-129"]).toContain(PILOT_PACKAGE_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, PILOT_PACKAGE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:pilot-package-p3-129");
  });

  it("formats audit lines", () => {
    const summary = auditPilotPackage(ROOT);
    const lines = formatPilotPackageAuditLines(summary);
    expect(lines.some((line) => line.includes(PILOT_PACKAGE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
