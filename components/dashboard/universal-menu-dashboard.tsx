"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  RefreshCw,
  Search,
  Upload,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import {
  bulkUpdateUniversalMenuAction,
  exportUniversalMenuCsvAction,
  importUniversalMenuCsvAction,
  syncAllUniversalMenuAction,
  syncUniversalMenuItemAction,
  updateUniversalMenuItemAction,
} from "@/actions/universal-menu";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeSyncHealth } from "@/lib/menu/universal-menu-builders";
import { CHANNEL_LABELS, type UniversalMenuDashboardPayload } from "@/lib/menu/universal-menu-dashboard-types";
import {
  MENU_CHANNELS,
  type ChannelItemOverride,
  type ChannelSyncStatus,
  type MenuChannel,
  type UniversalMenuItem,
} from "@/lib/menu/universal-menu-types";
import { cn } from "@/lib/utils";

type Props = UniversalMenuDashboardPayload;

const STATUS_DOT: Record<ChannelSyncStatus, string> = {
  synced: "bg-emerald-500",
  pending: "bg-amber-400",
  error: "bg-red-500",
  disconnected: "bg-zinc-400",
  skipped: "bg-zinc-300",
};

function ChannelDots({ item }: { item: UniversalMenuItem }) {
  return (
    <div className="flex flex-wrap gap-1" title="Per-channel sync status">
      {MENU_CHANNELS.map((channel) => {
        const status = item.syncStatus[channel]?.status ?? "pending";
        return (
          <span
            key={channel}
            className={cn("inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border/60", STATUS_DOT[status])}
            title={`${CHANNEL_LABELS[channel]}: ${status}`}
          />
        );
      })}
    </div>
  );
}

function HealthBadge({ item }: { item: UniversalMenuItem }) {
  const health = summarizeSyncHealth(item.syncStatus);
  const tone =
    health === "green" ? "default" : health === "yellow" ? "secondary" : "destructive";
  return <Badge variant={tone}>{health}</Badge>;
}

function ItemEditor({
  item,
  onSaved,
}: {
  item: UniversalMenuItem;
  onSaved: (next: UniversalMenuItem) => void;
}) {
  const [tab, setTab] = useState<string>("master");
  const [pending, startTransition] = useTransition();
  const [master, setMaster] = useState(item.master);
  const [overrides, setOverrides] = useState(item.channelOverrides);

  function patchChannel(channel: MenuChannel, patch: ChannelItemOverride) {
    setOverrides((prev) => ({ ...prev, [channel]: { ...prev[channel], ...patch } }));
  }

  function save(push: boolean) {
    startTransition(async () => {
      try {
        const channelOverrides: Partial<Record<MenuChannel, ChannelItemOverride>> = {};
        for (const channel of MENU_CHANNELS) {
          const o = overrides[channel];
          if (o && Object.keys(o).length > 0) channelOverrides[channel] = o;
        }
        const result = await updateUniversalMenuItemAction(item.productId, {
          master: {
            title: master.title,
            description: master.description,
            price: master.price,
            category: master.category,
            image: master.image,
            active: master.active,
          },
          channelOverrides,
          pushToChannels: push,
        });
        onSaved(result.item);
        toast.success(push ? "Saved and synced to channels." : "Saved.");
      } catch {
        toast.error("Could not save menu item.");
      }
    });
  }

  function syncOne() {
    startTransition(async () => {
      try {
        const result = await syncUniversalMenuItemAction(item.productId);
        onSaved(result.item);
        toast.success("Sync complete.");
      } catch {
        toast.error("Sync failed.");
      }
    });
  }

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{item.master.title}</CardTitle>
            <CardDescription>Edit master item and per-channel overrides</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => save(false)}>
              Save
            </Button>
            <Button type="button" size="sm" disabled={pending} onClick={() => save(true)}>
              Save &amp; sync
            </Button>
            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={syncOne}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden />
              Sync
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
            <TabsTrigger value="master">Master</TabsTrigger>
            {MENU_CHANNELS.map((c) => (
              <TabsTrigger key={c} value={c}>
                {CHANNEL_LABELS[c]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="master" className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="um-title">Title</Label>
              <Input
                id="um-title"
                value={master.title}
                onChange={(e) => setMaster((m) => ({ ...m, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="um-price">Price</Label>
              <Input
                id="um-price"
                type="number"
                step="0.01"
                value={master.price}
                onChange={(e) => setMaster((m) => ({ ...m, price: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="um-category">Category</Label>
              <Input
                id="um-category"
                value={master.category}
                onChange={(e) => setMaster((m) => ({ ...m, category: e.target.value }))}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="um-desc">Description</Label>
              <Input
                id="um-desc"
                value={master.description ?? ""}
                onChange={(e) => setMaster((m) => ({ ...m, description: e.target.value || null }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={master.active}
                onCheckedChange={(v) => setMaster((m) => ({ ...m, active: v === true }))}
              />
              Active on master menu
            </label>
          </TabsContent>

          {MENU_CHANNELS.map((channel) => (
            <TabsContent key={channel} value={channel} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    STATUS_DOT[item.syncStatus[channel]?.status ?? "pending"],
                  )}
                />
                Status: {item.syncStatus[channel]?.status ?? "pending"}
                {item.syncStatus[channel]?.lastError ? ` — ${item.syncStatus[channel]?.lastError}` : null}
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <Checkbox
                  checked={overrides[channel]?.enabled ?? true}
                  onCheckedChange={(v) => patchChannel(channel, { enabled: v === true })}
                />
                Enabled on {CHANNEL_LABELS[channel]}
              </label>
              <div className="space-y-1">
                <Label>Override title</Label>
                <Input
                  placeholder={master.title}
                  value={overrides[channel]?.title ?? ""}
                  onChange={(e) => patchChannel(channel, { title: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-1">
                <Label>Override price</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={String(master.price)}
                  value={overrides[channel]?.price ?? ""}
                  onChange={(e) =>
                    patchChannel(channel, {
                      price: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              {["shopify", "uberEats", "doordash", "grubhub"].includes(channel) ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label>External ID</Label>
                  <Input
                    value={overrides[channel]?.externalId ?? ""}
                    onChange={(e) =>
                      patchChannel(channel, { externalId: e.target.value || null })
                    }
                  />
                </div>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function UniversalMenuDashboard({ items: initialItems, menus, syncHistory: initialHistory }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [syncHistory] = useState(initialHistory);
  const [search, setSearch] = useState("");
  const [menuId, setMenuId] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeItemId, setActiveItemId] = useState<string | null>(initialItems[0]?.productId ?? null);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [bulkChannel, setBulkChannel] = useState<MenuChannel>("website");
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (menuId && item.menuId !== menuId) return false;
      if (activeOnly && !item.master.active) return false;
      if (!q) return true;
      return (
        item.master.title.toLowerCase().includes(q) ||
        item.master.category.toLowerCase().includes(q)
      );
    });
  }, [items, search, menuId, activeOnly]);

  const activeItem = items.find((i) => i.productId === activeItemId) ?? null;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.productId)));
    }
  }

  function syncAll() {
    const ids = selectedIds.size > 0 ? [...selectedIds] : filtered.map((i) => i.productId);
    startTransition(async () => {
      try {
        const result = await syncAllUniversalMenuAction(ids);
        toast.success(`Synced ${result.synced} items${result.failed ? `, ${result.failed} failed` : ""}.`);
        router.refresh();
      } catch {
        toast.error("Sync all failed.");
      }
    });
  }

  function runBulkEdit() {
    const ids = [...selectedIds];
    if (ids.length === 0) {
      toast.error("Select items for bulk edit.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await bulkUpdateUniversalMenuAction({
          productIds: ids,
          patch: { priceDeltaPercent: Number(bulkPercent) },
          pushToChannels: false,
        });
        setItems((prev) => {
          const map = new Map(result.items.map((i) => [i.productId, i]));
          return prev.map((i) => map.get(i.productId) ?? i);
        });
        toast.success(`Updated ${result.updated} items.`);
      } catch {
        toast.error("Bulk edit failed.");
      }
    });
  }

  function bulkToggleChannel(enabled: boolean) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    startTransition(async () => {
      try {
        const result = await bulkUpdateUniversalMenuAction({
          productIds: ids,
          patch: { channel: bulkChannel, channelEnabled: enabled },
          pushToChannels: true,
        });
        setItems((prev) => {
          const map = new Map(result.items.map((i) => [i.productId, i]));
          return prev.map((i) => map.get(i.productId) ?? i);
        });
        toast.success(`Channel ${CHANNEL_LABELS[bulkChannel]} updated for ${result.updated} items.`);
      } catch {
        toast.error("Bulk channel update failed.");
      }
    });
  }

  function downloadCsv() {
    startTransition(async () => {
      try {
        const csv = await exportUniversalMenuCsvAction({
          menuId: menuId || undefined,
          search: search || undefined,
          activeOnly,
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `universal-menu-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported.");
      } catch {
        toast.error("Export failed.");
      }
    });
  }

  function onImportFile(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("pushAfterImport", "false");
    startTransition(async () => {
      try {
        const result = await importUniversalMenuCsvAction(fd);
        toast.success(`Imported ${result.imported} rows${result.skipped ? `, skipped ${result.skipped}` : ""}.`);
        if (result.errors.length) toast.message(result.errors.slice(0, 3).join("; "));
        router.refresh();
      } catch {
        toast.error("Import failed.");
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="universal-menu-dashboard">
      <AiHonestyBanner moduleId="universal-menu" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Universal Menu</h1>
          <p className="text-muted-foreground max-w-2xl">
            One master list — push to POS, website, Shopify, and delivery apps. Green/yellow/red dots
            show per-channel sync health.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = "";
            }}
          />
          <Button type="button" size="sm" disabled={pending} onClick={syncAll}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Sync {selectedIds.size > 0 ? "selected" : "all"}
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label htmlFor="um-search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                id="um-search"
                className="pl-9"
                placeholder="Title or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="um-menu">Menu</Label>
            <select
              id="um-menu"
              className="flex h-10 w-full min-w-[160px] rounded-md border border-input bg-background px-3 text-sm"
              value={menuId}
              onChange={(e) => setMenuId(e.target.value)}
            >
              <option value="">All menus</option>
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
          <label className="flex h-10 items-center gap-2 text-sm">
            <Checkbox checked={activeOnly} onCheckedChange={(v) => setActiveOnly(v === true)} />
            Active only
          </label>
        </CardContent>
      </Card>

      {selectedIds.size > 0 ? (
        <Card className="border-primary/30 bg-primary/5 shadow-none">
          <CardContent className="flex flex-wrap items-center gap-3 pt-6">
            <Layers className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Input
              className="w-20"
              type="number"
              value={bulkPercent}
              onChange={(e) => setBulkPercent(e.target.value)}
              aria-label="Price change percent"
            />
            <span className="text-sm text-muted-foreground">% price</span>
            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={runBulkEdit}>
              Apply price
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={bulkChannel}
              onChange={(e) => setBulkChannel(e.target.value as MenuChannel)}
            >
              {MENU_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => bulkToggleChannel(true)}>
              Enable channel
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => bulkToggleChannel(false)}>
              Disable channel
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3 border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Master list</CardTitle>
            <CardDescription>{filtered.length} items — click a row to edit</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-3 w-10">
                      <Checkbox
                        checked={filtered.length > 0 && selectedIds.size === filtered.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="p-3 font-medium">Item</th>
                    <th className="p-3 font-medium">Price</th>
                    <th className="p-3 font-medium">Channels</th>
                    <th className="p-3 font-medium">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.productId}
                      className={cn(
                        "border-b cursor-pointer hover:bg-muted/30",
                        activeItemId === item.productId && "bg-muted/50",
                      )}
                      onClick={() => setActiveItemId(item.productId)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(item.productId)}
                          onCheckedChange={() => toggleSelect(item.productId)}
                          aria-label={`Select ${item.master.title}`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{item.master.title}</div>
                        <div className="text-xs text-muted-foreground">{item.master.category}</div>
                      </td>
                      <td className="p-3">${item.master.price.toFixed(2)}</td>
                      <td className="p-3">
                        <ChannelDots item={item} />
                      </td>
                      <td className="p-3">
                        <HealthBadge item={item} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No items match your filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          {activeItem ? (
            <ItemEditor
              key={activeItem.productId + activeItem.updatedAt}
              item={activeItem}
              onSaved={(next) => {
                setItems((prev) => prev.map((i) => (i.productId === next.productId ? next : i)));
              }}
            />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Select an item to edit channel overrides.
              </CardContent>
            </Card>
          )}

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sync history</CardTitle>
              <CardDescription>Recent channel push events</CardDescription>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-2 text-xs">
              {syncHistory.length === 0 ? (
                <p className="text-muted-foreground">No sync events yet.</p>
              ) : (
                syncHistory.map((entry, i) => (
                  <div key={`${entry.at}-${entry.channel}-${i}`} className="rounded-md border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{entry.productTitle}</span>
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[entry.status])}
                      />
                    </div>
                    <div className="text-muted-foreground">
                      {CHANNEL_LABELS[entry.channel]} · {new Date(entry.at).toLocaleString()}
                    </div>
                    {entry.message ? <div>{entry.message}</div> : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              {(
                [
                  ["synced", "Synced"],
                  ["pending", "Pending"],
                  ["error", "Error"],
                  ["disconnected", "Disconnected"],
                ] as const
              ).map(([status, label]) => (
                <div key={status} className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[status])} />
                  {label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {pending ? (
        <div className="fixed bottom-4 right-4 z-50 w-48 rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-2">Working…</p>
          <Progress value={66} className="h-1" />
        </div>
      ) : null}
    </div>
  );
}
