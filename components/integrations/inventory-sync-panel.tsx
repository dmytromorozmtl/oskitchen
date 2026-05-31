"use client";

import {
  pullInventorySyncAction,
  pushAllInventorySyncAction,
  resolveInventoryConflictAction,
  saveInventorySyncSettingsAction,
} from "@/actions/integrations/inventory-sync";
import type { InventorySyncSettings, StoredInventoryConflict } from "@/lib/integrations/inventory-sync-settings";
import type { InventorySyncSnapshot } from "@/services/integrations/inventory-sync-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ConnectionRow = {
  id: string;
  provider: string;
  name: string;
  settings: InventorySyncSettings;
};

type Props = {
  snapshot: InventorySyncSnapshot;
  connections: ConnectionRow[];
  storedConflicts: StoredInventoryConflict[];
};

export function InventorySyncPanel({ snapshot, connections, storedConflicts }: Props) {
  const conflicts = storedConflicts.length > 0 ? storedConflicts : snapshot.conflicts.map((c) => ({
    id: c.id,
    connectionId: c.level.connectionId,
    provider: c.level.provider,
    externalProductId: c.level.externalProductId,
    externalVariantId: c.level.externalVariantId,
    mappedProductId: c.level.mappedProductId,
    productTitle: c.level.productTitle,
    sku: c.level.sku,
    kitchenQuantity: c.level.kitchenQuantity,
    channelQuantity: c.level.channelQuantity,
    detectedAt: snapshot.pulledAtIso,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Mapped SKUs</CardTitle>
            <p className="text-2xl font-semibold">{snapshot.levels.length}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In sync</CardTitle>
            <p className="text-2xl font-semibold">{snapshot.inSyncCount}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Conflicts</CardTitle>
            <p className="text-2xl font-semibold">{conflicts.length}</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Pull latest levels</CardTitle>
          <form action={pullInventorySyncAction}>
            <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
              Pull from channels
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last snapshot: {new Date(snapshot.pulledAtIso).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {connections.map((conn) => (
        <Card key={conn.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {conn.name} · {conn.provider}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={saveInventorySyncSettingsAction} className="grid gap-2 sm:grid-cols-3">
              <input type="hidden" name="connectionId" value={conn.id} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="enabled" defaultChecked={conn.settings.enabled} />
                Enabled
              </label>
              <select
                name="conflictResolution"
                defaultValue={conn.settings.conflictResolution}
                className="rounded-md border px-2 py-1.5 text-sm"
              >
                <option value="manual_review">Manual review</option>
                <option value="kitchen_wins">Kitchen wins</option>
                <option value="channel_wins">Channel wins</option>
              </select>
              <button type="submit" className="rounded-md border px-3 py-1.5 text-sm sm:w-fit">
                Save rules
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              <form action={pushAllInventorySyncAction}>
                <input type="hidden" name="connectionId" value={conn.id} />
                <input type="hidden" name="strategy" value="kitchen_wins" />
                <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
                  Push all (kitchen wins)
                </button>
              </form>
              <form action={pushAllInventorySyncAction}>
                <input type="hidden" name="connectionId" value={conn.id} />
                <input type="hidden" name="strategy" value="channel_wins" />
                <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                  Pull all (channel wins)
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conflict queue</CardTitle>
        </CardHeader>
        <CardContent>
          {conflicts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inventory conflicts — kitchen and channels match.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="pb-2 pr-3">Product</th>
                    <th className="pb-2 pr-3">Provider</th>
                    <th className="pb-2 pr-3">Kitchen</th>
                    <th className="pb-2 pr-3">Channel</th>
                    <th className="pb-2">Resolve</th>
                  </tr>
                </thead>
                <tbody>
                  {conflicts.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2 pr-3 font-medium">{row.productTitle}</td>
                      <td className="py-2 pr-3">{row.provider}</td>
                      <td className="py-2 pr-3">{row.kitchenQuantity}</td>
                      <td className="py-2 pr-3">{row.channelQuantity}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          <form action={resolveInventoryConflictAction}>
                            <input type="hidden" name="connectionId" value={row.connectionId} />
                            <input type="hidden" name="conflictId" value={row.id} />
                            <input type="hidden" name="strategy" value="kitchen_wins" />
                            <button type="submit" className="text-xs text-primary hover:underline">
                              Kitchen
                            </button>
                          </form>
                          <form action={resolveInventoryConflictAction}>
                            <input type="hidden" name="connectionId" value={row.connectionId} />
                            <input type="hidden" name="conflictId" value={row.id} />
                            <input type="hidden" name="strategy" value="channel_wins" />
                            <button type="submit" className="text-xs text-primary hover:underline">
                              Channel
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {snapshot.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
