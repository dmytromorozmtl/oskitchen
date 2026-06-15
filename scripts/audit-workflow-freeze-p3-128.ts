/**
 * Audit workflow freeze policy (Blueprint P3-128).
 *
 * Usage:
 *   npm run audit:workflow-freeze-p3-128
 */
import {
  auditWorkflowFreeze,
  formatWorkflowFreezeAuditLines,
} from "@/lib/pm/workflow-freeze-p3-128-audit";
import {
  getCurrentWorkflowFreezeCounts,
  loadWorkflowFreezeRegistry,
  validateWorkflowFreezeRegistry,
} from "@/lib/pm/workflow-freeze-p3-128-operations";

function main(): void {
  const summary = auditWorkflowFreeze();
  const registry = loadWorkflowFreezeRegistry();
  const validation = validateWorkflowFreezeRegistry(registry);
  const current = getCurrentWorkflowFreezeCounts();

  console.log("");
  for (const line of formatWorkflowFreezeAuditLines(summary)) {
    console.log(line);
  }
  console.log(
    `Counts — workflows: ${current.githubWorkflows}/${validation.expectedMax.githubWorkflows}, scripts: ${current.scriptFiles}/${validation.expectedMax.scriptFiles}, npm: ${current.npmScripts}/${validation.expectedMax.npmScripts}`,
  );
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Workflow freeze audit OK");
}

main();
