import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_DOC_PATHS,
  ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_MARKERS,
  ERA20_FIRST_PAID_PILOT_PACKAGE_CI_SCRIPTS,
  ERA20_FIRST_PAID_PILOT_PACKAGE_DOC,
  ERA20_FIRST_PAID_PILOT_PACKAGE_MODULE,
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  ERA20_FIRST_PAID_PILOT_PACKAGE_REQUIRED_SECTIONS,
  ERA20_FIRST_PAID_PILOT_PACKAGE_REVIEW_SECTION,
  ERA20_FIRST_PAID_PILOT_PACKAGE_UNIT_TESTS,
} from "@/lib/commercial/era20-first-paid-pilot-package-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("era20 first paid pilot package CI certification (live repo)", () => {
  it("locks era20 pilot package policy id", () => {
    expect(ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID).toBe(
      "era20-first-paid-pilot-package-v1",
    );
  });

  it("defines era20 pilot package cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of ERA20_FIRST_PAID_PILOT_PACKAGE_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:commercial-pilot-runbook:cert"]).toContain(
      "era20-first-paid-pilot-package-cert-live",
    );
  });

  it("documents era20 pilot package in canonical docs", () => {
    expect(existsSync(join(ROOT, ERA20_FIRST_PAID_PILOT_PACKAGE_MODULE))).toBe(true);
    const template = readFileSync(join(ROOT, ERA20_FIRST_PAID_PILOT_PACKAGE_DOC), "utf8");
    for (const section of ERA20_FIRST_PAID_PILOT_PACKAGE_REQUIRED_SECTIONS) {
      expect(template, section).toContain(section);
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(ERA20_FIRST_PAID_PILOT_PACKAGE_REVIEW_SECTION);
    for (const marker of ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    for (const rel of ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_DOC_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    for (const rel of ERA20_FIRST_PAID_PILOT_PACKAGE_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
