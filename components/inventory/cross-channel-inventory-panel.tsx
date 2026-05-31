"use client";

import { useMemo, useState } from "react";

import {
  pullCrossChannelInventoryAction,
  pushCrossChannelInventoryAction,
  resolveCrossChannelConflictAction,
  saveCrossChannelInventorySettingsAction,
} from "@/actions/inventory/cross-channel-inventory";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CrossChannelInventorySettings, CrossChannelInventoryProvider } from "@/lib/inventory/cross-channel-inventory-settings";
import type {
  CrossChannelConflict,
  CrossChannelLevel,
  CrossChannelLowStockAlert,
  CrossChannelSyncSnapshot,
} from "@/services/inventory/cross-channel-inventory-sync";

const CHANNEL_TABS: Array<{ id: "ALL" | CrossChannelInventoryProvider; label: string }> = [
  { id: "ALL", label: "All channels" },
  { id: "POS", label: "POS" },
  { id: "SHOPIFY", label: "Shopify" },
  { id: "WOOCOMMERCE", label: "WooCommerce" },
  { id: "DOORDASH", label: "DoorDash" },
];

type ConnectionRow = {
  id: string;
  provider: string;
  name: string;
  settings: CrossChannelInventorySettings;
};

type Props = {
  snapshot: CrossChannelSyncSnapshot;
  connections: ConnectionRow[];
  canManage: boolean;
};

function channelBadgeVariant(
  provider: CrossChannelInventoryProvider,
): "default" | "secondary" | "outline" {
  if (provider === "POS") return "default";
  if (provider === "DOORDASH") return "secondary";
  return "outline";
}

function syncStatusForLevel(level: CrossChannelLevel): "synced" | "conflict" | "partial" {
  const external = level.channels.filter((c) => c.provider !== "POS");
  if (external.length === 0) return "partial";
  const allMatch = external.every((c) => c.quantity === level.masterQuantity);
  return allMatch ? "synced" : "conflict";
}

export function CrossChannelInventoryPanel({ snapshot, connections, canManage }: Props) {
  const [activeChannel, setActiveChannel] = useState<"ALL" | CrossChannelInventoryProvider>("ALL");

  const filteredLevels = useMemo(() => {
    if (activeChannel === "ALL") return snapshot.levels;
    return snapshot.levels.filter((level) =>
      level.channels.some((c) => c.provider === activeChannel),
    );
  }, [activeChannel, snapshot.levels]);

  const filteredConflicts = useMemo(() => {
    if (activeChannel === "ALL") return snapshot.conflicts;
    return snapshot.conflicts.filter((c) => c.channel.provider === activeChannel);
  }, [activeChannel, snapshot.conflicts]);

  return (
    <div className="space-y-4" data-testid="cross-channel-inventory-panel">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Products tracked" value={snapshot.levels.length} />
        <SummaryCard label="In sync" value={snapshot.inSyncCount} />
        <SummaryCard label="Conflicts" value={snapshot.conflicts.length} tone="warn" />
        <SummaryCard label="Low stock" value={snapshot.lowStockAlerts.length} tone="warn" />
        <SummaryCard label="Reservations" value={snapshot.reservations.length} />
      </div>

      <div className="flex flex-wrap gap-2">
        {CHANNEL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`cross-channel-tab-${tab.id}`}
            onClick={() => setActiveChannel(tab.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeChannel === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Sync snapshot</CardTitle>
          {canManage ? (
            <form action={pullCrossChannelInventoryAction}>
              <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                Pull all channels
              </button>
            </form>
          ) : (
            <span className="text-xs text-muted-foreground">Read-only — integrations.manage required</span>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Last pull: {new Date(snapshot.pulledAtIso).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel levels</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {filteredLevels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No mapped products for this channel yet — connect integrations and map catalog items.
            </p>
          ) : (
            <table className="min-w-full text-sm" data-testid="cross-channel-levels-table">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">Master (POS)</th>
                  <th className="pb-2 pr-3">Available</th>
                  <th className="pb-2 pr-3">Reserved</th>
                  <th className="pb-2 pr-3">Shopify</th>
                  <th className="pb-2 pr-3">Woo</th>
                  <th className="pb-2 pr-3">DoorDash</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLevels.map((level) => (
                  <LevelRow key={level.productId} level={level} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {connections.length > 0 ? (
        <div className="space-y-3">
          {connections.map((conn) => (
            <Card key={conn.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {conn.name} · {conn.provider}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canManage ? (
                  <>
                    <form
                      action={saveCrossChannelInventorySettingsAction}
                      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      <input type="hidden" name="connectionId" value={conn.id} />
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="enabled" defaultChecked={conn.settings.enabled} />
                        Sync enabled
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
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="autoPushOnChange"
                          defaultChecked={conn.settings.autoPushOnChange}
                        />
                        Auto-push on change
                      </label>
                      <input
                        type="number"
                        name="lowStockThreshold"
                        min={0}
                        defaultValue={conn.settings.lowStockThreshold}
                        className="rounded-md border px-2 py-1.5 text-sm"
                        aria-label="Low stock threshold"
                      />
                      <button type="submit" className="rounded-md border px-3 py-1.5 text-sm sm:w-fit">
                        Save rules
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      <form action={pushCrossChannelInventoryAction}>
                        <input type="hidden" name="connectionId" value={conn.id} />
                        <input type="hidden" name="strategy" value="kitchen_wins" />
                        <button
                          type="submit"
                          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                        >
                          Push (kitchen wins)
                        </button>
                      </form>
                      <form action={pushCrossChannelInventoryAction}>
                        <input type="hidden" name="connectionId" value={conn.id} />
                        <input type="hidden" name="strategy" value="channel_wins" />
                        <button type="submit" className="rounded-md border px-3 py-1.5 text-sm">
                          Pull (channel wins)
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Conflict resolution requires integrations.manage permission.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conflict queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ConflictTable conflicts={filteredConflicts} canManage={canManage} />
        </CardContent>
      </Card>

      {snapshot.lowStockAlerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low-stock alerts</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-2 pr-3">Product</th>
                  <th className="pb-2 pr-3">Available</th>
                  <th className="pb-2 pr-3">Threshold</th>
                  <th className="pb-2">Channels</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.lowStockAlerts.map((alert) => (
                  <LowStockRow key={alert.id} alert={alert} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <ul className="space-y-1 text-xs text-muted-foreground">
        {snapshot.notes.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warn";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums",
            tone === "warn" && value > 0 && "text-amber-700 dark:text-amber-400",
          )}
        >
          {value}
        </p>
      </CardHeader>
    </Card>
  );
}

function qtyForProvider(level: CrossChannelLevel, provider: CrossChannelInventoryProvider): string {
  const channel = level.channels.find((c) => c.provider === provider);
  return channel != null ? String(channel.quantity) : "—";
}

function LevelRow({ level }: { level: CrossChannelLevel }) {
  const status = syncStatusForLevel(level);
  return (
    <tr className="border-t" data-testid={`cross-channel-level-${level.productId}`}>
      <td className="py-2 pr-3 font-medium">{level.productTitle}</td>
      <td className="py-2 pr-3 tabular-nums">{level.masterQuantity}</td>
      <td className="py-2 pr-3 tabular-nums">{level.availableQuantity}</td>
      <td className="py-2 pr-3 tabular-nums">{level.reservedQuantity}</td>
      <td className="py-2 pr-3 tabular-nums">{qtyForProvider(level, "SHOPIFY")}</td>
      <td className="py-2 pr-3 tabular-nums">{qtyForProvider(level, "WOOCOMMERCE")}</td>
      <td className="py-2 pr-3 tabular-nums">{qtyForProvider(level, "DOORDASH")}</td>
      <td className="py-2">
        <Badge variant={status === "synced" ? "default" : status === "conflict" ? "destructive" : "secondary"}>
          {status === "synced" ? "In sync" : status === "conflict" ? "Conflict" : "POS only"}
        </Badge>
      </td>
    </tr>
  );
}

function ConflictTable({
  conflicts,
  canManage,
}: {
  conflicts: CrossChannelConflict[];
  canManage: boolean;
}) {
  if (conflicts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="cross-channel-no-conflicts">
        No inventory conflicts — kitchen spine and channels match.
      </p>
    );
  }

  return (
    <table className="min-w-full text-sm" data-testid="cross-channel-conflicts-table">
      <thead className="text-left text-xs uppercase text-muted-foreground">
        <tr>
          <th className="pb-2 pr-3">Product</th>
          <th className="pb-2 pr-3">Channel</th>
          <th className="pb-2 pr-3">Master</th>
          <th className="pb-2 pr-3">Channel qty</th>
          <th className="pb-2 pr-3">Delta</th>
          {canManage ? <th className="pb-2">Resolve</th> : null}
        </tr>
      </thead>
      <tbody>
        {conflicts.map((row) => (
          <tr key={row.id} className="border-t" data-testid={`cross-channel-conflict-${row.id}`}>
            <td className="py-2 pr-3 font-medium">{row.productTitle}</td>
            <td className="py-2 pr-3">
              <Badge variant={channelBadgeVariant(row.channel.provider)}>{row.channel.provider}</Badge>
            </td>
            <td className="py-2 pr-3 tabular-nums">{row.masterQuantity}</td>
            <td className="py-2 pr-3 tabular-nums">{row.channel.quantity}</td>
            <td className="py-2 pr-3 tabular-nums">{row.delta}</td>
            {canManage ? (
              <td className="py-2">
                <div className="flex flex-wrap gap-1">
                  <form action={resolveCrossChannelConflictAction}>
                    <input type="hidden" name="connectionId" value={row.channel.connectionId} />
                    <input type="hidden" name="conflictId" value={row.id} />
                    <input type="hidden" name="strategy" value="kitchen_wins" />
                    <button type="submit" className="text-xs text-primary hover:underline">
                      Kitchen wins
                    </button>
                  </form>
                  <form action={resolveCrossChannelConflictAction}>
                    <input type="hidden" name="connectionId" value={row.channel.connectionId} />
                    <input type="hidden" name="conflictId" value={row.id} />
                    <input type="hidden" name="strategy" value="channel_wins" />
                    <button type="submit" className="text-xs text-primary hover:underline">
                      Channel wins
                    </button>
                  </form>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LowStockRow({ alert }: { alert: CrossChannelLowStockAlert }) {
  return (
    <tr className="border-t">
      <td className="py-2 pr-3 font-medium">{alert.productTitle}</td>
      <td className="py-2 pr-3 tabular-nums text-amber-700 dark:text-amber-400">{alert.availableQuantity}</td>
      <td className="py-2 pr-3 tabular-nums">{alert.threshold}</td>
      <td className="py-2">
        <div className="flex flex-wrap gap-1">
          {alert.channels.map((c) => (
            <Badge key={c} variant={channelBadgeVariant(c)} className="text-[10px]">
              {c}
            </Badge>
          ))}
        </div>
      </td>
    </tr>
  );
}
