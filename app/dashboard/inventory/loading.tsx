import { InventorySkeleton } from "@/components/dashboard/inventory-skeleton";
import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <InventorySkeleton />
    </PageShell>
  );
}
