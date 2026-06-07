import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
  QA_FULL_COVERAGE_SLOTS,
  type QaFullCoverageSlot,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

export type QaFullCoverageAudit = {
  ok: boolean;
  failures: string[];
  slot?: QaFullCoverageSlot;
};

export function auditQaFullCoverageSlot(
  taskNumber: number,
  root = process.cwd(),
): QaFullCoverageAudit {
  const failures: string[] = [];
  const slot = getQaFullCoverageSlot(taskNumber);
  if (!slot) {
    return { ok: false, failures: [`unknown QA slot task ${taskNumber}`] };
  }

  if (!existsSync(join(root, slot.baseCertTest))) {
    failures.push(`missing base cert test: ${slot.baseCertTest}`);
  }

  if (!existsSync(join(root, slot.qaTest))) {
    failures.push(`missing QA test: ${slot.qaTest}`);
  } else {
    const qaSource = readFileSync(join(root, slot.qaTest), "utf8");
    if (!qaSource.includes(`Absolute Final Task ${taskNumber}`)) {
      failures.push(`QA test missing task ${taskNumber} marker`);
    }
    if (!qaSource.includes(`feature ${slot.featureTaskNumber}`)) {
      failures.push(`QA test missing feature ${slot.featureTaskNumber} marker`);
    }
    if (!qaSource.includes(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID)) {
      failures.push("QA test missing policy id reference");
    }
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.[slot.ciCertScript]) {
    failures.push(`missing CI cert script: ${slot.ciCertScript}`);
  }

  return { ok: failures.length === 0, failures, slot };
}

export function auditQaFullCoverageRegistry(root = process.cwd()): QaFullCoverageAudit {
  const failures: string[] = [];

  if (QA_FULL_COVERAGE_SLOTS.length !== 15) {
    failures.push(`expected 15 QA slots, got ${QA_FULL_COVERAGE_SLOTS.length}`);
  }

  const policySource = readFileSync(
    join(root, "lib/qa/absolute-final-qa-full-coverage-policy.ts"),
    "utf8",
  );
  if (!policySource.includes(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("policy missing policy id");
  }

  for (const slot of QA_FULL_COVERAGE_SLOTS) {
    if (slot.taskNumber !== slot.featureTaskNumber + 15) {
      failures.push(
        `slot ${slot.taskNumber} feature mapping off: feature ${slot.featureTaskNumber}`,
      );
    }
  }

  return { ok: failures.length === 0, failures };
}
