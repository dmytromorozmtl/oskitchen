import { getTenantActor } from '@/lib/scope/cached-tenant';
import { getTablesForWorkspace } from '@/services/restaurant/table-service';
import { FloorPlan } from '@/components/restaurant/floor-plan';

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  const { userId } = await getTenantActor();
  const tables = await getTablesForWorkspace(userId);

  return <FloorPlan tables={tables} />;
}
