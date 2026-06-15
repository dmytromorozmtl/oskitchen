"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ChefHat, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { bulkProductionUpdate, updateProductionTask } from "@/actions/production";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeletonRows } from "@/components/tables/table-skeleton";
import { useProductionUiStore } from "@/stores/ui-store";

export type ProductionRowDTO = {
  productId: string;
  title: string;
  menuTitle: string;
  category: string | null;
  preparedDate: string | null;
  cooked: boolean;
  packed: boolean;
  labeled: boolean;
  assignedTo: string | null;
};

export function ProductionTable({
  rows,
  embedded = false,
  loading = false,
}: {
  rows: ProductionRowDTO[];
  /** When true, hides the hero header (used inside Production Command Center). */
  embedded?: boolean;
  loading?: boolean;
}) {
  const query = useProductionUiStore((s) => s.query);
  const setQuery = useProductionUiStore((s) => s.setQuery);
  const [filter, setFilter] = React.useState<"all" | "todo" | "done">("all");
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  const filtered = rows.filter((r) => {
    const hay = `${r.title} ${r.menuTitle} ${r.category ?? ""}`.toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
    const done = r.cooked && r.packed && r.labeled;
    if (filter === "todo" && done) return false;
    if (filter === "done" && !done) return false;
    return true;
  });

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  function toggleAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    if (checked) {
      filtered.forEach((r) => {
        next[r.productId] = true;
      });
    }
    setSelected(next);
  }

  async function patchRow(
    productId: string,
    patch: Partial<{ cooked: boolean; packed: boolean; labeled: boolean }>,
  ) {
    const res = await updateProductionTask(productId, patch);
    const _err = getActionError(res); if (_err) toast.error(_err);
    else {
      toast.success("Updated");
      window.location.reload();
    }
  }

  async function bulk(stage: "cooked" | "packed" | "labeled") {
    if (!selectedIds.length) {
      toast.message("Select rows first");
      return;
    }
    await bulkProductionUpdate(selectedIds, { [stage]: true });
    toast.success("Bulk update applied");
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">Kitchen production</h1>
              <Badge variant="outline" className="rounded-full">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Kitchen mode ready
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Optimized for gloves-on workflows: scan, tap, bulk complete.
            </p>
          </div>
          {rows.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                type="button"
                onClick={() => bulk("cooked")}
              >
                Mark cooked
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                type="button"
                onClick={() => bulk("packed")}
              >
                Mark packed
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                type="button"
                onClick={() => bulk("labeled")}
              >
                Mark labeled
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Product checkpoints</h2>
            <p className="text-sm text-muted-foreground">
              Cook / pack / label flags per menu item (legacy line). Prep list & batches live above.
            </p>
          </div>
          {rows.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full" type="button" onClick={() => bulk("cooked")}>
                Mark cooked
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" type="button" onClick={() => bulk("packed")}>
                Mark packed
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" type="button" onClick={() => bulk("labeled")}>
                Mark labeled
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {rows.length === 0 ? (
        embedded ? (
          <p className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
            No product-level cook/pack/label rows for this date. Generate prep from menus or orders, or add menu
            items with prepared dates.
          </p>
        ) : (
        <EmptyState
          icon={ChefHat}
          title="Your kitchen board is empty"
          description="Create menu items with prep dates or import orders so production checkpoints reflect real workloads — staff see exactly what to cook, pack, and label."
          primaryLabel="Menu items"
          primaryHref="/dashboard/products"
          secondaryLabel="Try demo workspace"
          secondaryHref="/demo"
          demoHref="/demo"
        />
        )
      ) : (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search meals, menus..."
                className="rounded-full pl-9"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="md:w-56 rounded-full">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="todo">Needs work</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        filtered.length > 0 &&
                        filtered.every((r) => selected[r.productId])
                      }
                      onCheckedChange={(v) => toggleAll(Boolean(v))}
                    />
                  </TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead>Prep date</TableHead>
                  <TableHead>Cooked</TableHead>
                  <TableHead>Packed</TableHead>
                  <TableHead>Labeled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableSkeletonRows columns={7} rows={8} /> : null}
                {!loading &&
                filtered.map((r) => (
                  <TableRow key={r.productId}>
                    <TableCell>
                      <Checkbox
                        checked={Boolean(selected[r.productId])}
                        onCheckedChange={(v) =>
                          setSelected((prev) => ({
                            ...prev,
                            [r.productId]: Boolean(v),
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.category ?? "General"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.menuTitle}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.preparedDate
                        ? format(parseISO(r.preparedDate), "MMM d")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={r.cooked}
                        onCheckedChange={(v) =>
                          patchRow(r.productId, { cooked: Boolean(v) })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={r.packed}
                        onCheckedChange={(v) =>
                          patchRow(r.productId, { packed: Boolean(v) })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={r.labeled}
                        onCheckedChange={(v) =>
                          patchRow(r.productId, { labeled: Boolean(v) })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No rows match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
