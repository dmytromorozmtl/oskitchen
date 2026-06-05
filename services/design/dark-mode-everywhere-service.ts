import { auditDarkModeEverywhere } from "@/lib/design/dark-mode-everywhere-audit-policy";
import { DARK_MODE_EVERYWHERE_POLICY_ID } from "@/lib/design/dark-mode-everywhere-policy";

export type DarkModeEverywhereSnapshot = {
  policyId: typeof DARK_MODE_EVERYWHERE_POLICY_ID;
  moduleCount: number;
  roleModuleCount: number;
  passedModuleCount: number;
  healthScore: number;
  legacyDarkBridgePresent: boolean;
  passed: boolean;
  modules: ReturnType<typeof auditDarkModeEverywhere>["modules"];
};

export function loadDarkModeEverywhereSnapshot(): DarkModeEverywhereSnapshot {
  const report = auditDarkModeEverywhere();
  const passedModuleCount = report.modules.filter((m) => m.passed).length;
  const healthScore =
    report.modules.length === 0
      ? 0
      : Math.round((passedModuleCount / report.modules.length) * 100);

  return {
    policyId: DARK_MODE_EVERYWHERE_POLICY_ID,
    moduleCount: report.moduleCount,
    roleModuleCount: report.roleModuleCount,
    passedModuleCount,
    healthScore,
    legacyDarkBridgePresent: report.legacyDarkBridgePresent,
    passed: report.passed,
    modules: report.modules,
  };
}
