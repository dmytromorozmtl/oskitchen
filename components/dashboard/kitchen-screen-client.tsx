"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";

import {
  assignProductionWorkItemStaffFormAction,
  updateProductionTask,
  updateProductionWorkItemStatusFormAction,
} from "@/actions/production";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KdsRefreshHonestyBanner } from "@/components/kitchen/kds-refresh-honesty-banner";
import { KDS_POLL_FALLBACK_MS } from "@/lib/kitchen/kds-realtime-smoke-policy";
import {
  countLate,
  filterKitchenWorkItems,
  KITCHEN_STATION_SLUGS,
  normalizeKitchenCardSize,
  normalizeKitchenScreenMode,
  normalizeKitchenStationSlug,
  sortKitchenWorkQueue,
} from "@/lib/kitchen-screen/kitchen-screen-filters";
import { kitchenWorkItemActions } from "@/lib/kitchen-screen/kitchen-screen-actions";
import { KITCHEN_MODE_OPTIONS, kitchenScreenEyebrow, kitchenScreenHeading } from "@/lib/kitchen-screen/kitchen-screen-layouts";
import type {
  KitchenLegacyRowDTO,
  KitchenScreenBundleDTO,
  KitchenScreenMode,
  KitchenWorkRowDTO,
} from "@/lib/kitchen-screen/kitchen-screen-types";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { isWorkLate } from "@/lib/production/production-status";
import { PRODUCTION_PRIORITY_LABEL } from "@/lib/production/production-priority";
import { PRODUCTION_WORK_STATUS_LABEL } from "@/lib/production/production-status";
import { cn } from "@/lib/utils";

const HOLD_REASONS = [
  "Ingredient missing",
  "Equipment issue",
  "Waiting for batch",
  "Unclear order",
  "Staff shortage",
  "Other",
] as const;

function buildKitchenHref(opts: {
  station: string | null;
  mode: KitchenScreenMode;
  fullscreen: boolean;
  cardSize: "large" | "compact";
}): string {
  const p = new URLSearchParams();
  if (opts.station) p.set("station", opts.station);
  if (opts.mode !== "all") p.set("mode", opts.mode);
  if (opts.fullscreen) p.set("fullscreen", "1");
  if (opts.cardSize === "compact") p.set("card", "compact");
  const q = p.toString();
  return q ? `/dashboard/kitchen?${q}` : "/dashboard/kitchen";
}

function KitchenEmpty({
  hasFiltered,
  hasAnyWork,
  stationSlug,
  userRole,
  platformBypass,
}: {
  hasFiltered: boolean;
  hasAnyWork: boolean;
  stationSlug: string | null;
  userRole: "OWNER" | "STAFF";
  platformBypass: boolean;
}) {
  if (!hasAnyWork) {
    return (
      <Card className="border-dashed border-2 border-amber-500/40 bg-amber-500/5 p-10 text-center">
        <p className="text-xl font-semibold text-foreground">No active prep lines</p>
        <p className="mt-2 text-muted-foreground">
          {userRole === "OWNER" || platformBypass
            ? "Generate production from the command center."
            : "Ask a manager to generate production for today."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="min-h-12 rounded-xl">
            <Link href="/dashboard/production">Open Production</Link>
          </Button>
          {platformBypass ? (
            <Button asChild size="lg" variant="outline" className="min-h-12 rounded-xl">
              <Link href="/platform/dashboard">Platform</Link>
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }
  if (hasFiltered) {
    return (
      <Card className="border-dashed p-10 text-center">
        <p className="text-xl font-semibold">No tasks for this view</p>
        <p className="mt-2 text-muted-foreground">
          {stationSlug
            ? "Try All stations or pick another station tab."
            : "Adjust mode filters or clear Rush / My tasks."}
        </p>
      </Card>
    );
  }
  return null;
}

export type KitchenUiPermissions = Pick<
  Record<PermissionKey, boolean>,
  "kitchen.bump" | "kitchen.recall" | "kitchen.configure" | "kitchen.expo.manage"
>;

export function KitchenScreenClient({
  bundle,
  initialStation,
  initialMode,
  initialFullscreen,
  initialCardSize,
  kitchenPermissions,
}: {
  bundle: KitchenScreenBundleDTO;
  initialStation: string | null;
  initialMode: KitchenScreenMode;
  initialFullscreen: boolean;
  initialCardSize: "large" | "compact";
  kitchenPermissions: KitchenUiPermissions;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [clock, setClock] = React.useState(() => new Date());
  const [lastRefresh, setLastRefresh] = React.useState(() => new Date());

  const stationSlug = normalizeKitchenStationSlug(sp.get("station") ?? initialStation);
  const mode = normalizeKitchenScreenMode(sp.get("mode") ?? initialMode);
  const fullscreen = (sp.get("fullscreen") ?? (initialFullscreen ? "1" : "")) === "1";
  const cardSize = normalizeKitchenCardSize(sp.get("card") ?? initialCardSize);

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => {
      startTransition(() => {
        router.refresh();
        setLastRefresh(new Date());
      });
    }, KDS_POLL_FALLBACK_MS);
    return () => clearInterval(id);
  }, [router]);

  const filtered = React.useMemo(() => {
    const f = filterKitchenWorkItems(bundle.workItems, {
      stationSlug,
      mode,
      viewerStaffId: bundle.viewerStaffId,
    });
    return sortKitchenWorkQueue(f);
  }, [bundle.workItems, bundle.viewerStaffId, mode, stationSlug]);

  const lateFiltered = countLate(filtered);

  const pushQuery = (patch: Partial<{ station: string | null; mode: KitchenScreenMode; fullscreen: boolean; cardSize: "large" | "compact" }>) => {
    const nextStation = patch.station !== undefined ? patch.station : stationSlug;
    const nextMode = patch.mode ?? mode;
    const nextFs = patch.fullscreen ?? fullscreen;
    const nextCard = patch.cardSize ?? cardSize;
    router.replace(
      buildKitchenHref({
        station: nextStation,
        mode: nextMode,
        fullscreen: nextFs,
        cardSize: nextCard,
      }),
    );
  };

  const heading = kitchenScreenHeading(bundle.businessType);
  const eyebrow = kitchenScreenEyebrow(bundle.businessType);

  const refresh = () =>
    startTransition(() => {
      router.refresh();
      setLastRefresh(new Date());
    });

  const inner = (
    <div className={cn("kitchen-screen flex min-h-0 flex-1 flex-col gap-4", fullscreen ? "text-zinc-50" : "")}>
      <KdsRefreshHonestyBanner pollIntervalMs={KDS_POLL_FALLBACK_MS} lastRefreshAt={lastRefresh} />
      <header
        className={cn(
          "sticky top-0 z-10 flex flex-col gap-3 border-b pb-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
          fullscreen ? "border-zinc-700 bg-zinc-950/95" : "border-border/80 bg-background/90 backdrop-blur",
        )}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
          <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground sm:text-base">
            {format(clock, "EEE MMM d · h:mm a")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1.5 text-sm">
            {filtered.length} tasks
          </Badge>
          {lateFiltered > 0 ? (
            <Badge variant="destructive" className="rounded-full px-3 py-1.5 text-sm">
              {lateFiltered} late
            </Badge>
          ) : (
            <Badge variant="success" className="rounded-full px-3 py-1.5 text-sm">
              On track
            </Badge>
          )}
          <Button type="button" variant="outline" size="lg" className="min-h-11 rounded-xl" disabled={isPending} onClick={refresh}>
            Refresh
          </Button>
          <Button
            type="button"
            variant={fullscreen ? "premium" : "outline"}
            size="lg"
            className="min-h-11 rounded-xl"
            onClick={() => pushQuery({ fullscreen: !fullscreen })}
          >
            {fullscreen ? "Exit full screen" : "Full screen"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 rounded-xl"
            onClick={() => pushQuery({ cardSize: cardSize === "large" ? "compact" : "large" })}
          >
            {cardSize === "large" ? "Compact cards" : "Large cards"}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
          {KITCHEN_STATION_SLUGS.map((tab) => {
            const active = (tab.slug === "all" && !stationSlug) || tab.slug === stationSlug;
            const count =
              tab.slug === "all"
                ? bundle.workItems.length
                : bundle.workItems.filter((w) => tab.match((w.station ?? "").trim() || "")).length;
            return (
              <Button
                key={tab.slug}
                type="button"
                size="lg"
                variant={active ? "premium" : "outline"}
                className="min-h-11 shrink-0 rounded-xl"
                disabled={!kitchenPermissions["kitchen.configure"]}
                onClick={() => {
                  if (!kitchenPermissions["kitchen.configure"]) return;
                  pushQuery({ station: tab.slug === "all" ? null : tab.slug });
                }}
              >
                {tab.label}
                <span className="ml-2 tabular-nums opacity-80">({count})</span>
              </Button>
            );
          })}
        </div>
        <Select
          value={mode}
          disabled={!kitchenPermissions["kitchen.configure"]}
          onValueChange={(v) => {
            if (!kitchenPermissions["kitchen.configure"]) return;
            pushQuery({ mode: normalizeKitchenScreenMode(v) });
          }}
        >
          <SelectTrigger className="min-h-11 w-[220px] rounded-xl text-base">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            {KITCHEN_MODE_OPTIONS.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-base">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Auto-refresh ~30s · Last sync {formatDistanceToNow(lastRefresh, { addSuffix: true })}
      </p>

      <KitchenEmpty
        hasFiltered={filtered.length === 0 && bundle.workItems.length > 0}
        hasAnyWork={bundle.workItems.length > 0}
        stationSlug={stationSlug}
        userRole={bundle.userRole}
        platformBypass={bundle.platformBypass}
      />

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4 pb-8",
          cardSize === "large" ? "xl:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {filtered.map((w) => (
          <KitchenWorkCard
            key={w.id}
            w={w}
            cardSize={cardSize}
            staffMembers={bundle.staffMembers}
            viewerStaffId={bundle.viewerStaffId}
            isPending={isPending}
            startTransition={startTransition}
            routerRefresh={refresh}
            kitchenPermissions={kitchenPermissions}
          />
        ))}
      </div>

      <div className="space-y-3 border-t pt-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Legacy · Cook / pack / label</h2>
        <p className="text-sm text-muted-foreground">
          Menu product checkpoints (unchanged). Prep lines use the command center above.
        </p>
        <div className={cn("grid gap-4", cardSize === "large" ? "xl:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {bundle.legacyOpen.map((row) => (
            <LegacyProductCard
              key={row.productId}
              row={row}
              cardSize={cardSize}
              isPending={isPending}
              startTransition={startTransition}
              routerRefresh={refresh}
            />
          ))}
          {!bundle.legacyOpen.length ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground sm:col-span-2 xl:col-span-2">
              All caught up — cook/pack/label tasks appear when menu products need production.
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col overflow-auto bg-zinc-950 p-3 sm:p-5">
        {inner}
        <p className="mt-4 text-center text-[11px] text-zinc-500">
          Allergen and nutrition data must be verified by your business. OS Kitchen does not replace label compliance.
        </p>
      </div>
    );
  }

  return <div className="flex min-h-[70vh] flex-col">{inner}</div>;
}

function KitchenWorkCard({
  w,
  cardSize,
  staffMembers,
  viewerStaffId,
  isPending,
  startTransition,
  routerRefresh,
  kitchenPermissions,
}: {
  w: KitchenWorkRowDTO;
  cardSize: "large" | "compact";
  staffMembers: { id: string; name: string }[];
  viewerStaffId: string | null;
  isPending: boolean;
  startTransition: (fn: () => void) => void;
  routerRefresh: () => void;
  kitchenPermissions: KitchenUiPermissions;
}) {
  const late = w.dueAt ? isWorkLate(new Date(w.dueAt), w.status) : false;
  const actions = kitchenWorkItemActions(w.status);
  const pad = cardSize === "large" ? "p-6 sm:p-8" : "p-4";
  const [holdReason, setHoldReason] = React.useState<string>(HOLD_REASONS[0]);

  const runStatus = (status: string, appendNote?: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("workItemId", w.id);
      fd.set("status", status);
      if (appendNote) fd.set("appendNote", appendNote);
      await updateProductionWorkItemStatusFormAction(fd);
      routerRefresh();
    });
  };

  const runAssign = (staffMemberId: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("workItemId", w.id);
      fd.set("staffMemberId", staffMemberId);
      await assignProductionWorkItemStaffFormAction(fd);
      routerRefresh();
    });
  };

  return (
    <Card
      className={cn(
        "flex flex-col border-2 shadow-lg",
        late ? "border-destructive/80 bg-destructive/5" : "border-border/80 bg-card",
        w.status === "HOLD" ? "border-amber-500/60 bg-amber-500/5" : "",
      )}
    >
      <div className={cn("flex min-h-0 flex-1 flex-col", pad)}>
        <div className="flex flex-wrap gap-2">
          <Badge variant={late ? "destructive" : "outline"} className="rounded-full text-sm">
            {PRODUCTION_WORK_STATUS_LABEL[w.status]}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-sm">
            {PRODUCTION_PRIORITY_LABEL[w.priority]}
          </Badge>
          {w.requiresPacking ? (
            <Badge className="rounded-full bg-sky-600 text-sm text-white hover:bg-sky-600">Pack</Badge>
          ) : null}
          {w.requiresLabel ? (
            <Badge className="rounded-full bg-violet-700 text-sm text-white hover:bg-violet-700">Label</Badge>
          ) : null}
        </div>
        {w.allergenWarning ? (
          <div className="mt-3 rounded-xl border-2 border-destructive bg-destructive/15 px-4 py-3 text-base font-bold text-destructive">
            Allergen: {w.allergenWarning}
          </div>
        ) : null}
        <h3 className={cn("mt-3 font-bold leading-tight", cardSize === "large" ? "text-3xl sm:text-4xl" : "text-xl")}>
          {w.title}
        </h3>
        <p className={cn("mt-2 font-semibold text-muted-foreground", cardSize === "large" ? "text-2xl" : "text-lg")}>
          ×{w.quantity}
          {w.station ? ` · ${w.station}` : ""}
          {w.stage ? ` · ${w.stage}` : ""}
        </p>
        {w.dueAt ? (
          <p className={cn("mt-1 font-medium", late ? "text-destructive" : "text-muted-foreground")}>
            Due {format(new Date(w.dueAt), "EEE h:mm a")}
          </p>
        ) : null}
        {w.orderLabel ? <p className="mt-2 text-sm text-muted-foreground">Order: {w.orderLabel}</p> : null}
        {w.brandName ? (
          <Badge variant="outline" className="mt-2 w-fit rounded-full">
            {w.brandName}
          </Badge>
        ) : null}
        {w.assignedToName ? <p className="mt-2 text-sm text-muted-foreground">Assigned: {w.assignedToName}</p> : null}
        {w.notes ? <p className="mt-3 line-clamp-4 rounded-lg bg-muted/50 p-3 text-sm">{w.notes}</p> : null}

        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="sr-only" htmlFor={`assign-${w.id}`}>
            Assign staff
          </label>
          <select
            id={`assign-${w.id}`}
            defaultValue={w.assignedToId ?? ""}
            className="min-h-11 min-w-[10rem] rounded-lg border border-input bg-background px-3 text-base"
            disabled={isPending || !kitchenPermissions["kitchen.expo.manage"]}
          >
            <option value="">Unassigned</option>
            {staffMembers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 rounded-xl"
            disabled={isPending || !kitchenPermissions["kitchen.expo.manage"]}
            onClick={() => {
              const el = document.getElementById(`assign-${w.id}`) as HTMLSelectElement | null;
              runAssign(el?.value ?? "");
            }}
          >
            Save assign
          </Button>
          {viewerStaffId && kitchenPermissions["kitchen.expo.manage"] ? (
            <Button type="button" size="lg" variant="secondary" className="min-h-11 rounded-xl" disabled={isPending} onClick={() => runAssign(viewerStaffId)}>
              Assign to me
            </Button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {actions.start && kitchenPermissions["kitchen.bump"] ? (
            <Button type="button" size="lg" className="min-h-14 min-w-[9rem] rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("IN_PROGRESS")}>
              Start
            </Button>
          ) : null}
          {actions.ready && kitchenPermissions["kitchen.bump"] ? (
            <Button type="button" size="lg" variant="outline" className="min-h-14 min-w-[9rem] rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("READY")}>
              Mark ready
            </Button>
          ) : null}
          {actions.resume && kitchenPermissions["kitchen.recall"] ? (
            <Button type="button" size="lg" variant="outline" className="min-h-14 min-w-[9rem] rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("TO_PREP")}>
              Resume
            </Button>
          ) : null}
          {actions.hold && kitchenPermissions["kitchen.bump"] ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="min-h-12 rounded-lg border border-input bg-background px-3 text-base"
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
              >
                {HOLD_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Button type="button" variant="outline" size="lg" className="min-h-14 rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("HOLD", `[Hold] ${holdReason}`)}>
                Hold
              </Button>
            </div>
          ) : null}
          {w.requiresPacking && actions.packHandoff && w.status !== "DONE" && kitchenPermissions["kitchen.expo.manage"] ? (
            <Button type="button" size="lg" variant="secondary" className="min-h-14 min-w-[9rem] rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("PACK_HANDOFF")}>
              Send to packing
            </Button>
          ) : null}
          {actions.complete && kitchenPermissions["kitchen.bump"] ? (
            <Button type="button" size="lg" variant="premium" className="min-h-14 min-w-[9rem] rounded-xl text-lg" disabled={isPending} onClick={() => runStatus("DONE")}>
              {w.status === "PACK_HANDOFF" ? "Complete handoff" : "Complete"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function LegacyProductCard({
  row,
  cardSize,
  isPending,
  startTransition,
  routerRefresh,
}: {
  row: KitchenLegacyRowDTO;
  cardSize: "large" | "compact";
  isPending: boolean;
  startTransition: (fn: () => void) => void;
  routerRefresh: () => void;
}) {
  const pad = cardSize === "large" ? "p-6" : "p-4";
  const patch = (p: Partial<{ cooked: boolean; packed: boolean; labeled: boolean }>) => {
    startTransition(async () => {
      const res = await updateProductionTask(row.productId, p);
      if (res && "error" in res && res.error) {
        console.error(res.error);
      }
      routerRefresh();
    });
  };

  return (
    <Card className={cn("border-border/80", pad)}>
      <div className="flex flex-wrap gap-2">
        <Badge variant={row.cooked ? "success" : "secondary"}>Cook {row.cooked ? "✓" : "…"}</Badge>
        <Badge variant={row.packed ? "success" : "secondary"}>Pack {row.packed ? "✓" : "…"}</Badge>
        <Badge variant={row.labeled ? "success" : "secondary"}>Label {row.labeled ? "✓" : "…"}</Badge>
      </div>
      <h3 className={cn("mt-3 font-bold", cardSize === "large" ? "text-2xl" : "text-lg")}>{row.productTitle}</h3>
      <p className="text-muted-foreground">{row.menuTitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="lg" className="min-h-12 rounded-xl" disabled={isPending || row.cooked} onClick={() => patch({ cooked: true })}>
          Cook done
        </Button>
        <Button type="button" size="lg" variant="outline" className="min-h-12 rounded-xl" disabled={isPending || row.packed} onClick={() => patch({ packed: true })}>
          Packed
        </Button>
        <Button type="button" size="lg" variant="outline" className="min-h-12 rounded-xl" disabled={isPending || row.labeled} onClick={() => patch({ labeled: true })}>
          Labeled
        </Button>
      </div>
    </Card>
  );
}
