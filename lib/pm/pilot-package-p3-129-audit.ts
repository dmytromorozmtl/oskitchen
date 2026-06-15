import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadPilotPackageV1,
  validatePilotPackageV1,
} from "@/lib/pm/pilot-package-p3-129-operations";
import {
  PILOT_PACKAGE_CORE_MODULES,
  PILOT_PACKAGE_DOC,
  PILOT_PACKAGE_HONESTY_MARKERS,
  PILOT_PACKAGE_INTEGRATION_REGISTRY,
  PILOT_PACKAGE_LIVE_INTEGRATIONS,
  PILOT_PACKAGE_POLICY_ID,
  PILOT_PACKAGE_RELATED_DOCS,
  PILOT_PACKAGE_WIRING_PATHS,
} from "@/lib/pm/pilot-package-p3-129-policy";

export type PilotPackageAuditSummary = {
  policyId: typeof PILOT_PACKAGE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  artifactValid: boolean;
  routesWired: boolean;
  registryWired: boolean;
  relatedDocsReferenced: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditPilotPackage(root = process.cwd()): PilotPackageAuditSummary {
  const wiringComplete = PILOT_PACKAGE_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  let relatedDocsReferenced = false;

  if (existsSync(join(root, PILOT_PACKAGE_DOC))) {
    const source = readFileSync(join(root, PILOT_PACKAGE_DOC), "utf8");
    docWired =
      PILOT_PACKAGE_CORE_MODULES.every(
        (module) => source.includes(module.path) && source.includes(module.id),
      ) &&
      PILOT_PACKAGE_LIVE_INTEGRATIONS.every(
        (integration) =>
          source.includes(integration.registryId) && source.includes(integration.setupRoute),
      );
    relatedDocsReferenced = PILOT_PACKAGE_RELATED_DOCS.every((doc) => source.includes(doc));
  }

  let artifactValid = false;
  if (existsSync(join(root, "artifacts/pilot-package-v1.json"))) {
    const pilotPackage = loadPilotPackageV1(root);
    artifactValid = validatePilotPackageV1(pilotPackage).valid;
  }

  const routesWired = PILOT_PACKAGE_CORE_MODULES.every((module) => {
    if (!existsSync(join(root, module.pagePath))) return false;
    const source = readFileSync(join(root, module.pagePath), "utf8");
    return source.length > 0;
  });

  let registryWired = false;
  if (existsSync(join(root, PILOT_PACKAGE_INTEGRATION_REGISTRY))) {
    const source = readFileSync(join(root, PILOT_PACKAGE_INTEGRATION_REGISTRY), "utf8");
    registryWired = PILOT_PACKAGE_LIVE_INTEGRATIONS.every((integration) =>
      source.includes(`id: "${integration.registryId}"`),
    );
  }

  const combinedSources = [PILOT_PACKAGE_DOC, "artifacts/pilot-package-v1.json"]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = PILOT_PACKAGE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    artifactValid &&
    routesWired &&
    registryWired &&
    relatedDocsReferenced &&
    honestyMarkersPresent;

  return {
    policyId: PILOT_PACKAGE_POLICY_ID,
    wiringComplete,
    docWired,
    artifactValid,
    routesWired,
    registryWired,
    relatedDocsReferenced,
    honestyMarkersPresent,
    passed,
  };
}

export function formatPilotPackageAuditLines(summary: PilotPackageAuditSummary): string[] {
  return [
    `Pilot package v1 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${PILOT_PACKAGE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Artifact valid: ${summary.artifactValid ? "yes" : "no"}`,
    `Routes wired: ${summary.routesWired ? "yes" : "no"}`,
    `Integration registry: ${summary.registryWired ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
