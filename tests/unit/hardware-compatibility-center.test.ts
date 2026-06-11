import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  auditHardwareCompatibilityCenter,
  formatHardwareCompatibilityCenterAuditLines,
} from "@/lib/hardware/hardware-compatibility-center-audit";
import { HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS } from "@/lib/hardware/hardware-compatibility-center-content";
import {
  buildPrinterTestHtml,
  CASH_DRAWER_TEST_STATUS,
  runKdsConnectivityCheck,
  runNetworkDiagnostic,
} from "@/lib/hardware/hardware-compatibility-center-diagnostics";
import {
  HARDWARE_COMPATIBILITY_CENTER_CI_WORKFLOW,
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_DOC,
  HARDWARE_COMPATIBILITY_CENTER_NPM_SCRIPT,
  HARDWARE_COMPATIBILITY_CENTER_POLICY_ID,
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TEST_IDS,
  HARDWARE_COMPATIBILITY_CENTER_UNIT_TEST,
} from "@/lib/hardware/hardware-compatibility-center-policy";

const ROOT = process.cwd();

describe("Hardware compatibility center (P2-87)", () => {
  it("locks policy id, route, and four diagnostics", () => {
    expect(HARDWARE_COMPATIBILITY_CENTER_POLICY_ID).toBe(
      "hardware-compatibility-center-p2-87-v1",
    );
    expect(HARDWARE_COMPATIBILITY_CENTER_ROUTE).toBe("/works-with-os-kitchen");
    expect(HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT).toBe(4);
    expect(HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS).toHaveLength(4);
    expect(HARDWARE_COMPATIBILITY_CENTER_TEST_IDS).toEqual([
      "hardware-compatibility-center",
      "hardware-test-printer",
      "hardware-test-cash-drawer",
      "hardware-test-kds",
      "hardware-test-network",
    ]);
  });

  it("passes full hardware compatibility center audit", () => {
    const summary = auditHardwareCompatibilityCenter(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.diagnosticCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.guideLinked).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("network diagnostic classifies health responses", async () => {
    vi.stubGlobal("navigator", { onLine: true });

    const passFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const pass = await runNetworkDiagnostic(passFetch as typeof fetch);
    expect(pass.status).toBe("pass");
    expect(pass.healthOk).toBe(true);

    const failFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const fail = await runNetworkDiagnostic(failFetch as typeof fetch);
    expect(fail.status).toBe("fail");

    vi.unstubAllGlobals();
  });

  it("KDS connectivity accepts redirect responses", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ status: 307 });
    const result = await runKdsConnectivityCheck(fetchFn as typeof fetch);
    expect(result.kitchenRouteReachable).toBe(true);
    expect(result.status).toBe("pass");
  });

  it("printer test html and cash drawer status are honest placeholders", () => {
    const html = buildPrinterTestHtml();
    expect(html).toContain("printer test");
    expect(html).toContain("window.print");
    expect(CASH_DRAWER_TEST_STATUS.status).toBe("placeholder");
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_DOC))).toBe(true);
    expect(existsSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[HARDWARE_COMPATIBILITY_CENTER_NPM_SCRIPT]).toContain(
      "audit-hardware-compatibility-center.ts",
    );
    expect(pkg.scripts?.["test:ci:hardware-compatibility-center"]).toContain(
      HARDWARE_COMPATIBILITY_CENTER_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, HARDWARE_COMPATIBILITY_CENTER_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:hardware-compatibility-center");
  });

  it("formats audit lines", () => {
    const lines = formatHardwareCompatibilityCenterAuditLines(
      auditHardwareCompatibilityCenter(ROOT),
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
