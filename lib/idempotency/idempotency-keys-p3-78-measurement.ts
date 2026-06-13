import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditAllIdempotencyKeys,
  auditIdempotencyEntry,
} from "@/lib/idempotency/idempotency-keys-policy";
import {
  IDEMPOTENCY_KEYS_P3_78_CRITICAL_POS_PATHS,
  IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT,
  IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID,
} from "@/lib/idempotency/idempotency-keys-p3-78-policy";

export type IdempotencyKeysContractValidation = {
  passed: boolean;
  upstreamRegistryOk: boolean;
  registryCountOk: boolean;
  posCheckoutAuditWired: boolean;
  posVoidAuditWired: boolean;
  failures: string[];
};

export function validateIdempotencyKeysContract(
  root = process.cwd(),
): IdempotencyKeysContractValidation {
  const failures: string[] = [];

  const upstream = auditAllIdempotencyKeys(root);
  const upstreamRegistryOk =
    upstream.passed && upstream.policyId === IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID;
  if (!upstreamRegistryOk) {
    failures.push("upstream idempotency registry audit failed");
  }

  const registryCountOk = upstream.reports.length === IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT;
  if (!registryCountOk) {
    failures.push(
      `registry count drift: expected ${IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT}, got ${upstream.reports.length}`,
    );
  }

  for (const rel of IDEMPOTENCY_KEYS_P3_78_CRITICAL_POS_PATHS) {
    const entry = upstream.reports.find((report) => report.entry.servicePath === rel);
    if (!entry?.passed) {
      failures.push(`critical POS path not wired: ${rel}`);
    }
  }

  let posCheckoutAuditWired = false;
  const checkoutPath = join(root, "services/pos/pos-checkout-service.ts");
  if (existsSync(checkoutPath)) {
    const source = readFileSync(checkoutPath, "utf8");
    posCheckoutAuditWired =
      source.includes("posCheckoutIdempotencyKey") && source.includes("idempotencyKey");
    if (!posCheckoutAuditWired) {
      failures.push("pos checkout missing idempotencyKey audit metadata");
    }
  }

  let posVoidAuditWired = false;
  const voidPath = join(root, "services/pos/pos-void-service.ts");
  if (existsSync(voidPath)) {
    const source = readFileSync(voidPath, "utf8");
    posVoidAuditWired =
      source.includes("posVoidIdempotencyKey") && source.includes("idempotencyKey");
    if (!posVoidAuditWired) {
      failures.push("pos void missing idempotencyKey audit metadata");
    }
  }

  const refundEntry = upstream.reports.find(
    (report) => report.entry.servicePath === "services/pos/pos-refund-service.ts",
  );
  if (!refundEntry?.passed) {
    const report = auditIdempotencyEntry(
      {
        surface: "payment_capture",
        servicePath: "services/pos/pos-refund-service.ts",
        wiringPattern: /posRefundIdempotencyKey/,
      },
      root,
    );
    if (!report.passed) {
      failures.push("pos refund idempotency key not wired");
    }
  }

  return {
    passed: failures.length === 0,
    upstreamRegistryOk,
    registryCountOk,
    posCheckoutAuditWired,
    posVoidAuditWired,
    failures,
  };
}
