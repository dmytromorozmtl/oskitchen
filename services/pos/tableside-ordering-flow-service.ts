import {
  assessTablesideOrderingReadiness,
  TABLESIDE_ORDERING_FLOW_POLICY_ID,
  type TablesideOrderingReadiness,
} from "@/lib/pos/tableside-ordering-flow-policy";
import { loadHandheldOrderingBootstrap } from "@/services/pos/handheld-ordering-service";

export type TablesideOrderingFlowModel = {
  policyId: typeof TABLESIDE_ORDERING_FLOW_POLICY_ID;
  readiness: TablesideOrderingReadiness;
};

export async function loadTablesideOrderingFlowModel(
  userId: string,
): Promise<TablesideOrderingFlowModel> {
  const boot = await loadHandheldOrderingBootstrap(userId);

  return {
    policyId: TABLESIDE_ORDERING_FLOW_POLICY_ID,
    readiness: assessTablesideOrderingReadiness({
      tableCount: boot.tables.length,
      registerCount: boot.registers.length,
      staffCount: boot.staff.length,
      productCount: boot.products.length,
    }),
  };
}
