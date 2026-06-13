import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditIntegrationStatusPageP3_70,
  formatIntegrationStatusPageP3_70AuditLines,
} from "@/lib/marketing/integration-status-page-p3-70-audit";
import { validateIntegrationStatusPageContract } from "@/lib/marketing/integration-status-page-p3-70-measurement";
import {
  INTEGRATION_STATUS_PAGE_EXPECTED_COUNT,
  INTEGRATION_STATUS_PAGE_PATH,
} from "@/lib/marketing/integration-status-page-content";
import {
  INTEGRATION_STATUS_PAGE_P3_70_AUDIT_SCRIPT,
  INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH,
  INTEGRATION_STATUS_PAGE_P3_70_CHECK_NPM_SCRIPT,
  INTEGRATION_STATUS_PAGE_P3_70_DOC,
  INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPT,
  INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPTS,
  INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID,
  INTEGRATION_STATUS_PAGE_P3_70_PRIMARY_KEYWORD,
  INTEGRATION_STATUS_PAGE_P3_70_UNIT_TEST,
  integrationStatusPagePathsAligned,
} from "@/lib/marketing/integration-status-page-p3-70-policy";
import { loadPublicIntegrationFleetSnapshot } from "@/lib/marketing/integration-status-page-data";

const ROOT = process.cwd();

describe("Integration status page (P3-70)", () => {
  it("locks canonical /status path and 18 integration fleet", () => {
    expect(INTEGRATION_STATUS_PAGE_P3_70_POLICY_ID).toBe("integration-status-page-p3-70-v1");
    expect(INTEGRATION_STATUS_PAGE_P3_70_CANONICAL_PATH).toBe("/status");
    expect(INTEGRATION_STATUS_PAGE_PATH).toBe("/status");
    expect(INTEGRATION_STATUS_PAGE_P3_70_PRIMARY_KEYWORD).toBe("integration status");
    expect(INTEGRATION_STATUS_PAGE_EXPECTED_COUNT).toBe(18);
    expect(integrationStatusPagePathsAligned()).toBe(true);
  });

  it("loads integration fleet snapshot from artifact", () => {
    const snapshot = loadPublicIntegrationFleetSnapshot(ROOT);
    expect(snapshot.loaded).toBe(true);
    expect(snapshot.rows.length).toBe(INTEGRATION_STATUS_PAGE_EXPECTED_COUNT);
    const providers = snapshot.rows.filter((r) => r.integrationId !== "integration-health");
    expect(providers.length).toBe(17);
  });

  it("validates integration status page contract", () => {
    const validation = validateIntegrationStatusPageContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.sitemapWired).toBe(true);
    expect(validation.fleetLoaded).toBe(true);
    expect(validation.fleetCountOk).toBe(true);
  });

  it("passes full integration status page audit", () => {
    const summary = auditIntegrationStatusPageP3_70(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatIntegrationStatusPageP3_70AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, INTEGRATION_STATUS_PAGE_P3_70_DOC))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_STATUS_PAGE_P3_70_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INTEGRATION_STATUS_PAGE_P3_70_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPT]).toContain(
      "audit-integration-status-page-p3-70.ts",
    );
    expect(pkg.scripts?.[INTEGRATION_STATUS_PAGE_P3_70_CHECK_NPM_SCRIPT]).toContain(
      INTEGRATION_STATUS_PAGE_P3_70_UNIT_TEST,
    );
    for (const script of INTEGRATION_STATUS_PAGE_P3_70_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
