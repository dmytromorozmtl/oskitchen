import { FloorPlanEditor } from "@/components/restaurant/floor-plan-editor";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getTablesForWorkspace } from "@/services/restaurant/table-service";

export const dynamic = "force-dynamic";

export default async function FloorPlansPage() {
  const { userId } = await getTenantActor();
  const tables = await getTablesForWorkspace(userId);

  return (
    <div className="p-4 md:p-6">
      <FloorPlanEditor tables={tables} />
    </div>
  );
}
