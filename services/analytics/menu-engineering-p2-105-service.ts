import {
  buildMenuEngineeringDemoReport,
  buildMenuEngineeringItems,
  buildMenuEngineeringReport,
  type MenuEngineeringReport,
} from "@/lib/analytics/menu-engineering-p2-105-operations";
import { MENU_ENGINEERING_P2_105_POLICY_ID } from "@/lib/analytics/menu-engineering-p2-105-policy";
import { getMenuEngineeringMatrix } from "@/services/analytics/menu-engineering-service";

export type MenuEngineeringSnapshot = MenuEngineeringReport & {
  policyId: typeof MENU_ENGINEERING_P2_105_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

const TARGET_MARGIN_PERCENT = 65;

export async function loadMenuEngineeringSnapshot(
  userId: string,
): Promise<MenuEngineeringSnapshot> {
  try {
    const matrix = await getMenuEngineeringMatrix(userId);

    if (matrix.length > 0) {
      const items = buildMenuEngineeringItems(matrix);
      const report = buildMenuEngineeringReport({
        items,
        targetMarginPercent: TARGET_MARGIN_PERCENT,
      });

      return {
        policyId: MENU_ENGINEERING_P2_105_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildMenuEngineeringDemoReport();

  return {
    policyId: MENU_ENGINEERING_P2_105_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
