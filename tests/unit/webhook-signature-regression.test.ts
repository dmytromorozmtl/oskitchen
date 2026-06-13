import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  WEBHOOK_SIGNATURE_REGRESSION_AUDIT_SCRIPT,
  WEBHOOK_SIGNATURE_REGRESSION_CHECK_NPM_SCRIPT,
  WEBHOOK_SIGNATURE_REGRESSION_CI_WORKFLOW,
  WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT,
  WEBHOOK_SIGNATURE_REGRESSION_FLOW_STEPS,
  WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS,
  WEBHOOK_SIGNATURE_REGRESSION_NPM_SCRIPT,
  WEBHOOK_SIGNATURE_REGRESSION_POLICY_ID,
  WEBHOOK_SIGNATURE_REGRESSION_UNIT_TEST,
  isWebhookSignatureRegression401,
} from "@/lib/qa/webhook-signature-regression-policy";
import {
  hasInvalidSignatureFailClosed,
  probeBearerWebhookInvalidSignature,
  runWebhookSignatureRegressionBenchmark,
} from "@/lib/qa/webhook-signature-regression-scoring";

const ROOT = process.cwd();

describe("webhook signature regression — 59 routes (P1-22)", () => {
  it("locks policy id and regression flow steps", () => {
    expect(WEBHOOK_SIGNATURE_REGRESSION_POLICY_ID).toBe(
      "webhook-signature-regression-p1-22-v1",
    );
    expect(WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT).toBe(59);
    expect(WEBHOOK_SIGNATURE_REGRESSION_FLOW_STEPS).toEqual([
      "enumerate_routes",
      "assert_signature_verified",
      "assert_invalid_signature_rejected",
    ]);
    expect(isWebhookSignatureRegression401(401)).toBe(true);
    expect(isWebhookSignatureRegression401(200)).toBe(false);
  });

  it("rejects invalid bearer webhook secret with 401", () => {
    expect(probeBearerWebhookInvalidSignature()).toBe(
      WEBHOOK_SIGNATURE_REGRESSION_INVALID_STATUS,
    );
  });

  it("detects fail-closed patterns for invalid signatures", () => {
    expect(
      hasInvalidSignatureFailClosed(
        'return NextResponse.json({ error: "Invalid signature" }, { status: 401 });',
      ),
    ).toBe(true);
    expect(hasInvalidSignatureFailClosed("requireBearerWebhookSecret(request")).toBe(true);
    expect(
      hasInvalidSignatureFailClosed(
        "constructEvent(body, sig, secret); return NextResponse.json({}, { status: 400 });",
      ),
    ).toBe(true);
    expect(hasInvalidSignatureFailClosed("return NextResponse.json({ ok: true });")).toBe(false);
  });

  it("passes full regression benchmark across 59 ingress routes", () => {
    const result = runWebhookSignatureRegressionBenchmark(ROOT);
    expect(result.routeCount).toBe(WEBHOOK_SIGNATURE_REGRESSION_EXPECTED_ROUTE_COUNT);
    expect(result.passed).toBe(true);
    expect(result.passPct).toBe(100);
  });

  it("registers benchmark script and npm wiring", () => {
    expect(existsSync(join(ROOT, WEBHOOK_SIGNATURE_REGRESSION_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, "scripts/audit-webhook-signatures.ts"))).toBe(true);
    expect(WEBHOOK_SIGNATURE_REGRESSION_UNIT_TEST).toBe(
      "tests/unit/webhook-signature-regression.test.ts",
    );

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEBHOOK_SIGNATURE_REGRESSION_NPM_SCRIPT]).toContain(
      "run-webhook-signature-regression-benchmark.ts",
    );
    expect(pkg.scripts?.[WEBHOOK_SIGNATURE_REGRESSION_CHECK_NPM_SCRIPT]).toContain(
      WEBHOOK_SIGNATURE_REGRESSION_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:webhook-signature-regression"]).toContain(
      WEBHOOK_SIGNATURE_REGRESSION_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, WEBHOOK_SIGNATURE_REGRESSION_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("webhook-signature-regression");
  });
});
