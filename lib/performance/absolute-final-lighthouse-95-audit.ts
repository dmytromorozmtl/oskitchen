import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID,
  LIGHTHOUSE_95_DOC_PATH,
  LIGHTHOUSE_95_MIN_SCORE,
  LIGHTHOUSE_95_WIRING_PATHS,
} from "@/lib/performance/absolute-final-lighthouse-95-policy";
import {
  LIGHTHOUSE_CWV_CONFIG_PATH,
  LIGHTHOUSE_CWV_FCP_MAX_MS,
  LIGHTHOUSE_CWV_LCP_MAX_MS,
  LIGHTHOUSE_CWV_WORKFLOW_PATH,
} from "@/lib/performance/lighthouse-core-web-vitals-policy";

export type Lighthouse95Audit = {
  ok: boolean;
  failures: string[];
};

export function auditLighthouse95Wiring(root = process.cwd()): Lighthouse95Audit {
  const failures: string[] = [];

  for (const rel of LIGHTHOUSE_95_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const lhciConfig = readFileSync(join(root, LIGHTHOUSE_CWV_CONFIG_PATH), "utf8");
  if (!lhciConfig.includes("categories:performance")) {
    failures.push("LHCI config missing categories:performance assertion");
  }
  if (!lhciConfig.includes(String(LIGHTHOUSE_95_MIN_SCORE))) {
    failures.push(`LHCI config missing Lighthouse ${LIGHTHOUSE_95_MIN_SCORE * 100}+ minScore`);
  }
  if (!lhciConfig.includes('"error"') || !lhciConfig.includes("minScore: 0.95")) {
    failures.push("LHCI performance category must error at minScore 0.95");
  }
  if (!lhciConfig.includes(String(LIGHTHOUSE_CWV_FCP_MAX_MS))) {
    failures.push("LHCI config missing FCP ceiling");
  }
  if (!lhciConfig.includes(String(LIGHTHOUSE_CWV_LCP_MAX_MS))) {
    failures.push("LHCI config missing LCP ceiling");
  }

  const workflow = readFileSync(join(root, LIGHTHOUSE_CWV_WORKFLOW_PATH), "utf8");
  if (!workflow.includes(LIGHTHOUSE_CWV_CONFIG_PATH)) {
    failures.push("lighthouse workflow missing core web vitals config");
  }

  const docSource = readFileSync(join(root, LIGHTHOUSE_95_DOC_PATH), "utf8");
  if (!docSource.includes("Lighthouse 95+")) {
    failures.push("performance review doc missing Lighthouse 95+ target");
  }
  if (!docSource.includes(LIGHTHOUSE_95_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("performance review doc missing Lighthouse 95 policy id");
  }

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.["lighthouse:core-web-vitals"]) {
    failures.push("package.json missing lighthouse:core-web-vitals script");
  }

  return { ok: failures.length === 0, failures };
}
