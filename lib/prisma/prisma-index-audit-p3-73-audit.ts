import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PRISMA_INDEX_AUDIT_P3_73_DOC,
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT,
  PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPTS,
  PRISMA_INDEX_AUDIT_P3_73_POLICY_ID,
  PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID,
  PRISMA_INDEX_AUDIT_P3_73_WIRING_PATHS,
} from "@/lib/prisma/prisma-index-audit-p3-73-policy";
import { validatePrismaIndexAuditContract } from "@/lib/prisma/prisma-index-audit-p3-73-measurement";

export type PrismaIndexAuditP3_73AuditSummary = {
  policyId: typeof PRISMA_INDEX_AUDIT_P3_73_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  hotPathCount: number;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditPrismaIndexAuditP3_73(
  root = process.cwd(),
): PrismaIndexAuditP3_73AuditSummary {
  const wiringComplete = PRISMA_INDEX_AUDIT_P3_73_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PRISMA_INDEX_AUDIT_P3_73_DOC))) {
    const source = readFileSync(join(root, PRISMA_INDEX_AUDIT_P3_73_DOC), "utf8");
    docWired =
      source.includes(PRISMA_INDEX_AUDIT_P3_73_POLICY_ID) &&
      source.includes(PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID) &&
      source.includes("hot-path");
  }

  const contract = validatePrismaIndexAuditContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = PRISMA_INDEX_AUDIT_P3_73_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed = wiringComplete && docWired && contract.passed && npmScriptsWired;

  return {
    policyId: PRISMA_INDEX_AUDIT_P3_73_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    hotPathCount: PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT,
    npmScriptsWired,
    passed,
  };
}

export function formatPrismaIndexAuditP3_73AuditLines(
  summary: PrismaIndexAuditP3_73AuditSummary,
): string[] {
  return [
    `Prisma index audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${PRISMA_INDEX_AUDIT_P3_73_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Hot-path models: ${summary.hotPathCount} (zero FK gaps required)`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
