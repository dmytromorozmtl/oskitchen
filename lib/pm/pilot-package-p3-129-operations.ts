import { readFileSync } from "node:fs";
import { join } from "node:path";

import { INTEGRATION_REGISTRY } from "@/lib/integrations/integration-registry";
import {
  PILOT_PACKAGE_CORE_MODULES,
  PILOT_PACKAGE_LIVE_INTEGRATIONS,
  PILOT_PACKAGE_POLICY_ID,
} from "@/lib/pm/pilot-package-p3-129-policy";

export type PilotPackageV1 = {
  version: string;
  policyId: typeof PILOT_PACKAGE_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  coreModules: Array<{
    id: string;
    path: string;
    maturity: string;
  }>;
  liveIntegrations: Array<{
    id: string;
    registryId: string;
    setupRoute: string;
    pilotRole: string;
  }>;
  goldenPath: string[];
};

export function loadPilotPackageV1(
  root = process.cwd(),
  artifactPath = "artifacts/pilot-package-v1.json",
): PilotPackageV1 {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as PilotPackageV1;
}

export function validatePilotPackageV1(pilotPackage: PilotPackageV1): {
  valid: boolean;
  policyIdMatches: boolean;
  coreModulesMatch: boolean;
  integrationsMatch: boolean;
  integrationsLiveInRegistry: boolean;
  goldenPathComplete: boolean;
} {
  const policyIdMatches = pilotPackage.policyId === PILOT_PACKAGE_POLICY_ID;

  const expectedModuleIds = PILOT_PACKAGE_CORE_MODULES.map((module) => module.id);
  const coreModulesMatch =
    pilotPackage.coreModules.length === expectedModuleIds.length &&
    expectedModuleIds.every((id, index) => pilotPackage.coreModules[index]?.id === id);

  const expectedIntegrationIds = PILOT_PACKAGE_LIVE_INTEGRATIONS.map(
    (integration) => integration.registryId,
  );
  const integrationsMatch =
    pilotPackage.liveIntegrations.length === expectedIntegrationIds.length &&
    expectedIntegrationIds.every(
      (id, index) => pilotPackage.liveIntegrations[index]?.registryId === id,
    );

  const integrationsLiveInRegistry = pilotPackage.liveIntegrations.every((integration) => {
    const entry = INTEGRATION_REGISTRY.find((row) => row.id === integration.registryId);
    return entry?.status === "LIVE";
  });

  const goldenPathComplete =
    pilotPackage.goldenPath.length >= 5 &&
    pilotPackage.goldenPath.includes("/dashboard/today") &&
    pilotPackage.goldenPath.includes("/dashboard/quick-start");

  const valid =
    policyIdMatches &&
    coreModulesMatch &&
    integrationsMatch &&
    integrationsLiveInRegistry &&
    goldenPathComplete;

  return {
    valid,
    policyIdMatches,
    coreModulesMatch,
    integrationsMatch,
    integrationsLiveInRegistry,
    goldenPathComplete,
  };
}
