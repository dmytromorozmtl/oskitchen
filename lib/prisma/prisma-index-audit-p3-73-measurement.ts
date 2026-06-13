import { join } from "node:path";

import { auditPrismaSchemaIndexes } from "@/lib/prisma/prisma-index-audit";
import {
  PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT,
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT,
  PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS,
  PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID,
} from "@/lib/prisma/prisma-index-audit-p3-73-policy";

export type PrismaIndexHotPathValidation = {
  model: string;
  missingForeignKeyIndexes: string[];
  passed: boolean;
};

export type PrismaIndexAuditContractValidation = {
  passed: boolean;
  modelCountOk: boolean;
  tenantScopeZero: boolean;
  hotPathZeroGaps: boolean;
  upstreamPolicyAligned: boolean;
  hotPathReports: PrismaIndexHotPathValidation[];
  failures: string[];
};

export function validatePrismaIndexHotPathModels(
  root = process.cwd(),
): PrismaIndexHotPathValidation[] {
  const summary = auditPrismaSchemaIndexes(join(root, "prisma/schema.prisma"));

  return PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_MODELS.map((model) => {
    const report = summary.reports.find((entry) => entry.model === model);
    const missingForeignKeyIndexes = report?.missingForeignKeyIndexes ?? ["model-not-found"];
    return {
      model,
      missingForeignKeyIndexes,
      passed: missingForeignKeyIndexes.length === 0,
    };
  });
}

export function validatePrismaIndexAuditContract(
  root = process.cwd(),
): PrismaIndexAuditContractValidation {
  const failures: string[] = [];
  const summary = auditPrismaSchemaIndexes(join(root, "prisma/schema.prisma"));

  const modelCountOk = summary.modelCount === PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT;
  if (!modelCountOk) {
    failures.push(
      `model count ${summary.modelCount}/${PRISMA_INDEX_AUDIT_P3_73_EXPECTED_MODEL_COUNT}`,
    );
  }

  const tenantScopeZero = summary.totalMissingTenantScopeIndexes === 0;
  if (!tenantScopeZero) {
    failures.push(
      `tenant-scope gaps: ${summary.totalMissingTenantScopeIndexes}`,
    );
  }

  const upstreamPolicyAligned =
    summary.policyId === PRISMA_INDEX_AUDIT_P3_73_UPSTREAM_POLICY_ID;
  if (!upstreamPolicyAligned) {
    failures.push(`upstream policy mismatch: ${summary.policyId}`);
  }

  const hotPathReports = validatePrismaIndexHotPathModels(root);
  const hotPathZeroGaps = hotPathReports.every((report) => report.passed);
  if (!hotPathZeroGaps) {
    const gapModels = hotPathReports
      .filter((report) => !report.passed)
      .map((report) => `${report.model}(${report.missingForeignKeyIndexes.join(",")})`);
    failures.push(`hot-path FK gaps: ${gapModels.join("; ")}`);
  }

  if (hotPathReports.length !== PRISMA_INDEX_AUDIT_P3_73_HOT_PATH_COUNT) {
    failures.push("hot-path model count drift");
  }

  return {
    passed: failures.length === 0,
    modelCountOk,
    tenantScopeZero,
    hotPathZeroGaps,
    upstreamPolicyAligned,
    hotPathReports,
    failures,
  };
}
