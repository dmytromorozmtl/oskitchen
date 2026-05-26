import { getTenantActor } from '@/lib/scope/cached-tenant';
import { getOpenTabs } from '@/services/pos/tab-service';
import { TabPanel } from '@/components/pos/tab-panel';

export const dynamic = 'force-dynamic';

export default async function PosTabsPage() {
  const { userId } = await getTenantActor();
  const tabs = await getOpenTabs(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bar & table tabs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Open tabs, quick-add items, and close with tax and tip.
        </p>
      </div>
      <TabPanel tabs={tabs} />
    </div>
  );
}
