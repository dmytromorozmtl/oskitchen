import { auditMobileFirstRedesign } from "@/lib/design/mobile-first-redesign-audit-policy";
import { mobileFirstRedesignSummary } from "@/lib/design/mobile-first-redesign-patterns";
import { MOBILE_FIRST_REDESIGN_POLICY_ID } from "@/lib/design/mobile-first-redesign-policy";

export type MobileFirstRedesignSnapshot = {
  policyId: typeof MOBILE_FIRST_REDESIGN_POLICY_ID;
  viewportPx: number;
  touchFloorPx: number;
  swipeMinPx: number;
  moduleCount: number;
  passedModuleCount: number;
  healthScore: number;
  passed: boolean;
  modules: ReturnType<typeof auditMobileFirstRedesign>["modules"];
};

export function loadMobileFirstRedesignSnapshot(): MobileFirstRedesignSnapshot {
  const summary = mobileFirstRedesignSummary();
  const report = auditMobileFirstRedesign();
  const passedModuleCount = report.modules.filter((m) => m.passed).length;
  const healthScore =
    report.modules.length === 0
      ? 0
      : Math.round((passedModuleCount / report.modules.length) * 100);

  return {
    policyId: MOBILE_FIRST_REDESIGN_POLICY_ID,
    viewportPx: summary.viewportPx,
    touchFloorPx: summary.touchFloorPx,
    swipeMinPx: summary.swipeMinPx,
    moduleCount: report.modules.length,
    passedModuleCount,
    healthScore,
    passed: report.passed,
    modules: report.modules,
  };
}
