import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  WORKFLOW_FREEZE_FROZEN_SURFACES,
  WORKFLOW_FREEZE_POLICY_ID,
  type WorkflowFreezeSurface,
} from "@/lib/pm/workflow-freeze-p3-128-policy";

export type WorkflowFreezeBaselineCounts = {
  githubWorkflows: number;
  scriptFiles: number;
  npmScripts: number;
};

export type WorkflowFreezeApprovedAddition = {
  id: string;
  surface: WorkflowFreezeSurface;
  path: string;
  approvedAt: string;
  approvedBy: string;
  blueprintTask: string | null;
  reason: string;
};

export type WorkflowFreezeRegistry = {
  version: string;
  policyId: typeof WORKFLOW_FREEZE_POLICY_ID;
  frozenSince: string;
  honestyNote: string;
  baselineCounts: WorkflowFreezeBaselineCounts;
  approvedAdditions: WorkflowFreezeApprovedAddition[];
};

export function countGithubWorkflows(root = process.cwd()): number {
  const dir = join(root, ".github/workflows");
  return readdirSync(dir).filter((name) => name.endsWith(".yml") || name.endsWith(".yaml")).length;
}

export function countScriptFiles(root = process.cwd()): number {
  const scriptsDir = join(root, "scripts");
  let count = 0;

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.endsWith(".ts") || entry.endsWith(".js") || entry.endsWith(".mjs")) {
        count += 1;
      }
    }
  }

  walk(scriptsDir);
  return count;
}

export function countNpmScripts(root = process.cwd()): number {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return Object.keys(pkg.scripts ?? {}).length;
}

export function loadWorkflowFreezeRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/workflow-freeze-registry.json",
): WorkflowFreezeRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as WorkflowFreezeRegistry;
}

export function countApprovedAdditionsBySurface(
  registry: WorkflowFreezeRegistry,
): Record<WorkflowFreezeSurface, number> {
  const counts = Object.fromEntries(
    WORKFLOW_FREEZE_FROZEN_SURFACES.map((surface) => [surface, 0]),
  ) as Record<WorkflowFreezeSurface, number>;

  for (const addition of registry.approvedAdditions) {
    counts[addition.surface] += 1;
  }

  return counts;
}

export function getCurrentWorkflowFreezeCounts(root = process.cwd()): WorkflowFreezeBaselineCounts {
  return {
    githubWorkflows: countGithubWorkflows(root),
    scriptFiles: countScriptFiles(root),
    npmScripts: countNpmScripts(root),
  };
}

export function validateWorkflowFreezeRegistry(
  registry: WorkflowFreezeRegistry,
  root = process.cwd(),
): {
  valid: boolean;
  policyIdMatches: boolean;
  countsWithinBaseline: boolean;
  currentCounts: WorkflowFreezeBaselineCounts;
  expectedMax: WorkflowFreezeBaselineCounts;
} {
  const policyIdMatches = registry.policyId === WORKFLOW_FREEZE_POLICY_ID;
  const currentCounts = getCurrentWorkflowFreezeCounts(root);
  const approved = countApprovedAdditionsBySurface(registry);

  const expectedMax: WorkflowFreezeBaselineCounts = {
    githubWorkflows: registry.baselineCounts.githubWorkflows + approved.github_workflow,
    scriptFiles: registry.baselineCounts.scriptFiles + approved.script_file,
    npmScripts: registry.baselineCounts.npmScripts + approved.npm_script,
  };

  const countsWithinBaseline =
    currentCounts.githubWorkflows <= expectedMax.githubWorkflows &&
    currentCounts.scriptFiles <= expectedMax.scriptFiles &&
    currentCounts.npmScripts <= expectedMax.npmScripts;

  const valid = policyIdMatches && countsWithinBaseline;

  return {
    valid,
    policyIdMatches,
    countsWithinBaseline,
    currentCounts,
    expectedMax,
  };
}
