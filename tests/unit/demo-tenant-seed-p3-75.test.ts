import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDemoTenantSeedP3_75,
  formatDemoTenantSeedP3_75AuditLines,
} from "@/lib/demo/demo-tenant-seed-p3-75-audit";
import { validateDemoTenantSeedContract } from "@/lib/demo/demo-tenant-seed-p3-75-measurement";
import {
  DEMO_TENANT_SEED_P3_75_AUDIT_SCRIPT,
  DEMO_TENANT_SEED_P3_75_CHECK_NPM_SCRIPT,
  DEMO_TENANT_SEED_P3_75_DOC,
  DEMO_TENANT_SEED_P3_75_NPM_SCRIPT,
  DEMO_TENANT_SEED_P3_75_NPM_SCRIPTS,
  DEMO_TENANT_SEED_P3_75_POLICY_ID,
  DEMO_TENANT_SEED_P3_75_TARGETS,
  DEMO_TENANT_SEED_P3_75_UNIT_TEST,
  DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID,
  DEMO_TENANT_SEED_P3_75_UPSTREAM_TEST,
} from "@/lib/demo/demo-tenant-seed-p3-75-policy";

const ROOT = process.cwd();

describe("Demo tenant seed (P3-75)", () => {
  it("locks P3-75 policy and blueprint targets", () => {
    expect(DEMO_TENANT_SEED_P3_75_POLICY_ID).toBe("demo-tenant-seed-p3-75-v1");
    expect(DEMO_TENANT_SEED_P3_75_UPSTREAM_POLICY_ID).toBe("demo-tenant-seed-p1-35-v1");
    expect(DEMO_TENANT_SEED_P3_75_TARGETS).toEqual({ orders: 50, vendors: 3, inventory: 20 });
  });

  it("validates upstream seed + /demo commercial import wiring", () => {
    const validation = validateDemoTenantSeedContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamAuditOk).toBe(true);
    expect(validation.demoImportWired).toBe(true);
    expect(validation.targetsLocked).toBe(true);
  });

  it("passes full demo tenant seed P3-75 audit", () => {
    const summary = auditDemoTenantSeedP3_75(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatDemoTenantSeedP3_75AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, DEMO_TENANT_SEED_P3_75_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DEMO_TENANT_SEED_P3_75_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, DEMO_TENANT_SEED_P3_75_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, DEMO_TENANT_SEED_P3_75_UPSTREAM_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DEMO_TENANT_SEED_P3_75_NPM_SCRIPT]).toContain(
      "audit-demo-tenant-seed-p3-75.ts",
    );
    expect(pkg.scripts?.[DEMO_TENANT_SEED_P3_75_CHECK_NPM_SCRIPT]).toContain(
      DEMO_TENANT_SEED_P3_75_UNIT_TEST,
    );
    for (const script of DEMO_TENANT_SEED_P3_75_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
