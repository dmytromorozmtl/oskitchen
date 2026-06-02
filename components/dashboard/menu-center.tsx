"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  CalendarRange,
  Copy,
  ExternalLink,
  GripVertical,
  LayoutGrid,
  List,
  Table2,
  Trash2,
} from "lucide-react";
import type { BusinessType, MenuStrategy } from "@prisma/client";
import { toast } from "sonner";

import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

import {
  createMenu,
  deleteMenu,
  duplicateMenu,
  reorderMenus,
  setMenuActive,
  updateMenu,
} from "@/actions/menus";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MediaUrlField } from "@/components/storefront/media/media-url-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  defaultMenuStrategyForBusinessType,
  MENU_STRATEGY_ORDER,
  menuStrategyDefinition,
} from "@/lib/menus/menu-strategies";
import { menuCenterCopy } from "@/lib/menus/menu-terminology";
import { describeStorefrontLink, type StorefrontMenuSurface } from "@/lib/menus/menu-publishing";
import { cn } from "@/lib/utils";

export type MenuBucket = "active" | "draft" | "scheduled" | "archived";

export type MenuCenterRow = {
  id: string;
  title: string;
  strategy: MenuStrategy;
  description: string | null;
  startDate: string;
  endDate: string;
  preorderDeadline: string;
  active: boolean;
  published: boolean;
  productCount: number;
  orderCount: number;
  status: "active" | "draft" | "closed";
  bucket: MenuBucket;
  storefrontLinked: boolean;
  collectionSlug: string | null;
  collectionHero?: {
    heroImageUrl?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
  };
};

function SortableMenuCard({
  menu,
  onRefresh,
  itemsWord,
  storefrontSurface,
  storeSlug,
  mediaAssets,
}: {
  menu: MenuCenterRow;
  onRefresh: () => void;
  itemsWord: string;
  storefrontSurface: StorefrontMenuSurface;
  storeSlug: string | null;
  mediaAssets: { id: string; url: string; label: string | null; altText: string | null }[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: menu.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [editOpen, setEditOpen] = React.useState(false);
  const start = parseISO(menu.startDate);
  const end = parseISO(menu.endDate);
  const preorder = parseISO(menu.preorderDeadline);
  const strat = menuStrategyDefinition(menu.strategy);
  const preorderLine =
    menu.strategy === "WEEKLY_PREORDER" || menu.strategy === "BAKERY_PREORDER"
      ? preorder.getTime() > Date.now()
        ? `Preorder closes ${formatDistanceToNow(preorder, { addSuffix: true })}`
        : "Preorder window closed"
      : `${format(start, "MMM d")} — ${format(end, "MMM d")}`;

  const sf = describeStorefrontLink({
    menuId: menu.id,
    surface: storefrontSurface,
    strategy: menu.strategy,
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-4 border-border/80 bg-card/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 rounded-md border border-dashed border-border/80 p-1 text-muted-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-lg font-semibold">{menu.title}</p>
            <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
              {strat.label}
            </Badge>
            {menu.status === "active" ? <Badge variant="success">Live</Badge> : null}
            {menu.status === "draft" ? <Badge variant="secondary">Draft</Badge> : null}
            {menu.status === "closed" ? <Badge variant="outline">Ended</Badge> : null}
            {menu.published ? <Badge className="shrink-0">Published flag</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{preorderLine}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {menu.productCount} {itemsWord.toLowerCase()} · {menu.orderCount} orders ·{" "}
            <span
              className={cn(
                sf.tone === "live" && "text-emerald-700 dark:text-emerald-400",
                sf.tone === "draft" && "text-muted-foreground",
                sf.tone === "disabled" && "text-amber-800 dark:text-amber-300",
              )}
            >
              {sf.label}
            </span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1">
          <Switch
            checked={menu.active}
            disabled={menu.status === "closed"}
            onCheckedChange={async (v) => {
              const res = await setMenuActive(menu.id, v);
              const _err = getActionError(res); if (_err) toast.error(_err);
              onRefresh();
            }}
          />
          <span className="text-xs text-muted-foreground">Checkout menu</span>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link href={`/dashboard/menus/${menu.id}`}>
            <ExternalLink className="mr-1 h-3.5 w-3.5" />
            Open
          </Link>
        </Button>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit menu</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const fd = new FormData(event.currentTarget);
                fd.set("strategy", menu.strategy);
                const res = await invokeServerAction(() => updateMenu(menu.id, fd));
                const _err = getActionError(res);
                if (_err) toast.error(_err);
                else {
                  toast.success("Menu updated");
                  setEditOpen(false);
                  onRefresh();
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={menu.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={menu.description ?? ""}
                  placeholder="Optional notes for your team"
                />
              </div>
              <div className="space-y-2 border-t border-border/60 pt-4">
                <p className="text-sm font-medium">Collection landing (storefront)</p>
                <MediaUrlField
                  id="collectionHeroImageUrl"
                  name="collectionHeroImageUrl"
                  label="Hero image"
                  defaultValue={menu.collectionHero?.heroImageUrl ?? ""}
                  assets={mediaAssets}
                  placeholder="https://cdn…/hero.jpg"
                />
                <Label htmlFor="collectionHeroTitle">Hero title override</Label>
                <Input
                  id="collectionHeroTitle"
                  name="collectionHeroTitle"
                  defaultValue={menu.collectionHero?.heroTitle ?? ""}
                  placeholder={menu.title}
                />
                <Label htmlFor="collectionHeroSubtitle">Hero subtitle</Label>
                <Input
                  id="collectionHeroSubtitle"
                  name="collectionHeroSubtitle"
                  defaultValue={menu.collectionHero?.heroSubtitle ?? ""}
                  placeholder={menu.description ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collectionSlug">Collection URL slug (optional)</Label>
                <Input
                  id="collectionSlug"
                  name="collectionSlug"
                  defaultValue={menu.collectionSlug ?? ""}
                  placeholder="e.g. weekly-specials"
                  className="font-mono text-sm"
                />
                {storeSlug && menu.collectionSlug ? (
                  <p className="text-xs text-muted-foreground">
                    Public:{" "}
                    <span className="font-mono text-foreground">
                      /s/{storeSlug}/collections/{menu.collectionSlug}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Guests browse this menu at /collections/your-slug when the storefront is live.
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    defaultValue={format(start, "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    required
                    defaultValue={format(end, "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="preorderDeadline">Preorder deadline</Label>
                  <Input
                    id="preorderDeadline"
                    name="preorderDeadline"
                    type="datetime-local"
                    required
                    defaultValue={format(preorder, "yyyy-MM-dd'T'HH:mm")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="rounded-full">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={async () => {
            const res = await duplicateMenu(menu.id);
            const _err = getActionError(res); if (_err) toast.error(_err);
            else {
              toast.success("Menu duplicated");
              onRefresh();
            }
          }}
        >
          <Copy className="mr-1 h-4 w-4" />
          Duplicate
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Delete menu">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete menu?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes items and production tasks on this menu. Resolve orders tied to these
                SKUs before deleting when possible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await deleteMenu(menu.id);
                  toast.success("Menu deleted");
                  onRefresh();
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/80 bg-muted/20 p-4 shadow-none">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

export function MenuCenter({
  businessType,
  initialMenus,
  storefrontSurface,
  storeSlug,
  mediaAssets = [],
}: {
  businessType: BusinessType | null;
  initialMenus: MenuCenterRow[];
  storefrontSurface: StorefrontMenuSurface;
  storeSlug: string | null;
  mediaAssets?: { id: string; url: string; label: string | null; altText: string | null }[];
}) {
  const copy = menuCenterCopy(businessType);
  const [menus, setMenus] = React.useState(initialMenus);
  const [tab, setTab] = React.useState<"all" | MenuBucket>("all");
  const [view, setView] = React.useState<"cards" | "table">("cards");
  const [strategyFilter, setStrategyFilter] = React.useState<MenuStrategy | "ALL">("ALL");

  React.useEffect(() => {
    setMenus(initialMenus);
  }, [initialMenus]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function persistOrder(next: MenuCenterRow[]) {
    setMenus(next);
    await reorderMenus(next.map((m) => m.id));
    toast.success("Menu order saved");
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    void persistOrder(arrayMove(menus, oldIndex, newIndex));
  }

  const filtered = React.useMemo(() => {
    return menus.filter((m) => {
      if (strategyFilter !== "ALL" && m.strategy !== strategyFilter) return false;
      if (tab === "all") return true;
      return m.bucket === tab;
    });
  }, [menus, tab, strategyFilter]);

  const counts = React.useMemo(() => {
    const active = menus.filter((m) => m.bucket === "active").length;
    const draft = menus.filter((m) => m.bucket === "draft").length;
    const scheduled = menus.filter((m) => m.bucket === "scheduled").length;
    const archived = menus.filter((m) => m.bucket === "archived").length;
    const published = menus.filter((m) => m.published).length;
    const items = menus.reduce((s, m) => s + m.productCount, 0);
    return { active, draft, scheduled, archived, published, items };
  }, [menus]);

  const emptyDef = menuStrategyDefinition(defaultMenuStrategyForBusinessType(businessType));
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{copy.pageTitle}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{copy.pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/menus/templates">Menu templates</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/dashboard/menu-planner">Menu planner</Link>
          </Button>
          <Button className="rounded-full" variant="premium" asChild>
            <Link href="/dashboard/menus/new">New menu</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Live checkout menus" value={counts.active} />
        <SummaryCard label="Drafts" value={counts.draft} />
        <SummaryCard label="Scheduled" value={counts.scheduled} />
        <SummaryCard label="Archived" value={counts.archived} />
        <SummaryCard label="Published flag" value={counts.published} />
        <SummaryCard label={copy.itemsWord} value={counts.items} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["active", "Live"],
              ["draft", "Drafts"],
              ["scheduled", "Scheduled"],
              ["archived", "Archive"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={tab === value ? "secondary" : "outline"}
              className="rounded-full"
              onClick={() => setTab(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="menu-strategy-filter">
            Strategy
          </label>
          <select
            id="menu-strategy-filter"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value as MenuStrategy | "ALL")}
          >
            <option value="ALL">All strategies</option>
            {MENU_STRATEGY_ORDER.map((s) => (
              <option key={s} value={s}>
                {menuStrategyDefinition(s).label}
              </option>
            ))}
          </select>
          <div className="ml-auto flex rounded-full border border-border/70 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={view === "cards" ? "secondary" : "ghost"}
              className="rounded-full px-3"
              onClick={() => setView("cards")}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              className="rounded-full px-3"
              onClick={() => setView("table")}
              aria-label="Table view"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Only one menu can be the <span className="font-medium text-foreground">checkout</span> menu
          at a time. Strategy controls terminology and defaults — weekly preorder behavior is unchanged.
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full lg:hidden">
              Quick create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick create menu</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const fd = new FormData(event.currentTarget);
                fd.set("strategy", defaultMenuStrategyForBusinessType(businessType));
                const res = await invokeServerAction(() => createMenu(fd));
                const _err = getActionError(res);
                if (_err) toast.error(_err);
                else {
                  toast.success("Menu created");
                  setCreateOpen(false);
                  window.location.reload();
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="q-title">Title</Label>
                <Input id="q-title" name="title" required placeholder="Menu title" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="q-start">Start</Label>
                  <Input id="q-start" name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-end">End</Label>
                  <Input id="q-end" name="endDate" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-pre">Preorder deadline</Label>
                <Input id="q-pre" name="preorderDeadline" type="datetime-local" required />
              </div>
              <DialogFooter>
                <Button type="submit" className="rounded-full">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {view === "table" && filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Menu</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3">{copy.itemsWord}</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Storefront</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const st = menuStrategyDefinition(m.strategy);
                const sf = describeStorefrontLink({
                  menuId: m.id,
                  surface: storefrontSurface,
                  strategy: m.strategy,
                });
                return (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3">{st.label}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(parseISO(m.startDate), "MMM d")} — {format(parseISO(m.endDate), "MMM d")}
                    </td>
                    <td className="px-4 py-3">{m.productCount}</td>
                    <td className="px-4 py-3">{m.orderCount}</td>
                    <td className="px-4 py-3 text-xs">{sf.label}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" className="rounded-full" asChild>
                        <Link href={`/dashboard/menus/${m.id}`}>Open</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={filtered.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.map((menu) => (
                <SortableMenuCard
                  key={menu.id}
                  menu={menu}
                  itemsWord={copy.itemsWord}
                  storefrontSurface={storefrontSurface}
                  storeSlug={storeSlug}
                  mediaAssets={mediaAssets}
                  onRefresh={() => window.location.reload()}
                />
              ))}
              {!menus.length ? (
                <EmptyState
                  icon={CalendarRange}
                  title={emptyDef.emptyStateTitle}
                  description={emptyDef.emptyStateDescription}
                  primarySlot={
                    <Button type="button" className="rounded-full" variant="premium" asChild>
                      <Link href="/dashboard/menus/new">{emptyDef.primaryCta}</Link>
                    </Button>
                  }
                  secondaryLabel={emptyDef.secondaryCta}
                  secondaryHref="/dashboard/menus/templates"
                  demoHref="/demo"
                />
              ) : !filtered.length ? (
                <EmptyState
                  icon={List}
                  title="No menus in this filter"
                  description="Try another tab, strategy filter, or reset filters to see all menus."
                  primarySlot={
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setTab("all");
                        setStrategyFilter("ALL");
                      }}
                    >
                      Reset filters
                    </Button>
                  }
                />
              ) : null}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
