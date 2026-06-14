import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT,
  GAP_CLOSURE_COMPLETE_P3_100_DOC,
  GAP_CLOSURE_COMPLETE_P3_100_EXECUTION_LOG,
  GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID,
  GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES,
  GAP_CLOSURE_COMPLETE_P3_100_TASK_ID,
  GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS,
  GAP_CLOSURE_COMPLETE_P3_100_TRACKER,
  GAP_CLOSURE_COMPLETE_P3_100_WIRING_PATHS,
} from "@/lib/gap-closure/gap-closure-complete-p3-100-policy";

export type GapClosureCompleteP3100AuditSummary = {
  policyId: typeof GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  trackerComplete: boolean;
  allTasksDone: boolean;
  taskCount: number;
  doneCount: number;
  finalTaskPresent: boolean;
  executionLogWired: boolean;
  artifactValid: boolean;
  passed: boolean;
  failures: string[];
};

function countByPrefix(tracker: Record<string, string>, prefix: string): number {
  return Object.keys(tracker).filter((key) => key.startsWith(prefix)).length;
}

export function auditGapClosureCompleteP3100(
  root = process.cwd(),
): GapClosureCompleteP3100AuditSummary {
  const failures: string[] = [];

  const wiringComplete = GAP_CLOSURE_COMPLETE_P3_100_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) failures.push("missing P3-100 wiring paths");

  let docWired = false;
  if (existsSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_DOC))) {
    const doc = readFileSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_DOC), "utf8");
    docWired =
      doc.includes(GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID) &&
      doc.includes("100/100") &&
      doc.toLowerCase().includes("gap closure");
  } else {
    failures.push(`missing doc: ${GAP_CLOSURE_COMPLETE_P3_100_DOC}`);
  }

  let tracker: Record<string, string> = {};
  let taskCount = 0;
  let doneCount = 0;
  let finalTaskPresent = false;
  let allTasksDone = false;
  let trackerComplete = false;

  const trackerPath = join(root, GAP_CLOSURE_COMPLETE_P3_100_TRACKER);
  if (existsSync(trackerPath)) {
    tracker = JSON.parse(readFileSync(trackerPath, "utf8")) as Record<string, string>;
    taskCount = Object.keys(tracker).length;
    doneCount = Object.values(tracker).filter((value) => value === "done").length;
    finalTaskPresent = tracker[GAP_CLOSURE_COMPLETE_P3_100_TASK_ID] === "done";
    allTasksDone = doneCount === taskCount && taskCount > 0;
    trackerComplete =
      taskCount === GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS &&
      allTasksDone &&
      finalTaskPresent;

    if (taskCount !== GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS) {
      failures.push(`tracker has ${taskCount} tasks, expected ${GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS}`);
    }
    if (!allTasksDone) failures.push("not all tracker entries are done");
    if (!finalTaskPresent) failures.push(`missing ${GAP_CLOSURE_COMPLETE_P3_100_TASK_ID}`);
    if (countByPrefix(tracker, "p0-") !== GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES.p0.count) {
      failures.push("P0 task count mismatch");
    }
    if (countByPrefix(tracker, "p1-") !== GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES.p1.count) {
      failures.push("P1 task count mismatch");
    }
    if (countByPrefix(tracker, "p2-") !== GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES.p2.count) {
      failures.push("P2 task count mismatch");
    }
    if (countByPrefix(tracker, "p3-") !== GAP_CLOSURE_COMPLETE_P3_100_PRIORITY_RANGES.p3.count) {
      failures.push("P3 task count mismatch");
    }
  } else {
    failures.push(`missing tracker: ${GAP_CLOSURE_COMPLETE_P3_100_TRACKER}`);
  }

  let executionLogWired = false;
  if (existsSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_EXECUTION_LOG))) {
    const log = readFileSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_EXECUTION_LOG), "utf8");
    executionLogWired = log.includes("Cycle: 100") && log.includes("P3-100");
  }

  let artifactValid = false;
  if (existsSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT))) {
    const artifact = JSON.parse(readFileSync(join(root, GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT), "utf8")) as {
      policyId?: string;
      status?: string;
      totalTasks?: number;
      doneTasks?: number;
    };
    artifactValid =
      artifact.policyId === GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID &&
      artifact.status === "COMPLETE" &&
      artifact.totalTasks === GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS &&
      artifact.doneTasks === GAP_CLOSURE_COMPLETE_P3_100_TOTAL_TASKS;
    if (!artifactValid) failures.push("artifact validation failed");
  } else {
    failures.push(`missing artifact: ${GAP_CLOSURE_COMPLETE_P3_100_ARTIFACT}`);
  }

  const passed =
    failures.length === 0 &&
    wiringComplete &&
    docWired &&
    trackerComplete &&
    executionLogWired &&
    artifactValid;

  return {
    policyId: GAP_CLOSURE_COMPLETE_P3_100_POLICY_ID,
    wiringComplete,
    docWired,
    trackerComplete,
    allTasksDone,
    taskCount,
    doneCount,
    finalTaskPresent,
    executionLogWired,
    artifactValid,
    passed,
    failures,
  };
}

export function formatGapClosureCompleteP3100AuditLines(
  summary: GapClosureCompleteP3100AuditSummary,
): string[] {
  return [
    `Gap closure complete (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Tracker: ${summary.doneCount}/${summary.taskCount} done`,
    `Final task: ${summary.finalTaskPresent ? "yes" : "no"}`,
    `Execution log cycle 100: ${summary.executionLogWired ? "yes" : "no"}`,
    `Artifact: ${summary.artifactValid ? "valid" : "invalid"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
