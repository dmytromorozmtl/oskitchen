import { InventoryManagerClient } from "@/components/inventory/inventory-manager-client";
import { loadInventoryManagerSnapshot } from "@/services/ai/inventory-manager";

export async function InventoryManagerAsyncSection({ userId }: { userId: string }) {
  const snapshot = await loadInventoryManagerSnapshot(userId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <InventoryManagerClient snapshot={snapshot} />
    </div>
  );
}
