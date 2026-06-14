import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  evaluateMaintenanceModePanelPerfBudget,
  maintenanceModePanelPerfBudgetPass,
  MAINTENANCE_MODE_PANEL_COMPONENT_PATH,
  MAINTENANCE_MODE_PANEL_CLS_MAX,
  MAINTENANCE_MODE_PANEL_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH,
  MAINTENANCE_MODE_PANEL_PERF_PATHS,
  MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE,
  MAINTENANCE_MODE_PANEL_TBT_MAX_MS,
  MAINTENANCE_MODE_PANEL_TEST_ID,
  type MaintenanceModePanelPerfMetrics,
} from "@/lib/performance/maintenance-mode-panel-perf-budget-policy";

export type MaintenanceModePanelPerfBudgetContractValidation = {
  passed: boolean;
  configPresent: boolean;
  pathCount: number;
  panelTestIdWired: boolean;
  platformSectionsLazyLoaded: boolean;
  fcpMaxMs: number;
  lcpMaxMs: number;
  clsMax: number;
  tbtMaxMs: number;
  performanceMinScore: number;
  failures: string[];
};

export function validateMaintenanceModePanelPerfBudgetContract(
  root = process.cwd(),
): MaintenanceModePanelPerfBudgetContractValidation {
  const failures: string[] = [];

  const configPath = join(root, MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH);
  const configPresent = existsSync(configPath);
  if (!configPresent) {
    failures.push(`missing LHCI config: ${MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH}`);
  } else {
    const config = readFileSync(configPath, "utf8");
    if (!config.includes(`maxNumericValue: ${MAINTENANCE_MODE_PANEL_FCP_MAX_MS}`)) {
      failures.push(`LHCI config missing FCP ${MAINTENANCE_MODE_PANEL_FCP_MAX_MS}ms threshold`);
    }
    if (!config.includes(`maxNumericValue: ${MAINTENANCE_MODE_PANEL_LCP_MAX_MS}`)) {
      failures.push(`LHCI config missing LCP ${MAINTENANCE_MODE_PANEL_LCP_MAX_MS}ms threshold`);
    }
    if (!config.includes(`maxNumericValue: ${MAINTENANCE_MODE_PANEL_CLS_MAX}`)) {
      failures.push(`LHCI config missing CLS ${MAINTENANCE_MODE_PANEL_CLS_MAX} threshold`);
    }
    if (!config.includes(`maxNumericValue: ${MAINTENANCE_MODE_PANEL_TBT_MAX_MS}`)) {
      failures.push(`LHCI config missing TBT ${MAINTENANCE_MODE_PANEL_TBT_MAX_MS}ms threshold`);
    }
    if (!config.includes(`minScore: ${MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE}`)) {
      failures.push(
        `LHCI config missing performance minScore ${MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE}`,
      );
    }
    for (const path of MAINTENANCE_MODE_PANEL_PERF_PATHS) {
      if (!config.includes(path)) {
        failures.push(`LHCI config missing host path: ${path}`);
      }
    }
  }

  let panelTestIdWired = false;
  const panelPath = join(root, MAINTENANCE_MODE_PANEL_COMPONENT_PATH);
  if (!existsSync(panelPath)) {
    failures.push(`missing panel component: ${MAINTENANCE_MODE_PANEL_COMPONENT_PATH}`);
  } else {
    const panel = readFileSync(panelPath, "utf8");
    panelTestIdWired = panel.includes(`data-testid="${MAINTENANCE_MODE_PANEL_TEST_ID}"`);
    if (!panelTestIdWired) {
      failures.push(`panel missing data-testid="${MAINTENANCE_MODE_PANEL_TEST_ID}"`);
    }
    if (!panel.includes("aria-hidden")) {
      failures.push("panel decorative icon missing aria-hidden");
    }
  }

  let platformSectionsLazyLoaded = false;
  const platformSectionsPath = join(
    root,
    "components/dashboard/maintenance/platform/maintenance-platform-sections.tsx",
  );
  if (existsSync(platformSectionsPath)) {
    const platformSections = readFileSync(platformSectionsPath, "utf8");
    platformSectionsLazyLoaded =
      platformSections.includes("next/dynamic") &&
      platformSections.includes("MaintenanceLinearPathPanel");
  } else {
    failures.push("missing maintenance-platform-sections.tsx");
  }

  return {
    passed: failures.length === 0,
    configPresent,
    pathCount: MAINTENANCE_MODE_PANEL_PERF_PATHS.length,
    panelTestIdWired,
    platformSectionsLazyLoaded,
    fcpMaxMs: MAINTENANCE_MODE_PANEL_FCP_MAX_MS,
    lcpMaxMs: MAINTENANCE_MODE_PANEL_LCP_MAX_MS,
    clsMax: MAINTENANCE_MODE_PANEL_CLS_MAX,
    tbtMaxMs: MAINTENANCE_MODE_PANEL_TBT_MAX_MS,
    performanceMinScore: MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE,
    failures,
  };
}

export function evaluateMaintenanceModePanelPerfBudgetMetrics(
  metrics: MaintenanceModePanelPerfMetrics,
): {
  passed: boolean;
  violations: ReturnType<typeof evaluateMaintenanceModePanelPerfBudget>;
} {
  const violations = evaluateMaintenanceModePanelPerfBudget(metrics);
  return { passed: maintenanceModePanelPerfBudgetPass(metrics), violations };
}
