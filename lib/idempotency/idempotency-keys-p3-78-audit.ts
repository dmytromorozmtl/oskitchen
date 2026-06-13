import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  IDEMPOTENCY_KEYS_P3_78_DOC,
  IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPTS,
  IDEMPOTENCY_KEYS_P3_78_POLICY_ID,
  IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT,
  IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID,
  IDEMPOTENCY_KEYS_P3_78_WIRING_PATHS,
} from "@/lib/idempotency/idempotency-keys-p3-78-policy";
import { validateIdempotencyKeysContract } from "@/lib/idempotency/idempotency-keys-p3-78-measurement";

export type IdempotencyKeysP3_78AuditSummary = {
  policyId: typeof IDEMPOTENCY_KEYS_P3_78_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  registryCount: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditIdempotencyKeysP3_78(
  root = process.cwd(),
): IdempotencyKeysP3_78AuditSummary {
  const wiringComplete = IDEMPOTENCY_KEYS_P3_78_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, IDEMPOTENCY_KEYS_P3_78_DOC))) {
    const source = readFileSync(join(root, IDEMPOTENCY_KEYS_P3_78_DOC), "utf8");
    docWired =
      source.includes(IDEMPOTENCY_KEYS_P3_78_POLICY_ID) &&
      source.includes(IDEMPOTENCY_KEYS_P3_78_UPSTREAM_POLICY_ID) &&
      source.includes("POS checkout");
  }

  const contract = validateIdempotencyKeysContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = IDEMPOTENCY_KEYS_P3_78_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: IDEMPOTENCY_KEYS_P3_78_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    registryCount: IDEMPOTENCY_KEYS_P3_78_REGISTRY_COUNT,
    npmScriptsWired,
    passed,
  };
}

export function formatIdempotencyKeysP3_78AuditLines(
  summary: IdempotencyKeysP3_78AuditSummary,
): string[] {
  return [
    `Idempotency keys audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${IDEMPOTENCY_KEYS_P3_78_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Registry entries: ${summary.registryCount}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
