import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PUBLIC_ROADMAP_P3_69_CANONICAL_PATH,
  PUBLIC_ROADMAP_P3_69_DOC,
  PUBLIC_ROADMAP_P3_69_NPM_SCRIPTS,
  PUBLIC_ROADMAP_P3_69_POLICY_ID,
  PUBLIC_ROADMAP_P3_69_PRIMARY_KEYWORD,
  PUBLIC_ROADMAP_P3_69_UPSTREAM_DOC,
  PUBLIC_ROADMAP_P3_69_WIRING_PATHS,
} from "@/lib/marketing/public-roadmap-p3-69-policy";
import { validatePublicRoadmapContract } from "@/lib/marketing/public-roadmap-p3-69-measurement";

export type PublicRoadmapP3_69AuditSummary = {
  policyId: typeof PUBLIC_ROADMAP_P3_69_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  contractValid: boolean;
  canonicalPathWired: boolean;
  npmScriptsWired: boolean;
  passed: boolean;
};

export function auditPublicRoadmapP3_69(
  root = process.cwd(),
): PublicRoadmapP3_69AuditSummary {
  const wiringComplete = PUBLIC_ROADMAP_P3_69_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PUBLIC_ROADMAP_P3_69_DOC))) {
    const source = readFileSync(join(root, PUBLIC_ROADMAP_P3_69_DOC), "utf8");
    docWired =
      source.includes(PUBLIC_ROADMAP_P3_69_POLICY_ID) &&
      source.includes(PUBLIC_ROADMAP_P3_69_CANONICAL_PATH) &&
      source.includes(PUBLIC_ROADMAP_P3_69_PRIMARY_KEYWORD) &&
      source.includes(PUBLIC_ROADMAP_P3_69_UPSTREAM_DOC);
  }

  const contract = validatePublicRoadmapContract(root);

  let npmScriptsWired = false;
  if (existsSync(join(root, "package.json"))) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    npmScriptsWired = PUBLIC_ROADMAP_P3_69_NPM_SCRIPTS.every((script) =>
      Boolean(pkg.scripts?.[script]),
    );
  }

  const passed =
    wiringComplete &&
    docWired &&
    contract.passed &&
    contract.pathsAligned &&
    npmScriptsWired;

  return {
    policyId: PUBLIC_ROADMAP_P3_69_POLICY_ID,
    wiringComplete,
    docWired,
    contractValid: contract.passed,
    canonicalPathWired: contract.pathsAligned,
    npmScriptsWired,
    passed,
  };
}

export function formatPublicRoadmapP3_69AuditLines(
  summary: PublicRoadmapP3_69AuditSummary,
): string[] {
  return [
    `Public roadmap audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${PUBLIC_ROADMAP_P3_69_DOC})`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Canonical /roadmap: ${summary.canonicalPathWired ? "yes" : "no"}`,
    `npm scripts: ${summary.npmScriptsWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
