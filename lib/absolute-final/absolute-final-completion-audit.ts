import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ABSOLUTE_FINAL_BLOCKED_TASK_IDS,
  ABSOLUTE_FINAL_COMPLETION_DOC_PATH,
  ABSOLUTE_FINAL_COMPLETION_POLICY_ID,
  ABSOLUTE_FINAL_FINAL_AUDIT_TASKS,
  ABSOLUTE_FINAL_TASK_TOTAL,
  ABSOLUTE_FINAL_TRACKER_PATH,
  ABSOLUTE_FINAL_WIRING_PATHS,
  isAbsoluteFinalTaskKey,
} from "@/lib/absolute-final/absolute-final-completion-policy";

export type AbsoluteFinalCompletionAudit = {
  ok: boolean;
  failures: string[];
  doneCount: number;
  blockedCount: number;
};

export function auditAbsoluteFinalCompletion(root = process.cwd()): AbsoluteFinalCompletionAudit {
  const failures: string[] = [];

  for (const rel of ABSOLUTE_FINAL_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const tracker = JSON.parse(
    readFileSync(join(root, ABSOLUTE_FINAL_TRACKER_PATH), "utf8"),
  ) as Record<string, string>;

  const taskKeys = Object.keys(tracker).filter(isAbsoluteFinalTaskKey);
  const doneCount = taskKeys.filter((k) => tracker[k] === "done").length;
  const blockedCount = taskKeys.filter((k) => tracker[k] === "blocked").length;

  if (doneCount + blockedCount !== ABSOLUTE_FINAL_TASK_TOTAL) {
    failures.push(
      `expected ${ABSOLUTE_FINAL_TASK_TOTAL} task outcomes (done+blocked), got ${doneCount + blockedCount}`,
    );
  }

  if (doneCount !== ABSOLUTE_FINAL_TASK_TOTAL - ABSOLUTE_FINAL_BLOCKED_TASK_IDS.length) {
    failures.push(`expected ${ABSOLUTE_FINAL_TASK_TOTAL - ABSOLUTE_FINAL_BLOCKED_TASK_IDS.length} done tasks`);
  }

  for (const blockedId of ABSOLUTE_FINAL_BLOCKED_TASK_IDS) {
    if (tracker[blockedId] !== "blocked") {
      failures.push(`expected blocked task: ${blockedId}`);
    }
  }

  if (tracker["151-absolute-final-complete"] !== "done") {
    failures.push("expected 151-absolute-final-complete meta key done");
  }

  for (const taskId of ABSOLUTE_FINAL_FINAL_AUDIT_TASKS) {
    if (tracker[taskId] !== "done") {
      failures.push(`final audit task not done: ${taskId}`);
    }
  }

  const docSource = readFileSync(join(root, ABSOLUTE_FINAL_COMPLETION_DOC_PATH), "utf8");
  if (!docSource.includes(ABSOLUTE_FINAL_COMPLETION_POLICY_ID)) {
    failures.push("absolute final report missing policy id");
  }
  if (!docSource.includes("100/100")) {
    failures.push("absolute final report missing 100/100 score marker");
  }
  if (!docSource.includes("149/150")) {
    failures.push("absolute final report missing 149/150 task count");
  }
  if (!docSource.includes("Sentry")) {
    failures.push("absolute final report missing Sentry blocker note");
  }

  const executionLog = readFileSync(join(root, "artifacts/execution-log.txt"), "utf8");
  if (!executionLog.includes("Task: 150")) {
    failures.push("execution log missing cycle 150 entry");
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.["test:ci:absolute-final-completion:cert"]) {
    failures.push("package.json missing absolute final completion cert script");
  }

  return {
    ok: failures.length === 0,
    failures,
    doneCount,
    blockedCount,
  };
}
