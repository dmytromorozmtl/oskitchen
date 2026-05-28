import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WEBHOOK_SECURITY_ERA16_CANONICAL_DOC_PATHS,
  WEBHOOK_SECURITY_ERA16_CANONICAL_MARKERS,
  WEBHOOK_SECURITY_ERA16_CERT_SCRIPT,
  WEBHOOK_SECURITY_ERA16_CI_SCRIPTS,
  WEBHOOK_SECURITY_ERA16_FORBIDDEN_CLAIMS,
  WEBHOOK_SECURITY_ERA16_MATRIX_MODULE,
  WEBHOOK_SECURITY_ERA16_POLICY_ID,
  WEBHOOK_SECURITY_ERA16_REVIEW_SECTION,
  WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT,
  WEBHOOK_SECURITY_ERA16_UNIT_TESTS,
} from "@/lib/security/webhook-security-era16-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("webhook security era16 CI certification (live repo)", () => {
  it("locks era16 webhook security policy id", () => {
    expect(WEBHOOK_SECURITY_ERA16_POLICY_ID).toBe("era16-webhook-security-matrix-v1");
  });

  it("defines era16 webhook security scripts chained into test:security", () => {
    const scripts = readPackageScripts();
    for (const name of WEBHOOK_SECURITY_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["cert:webhook-security-era16"]).toContain(WEBHOOK_SECURITY_ERA16_CERT_SCRIPT);
    expect(scripts["test:security"]).toContain("test:ci:webhook-security-era16:cert");
  });

  it("wires matrix module, cert script, and summary artifact", () => {
    expect(existsSync(join(ROOT, WEBHOOK_SECURITY_ERA16_MATRIX_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, WEBHOOK_SECURITY_ERA16_CERT_SCRIPT))).toBe(true);
    const certScript = readFileSync(join(ROOT, WEBHOOK_SECURITY_ERA16_CERT_SCRIPT), "utf8");
    expect(certScript).toContain("WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT");
    expect(certScript).toContain(WEBHOOK_SECURITY_ERA16_SUMMARY_ARTIFACT);
  });

  it("documents era16 webhook security in canonical docs without forbidden claims", () => {
    for (const rel of WEBHOOK_SECURITY_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      for (const marker of WEBHOOK_SECURITY_ERA16_CANONICAL_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
      for (const forbidden of WEBHOOK_SECURITY_ERA16_FORBIDDEN_CLAIMS) {
        expect(text).not.toContain(forbidden.toLowerCase());
      }
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(WEBHOOK_SECURITY_ERA16_REVIEW_SECTION);
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(WEBHOOK_SECURITY_ERA16_POLICY_ID);
    for (const rel of WEBHOOK_SECURITY_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
