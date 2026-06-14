import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  TRUST_PAGE_SECURITY_DETAIL_CARDS,
  TRUST_PAGE_WEBHOOK_SIGNATURE_TOTAL_ROUTES,
  TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT,
} from "@/lib/marketing/trust-page-security-p1-27-content";
import {
  TRUST_PAGE_SECURITY_P1_27_ARTIFACT,
  TRUST_PAGE_SECURITY_P1_27_CHECK_NPM_SCRIPT,
  TRUST_PAGE_SECURITY_P1_27_CI_NPM_SCRIPT,
  TRUST_PAGE_SECURITY_P1_27_CI_WORKFLOW,
  TRUST_PAGE_SECURITY_P1_27_COMPONENT,
  TRUST_PAGE_SECURITY_P1_27_DOC,
  TRUST_PAGE_SECURITY_P1_27_PAGE,
  TRUST_PAGE_SECURITY_P1_27_POLICY_ID,
  TRUST_PAGE_SECURITY_P1_27_REQUIRED_TOPICS,
  TRUST_PAGE_SECURITY_P1_27_TEST_ID,
  TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT,
  TRUST_PAGE_SECURITY_P1_27_WIRING_PATHS,
} from "@/lib/marketing/trust-page-security-p1-27-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Trust page security details (P1-27)", () => {
  it("locks P1-27 policy and five required security topics", () => {
    expect(TRUST_PAGE_SECURITY_P1_27_POLICY_ID).toBe("trust-page-security-p1-27-v1");
    expect(TRUST_PAGE_SECURITY_P1_27_REQUIRED_TOPICS).toEqual([
      "webhook-security",
      "uptime",
      "data-residency",
      "gdpr",
      "pci",
    ]);
    expect(TRUST_PAGE_SECURITY_DETAIL_CARDS).toHaveLength(5);
    for (const topic of TRUST_PAGE_SECURITY_P1_27_REQUIRED_TOPICS) {
      expect(TRUST_PAGE_SECURITY_DETAIL_CARDS.some((card) => card.id === topic)).toBe(true);
    }
  });

  it("webhook verified count matches webhook-signature-audit artifact", () => {
    const audit = JSON.parse(readSource(TRUST_PAGE_SECURITY_P1_27_WEBHOOK_AUDIT_ARTIFACT));
    expect(audit.overall).toBe("PASSED");
    expect(audit.verifiedCount).toBe(TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT);
    expect(audit.totalRoutes).toBe(TRUST_PAGE_WEBHOOK_SIGNATURE_TOTAL_ROUTES);
    expect(TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT).toBe(59);
  });

  it("trust page wires TrustPageSecurityDetailsSection", () => {
    const page = readSource(TRUST_PAGE_SECURITY_P1_27_PAGE);
    expect(page).toContain("TrustPageSecurityDetailsSection");
    expect(page).toContain("trust-page-security-details-section");
  });

  it("security details component exposes test id and all topic cards", () => {
    const component = readSource(TRUST_PAGE_SECURITY_P1_27_COMPONENT);
    expect(component).toContain(`data-testid={TRUST_PAGE_SECURITY_P1_27_TEST_ID}`);
    expect(component).toContain("TRUST_PAGE_WEBHOOK_SIGNATURE_VERIFIED_COUNT");
    expect(component).toContain("/59 signature verified");
    expect(component).toContain("export function TrustPageSecurityDetailsSection");
    expect(component).toContain("trust-security-${card.id}");
    expect(component).toContain("TRUST_PAGE_SECURITY_DETAIL_CARDS");
  });

  it("content cards document honest limits — no certification claims", () => {
    const serialized = JSON.stringify(TRUST_PAGE_SECURITY_DETAIL_CARDS);
    expect(serialized.toLowerCase()).not.toContain("gdpr compliant");
    expect(serialized.toLowerCase()).not.toContain("pci compliant");
    expect(serialized.toLowerCase()).not.toContain("soc 2 certified");
    expect(serialized).toContain("59 ingress routes");
    expect(serialized).toContain("US-primary");
  });

  it("P1-27 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of TRUST_PAGE_SECURITY_P1_27_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${TRUST_PAGE_SECURITY_P1_27_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${TRUST_PAGE_SECURITY_P1_27_CI_NPM_SCRIPT}"`);

    const ci = readSource(TRUST_PAGE_SECURITY_P1_27_CI_WORKFLOW);
    expect(ci).toContain(TRUST_PAGE_SECURITY_P1_27_CHECK_NPM_SCRIPT);

    const doc = readSource(TRUST_PAGE_SECURITY_P1_27_DOC);
    expect(doc).toContain(TRUST_PAGE_SECURITY_P1_27_POLICY_ID);
    expect(doc).toContain("59/59");

    const artifact = JSON.parse(readSource(TRUST_PAGE_SECURITY_P1_27_ARTIFACT));
    expect(artifact.policyId).toBe(TRUST_PAGE_SECURITY_P1_27_POLICY_ID);
    expect(artifact.sectionTestId).toBe(TRUST_PAGE_SECURITY_P1_27_TEST_ID);
  });
});
